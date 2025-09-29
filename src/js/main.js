import Alpine from 'alpinejs';
window.Alpine = Alpine;

import "./components/ClockComponent";
import "./components/WeatherComponent";
import "./components/WeatherComponentOpenMeteo";
import "./components/KodiComponent";


// Utility function to pre-cache all the weather icons after initial load

// Config from URL parameters
Alpine.store('config', {
    init() {
        const urlParams = new URLSearchParams(window.location.search);

        this.kodi = urlParams.get('kodi') || '127.0.0.1';
        this.bom = urlParams.get('bom') || false;
        this.latitude = urlParams.get('latitude') || false;
        this.longitude = urlParams.get('longitude') || false;
        this.timezone = urlParams.get('timezone') || false;
        // Fall back to BOM weather for Ascot Vale if no weather location info provided
        if (!this.bom && !this.latitude){
            this.bom = 'r1r11df';
        }
        this.size = urlParams.get('size') || 'large';
        const kodiJson = urlParams.get('kodi-json') || '9090';
        const kodiWeb = urlParams.get('kodi-web') || '8080';
        this.kodiJsonUrl = `${this.kodi}:${kodiJson}`;
        this.kodiWebUrl = `${this.kodi}:${kodiWeb}`;
        this.kodiSSL = urlParams.get('kodi-ssl') === 'true';
        console.log("Kodi IP (&kodi, default 127.0.0.1) is", this.kodi);
        console.log("Kodi JSON Port (&kodi-json, default 9090) is", kodiJson);
        console.log("Kodi Web Port (&kodi-web, default 8080) is", kodiWeb);
        console.log("Kodi SSL (&kodi-ssl, default false) is", this.kodiSSL);
        console.log("Display Size (&size=small|medium|large, default large) is", this.size);
        if (this.bom){
            console.log("BOM Weather Location ID (&bom, default r1r11df - Ascot Vale, Victoria) is", this.bom);
        }
        else {
            console.log("OpenMeteo Weather Location Latitude: ", this.latitude, " Longitude: ", this.longitude);
        }

        // 'small' = Phone size (just basic info) - FF: Galaxy S10 (760x360) DPR 4
        if (this.size === "small") {
            this.textSoloClock = 'text-[11rem]';
            this.textSoloClockSeconds = 'text-9xl';
            this.textLarge = 'text-8xl';
            this.textMedium = 'text-7xl';
            this.textSmall = 'text-6xl';
            this.textSmaller = 'text-5xl';
            this.weatherIconSize = 375;
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
            this.weatherIconSize = 375;
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
            this.weatherIconSize = 375;
            this.kodiArtworkScale = "max-w-lg"
        }
    },
    kodi: false,
    kodiJsonUrl: false,
    kodiWebUrl: false,
    kodiSSL: false,
    bom: false,
    latitude: false,
    longitude: false,
    timezone: false,
    size: false,
    textSoloClock: null,
    textSoloClockSeconds: null,
    textLarge: null,
    textMedium: null,
    textSmall: null,
    testSmaller: null,
    weatherIconSize: null,
    kodiArtworkScale: null,
    iconMarginCorrection: null,
    svgAnimatedPath: "images/weather-icons/svg/",
});

// These control the conditional visibility of the Weather and Kodi components
Alpine.store('isAvailable', {
    init() {
        this.weather = false;
        this.kodi = false;
    },
    weather: false,
    kodi: false,
});

// Create the components - each are scoped to the window which is where Alpine expects to find them
Alpine.data('clock', window.clock);
// Weather - use either BOM weather or OpenMeteo components
if (Alpine.store('config').bom) {
    Alpine.data('weather', window.weather);
}
else {
    Alpine.data('weather', window.weatherOpenMeteo);
}
Alpine.data('kodi', window.kodi);

// Actually start Alpine
Alpine.start();

