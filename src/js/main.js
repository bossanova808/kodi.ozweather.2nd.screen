import Alpine from 'alpinejs';
window.Alpine = Alpine;

import "./utils/logger.js"
import "./components/ClockComponent";
import "./components/WeatherComponent";
import "./components/KodiComponent";
import './components/JellyfinComponent';


const log = logger('main.js');

// Config comes from URL parameters
Alpine.store('config', {
    init() {
        const urlParams = new URLSearchParams(window.location.search);

        // Cosmetic Params
        this.size = urlParams.get('size') || 'large';
        // Weather Params
        this.bom = urlParams.get('bom') || false;
        this.uvStation = urlParams.get('uv') || '';
        this.latitude = urlParams.get('latitude') || false;
        this.longitude = urlParams.get('longitude') || false;
        this.timezone = urlParams.get('timezone') || false;
        // Fall back to BOM weather for Ascot Vale, Victoria, Australia - if no weather location info provided
        if (!this.bom && !this.latitude){
            this.bom = 'r1r11df';
        }
        // Media source - currently Jellyfin or Kodi
        this.mediaSource = urlParams.get('media-source') || 'jellyfin';
        // Jellyfin Params
        if (this.mediaSource === 'jellyfin') {
            this.jellyfin = urlParams.get('jellyfin') || 'jellyfin';
            this.jellyfinPort = urlParams.get('jellyfin-port') || '8096';
            this.jellyfinUrl = `${this.jellyfin}:${this.jellyfinPort}`
            this.jellyfinApiKey = urlParams.get('jellyfin-api') || '';
            this.jellyfinSSL = urlParams.get('jellyfin-ssl') || false;
            this.jellyfinUser = urlParams.get('jellyfin-user') ||  ''
            this.jellyfinPassword = urlParams.get('jellyfin-password') || ''
        }
        // Kodi Params
        if (this.mediaSource === 'kodi') {
            this.kodi = urlParams.get('kodi') || '127.0.0.1';
            this.kodiJsonPort = urlParams.get('kodi-json') || '9090';
            this.kodiWebPort = urlParams.get('kodi-web') || '8080';
            this.kodiJsonUrl = `${this.kodi}:${this.kodiJsonPort}`;
            this.kodiWebUrl = `${this.kodi}:${this.kodiWebPort}`;
            this.kodiSSL = urlParams.get('kodi-ssl') === 'true';
        }

        // Explicitly log the config / provide instructions
        log.info("Display Size (&size=small|medium|large, default large) is", this.size);

        if (this.bom){
            log.info("BOM Weather Location ID (&bom, default r1r11df - Ascot Vale, Victoria) is", this.bom);
        }
        else {
            log.info("OpenMeteo Weather Location Latitude: ", this.latitude, " Longitude: ", this.longitude);
        }
        if (this.uvStation) {
            log.info("UV station: ", this.uvStation);
        }

        if (this.mediaSource === 'jellyfin') {
            log.info("Jellyfin Host (&jellyfin, default jellyfin) is", this.jellyfin);
            log.info("Jellyfin Port (&jellyfin-port, default 8096) is", this.jellyfinPort);
            log.info("Jellyfin SSL (&jellyfin-ssl, default false) is", this.jellyfinSSL);
            log.info("Jellyfin user (&jellyfin-user, default user) is", this.jellyfinUser);
            if (this.jellyfinPassword) {
                log.info("Jellyfin password (&jellyfin-password, default password) is", this.jellyfinPassword.replace(this.jellyfinPassword, '***'));
            }
            if (this.jellyfinApiKey) {
                log.info("Jellyfin API key (&jellyfin-api-key) is", this.jellyfinApiKey.replace(this.jellyfinApiKey, '***'));
            }
        }

        if (this.mediaSource === 'kodi') {
            log.info("Kodi Host (&kodi, default 127.0.0.1) is", this.kodi);
            log.info("Kodi JSON Port (&kodi-json, default 9090) is", this.kodiJsonPort);
            log.info("Kodi Web Port (&kodi-web, default 8080) is", this.kodiWebPort);
            log.info("Kodi SSL (&kodi-ssl, default false) is", this.kodiSSL);
        }

        // 'small' = Phone size (just basic info) - FF: Galaxy S10 (760x360) DPR 4
        if (this.size === "small") {
            this.textSoloClock = 'text-[11rem]';
            this.textSoloClockSeconds = 'text-9xl';
            this.textLarge = 'text-7xl';
            this.textMedium = 'text-6xl';
            this.textSmall = 'text-5xl';
            this.textSmaller = 'text-4xl';
            this.weatherIconSize = 200;
            this.moonIconSize = 50;
            this.kodiArtworkScale = "max-w-sm"
        }
        // 'medium' = Smaller tablets, ~7" screens - FF: Responsive, 920x570, DPR 2, Zoom to 67%
        else if (this.size === "medium") {
            this.textSoloClock = 'text-[11rem]';
            this.textSoloClockSeconds = 'text-9xl';
            this.textLarge = 'text-7xl';
            this.textMedium = 'text-6xl';
            this.textSmall = 'text-5xl';
            this.textSmaller = 'text-4xl';
            this.weatherIconSize = 275;
            this.moonIconSize = 75;
            this.kodiArtworkScale = "max-w-md"
        }
        // 'large' = Default, 8 inch or bigger tablets - FF: Responsive, 960x580, DPR 1, Zoom to 80%
        else {
            this.textSoloClock = 'text-[11rem]';
            this.textSoloClockSeconds = 'text-9xl';
            this.textLarge = 'text-8xl';
            this.textMedium = 'text-7xl';
            this.textSmall = 'text-6xl';
            this.textSmaller = 'text-5xl';
            this.weatherIconSize = 325;
            this.moonIconSize = 200;
            this.kodiArtworkScale = "max-w-lg"
        }
    },
    mediaSource: false,
    jellyfin: false,
    jellyfinPort: false,
    jellyfinUrl: false,
    jellyfinApiKey: false,
    jellyfinSSL: false,
    jellyfinUser: false,
    jellyfinPassword: false,
    kodi: false,
    kodiJsonPort: false,
    kodiWebPort: false,
    kodiJsonUrl: false,
    kodiWebUrl: false,
    kodiSSL: false,
    bom: false,
    uvStation: false,
    latitude: false,
    longitude: false,
    timezone: false,
    size: false,
    textSoloClock: null,
    textSoloClockSeconds: null,
    textLarge: null,
    textMedium: null,
    textSmall: null,
    textSmaller: null,
    weatherIconSize: null,
    moonIconSize: null,
    kodiArtworkScale: null,
    iconMarginCorrection: null,
    svgAnimatedPath: "images/weather-icons/svg/",
});

// These control the conditional visibility of the Weather and Kodi components
Alpine.store('isAvailable', {
    init() {
        this.weather = false;
        this.kodi = false;
        this.jellyfin = false;
    },
    weather: false,
    kodi: false,
    jellyfin: false,
});

// Create the components - each are scoped to the window which is where Alpine expects to find them
Alpine.data('clock', window.clock);
Alpine.data('weather', window.weather);
//Alpine.data('kodi', window.kodi);
Alpine.data('jellyfin', window.jellyfin);

// Actually start Alpine
Alpine.start();

