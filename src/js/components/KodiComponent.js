// noinspection JSUnresolvedReference

import { WebSocket } from "partysocket";

function getKodiProtocols() {
    // Read SSL setting from centralized config
    const kodiSSL = Alpine.store('config').kodiSSL;

    // Default to HTTP/WS even if web app itself is HTTPS (typical mixed content scenario as Kodi doesn't by default support SSL)
    return {
        http: kodiSSL ? 'https://' : 'http://',
        ws: kodiSSL ? 'wss://' : 'ws://'
    };
}

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

window.kodi = () => {

    // globals to store our Kodi websocket
    let rws = null;

    // WebSocket workaround variables
    let pingInterval = null;

    // WebSocket workaround: Health check implementation
    const startHealthCheck = () => {
        if (pingInterval) {
            clearInterval(pingInterval);
        }

        pingInterval = setInterval(() => {
            if (rws && rws.readyState === 1) { // OPEN
                try {
                    const pingMessage = {
                        "jsonrpc": "2.0",
                        "method": "JSONRPC.Ping",
                        "id": "health-check-ping"
                    };
                    rws.send(JSON.stringify(pingMessage));
                } catch (error) {
                    console.log('Health check ping failed:', error);
                    if (rws) {
                        rws.close(1011, 'Closing WebSocket to Kodi as health check failed');
                    }
                }
            }
        }, 30000);  // Ping every 30 seconds
    };

    return {
        artwork: null,
        title: '',
        season: '',
        episode: '',
        finishTime: '',
        timeRemainingAsTime: '',

        _updateTimeRemainingInterval: null,
        _monitoringKodiPlayback: null,
        _offlineHandlerRegistered: false,
        _initDelay: null,
        _connectTimeout: null,
        _currentMediaType: null,

        createEnhancedKodiWebSocket() {

            const protocols = getKodiProtocols();
            const kodiWebsocketUrl = `${protocols.ws}${Alpine.store('config').kodiJsonUrl}/jsonrpc`;

            const options = {
                connectionTimeout: 1000,
                minReconnectionDelay: 500,
                maxReconnectionDelay: 5000,
                reconnectionDelayGrowFactor: 1.3,
                maxEnqueuedMessages: 0,
                debug: false,
            };

            console.log(`*** Opening new websocket connection to Kodi: ${kodiWebsocketUrl}`);

            // Workaround 1: Reset existing connection reference
            if (rws) {
                console.log('Resetting existing WebSocket reference');
                try {
                    if (rws.readyState < 2) rws.close(1000, 'Re-init'); // normal closure
                } catch (_) { /* ignore */ }
                rws = null;
                if (pingInterval) {
                    clearInterval(pingInterval);
                    pingInterval = null;
                }
                if (this._updateTimeRemainingInterval) {
                    clearInterval(this._updateTimeRemainingInterval);
                    this._updateTimeRemainingInterval = null;
                }
            }

            this._connectTimeout = setTimeout(() => {
                try {
                    rws = new WebSocket(kodiWebsocketUrl, [], options);

                    rws.addEventListener('open', () => {
                        console.log("Websocket [open]: Connection opened to Kodi")
                        // (DON'T set Kodi available here - wait for actual playback)
                        startHealthCheck();
                        // Check if Kodi is already playing, as soon as we connect...
                        sendKodiMessageOverWebSocket(rws, 'Player.GetActivePlayers', {});
                    });

                    rws.addEventListener('error', (event) => {
                        if (options.debug) console.log('WebSocket [error]:', event);
                        setTimeout(() => {
                            this._clearProperties();
                        }, 2000);
                        Alpine.store('isAvailable').kodi = false;
                        if (this._updateTimeRemainingInterval) {
                            clearInterval(this._updateTimeRemainingInterval);
                            this._updateTimeRemainingInterval = null;
                        }
                        if (pingInterval) {
                            clearInterval(pingInterval);
                            pingInterval = null;
                        }
                    });

                    // Register offline handler once
                    if (!this._offlineHandlerRegistered) {
                        this._offlineHandlerRegistered = true;
                        window.addEventListener('offline', () => {
                            if (options.debug) console.log('Network offline');
                            setTimeout(() => {
                                this._clearProperties();
                            }, 2000);
                            Alpine.store('isAvailable').kodi = false;
                            if (this._updateTimeRemainingInterval) {
                                clearInterval(this._updateTimeRemainingInterval);
                                this._updateTimeRemainingInterval = null;
                            }
                            if (pingInterval) {
                                clearInterval(pingInterval);
                                pingInterval = null;
                            }
                        });
                    }

                    rws.addEventListener('close', (event) => {
                        console.log(`Kodi WebSocket Disconnected: ${event.code} - ${event.reason}`);
                        Alpine.store('isAvailable').kodi = false;

                        if (pingInterval) {
                            clearInterval(pingInterval);
                            pingInterval = null;
                        }
                        this._updateTimeRemainingInterval = setInterval(function () {
                            let labels;
                            // For PVR we get this info from the EPG...
                            if (this._currentMediaType === 'channel'){
                                labels = ['PVR.EpgEventRemainingTime', 'PVR.EpgEventFinishTime'];
                            }
                            // Otherwise, from the standard labels...
                            else {
                                labels = ['VideoPlayer.TimeRemaining', 'Player.FinishTime'];
                            }

                            sendKodiMessageOverWebSocket(rws, 'XBMC.GetInfoLabels', {
                                labels: labels,
                            });
                        }.bind(this), 1000);

                        // Don't add custom reconnection logic here - let PartySocket handle it
                        console.log('WebSocket closed, PartySocket will handle reconnection automatically');
                    });

                    rws.addEventListener('message', (event) => {
                        const data = JSON.parse(event.data);

                        // Handle ping responses (don't process further)
                        if (data.id === 'health-check-ping') {
                            return;
                        }

                        let json_result = data;
                        console.log('Websocket [message]:');
                        console.log(json_result);

                        //////////////////////////////////////////////////////
                        // RESULTS PROCESSING!

                        if (json_result.id === "Player.GetItem") {
                            let results = json_result.result;
                            console.log("Processing result for: Player.GetItem");
                            console.log(results);

                            this.title = results.item.title;
                            this.season = results.item.season;
                            this.episode = results.item.episode;
                            this._currentMediaType = results.item.type;

                            let artworkUrl = null;

                            if (results.item.art && typeof results.item.art === 'object') {
                                const art = results.item.art;

                                if (art["album.thumb"]) {
                                    console.log("Artwork: using [album.thumb]")
                                    artworkUrl = art["album.thumb"];
                                }
                                else if (art["tvshow.poster"]) {
                                    console.log("Artwork: using [tvshow.poster]")
                                    artworkUrl = art["tvshow.poster"];
                                }
                                else if (art["movie.poster"]) {
                                    console.log("Artwork: using [movie.poster]")
                                    artworkUrl = art["movie.poster"];
                                }
                                else if (art["poster"]) {
                                    console.log("Artwork: using [poster]")
                                    artworkUrl = art["poster"];
                                }
                                else if (art["thumb"]) {
                                    console.log("Artwork: using [thumb]")
                                    artworkUrl = art["thumb"];
                                }
                                else if (art["icon"]) {
                                    console.log("Artwork: using [icon]")
                                    artworkUrl = art["icon"];
                                }
                            }
                            else if (results.item.thumbnail) {
                                console.log("Artwork: using fallback thumbnail")
                                artworkUrl = results.item.thumbnail;
                            }

                            if (artworkUrl) {
                                let artworkFromKodi = artworkUrl;
                                console.log("Kodi returned:", artworkFromKodi);
                                artworkFromKodi = artworkFromKodi.replace(/\/$/, '');
                                let kodiArtworkUrl;

                                if (artworkFromKodi.startsWith("http")) {
                                    console.log("Artwork URL is absolute - using directly");
                                    kodiArtworkUrl = artworkFromKodi;
                                } else {
                                    const protocols = getKodiProtocols();
                                    kodiArtworkUrl = `${protocols.http}${Alpine.store('config').kodiWebUrl}/image/${encodeURIComponent(artworkFromKodi)}`;
                                }
                                console.log("Final artwork URL:", kodiArtworkUrl);
                                this.artwork = kodiArtworkUrl;
                            }

                            // & Kick off the update of time remaining every x milliseconds
                            let type = results.item.type;

                            let labels = [];
                            // For PVR we get this info from the EPG...
                            if (type === 'channel'){
                                labels = ['PVR.EpgEventRemainingTime', 'PVR.EpgEventFinishTime']
                            }
                            // Otherwise, from the standard labels...
                            else {
                                labels = ['VideoPlayer.TimeRemaining', 'Player.FinishTime']
                            }
                            if (this._updateTimeRemainingInterval) {
                                clearInterval(this._updateTimeRemainingInterval);
                                this._updateTimeRemainingInterval = null;
                            }
                            this._updateTimeRemainingInterval = setInterval(function () {
                                sendKodiMessageOverWebSocket(rws, 'XBMC.GetInfoLabels', {
                                    labels: labels,
                                })
                            }, 1000);

                            // Kodi is playing and info will soon be available, so show our component, but give it a moment...
                            setTimeout(() => {
                                Alpine.store('isAvailable').kodi = true;
                            }, 1000);
                        }

                        // Get Time Remaining and Finish time - varies for PVR vs. other types of playback...
                        if (json_result.id === "XBMC.GetInfoLabels") {
                            let results = json_result.result;
                            console.log("Processing result for: XBMC.GetInfoLabels");
                            // Remaining time
                            const remainingTime = results["PVR.EpgEventRemainingTime"] || results["VideoPlayer.TimeRemaining"] || '';
                            const temp = typeof remainingTime === 'string' ? remainingTime.replace(/^0(?:0:0?)?/, '') : '';
                            this.timeRemainingAsTime = temp !== '' ? '-' + temp : '';
                            // Finish time
                            const finishTime = results["PVR.EpgEventFinishTime"] || results["Player.FinishTime"] || '';
                            console.log("Kodi finish time is " + finishTime);
                            this.finishTime = typeof finishTime === 'string'
                                ? finishTime.replace(' PM','pm').replace(' AM','am')
                                : '';
                        }

                        //////////////////////////////////////////////////////
                        // NOTIFICATIONS!

                        // We've either got a notification playback has started, or the result of the initial request for active players
                        if (json_result.method === "Player.OnPlay" || json_result.id === "Player.GetActivePlayers") {

                            let playerId = null;

                            // Responding to request to Kodi Player.GetActivePlayers
                            if (json_result.id === "Player.GetActivePlayers") {
                                console.log("Processing result for: Player.GetActivePlayers")
                                //console.log(json_result);
                                if (json_result.result.length === 0) {
                                    console.log("Kodi is not playing.");
                                    return;
                                } else {
                                    // Playing music
                                    if (json_result.result[0].playerid === 0) {
                                        playerId = 0;
                                    }
                                    // Playing a stream or video
                                    else if (json_result.result[0].playerid === 1 || json_result.result[0].playerid === -1) {
                                        playerId = 1;
                                    }
                                }
                            }
                            // Responding to Kodi Notification: Player.OnPlay
                            else {
                                console.log("Kodi Notification: Player.OnPlay");
                                playerId = json_result.params.data.player.playerid;
                            }

                            if (playerId === -1) {
                                playerId = 1;
                                console.log("Player ID was -1 (stream?) - let's assume video...");
                            }
                            // Playing pictures?  Just stay on the weather display
                            if (playerId === 2) {
                                console.log("Player ID is 2, displaying pictures, so do nothing.")
                                return;
                            }

                            console.log("Playback has started with playerid", playerId);

                            // Kodi playing - so first get static data - what is playing, artwork urls etc.
                            // Once this returns, the handler above will kick off the update of time remaining.
                            sendKodiMessageOverWebSocket(rws, 'Player.GetItem', {
                                properties: [
                                    'art',
                                    'title',
                                    'season',
                                    'episode',
                                    'endtime',
                                ],
                                playerid: playerId,
                            })
                        }

                        if (json_result.method === "Player.OnStop") {
                            console.log("Kodi: Player.OnStop");
                            clearInterval(this._updateTimeRemainingInterval);
                            this._updateTimeRemainingInterval = null;
                            this._clearProperties();
                            Alpine.store('isAvailable').kodi = false;
                        }

                    });

                } catch (error) {
                    console.error('Failed to create WebSocket:', error);
                    Alpine.store('isAvailable').kodi = false;
                }
            }, 500);
        },

        _clearProperties() {
            console.log("Clearing Kodi Properties");
            this.artwork = null;
            this.title = '';
            this.season = '';
            this.episode = '';
            this.finishTime = '';
            this.timeRemainingAsTime = '';
        },

        // Add cleanup method for the workarounds
        cleanup() {
            if (this._initDelay) {
                clearTimeout(this._initDelay);
                this._initDelay = null;
            }
            if (this._connectTimeout) {
                clearTimeout(this._connectTimeout);
                this._connectTimeout = null;
            }

            if (pingInterval) {
                clearInterval(pingInterval);
                pingInterval = null;
            }

            if (this._updateTimeRemainingInterval) {
                clearInterval(this._updateTimeRemainingInterval);
                this._updateTimeRemainingInterval = null;
            }

            if (rws) {
                try {
                    // CONNECTING(0) or OPEN(1)
                    if (rws.readyState < 2) rws.close(1000, 'Component cleanup');
                } catch (e) {
                    console.log('WebSocket cleanup close failed:', e);
                }
                rws = null;
            }


            this._clearProperties();
            this._monitoringKodiPlayback = false;
            Alpine.store('isAvailable').kodi = false;
        },

        init() {
            // Kick this off two seconds after we fire up, just to give time for things to settle a bit...
            this._initDelay = setTimeout(() => {
                console.log("KodiComponent init");
                this.createEnhancedKodiWebSocket(); // Use this.createEnhancedKodiWebSocket()
            }, 2000)
        },
    }
};