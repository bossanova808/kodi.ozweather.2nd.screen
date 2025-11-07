// noinspection JSUnresolvedReference

import "../utils/logger.js"

const log = logger('JellyfinComponent.js');

function getJellyfinProtocols() {
    // Read SSL setting from centralized config
    const jellyfinSSL = Alpine.store('config').jellyfinSSL;

    return {
        http: jellyfinSSL ? 'https://' : 'http://',
    };
}

/**
 * Builds fallback URLs for artwork based on media type
 */
function buildArtworkFallbackUrls(item, baseUrl, apiKey) {
    const urls = [];
    const protocols = getJellyfinProtocols();
    const baseImageUrl = `${protocols.http}${baseUrl}/Items`;

    // Helper to add image URL if ID exists
    const addImageUrl = (itemId, imageType) => {
        if (itemId) {
            urls.push(`${baseImageUrl}/${itemId}/Images/${imageType}?api_key=${apiKey}`);
        }
    };

    switch (item.Type) {
        case 'Episode':
            // Series Poster -> Series Logo -> Episode Primary -> Episode Thumbnail -> Jellyfin Logo
            addImageUrl(item.SeriesId, 'Primary');
            addImageUrl(item.SeriesId, 'Logo');
            addImageUrl(item.Id, 'Primary');
            addImageUrl(item.Id, 'Thumb');
            break;

        case 'Movie':
            // Movie Poster -> Movie Thumbnail -> Jellyfin Logo
            addImageUrl(item.Id, 'Primary');
            addImageUrl(item.Id, 'Thumb');
            break;

        case 'Audio':
        case 'MusicAlbum':
        case 'AudioBook':
        case 'Book':
            // Album/Book cover -> Jellyfin logo
            // Try album first if available, then item itself
            addImageUrl(item.AlbumId || item.ParentId, 'Primary');
            addImageUrl(item.Id, 'Primary');
            break;

        default:
            // Generic fallback: Primary -> Thumb -> Jellyfin Logo
            addImageUrl(item.Id, 'Primary');
            addImageUrl(item.Id, 'Thumb');
            break;
    }

    // Always add Jellyfin logo as final fallback
    urls.push('/images/jellyfin-logo.png');

    return urls;
}

/**
 * Tests artwork URLs in order and returns the first valid one
 */
async function getValidArtworkUrl(urls) {
    for (const url of urls) {
        try {
            // For local Jellyfin logo, return immediately
            if (url.startsWith('/images/')) {
                return url;
            }

            // Test if the image URL is accessible with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                return url;
            }
        } catch (error) {
            // Continue to next URL
            continue;
        }
    }

    // Final fallback (should never reach here since logo is always last)
    return '/images/jellyfin-logo.png';
}

window.jellyfin = () => {

    // Polling interval reference
    let pollInterval = null;

    // Different polling rates
    const POLL_RATE_IDLE = 2000;      // 2 seconds when nothing playing
    const POLL_RATE_ACTIVE = 500;     // 0.5 seconds when playing

    return {
        artwork: null,
        title: '',
        season: '',
        episode: '',
        finishTime: '',
        timeRemainingAsTime: '',

        _initDelay: null,
        _currentMediaType: null,
        _currentItemId: null,
        _currentSessionId: null,
        _apiKey: null,
        _pollingActive: false,
        _currentPollRate: POLL_RATE_IDLE,

        startSessionPolling(pollRate = POLL_RATE_IDLE) {
            // If already polling at the same rate, don't restart
            if (pollInterval && this._currentPollRate === pollRate) {
                return;
            }

            if (pollInterval) {
                clearInterval(pollInterval);
            }

            // Get API key from config
            this._apiKey = Alpine.store('config').jellyfinApiKey;

            if (!this._apiKey) {
                log.error('Jellyfin API key not supplied, hiding Jellyfin component');
                Alpine.store('isAvailable').jellyfin = false;
                return;
            }

            this._currentPollRate = pollRate;
            log.info(`Starting Jellyfin session polling (every ${pollRate}ms)`);
            this._pollingActive = true;

            // Initial check
            this._requestSessionInfo();

            // Poll at the specified rate
            pollInterval = setInterval(() => {
                if (this._pollingActive) {
                    this._requestSessionInfo();
                }
            }, pollRate);
        },

        stopSessionPolling() {
            log.info('Stopping Jellyfin session polling');
            this._pollingActive = false;

            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
        },

        async _requestSessionInfo() {
            const protocols = getJellyfinProtocols();
            const url = `${protocols.http}${Alpine.store('config').jellyfinUrl}/Sessions?api_key=${this._apiKey}`;

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const response = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const sessions = await response.json();
                const activeSession = sessions.find(s => s.NowPlayingItem);

                if (activeSession) {
                    const item = activeSession.NowPlayingItem;
                    if (!item) return;

                    // Switch to fast polling when playback is active
                    if (this._currentPollRate !== POLL_RATE_ACTIVE) {
                        log.info('Playback detected - switching to fast polling (500ms)');
                        this.startSessionPolling(POLL_RATE_ACTIVE);
                    }

                    // Get artwork with fallback - only when item changes
                    if (item.Id && item.Id !== this._currentItemId) {
                        log.info(`New item detected (${item.Id}), fetching artwork`);
                        const fallbackUrls = buildArtworkFallbackUrls(
                            item,
                            Alpine.store('config').jellyfinUrl,
                            this._apiKey
                        );
                        log.info(`Attempting artwork URLs for ${item.Type}:`, fallbackUrls.map(u => u.includes(this._apiKey) ? u.replace(this._apiKey, '***') : u));

                        this.artwork = await getValidArtworkUrl(fallbackUrls);
                        log.info(`Artwork URL set to ${this.artwork.includes(this._apiKey) ? this.artwork.replace(this._apiKey, '***') : this.artwork}`);
                    }

                    this._handlePlayback(activeSession);
                } else {
                    // Switch to slow polling when nothing is playing
                    if (this._currentPollRate !== POLL_RATE_IDLE) {
                        log.info('No playback - switching to slow polling (2s)');
                        this.startSessionPolling(POLL_RATE_IDLE);
                    }

                    // Only clear if we were previously showing jellyfin
                    if (Alpine.store('isAvailable').jellyfin) {
                        log.info("No active playback session found - hiding Jellyfin display");
                        this._handleStopPlayback();
                    }
                }
            } catch (error) {
                log.error('Failed to fetch session info:', error);
                // Don't stop polling on error - network might recover
            }
        },

        _handlePlayback(session) {
            const item = session.NowPlayingItem;
            if (!item) return;

            this._currentItemId = item.Id;
            this._currentSessionId = session.Id;
            this._currentMediaType = item.Type;

            // Calculate time remaining and finish time
            this._updateTimeRemaining(session);

            // Extract title/season/episode info
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

            // Show the component
            if (!Alpine.store('isAvailable').jellyfin) {
                log.info("Showing Jellyfin component");
                Alpine.store('isAvailable').jellyfin = true;
            }
        },

        _handleStopPlayback() {
            log.info("Playback stopped - clearing Jellyfin display");
            this._clearProperties();
            Alpine.store('isAvailable').jellyfin = false;
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
            this._currentMediaType = null;
        },

        init() {
            // If we're not set up to use Jellyfin, we're done...
            if (Alpine.store('config').mediaSource !== 'jellyfin'){
                log.info("Media source is not set to jellyfin, doing nothing.");
                return;
            }
            this._initDelay = setTimeout(() => {
                log.info("JellyfinComponent init");
                this.startSessionPolling();
            }, 2000);
        },
    }
};
