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

    // globals to store our Kodi websocket
    let rws = null;

    return {

        // 'Public' attributes
        artwork: null,
        title: null,
        season: null,
        episode: null,
        finishTime: null,
        timeRemainingAsTime: null,

        // 'Private' data
        _updateTimeRemainingInterval: null,
        _monitoringKodiPlayback: null,

        // 'Private' methods
        _clearProperties() {
            console.log("Clearing Kodi Properties");
            this.artwork = "";
            this.season = "";
            this.episode = "";
            this.finishTime = "";
            this.timeRemainingAsTime = "";
        },

        init() {


            // Kick this off two seconds after we fire up, just to give time for things to settle a bit...
            setTimeout(() => {
                console.log("KodiComponent init");

                rws = openKodiWebSocket()

                rws.addEventListener('open', () => {
                    console.log("Websocket [open]: Connection opened to Kodi")
                    // Check if Kodi is already playing, as soon as we connect...
                    sendKodiMessageOverWebSocket(rws, 'Player.GetActivePlayers', {});
                });

                rws.addEventListener('error', (event) => {
                    if (event.message !== 'TIMEOUT') {
                        console.log('Websocket [error]:');
                        console.log(event);
                        setTimeout(() => {
                            this._clearProperties();
                        }, 2000);
                    }
                    Alpine.store('isAvailable').kodi = false;
                });

                rws.addEventListener('offline', (event) => {
                    console.log('Websocket [offline]:');
                    console.log(event);
                    setTimeout(() => {
                        this._clearProperties();
                    }, 2000);
                    Alpine.store('isAvailable').kodi = false;
                });

                rws.addEventListener('close', (event) => {
                    // console.log(event);
                    if (event.reason !== 'timeout') {
                        console.log('Websocket [close]: Kodi connection not available / closed.');
                        if (!event.wasClean) {
                            console.log("WARNING: Socket close was not clean.");
                        }
                        console.log(event);
                        setTimeout(() => {
                            this._clearProperties();
                        }, 2000);
                    }
                    Alpine.store('isAvailable').kodi = false;
                });

                rws.addEventListener('message', (event) => {

                    // console.log(event);
                    let json_result = JSON.parse(event.data);

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

                        let artworkUrl = null;

                        if (results.item.art["album.thumb"] !== undefined) {
                            console.log("Artwork: found album.thumb")
                            artworkUrl = results.item.art["album.thumb"];
                        }
                        else if (results.item.art["tvshow.poster"] !== undefined) {
                            console.log("Artwork: found tvshow.poster")
                            artworkUrl = results.item.art["tvshow.poster"];
                        }
                        else if (results.item.art["movie.poster"] !== undefined) {
                            console.log("Artwork: found movie.poster")
                            artworkUrl = results.item.art["movie.poster"];
                        }
                        else if (results.item.art["poster"] !== undefined) {
                            console.log("Artwork: found poster")
                            artworkUrl = results.item.art["poster"];
                        }
                        else if (results.item.art["thumb"] !== undefined) {
                            console.log("Artwork: found thumb")
                            artworkUrl = results.item.art["thumb"];
                        }

                        if (artworkUrl) {
                            let artworkFromKodi = artworkUrl;
                            console.log("Kodi returned:", artworkFromKodi);
                            let kodiArtworkUrl;
                            if (artworkFromKodi.startsWith("http")) {
                                console.log("Kodi artwork url starts with http (i.e. link to external service, like PVR server) - use directly");
                                kodiArtworkUrl = artworkFromKodi;
                            }
                            else {
                                kodiArtworkUrl = "http://" + Alpine.store('config').kodiWebUrl + "/image/" + encodeURIComponent(artworkFromKodi);
                            }
                            console.log("Final artwork URL:", kodiArtworkUrl);
                            this.artwork = kodiArtworkUrl;
                        }

                        // & Kick off the update of time remaining every x milliseconds
                        let type = results.item.type;

                        // PVR is different, need to calculate the TimeRemaining as the Kodi label is not set
                        if (type === 'channel') {
                            this._updateTimeRemainingInterval = setInterval(function () {
                                sendKodiMessageOverWebSocket(rws, 'Player.GetProperties', {
                                    properties: [
                                        'percentage',
                                        'time',
                                        'totaltime'
                                    ],
                                    playerid: 1, // (Player ID is 1 here, as we know we're playing a video)
                                })
                            }, 500);
                        }
                        // Otherwise we can just use the Kodi calculated time remaining
                        else {
                            this._updateTimeRemainingInterval = setInterval(function () {
                                sendKodiMessageOverWebSocket(rws, 'XBMC.GetInfoLabels', {
                                    labels: [
                                        'VideoPlayer.TimeRemaining',
                                        'Player.FinishTime',
                                    ],
                                })
                            }, 1000);
                        }

                        // Kodi is playing and info will soon be available, so show our component, but give it a moment...
                        setTimeout(() => {
                            Alpine.store('isAvailable').kodi = true;
                        }, 1000);

                    }

                    // Basic way we get and update Time Remaining
                    if (json_result.id === "XBMC.GetInfoLabels") {
                        let results = json_result.result;
                        console.log("Processing result for: XBMC.GetInfoLabels");
                        // https://stackoverflow.com/questions/42879023/remove-leading-zeros-from-time-format
                        if (results["VideoPlayer.TimeRemaining"]===""){
                            console.log("(Empty time remaining, do nothing)");
                        }
                        else {
                            let temp = results["VideoPlayer.TimeRemaining"].replace(/^0(?:0:0?)?/, '');
                            (temp !== "") ? this.timeRemainingAsTime = "-" + temp : this.timeRemainingAsTime = "";
                        }
                        if (results["Player.FinishTime"]===""){
                            console.log("(Empty finish time, do nothing)");
                        }
                        else {
                            console.log("Kodi finish time is " + results["Player.FinishTime"])
                            // Convert Kodi 24hr 18:00 to 12hr 6:00
                            const finishTime12hr = new Date('1970-01-01T' + results["Player.FinishTime"] + ':00Z')
                              .toLocaleTimeString('en-US',
                                {timeZone:'UTC',hour12:true,hour:'numeric',minute:'numeric'}
                              );
                            this.finishTime = finishTime12hr.replace(/^0(?:0:0?)?/, '').replace(' PM','pm').replace(' AM','am');
                            console.log("Finish time is now " + this.finishTime);
                        }
                    }

                    // If not traditionally available (PVR), we calculate it instead...
                    if (json_result.id === "Player.GetProperties") {
                        let results = json_result.result;
                        console.log("Processing result for: Player.GetProperties");

                        this.durationInSeconds = calculateTotalSeconds(results.totaltime);
                        this.durationAsTime = secondsToTimeFormat(this.durationInSeconds);
                        this.elapsedInSeconds = calculateTotalSeconds(results.time);
                        this.elapsedAsTime = secondsToTimeFormat(this.elapsedInSeconds);
                        this.timeRemainingInSeconds = this.durationInSeconds - this.elapsedInSeconds;
                        this.timeRemainingAsTime = "-" + secondsToTimeFormat(this.timeRemainingInSeconds).replace(/^0(?:0:0?)?/, '');
                        this.percentageElapsed = results.percentage.toFixed(0);
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
                            ],
                            playerid: playerId,
                        })

                    }

                    if (json_result.method === "Player.OnStop") {
                        console.log("Kodi: Player.OnStop");
                        clearInterval(this._updateTimeRemainingInterval);
                        this._clearProperties();
                        Alpine.store('isAvailable').kodi = false;
                    }
                });



            }, 2000)
        },
    }
};