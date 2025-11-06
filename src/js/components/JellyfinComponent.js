// noinspection JSUnresolvedReference

import { WebSocket } from "partysocket";
import "../utils/logger.js"

const log = logger('JellyfinComponent.js');

function getJellyfinProtocols() {
    // Read SSL setting from centralized config
    const jellyfinSSL = Alpine.store('config').jellyfinSSL;

    return {
        http: jellyfinSSL ? 'https://' : 'http://',
        ws: jellyfinSSL ? 'wss://' : 'ws://'
    };
}

function sendJellyfinMessageOverWebSocket(rws, messageType, data = {}) {
    const msg = {
        MessageType: messageType,
        Data: data
    };
    log.info("Sending Jellyfin message:", msg);
    rws.send(JSON.stringify(msg));
}

window.jellyfin = () => {

    // globals to store our Jellyfin websocket
    let rws = null;

    // WebSocket workaround variables
    let pingInterval = null;
    let pollInterval = null;

    // WebSocket workaround: Health check implementation
    const startHealthCheck = () => {
        if (pingInterval) {
            clearInterval(pingInterval);
        }

        pingInterval = setInterval(() => {
            if (rws && rws.readyState === 1) { // OPEN
                try {
                    sendJellyfinMessageOverWebSocket(rws, 'KeepAlive');
                } catch (error) {
                    log.warn('Health check ping failed:', error);
                    if (rws) {
                        rws.close(1011, 'Closing WebSocket to Jellyfin as health check failed');
                    }
                }
            }
        }, 30000);  // Ping every 30 seconds
    };

    // Poll for active sessions since WebSocket doesn't always send notifications
    const startSessionPolling = (component) => {
        if (pollInterval) {
            clearInterval(pollInterval);
        }

        // Poll every 0.5 seconds for playback changes
        pollInterval = setInterval(() => {
            if (rws && rws.readyState === 1) {
                component._requestSessionInfo();
            }
        }, 500);
    };

    return {
        artwork: null,
        title: '',
        season: '',
        episode: '',
        finishTime: '',
        timeRemainingAsTime: '',

        _updateTimeRemainingInterval: null,
        _monitoringJellyfinPlayback: null,
        _offlineHandlerRegistered: false,
        _initDelay: null,
        _connectTimeout: null,
        _currentMediaType: null,
        _currentItemId: null,
        _currentSessionId: null,
        _apiKey: null,

        createEnhancedJellyfinWebSocket() {

            const protocols = getJellyfinProtocols();
            // Get API key from config
            this._apiKey = Alpine.store('config').jellyfinApiKey;

            if (!this._apiKey) {
                log.error('Jellyfin API key not configured');
                return;
            }

            // Jellyfin WebSocket format: ws://host:port/socket?api_key=KEY&deviceId=DEVICE
            const jellyfinWebsocketUrl = `${protocols.ws}${Alpine.store('config').jellyfinUrl}/socket?api_key=${this._apiKey}&deviceId=kodidash`;

            const options = {
                connectionTimeout: 2000,
                minReconnectionDelay: 3000,
                maxReconnectionDelay: 30000,
                reconnectionDelayGrowFactor: 1.5,
                maxEnqueuedMessages: 0,
                debug: false,
            };

            log.info(`*** Opening new websocket connection to Jellyfin: ${jellyfinWebsocketUrl.replace(this._apiKey, '***')}`);

            // Reset existing connection reference
            if (rws) {
                log.info('Resetting existing WebSocket reference');
                try {
                    if (rws.readyState < 2) rws.close(1000, 'Re-init');
                } catch (_) { /* ignore */ }
                rws = null;
                if (pingInterval) {
                    clearInterval(pingInterval);
                    pingInterval = null;
                }
                if (pollInterval) {
                    clearInterval(pollInterval);
                    pollInterval = null;
                }
                if (this._updateTimeRemainingInterval) {
                    clearInterval(this._updateTimeRemainingInterval);
                    this._updateTimeRemainingInterval = null;
                }
            }

            this._connectTimeout = setTimeout(() => {
                try {
                    rws = new WebSocket(jellyfinWebsocketUrl, undefined, options);

                    rws.addEventListener('open', () => {
                        log.info("Websocket [open]: Connection opened to Jellyfin");
                        startHealthCheck();
                        startSessionPolling(this);
                        // Immediately check for active sessions
                        this._requestSessionInfo();
                    });

                    rws.addEventListener('error', (event) => {
                        if (options.debug) log.info('WebSocket [error]:', event);
                        this._handleDisconnectCleanup();
                    });

                    // Register offline handler once
                    if (!this._offlineHandlerRegistered) {
                        this._offlineHandlerRegistered = true;
                        window.addEventListener('offline', () => {
                            if (options.debug) log.info('Network offline');
                            this._handleDisconnectCleanup();
                        });
                    }

                    rws.addEventListener('close', (event) => {
                        log.info(`Jellyfin WebSocket Disconnected:`, JSON.stringify({
                            code: event.code,
                            reason: event.reason || 'No reason provided',
                            wasClean: event.wasClean,
                            type: event.type
                        }, null, 4));

                        this._handleDisconnectCleanup({ useTimeout: false });

                        log.info('WebSocket closed, PartySocket will handle reconnection automatically');
                    });

                    rws.addEventListener('message', (event) => {
                        const data = JSON.parse(event.data);

                        // Don't log keep-alive spam
                        if (data.MessageType !== 'KeepAlive') {
                            log.info('Websocket [message]:');
                            log.info(JSON.stringify(data, null, 4));
                        }

                        const messageType = data.MessageType;

                        //////////////////////////////////////////////////////
                        // MESSAGE PROCESSING!

                        // Play state notifications (if they arrive)
                        if (messageType === 'PlaybackStart') {
                            log.info("Jellyfin: PlaybackStart notification");
                            this._requestSessionInfo();
                        }

                        if (messageType === 'PlaybackStopped') {
                            log.info("Jellyfin: PlaybackStopped");
                            this._handleDisconnectCleanup({ useTimeout: false });
                        }

                    });

                } catch (error) {
                    log.error('Failed to create WebSocket:', error);
                    Alpine.store('isAvailable').jellyfin = false;
                }
            }, 500);
        },

        async _requestSessionInfo() {
            // Make HTTP request to get session details
            const protocols = getJellyfinProtocols();
            const url = `${protocols.http}${Alpine.store('config').jellyfinUrl}/Sessions?api_key=${this._apiKey}`;

            try {
                const response = await fetch(url);
                const sessions = await response.json();

                const activeSession = sessions.find(s => s.NowPlayingItem);

                if (activeSession) {
                    this._handlePlaybackStart(activeSession);
                } else {
                    // Only clear if we were previously showing jellyfin
                    if (Alpine.store('isAvailable').jellyfin) {
                        log.info("No active playback session found - hiding Jellyfin display");
                        this._handleDisconnectCleanup({ useTimeout: false });
                    }
                }
            } catch (error) {
                log.error('Failed to fetch session info:', error);
            }
        },

        _handlePlaybackStart(session) {
            const item = session.NowPlayingItem;

            if (!item) return;

            this._currentItemId = item.Id;
            this._currentSessionId = session.Id;
            this._currentMediaType = item.Type;

            // Extract info
            this.title = item.Name || '';

            // For TV episodes
            if (item.Type === 'Episode') {
                this.season = item.ParentIndexNumber || '';
                this.episode = item.IndexNumber || '';
                this.title = item.SeriesName || this.title;
            } else {
                this.season = '';
                this.episode = '';
            }

            // Get artwork
            if (item.Id) {
                const protocols = getJellyfinProtocols();
                // Use Series poster for episodes, or otherwise primary (poster) for movies
                this.artworkUrl = `${protocols.http}${Alpine.store('config').jellyfinUrl}/Items/${item.SeriesId||item.Id}/Images/Primary?api_key=${this._apiKey}`;
                log.info(`Artwork URL set to ${this.artworkUrl}`);
            }

            // Calculate time remaining and finish time
            this._updateTimeRemaining(session);

            // Remove the old update interval - we're now polling sessions which includes time info
            if (this._updateTimeRemainingInterval) {
                clearInterval(this._updateTimeRemainingInterval);
                this._updateTimeRemainingInterval = null;
            }

            // Show the component
            if (!Alpine.store('isAvailable').jellyfin) {
                log.info("Showing Jellyfin component");
                setTimeout(() => {
                    Alpine.store('isAvailable').jellyfin = true;
                }, 500);
            }
        },

        _updateTimeRemaining(session) {
            const playState = session.PlayState;

            if (!playState) return;

            const positionTicks = playState.PositionTicks || 0;
            const runtimeTicks = session.NowPlayingItem?.RunTimeTicks || 0;

            if (runtimeTicks > 0) {
                // Convert ticks to seconds (10,000 ticks = 1ms)
                const remainingSeconds = Math.floor((runtimeTicks - positionTicks) / 10000000);

                // Format as HH:MM:SS or MM:SS
                const hours = Math.floor(remainingSeconds / 3600);
                const minutes = Math.floor((remainingSeconds % 3600) / 60);
                const seconds = remainingSeconds % 60;

                let timeString = '';
                if (hours > 0) {
                    timeString = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                } else {
                    timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }

                this.timeRemainingAsTime = '-' + timeString;

                // Calculate finish time
                const now = new Date();
                const finishDate = new Date(now.getTime() + (remainingSeconds * 1000));
                const finishHours = finishDate.getHours();
                const finishMinutes = finishDate.getMinutes();
                const ampm = finishHours >= 12 ? 'pm' : 'am';
                const displayHours = finishHours % 12 || 12;

                this.finishTime = `${displayHours}:${finishMinutes.toString().padStart(2, '0')}${ampm}`;

                log.info("Time Remaining:", this.timeRemainingAsTime);
                log.info("Finish Time:", this.finishTime);
            }
        },

        _clearProperties() {
            this.artwork = null;
            this.title = '';
            this.season = '';
            this.episode = '';
            this.finishTime = '';
            this.timeRemainingAsTime = '';
            this._currentItemId = null;
            this._currentSessionId = null;
        },

        _handleDisconnectCleanup(options = {}) {
            const {
                useTimeout = true,
                clearUpdateInterval = true,
                clearPingInterval = true
            } = options;

            if (useTimeout) {
                setTimeout(() => {
                    this._clearProperties();
                }, 2000);
            } else {
                this._clearProperties();
            }

            Alpine.store('isAvailable').jellyfin = false;

            if (clearUpdateInterval && this._updateTimeRemainingInterval) {
                clearInterval(this._updateTimeRemainingInterval);
                this._updateTimeRemainingInterval = null;
            }

            if (clearPingInterval && pingInterval) {
                clearInterval(pingInterval);
                pingInterval = null;
            }

            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
        },

        init() {
            this._initDelay = setTimeout(() => {
                log.info("JellyfinComponent init");
                this.createEnhancedJellyfinWebSocket();
            }, 2000);
        },
    }
};