import Alpine from 'alpinejs';
window.Alpine = Alpine;

import "./components/ClockComponent";
import "./components/WeatherComponent";
import "./components/WeatherComponentOpenMeteo";
import "./components/KodiComponent";

// Config from URL parameters
Alpine.store('config', {
    init() {
        let params = new URLSearchParams(window.location.search)

        this.kodi = params.has('kodi') ? params.get('kodi') : '127.0.0.1';
        this.bom = params.has('bom') ? params.get('bom') : false;
        this.lat = params.has('lat') ? params.get('lat') : false;
        this.lon = params.has('lon') ? params.get('lon') : false;
        // Fall back to BOM weather for Ascot Vale if no weather location info provided
        if (!this.bom && !this.lat){
            this.bom = 'r1r11df';
        }
        this.size = params.has('size') ? params.get('size') : 'large';
        let kodiJson = params.has('kodi-json') ? params.get('kodi-json') : '9090';
        let kodiWeb = params.has('kodi-web') ? params.get('kodi-web') : '8080';

        this.kodiJsonUrl = `${this.kodi}:${kodiJson}`;
        this.kodiWebUrl = `${this.kodi}:${kodiWeb}`;

        console.log("Kodi IP (&kodi, default 127.0.0.1) is", this.kodi);
        console.log("Kodi JSON Port (&kodi-json, default 9090) is", this.kodiJsonUrl);
        console.log("Kodi Web Port (&kodi-web, default 8080) is", this.kodiWebUrl);
        console.log("Display Size (&size=small|medium|large, default large) is", this.size);
        if (this.bom){
            console.log("BOM Weather Location ID (&bom, default r1r11df - Ascot Vale, Victoria) is", this.bom);
        }
        else {
            console.log("OpenMeteo Weather Location Latitude: ", this.lat, " Longitude: ", this.lon);
        }

        // 'small' = Phone size (just basic info) - FF: Galaxy S10 (760x360) DPR 4
        if (this.size === "small") {
            this.textSoloClock = 'text-[11rem]';
            this.textSoloClockSeconds = 'text-9xl';
            this.textLarge = 'text-8xl';
            this.textMedium = 'text-7xl';
            this.textSmall = 'text-6xl';
            this.weatherIconSize = 375;
        }
        // 'medium' = Smaller tablets, ~7" screens - FF: Responsive, 920x570, DPR 2, Zoom to 67%
        else if (this.size === "medium") {
            this.textSoloClock = 'text-[11rem]';
            this.textSoloClockSeconds = 'text-9xl';
            this.textLarge = 'text-7xl';
            this.textMedium = 'text-6xl';
            this.textSmall = 'text-5xl';
            this.weatherIconSize = 375;
        }
        // 'large' = Default, 8 inch or bigger tablets - FF: Responsive, 960x580, DPR 1, Zoom to 80%
        else {
            this.textSoloClock = 'text-[11rem]';
            this.textSoloClockSeconds = 'text-9xl';
            this.textLarge = 'text-8xl';
            this.textMedium = 'text-7xl';
            this.textSmall = 'text-6xl';
            this.weatherIconSize = 375;
        }
    },
    kodi: false,
    kodiJsonUrl: false,
    kodiWebUrl: false,
    bom: false,
    lat: false,
    lon: false,
    size: false,
    textSoloClock: null,
    textSoloClockSeconds: null,
    textLarge: null,
    textSmall: null,
    weatherIconSize: null,
    iconMarginCorrection: null,
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

