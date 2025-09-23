// noinspection JSUnresolvedReference

import { WebSocket } from "partysocket";

function sendKodiMessageOverWebSocket(rws, method, params) {
    let msg = {
        "jsonrpc": "2.0",
        "method": method,
        "id": method,
    };
    if (params) {
        msg.params = params;
    }
    //console.log("About to send message:", msg)
    rws.send(JSON.stringify(msg));
}

function calculateTotalSeconds(kodiTimeObject){
    return kodiTimeObject.hours * 60 * 60 + kodiTimeObject.minutes * 60 + kodiTimeObject.seconds;
}

function secondsToTimeFormat(seconds){
    return new Date(seconds * 1000).toISOString().substring(11, 19);
}

function openKodiWebSocket() {

    const kodiWebsocketUrl = 'ws://' + Alpine.store('config').kodiJsonUrl + '/jsonrpc';

    const options = {
        connectionTimeout: 1000,
        minReconnectionDelay: 500,
        maxReconnectionDelay: 5000,
        reconnectionDelayGrowFactor: 1.3,
        maxEnqueuedMessages: 0,
        debug: false,
    };

    console.log("*** Opening new websocket connection to Kodi: " + kodiWebsocketUrl)
    return new WebSocket(kodiWebsocketUrl, [], options);
}

window.kodi = () => {

    let rws = null;
    let pingInterval = null;
    let reconnectAttempts = 0;
    let connectionStrategy = 0; // Track which strategy we're using

    const openKodiWebSocket = () => {

        const urlParams = new URLSearchParams(window.location.search);
        const kodiHost = urlParams.get('kodiHost') || '127.0.0.1';
        const kodiPort = urlParams.get('kodiPort') || '8080';
        const url = `ws://${kodiHost}:${kodiPort}/jsonrpc`;

        console.log(`Attempting Kodi WebSocket connection to: ${url} (Strategy ${connectionStrategy + 1})`);

        // WORKAROUND 1: Force connection reset with different strategies
        const connectionStrategies = [
            // Strategy 1: Default settings
            {
                connectionTimeout: 1000,
                minReconnectionDelay: 500,
                maxReconnectionDelay: 5000,
                reconnectionDelayGrowFactor: 1.3,
                maxEnqueuedMessages: 0,
                debug: false,
            },
            // Strategy 2: More aggressive timeouts for stuck servers
            {
                connectionTimeout: 3000,
                minReconnectionDelay: 1000,
                maxReconnectionDelay: 8000,
                reconnectionDelayGrowFactor: 1.5,
                maxEnqueuedMessages: 0,
                debug: false,
            },
            // Strategy 3: Conservative approach for severely stuck servers
            {
                connectionTimeout: 5000,
                minReconnectionDelay: 2000,
                maxReconnectionDelay: 15000,
                reconnectionDelayGrowFactor: 2.0,
                maxEnqueuedMessages: 0,
                debug: false,
            }
        ];

        const options = connectionStrategies[connectionStrategy % connectionStrategies.length];

        // Force close any existing connection with abnormal closure to clear server state
        if (rws && rws.readyState !== WebSocket.CLOSED) {
            console.log('Force closing existing WebSocket connection');
            rws.close(1006, 'Force reset for server cleanup'); // Abnormal closure
            rws = null;
            // Clear ping interval if it exists
            if (pingInterval) {
                clearInterval(pingInterval);
                pingInterval = null;
            }
        }

        // Wait a moment for server cleanup before new connection
        setTimeout(() => {
            try {
                rws = new PartySocket(url, null, options);

                rws.addEventListener('open', function (event) {
                    console.log('Kodi WebSocket Connected');
                    Alpine.store('isAvailable').kodi = true;
                    reconnectAttempts = 0; // Reset counter on successful connection
                    connectionStrategy = 0; // Reset to default strategy

                    // WORKAROUND 2: Start health check ping
                    startHealthCheck();
                });

                rws.addEventListener('close', function (event) {
                    console.log(`Kodi WebSocket Disconnected: ${event.code} - ${event.reason}`);
                    Alpine.store('isAvailable').kodi = false;

                    // Stop health check
                    if (pingInterval) {
                        clearInterval(pingInterval);
                        pingInterval = null;
                    }

                    // WORKAROUND 3: Escalate connection strategy on repeated failures
                    if (event.code !== 1000 && event.code !== 1001) { // Not a normal closure
                        reconnectAttempts++;

                        if (reconnectAttempts > 3) {
                            // Switch to next strategy after 3 failed attempts
                            connectionStrategy = (connectionStrategy + 1) % connectionStrategies.length;
                            console.log(`Switching to connection strategy ${connectionStrategy + 1} after ${reconnectAttempts} attempts`);
                            reconnectAttempts = 0; // Reset counter for new strategy
                        }

                        // Wait longer on repeated failures
                        const baseDelay = 5000;
                        const escalatedDelay = Math.min(baseDelay * Math.pow(1.5, Math.floor(reconnectAttempts / 3)), 30000);
                        console.log(`Retrying connection in ${escalatedDelay}ms`);

                        setTimeout(() => {
                            openKodiWebSocket();
                        }, escalatedDelay);
                    }
                });

                rws.addEventListener('error', function (event) {
                    console.log('Kodi WebSocket Error:', event);
                    Alpine.store('isAvailable').kodi = false;
                });

                rws.addEventListener('message', function (event) {
                    // Handle ping responses
                    const data = JSON.parse(event.data);
                    if (data.id === 'health-check-ping') {
                        console.log('Health check ping successful');
                        return; // Don't process ping responses further
                    }

                    // Your existing message handling code...
                    if (data.method === 'Player.OnPropertyChanged') {
                        const changedData = data.params.data;
                        if (changedData.time !== undefined) {
                            this._kodiPlayerPosition = changedData.time;
                        }
                        if (changedData.totaltime !== undefined) {
                            this._kodiPlayerTotalTime = changedData.totaltime;
                        }
                    } else if (data.method === 'Player.OnPlay') {
                        this.kodiPlayerActive = true;
                    } else if (data.method === 'Player.OnStop') {
                        this.kodiPlayerActive = false;
                    } else if (data.method === 'Player.OnPause') {
                        this.kodiPlayerPaused = true;
                    } else if (data.method === 'Player.OnResume') {
                        this.kodiPlayerPaused = false;
                    } else if (data.method === 'Player.OnSeek') {
                        const seekData = data.params.data.player;
                        if (seekData.time !== undefined) {
                            this._kodiPlayerPosition = seekData.time;
                        }
                        if (seekData.totaltime !== undefined) {
                            this._kodiPlayerTotalTime = seekData.totaltime;
                        }
                    }
                }.bind(this));

            } catch (error) {
                console.error('Failed to create WebSocket:', error);
                Alpine.store('isAvailable').kodi = false;

                // Retry with next strategy
                reconnectAttempts++;
                if (reconnectAttempts > 3) {
                    connectionStrategy = (connectionStrategy + 1) % connectionStrategies.length;
                    reconnectAttempts = 0;
                }

                setTimeout(() => {
                    openKodiWebSocket();
                }, 5000);
            }
        }, connectionStrategy > 0 ? 2000 : 500); // Longer wait for escalated strategies
    };

    // WORKAROUND 2: Health check implementation
    const startHealthCheck = () => {
        // Clear any existing interval
        if (pingInterval) {
            clearInterval(pingInterval);
        }

        pingInterval = setInterval(() => {
            if (rws && rws.readyState === WebSocket.OPEN) {
                try {
                    // Send ping with unique ID to identify responses
                    const pingMessage = {
                        "jsonrpc": "2.0",
                        "method": "JSONRPC.Ping",
                        "id": "health-check-ping"
                    };
                    rws.send(JSON.stringify(pingMessage));
                } catch (error) {
                    console.log('Health check ping failed:', error);
                    // Force reconnection on ping failure
                    if (rws) {
                        rws.close(1006, 'Health check failed');
                    }
                }
            }
        }, 30000); // Ping every 30 seconds
    };

    return {
        // Your existing properties...
        kodiConnected: false,
        kodiPlayerActive: false,
        kodiPlayerPaused: false,
        kodiPlayerTitle: '',
        kodiPlayerType: '',
        kodiPlayerArt: '',
        kodiPlayerTimeRemaining: '',
        _kodiPlayerPosition: { hours: 0, minutes: 0, seconds: 0 },
        _kodiPlayerTotalTime: { hours: 0, minutes: 0, seconds: 0 },
        _updateTimeRemainingInterval: null,

        // Add cleanup method for proper shutdown if needed
        cleanup() {
            console.log("Cleaning up Kodi WebSocket connection");

            // Clear health check
            if (pingInterval) {
                clearInterval(pingInterval);
                pingInterval = null;
            }

            // Clear time remaining interval
            if (this._updateTimeRemainingInterval) {
                clearInterval(this._updateTimeRemainingInterval);
                this._updateTimeRemainingInterval = null;
            }

            // Close WebSocket with proper code
            if (rws && rws.readyState !== WebSocket.CLOSED) {
                rws.close(1000, 'Component cleanup');
                rws = null;
            }

            this._clearProperties();
            Alpine.store('isAvailable').kodi = false;
        },

        init() {
            console.log("KodiComponent init");

            setTimeout(() => {
                openKodiWebSocket();

                // Your existing interval setup...
                this._updateTimeRemainingInterval = setInterval(() => {
                    this._updateTimeRemaining();
                }, 1000);

            }, 100);
        },

        // Your existing methods remain the same...
        _clearProperties() {
            this.kodiPlayerActive = false;
            this.kodiPlayerPaused = false;
            this.kodiPlayerTitle = '';
            this.kodiPlayerType = '';
            this.kodiPlayerArt = '';
            this.kodiPlayerTimeRemaining = '';
            this._kodiPlayerPosition = { hours: 0, minutes: 0, seconds: 0 };
            this._kodiPlayerTotalTime = { hours: 0, minutes: 0, seconds: 0 };
        },

        _updateTimeRemaining() {
            // Your existing time calculation code...
            const position = this._kodiPlayerPosition;
            const total = this._kodiPlayerTotalTime;

            const positionSeconds = position.hours * 3600 + position.minutes * 60 + position.seconds;
            const totalSeconds = total.hours * 3600 + total.minutes * 60 + total.seconds;
            const remainingSeconds = totalSeconds - positionSeconds;

            if (remainingSeconds > 0) {
                const hours = Math.floor(remainingSeconds / 3600);
                const minutes = Math.floor((remainingSeconds % 3600) / 60);
                const seconds = remainingSeconds % 60;

                if (hours > 0) {
                    this.kodiPlayerTimeRemaining = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                } else {
                    this.kodiPlayerTimeRemaining = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
            } else {
                this.kodiPlayerTimeRemaining = '';
            }
        }
    };
};