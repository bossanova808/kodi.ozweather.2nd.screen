import Alpine from 'alpinejs';
window.Alpine = Alpine;

import "./utils/logger.js"
import "./components/ClockComponent";
import "./components/WeatherComponent";
import "./components/KodiComponent";
import './components/JellyfinComponent';


const log = logger('main.js');
const urlParams = new URLSearchParams(window.location.search);

// Config comes from URL parameters
Alpine.store('config', {
    init() {

        // Cosmetic Params
        this.size = urlParams.get('size') || 'large';
        // Weather Params
        this.bom = urlParams.get('bom') || false;
        this.uvStation = urlParams.get('uv') || '';
        this.latitude = urlParams.get('latitude') || false;
        this.longitude = urlParams.get('longitude') || false;
        this.timezone = urlParams.get('timezone') || false;
        // Fall back to BOM weather for Ascot Vale, Victoria, Australia - if no weather location info provided
        if (!this.bom && !this.latitude) {
            this.bom = 'r1r11df';
        }
        // Media source - currently 'jellyfin' or 'kodi'
        this.mediaSource = urlParams.get('media-source') || 'kodi';
        // Jellyfin Params
        if (this.mediaSource === 'jellyfin') {
            this.jellyfin = urlParams.get('jellyfin') || 'jellyfin';
            this.jellyfinPort = urlParams.get('jellyfin-port') || '8096';
            this.jellyfinUrl = `${this.jellyfin}:${this.jellyfinPort}`
            this.jellyfinApiKey = urlParams.get('jellyfin-api-key') || '';
            this.jellyfinDevice = urlParams.get('jellyfin-device') || ''
            this.jellyfinSSL = urlParams.get('jellyfin-ssl') === 'true';
            // Not currently used, left pending another try at a web sockets approach with JF
            this.jellyfinUser = urlParams.get('jellyfin-user') || ''
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
        log.info(`Display Size: ${this.size} (&size=small|medium|large, default large)`);

        if (this.bom) {
            log.info(`BOM Weather Location ID: ${this.bom} (&bom, default r1r11df - Ascot Vale, Victoria)`);
        } else {
            log.info(`OpenMeteo Weather Location Latitude: ${this.latitude}, Longitude: ${this.longitude}, , Timezone: ${this.timezone} (&latitude, $longitude, &timezone)`);
        }
        if (this.uvStation) {
            log.info(`UV station: ${this.uvStation} (&uv)`);
        }

        if (this.mediaSource === 'jellyfin') {
            log.info(`Media source: ${this.mediaSource} (&media-source)`);
            log.info(`Jellyfin Host: ${this.jellyfin} (&jellyfin, default jellyfin)`);
            log.info(`Jellyfin Port: ${this.jellyfinPort} (&jellyfin-port, default 8096)`);
            log.info(`Jellyfin Device: ${this.jellyfinDevice} (&jellyfin-device, default none)`);
            log.info(`Jellyfin SSL: ${this.jellyfinSSL} (&jellyfin-ssl, default false)`);
            if (this.jellyfinApiKey) {
                log.info(`Jellyfin API Key supplied: *** (&jellyfin-api-key)`);
            }
        }

        if (this.mediaSource === 'kodi') {
            log.info(`Kodi Host: ${this.kodi} (&kodi, default 127.0.0.1)`);
            log.info(`Kodi JSON Port: ${this.kodiJsonPort} (&kodi-json, default 9090)`);
            log.info(`Kodi Web Port: ${this.kodiWebPort} (&kodi-web, default 8080)`);
            log.info(`Kodi SSL: ${this.kodiSSL} (&kodi-ssl, default false)`);
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
    jellyfinDevice: false,
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
const mediaSourceParam = urlParams.get('media-source') || 'kodi';
if (mediaSourceParam === "kodi") {
    Alpine.data('media', window.kodi);
} else if (mediaSourceParam === "jellyfin") {
    Alpine.data('media', window.jellyfin);
} else {
    log.error(`Invalid media-source: ${mediaSourceParam}, falling back to default kodi given that is the historical default.`);
    Alpine.data('media', window.kodi);
}

// Potentially change the above later NOT to fall-back to Kodi - e.g. https://github.com/bossanova808/kodi.ozweather.2nd.screen/pull/10#pullrequestreview-3439392587
// log.warn(`Invalid media-source: ${mediaSource}, no media component will be available.`);
// // Provide a no-op media component
// Alpine.data('media', () => ({
//     init() {},
//     artwork: '',
//     timeRemainingAsTime: '',
//     finishTime: ''
// }));

// Actually start Alpine
Alpine.start();

