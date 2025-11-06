import { fetchWeatherApi } from 'openmeteo';
import { Moon, Hemisphere } from "lunarphase-js";
import "../utils/logger.js"

const log = logger('WeatherComponent.js');

/**
 * Location API Response Type
 * @typedef {{
 *   name: string,
 *   data: {
 *     latitude: number,
 *     longitude: number
 *   }
 * }} LocationResponse
 */

/**
 * Observations API Response Type
 * @typedef {{
 *   metadata: {
 *     response_timestamp: string
 *   },
 *   data: {
 *     temp: number,
 *     temp_feels_like: number|null,
 *     rain_since_9am: number
 *   }
 * }} ObservationsResponse
 */

/**
 * Forecast Day Data Type
 * @typedef {{
 *   astronomical: {
 *     sunrise_time: string,
 *     sunset_time: string
 *   },
 *   short_text: string,
 *   icon_descriptor: string,
 *   rain: {
 *     chance: number,
 *     amount: {
 *       min: number,
 *       max: number|null
 *     }
 *   },
 *   uv: {
 *     max_index: number
 *   },
 *   now: {
 *     temp_now: number,
 *     temp_later: number,
 *     now_label: string,
 *     later_label: string
 *   }
 * }} ForecastDayData
 */

/**
 * Forecast API Response Type
 * @typedef {{
 *   data: {
 *     '0': ForecastDayData,
 *     '1': ForecastDayData,
 *     '2': ForecastDayData,
 *     '3': ForecastDayData,
 *     '4': ForecastDayData,
 *     '5': ForecastDayData,
 *     '6': ForecastDayData
 *   }
 * }} ForecastResponse
 */


const mapUVValueToText = {
    1: 'Very Low',
    2: 'Low',
    3: 'Low Moderate',
    4: 'Moderate',
    5: 'High Moderate',
    6: 'High',
    7: 'High',
    8: 'Very High',
    9: 'Very High',
    10: 'Extreme',
    11: 'Extreme',
}

const mapBOMConditionToWeatherIcon = {
    "clear-day": "clear-day.svg",
    "clear-night": "clear-night.svg",
    "cloudy-day": "cloudy.svg",
    "cloudy-night": "partly-cloudy-night.svg",
    "dusty-day": "dust-day.svg",
    "dusty-night": "dust-night.svg",
    "fog-day": "fog-day.svg",
    "fog-night": "fog-night.svg",
    "frost-day": "thermometer-snow.svg",
    "frost-night": "thermometer-snow.svg",
    "hazy-day": "haze-day.svg",
    "hazy-night": "haze-night.svg",
    "heavy_shower-day": "extreme-day-rain.svg",
    "heavy_shower-night": "extreme-night-rain.svg",
    "light_rain-day": "extreme-day-drizzle.svg",
    "light_rain-night": "extreme-night-drizzle.svg",
    "light_shower-day": "overcast-day-drizzle.svg",
    "light_shower-night": "overcast-night-drizzle.svg",
    "mostly_sunny-day": "partly-cloudy-day.svg",
    "mostly_sunny-night": "partly-cloudy-night.svg",
    "partly_cloudy-day": "partly-cloudy-day.svg",
    "partly_cloudy-night": "partly-cloudy-night.svg",
    "rain-day": "rain.svg",
    "rain-night": "partly-cloudy-night-rain.svg",
    "shower-day": "partly-cloudy-day-rain.svg",
    "shower-night": "partly-cloudy-night-rain.svg",
    "snow-day": "snow.svg",
    "snow-night": "overcast-night-snow.svg",
    "storm-day": "thunderstorms-overcast-rain.svg",
    "storm-night": "thunderstorms-night-overcast-rain.svg",
    "sunny-day": "clear-day.svg",
    "sunny-night": "clear-night.svg",
    "tropical_cyclone-day": "hurricane.svg",
    "tropical_cyclone-night": "hurricane.svg",
    "windy-day": "wind-onshore.svg",
    "windy-night": "windsock.svg",
}

const mapMoonPhaseToWeatherIcon = {
    "New": "moon-new.svg",
    "Waxing Crescent":  "moon-waxing-crescent.svg",
    "First Quarter": "moon-first-quarter.svg",
    "Waxing Gibbous": "moon-waxing-gibbous.svg",
    "Full": "moon-full.svg",
    "Waning Gibbous": "moon-waning-gibbous.svg",
    "Last Quarter": "moon-last-quarter.svg",
    "Waning Crescent": "moon-waning-crescent.svg",
}


// ********* OPEN METEO

/**
 * OpenMeteo API Response Types
 * @typedef {{
 *   time: () => bigint,
 *   value: () => number,
 *   valuesArray: () => Float32Array
 * }} WeatherVariable
 */

/**
 * @typedef {{
 *   time: () => bigint,
 *   variables: (index: number) => WeatherVariable
 * }} CurrentWeather
 */

/**
 * @typedef {{
 *   time: () => bigint,
 *   timeEnd: () => bigint,
 *   interval: () => number,
 *   variables: (index: number) => WeatherVariable
 * }} DailyWeather
 */

/**
 * @typedef {{
 *   utcOffsetSeconds: () => number,
 *   timezone: () => string,
 *   timezoneAbbreviation: () => string,
 *   latitude: () => number,
 *   longitude: () => number,
 *   current: () => CurrentWeather,
 *   daily: () => DailyWeather
 * }} OpenMeteoResponse
 */

// See bottom of https://open-meteo.com/en/docs
// WMO Weather interpretation codes (WW)
// Code 	Description
// 0 	Clear sky
// 1, 2, 3 	Mainly clear, partly cloudy, and overcast
// 45, 48 	Fog and depositing rime fog
// 51, 53, 55 	Drizzle: Light, moderate, and dense intensity
// 56, 57 	Freezing Drizzle: Light and dense intensity
// 61, 63, 65 	Rain: Slight, moderate and heavy intensity
// 66, 67 	Freezing Rain: Light and heavy intensity
// 71, 73, 75 	Snow fall: Slight, moderate, and heavy intensity
// 77 	Snow grains
// 80, 81, 82 	Rain showers: Slight, moderate, and violent
// 85, 86 	Snow showers slight and heavy
// 95 * 	Thunderstorm: Slight or moderate
// 96, 99 * 	Thunderstorm with slight and heavy hail
//
// (*) Thunderstorm forecast with hail is only available in Central Europe

const mapOpenMeteoWeatherCodeToOutlook = {
    0: "Sunny",
    1: "Mostly Sunny",
    2: "Partly Cloudy",
    3: "Cloudy",
    45: "Fog",
    48: "Fog",
    51: "Light Drizzle",
    53: "Drizzle",
    55: "Heavy Drizzle",
    56: "Light Sleet",
    57: "Sleet",
    61: "Light Rain",
    63: "Rain",
    65: "Heavy Rain",
    66: "Freezing Rain",
    67: "Heavy Freezing Rain",
    71: "Light Snow",
    73: "Snow",
    75: "Heavy Snow",
    77: "Snow",
    80: "Light Showers",
    81: "Showers",
    82: "Heavy Showers",
    85: "Snow Showers",
    86: "Heavy Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Thunderstorm with Heavy Hail",
}

const mapOpenMeteoWeatherCodeToWeatherIcon = {
    0: "clear-day.svg",
    1: "clear-day.svg",
    2: "partly-cloudy-day.svg",
    3: "cloudy.svg",
    45: "fog.svg",
    48: "fog.svg",
    51: "drizzle.svg",
    53: "drizzle.svg",
    55: "rain.svg",
    56: "sleet.svg",
    57: "extreme-sleet.svg",
    61: "drizzle.svg",
    63: "rain.svg",
    65: "extreme-rain.svg",
    66: "sleet.svg",
    67: "extreme-rain.svg",
    71: "snow.svg",
    73: "snow.svg",
    75: "extreme-snow.svg",
    77: "snow.svg",
    80: "drizzle.svg",
    81: "rain.svg",
    82: "extreme-rain.svg",
    85: "snow.svg",
    86: "extreme-snow.svg",
    95: "thunderstorms-rain.svg",
    96: "thunderstorms-rain.svg",
    99: "hail.svg",
}

// ********* END OPEN METEO


window.weather = () => {
    return {
        // These hold the full JSON returned
        location: "",
        forecast: "",
        observations: "",
        observationsFetchedAt: "",
        uv: "",
        // How often to update weather (n minutes)
        updateWeatherEveryMinutes: 5,
        weatherConsideredStaleAtMinutes: 60,
        // set by updateLocation()
        locationName: "",
        locationLatitude: "",
        locationLongitude: "",
        // set by updateObservations()
        currentTemperature: "",
        currentFeelsLike: "",
        // set by updateForecast()
        icon: "",
        iconAlt: "",
        outlook: "",
        forecastHigh: "",
        forecastHighText: "",
        forecastLow: "",
        forecastLowText: "",
        forecastUVMax: "",
        forecastUVMaxText: "",
        forecastUVMaxIcon: "",
        rainChance: "",
        rainAmount: "",
        rainSince9am: "",
        showRainSince9am: true,
        sunrise: "",
        sunset: "",
        uvNow: "",
        uvIcon: "",
        showUV: false,
        moonPhase: "",
        moonPhaseEmoji: "",
        moonPhaseIcon: "",
        isWaxing: false,
        isWaning: false,
        showMoon: false,

        // 'Private' methods
        _clearProperties() {
            log.info("Clearing Weather Properties.");
            // These hold the full JSON returned
            this.location = "";
            this.forecast = "";
            this.observations = "";
            this.observationsFetchedAt = "";
            // set by updateLocation()
            this.locationName = "";
            this.locationLatitude = "";
            this.locationLongitude = "";
            // set by updateObservations()
            this.currentTemperature = "";
            this.currentFeelsLike = "";
            this.sunrise = "";
            this.sunset = "";
            // set by updateForecast()
            this.icon = "";
            this.iconAlt = "";
            this.outlook = "";
            this.forecastHigh = "";
            this.forecastHighText = "";
            this.forecastLow = "";
            this.forecastLowText = "";
            this.forecastUVMax = "";
            this.forecastUVMaxText = "";
            this.forecastUVMaxIcon = "";
            this.rainChance = "";
            this.rainAmount = "";
            this.rainSince9am = "";
            // set by updateUV()
            this.uvNow = "";
            this.uvIcon = "";
            this.showUV = false;
            // set by updateMoon()
            this.moonPhase = "";
            this.moonPhaseEmoji = "";
            this.moonPhaseIcon = "";
            this.isWaxing = false;
            this.isWaning = false;
            this.showMoon = false;
        },


        init() {
            log.info("WeatherComponent init");

            log.info("Pre-caching weather icons")
            for (const [_key, value] of Object.entries(mapBOMConditionToWeatherIcon)) {
                this.preload_image(value).then();
            }
            // Add UV icon pre-caching
            log.info("Pre-caching UV icons")
            for (let i = 0; i <= 11; i++) {
                this.preload_image(`uv-index-${i}.svg`).then();
            }

            // this stops IDE errors with awaits,
            let result = null;
            const weatherService = Alpine.store('config').bom ? "bom" : "open_meteo";
            // Get the initial location & weather data
            result = this.updateWeather(true, weatherService)

            // Then, update every 5 minutes (5 * 60 * 1000)
            setInterval(() => {
                result = this.updateWeather(false, weatherService)
            }, this.updateWeatherEveryMinutes * 60 * 1000);
            // & check that it remains fresh (e.g. network dropout or whatever).
            // Check for every third weather update
            setInterval(() => {
                this.checkWeatherRecentlyUpdated();
            }, this.updateWeatherEveryMinutes * 3 * 60 * 1000);

        },

        // Check if Weather was actually retrieved recently
        // If more than 60 minutes old, there's a problem.
        checkWeatherRecentlyUpdated(){
            let now = new Date();
            if (!this.observationsFetchedAt) return;
            let weatherAge = Math.round((now - this.observationsFetchedAt) / 60000);
            log.info(`Current weather data was fetched ${weatherAge} minutes ago`);
            if (weatherAge > this.weatherConsideredStaleAtMinutes) {
                log.info("Weather is stale.");
                this._clearProperties();
                Alpine.store('isAvailable').weather = false;
            }
        },

        // Utility function to pre-cache all the weather icons after initial load
        async preload_image(img_svg) {
            let img = new Image();
            img.src = Alpine.store('config').svgAnimatedPath + img_svg;
            log.info(`Pre-cached ${img.src}`);
        },

        // 'Parent' function to trigger the various stages of updating the weather data.
        // (call with init = true to kick off)
        // Awaiting of fetch data method from:
        // https://stackoverflow.com/questions/41775517/waiting-for-the-fetch-to-complete-and-then-execute-the-next-instruction/51992739#51992739
        async updateWeather (init = false, weatherService) {

            // Are we using Australian BOM data?
            if (weatherService==="bom") {
                log.info("Using Australian BOM for weather data.")

                // On initialisation, we must have the location data
                if (init) {
                    try {
                        await this.updateLocation();
                    }
                    catch (e) {
                        log.error("Error fetching weather location on startup - big problem!")
                        log.error(e);
                        this._clearProperties();
                        Alpine.store('isAvailable').weather = false;
                        return;
                    }
                }

                try {
                    await this.updateObservations();
                } catch (e) {
                    log.error("Error fetching observations.")
                    log.error(e);
                    this._clearProperties();
                    Alpine.store('isAvailable').weather = false;
                    return;
                }

                try {
                    await this.updateForecast();
                } catch (e) {
                    log.error("Error fetching forecast.")
                    log.error(e);
                    this._clearProperties();
                    Alpine.store('isAvailable').weather = false;
                    return;
                }
            }
            // Not using Australian BOM data? Use OpenMeteo for weather data instead
            else {
                log.info("Using Open Meteo for weather data.")
                try {
                    await this.updateForecastAndObservationsUsingOpenMeteo()
                }
                catch (e) {
                    log.error("Error fetching weather from OpenMeteo.")
                    log.error(e);
                    this._clearProperties();
                    Alpine.store('isAvailable').weather = false;
                    return;
                }
            }

            // ***
            // Data below here is less essential so don't block availability
            // ***

            try{
                await this.updateUV();
            }
            catch (e) {
                log.error("Error fetching UV.")
                log.error(e);
                // return;
            }

            try{
                await this.updateMoon(weatherService);
            }
            catch (e) {
                log.error("Error calculating moon phase.")
                log.error(e);
                // return;
            }

            // If we get here, at least some basic weather is available, so if we're not showing it, show it!
            // If we have just current temperature, the showing that and the clock is better than just the clock
            // Missing things will simply not display
            // @coderabbitai no further gating necessary!!
            if (this.currentTemperature) {
                Alpine.store('isAvailable').weather = true;
            }
        },

        // Run only once at init, to get the location name, and latitude and longitude
        async updateLocation() {
            let locationsURL = `https://api.weather.bom.gov.au/v1/locations/${Alpine.store('config').bom}`;
            return await fetch(locationsURL, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            })
                .then(response => response.json())
                .then(json => {
                    log.info(JSON.stringify(json));
                    /** @type {LocationResponse} */
                    this.location = json;
                    this.locationLatitude = this.location.data.latitude.toFixed(2);
                    this.locationLongitude = this.location.data.longitude.toFixed(2);
                    this.locationName = this.location.name;
                })
        },

        // Runs every update to get the current observation data
        async updateObservations() {
            let observationsURL = `https://api.weather.bom.gov.au/v1/locations/${Alpine.store('config').bom.substring(0,6)}/observations`;
            return await fetch(observationsURL, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            })
                .then(response => response.json())
                .then(json => {
                    log.info(JSON.stringify(json));
                    /** @type {ObservationsResponse} */
                    this.observations = json;
                    // Use this to keep track of when we last got observations, in case of network drop etc.
                    this.observationsFetchedAt =  new Date(this.observations.metadata.response_timestamp);
                    this.currentTemperature = this.observations.data.temp + '°';
                    if (this.observations.data.temp_feels_like != null) {
                        this.currentFeelsLike = this.observations.data.temp_feels_like + '°';
                }
                    else {
                        this.currentFeelsLike = "";
                    }
                    this.rainSince9am = this.observations.data.rain_since_9am;
                })
        },

        // Runs every update to get the current forecast data
        async updateForecast() {
            let forecastUrl = `https://api.weather.bom.gov.au/v1/locations/${Alpine.store('config').bom}/forecasts/daily`
            return await fetch(forecastUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            })
                .then(response => response.json())
                .then(json => {
                    log.info(JSON.stringify(json));
                    /** @type {ForecastResponse} */
                    this.forecast = json;
                    /** @type {ForecastDayData} */
                    const todayForecast = this.forecast.data['0'];
                    // Is it currently day or night?
                    // All UTC/ISO - e.g. 2023-02-03T19:38:01Z
                    let now = new Date();
                    this.sunrise = new Date(todayForecast.astronomical.sunrise_time);
                    this.sunset = new Date(todayForecast.astronomical.sunset_time);
                    let dayOrNight = '-night';
                    // log.info("Now", now);
                    // log.info("Sunrise", sunrise);
                    // log.info("Sunset", sunset);
                    if ( now > this.sunrise && now < this.sunset ) {
                        dayOrNight = '-day';
                    }
                    // What is the general outlook?
                    this.outlook = todayForecast.short_text;
                    // Remove full stop on end
                    this.outlook = this.outlook.replace(/\.$/, '')

                    // Save the icon - we convert the short text and use that to get the icon, if we can
                    // as sometimes the BOM will return an outlook of 'Sunny' but an icon of 'shower' if there is even
                    // a small percentage of 0mm of rain or whatever.
                    const slugify = s => (s ?? "")
                      .toLowerCase()
                      .replace(/\s+/g, "_")
                      .replace(/[^\w-]/g, "")
                      .trim();
                    let iconFromShortText = slugify(this.outlook) + dayOrNight;
                    log.info(`iconFromShortText is ${iconFromShortText}`);
                    if (mapBOMConditionToWeatherIcon[iconFromShortText] !== undefined){
                        this.icon = Alpine.store('config').svgAnimatedPath + mapBOMConditionToWeatherIcon[iconFromShortText];
                        this.iconAlt = iconFromShortText;
                        log.info(`Mapped BOM Short Text [${this.outlook}] -> [${iconFromShortText}] -> to actual icon ${this.icon}`)
                    }
                    else {
                        let bomIconDescriptor = todayForecast.icon_descriptor + dayOrNight;
                        this.icon = Alpine.store('config').svgAnimatedPath + mapBOMConditionToWeatherIcon[bomIconDescriptor];
                        this.iconAlt = todayForecast.icon_descriptor;
                        log.info(`Mapped BOM Icon Descriptor [${this.iconAlt}] -> [${bomIconDescriptor}] -> to actual icon ${this.icon}`)
                    }
                    // Clean up the outlook text


                    // Rain
                    this.rainChance = todayForecast.rain.chance;
                    if (todayForecast.rain.amount.max != null)
                    {
                        this.rainAmount = todayForecast.rain.amount.min + "-" + todayForecast.rain.amount.max + "mm";
                    }
                    else {
                        // Instead of 5% of none, present it as 95% chance of no rain
                        this.rainAmount = 'no rain';
                        this.rainChance = 100 - this.rainChance;
                    }
                    this.forecastUVMax = todayForecast.uv.max_index;
                    // UV Max - if forecast over 11, clamp to 11 for description and icon purposes
                    // Values over 11 are possible from the API, but descriptions and icons top out at Extreme/11
                    const uvClampedMax = Math.min(Math.round(todayForecast.uv.max_index ?? 0), 11);
                    this.forecastUVMaxText = mapUVValueToText[uvClampedMax];
                    this.forecastUVMaxIcon = Alpine.store('config').svgAnimatedPath + `uv-index-${uvClampedMax}.svg`;
                    // Max and Min
                    this.forecastLow = todayForecast.now.temp_later;
                    this.forecastLowText = todayForecast.now.later_label;
                    this.forecastHigh = todayForecast.now.temp_now;
                    this.forecastHighText = todayForecast.now.now_label;

                    // Hack to deal with the bizarre BOM API 'Now' behaviour...API design fail...
                    if (this.forecastLow > this.forecastHigh){
                        let temp = this.forecastLow;
                        this.forecastLow = this.forecastHigh;
                        this.forecastHigh = temp;
                    }
                    this.forecastHigh = this.forecastHigh + '°';
                    this.forecastLow = this.forecastLow + '°';
                })
        },

        async updateForecastAndObservationsUsingOpenMeteo () {

            log.info("updateWeatherOpenMeteo");

            // OpenMeteo doesn't really have an easy to get equivalent for these...
            this.showRainSince9am = false;
            this.showUV = false

            const params = {
                "latitude": Alpine.store('config').latitude,
                "longitude": Alpine.store('config').longitude,
                "current": ["temperature_2m", "apparent_temperature", "precipitation", "weather_code"],
                "daily": ["temperature_2m_max", "temperature_2m_min", "precipitation_sum", "precipitation_probability_mean"],
                "timezone": Alpine.store('config').timezone,
                "forecast_days": 1
            };
            const url = "https://api.open-meteo.com/v1/forecast";
            log.info(`Calling ${url} with params:`)
            console.table(params);
            const responses = await fetchWeatherApi(url, params);

            // Helper function to form time ranges
            const range = (start, stop, step) =>
                Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

            // Process first location. Add a for-loop for multiple locations or weather models
            const response = /** @type {OpenMeteoResponse} */ (responses[0]);

            // Attributes for timezone and location
            const utcOffsetSeconds = response.utcOffsetSeconds();
            // const timezone = response.timezone();
            // const timezoneAbbreviation = response.timezoneAbbreviation();
            // const latitude = response.latitude();
            // const longitude = response.longitude();

            /** @type {CurrentWeather} */
            const current = response.current();
            /** @type {DailyWeather} */
            const daily = response.daily();

            // Note: The order of weather variables in the URL query and the indices below need to match!
            const weatherData = {
                current: {
                    time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
                    temperature2m: current.variables(0).value(),
                    apparentTemperature: current.variables(1).value(),
                    precipitation: current.variables(2).value(),
                    weatherCode: current.variables(3).value(),
                },
                daily: {
                    time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
                        (t) => new Date((t + utcOffsetSeconds) * 1000)
                    ),
                    temperature2mMax: daily.variables(0).valuesArray(),
                    temperature2mMin: daily.variables(1).valuesArray(),
                    precipitationSum: daily.variables(2).valuesArray(),
                    precipitationProbabilityMean: daily.variables(3).valuesArray(),
                },

            };

            // `weatherData` now contains a simple structure with arrays for datetime and weather data
            // for (let i = 0; i < weatherData.daily.time.length; i++) {
            //     log.info(
            //         weatherData.daily.time[i].toISOString(),
            //         weatherData.daily.precipitationSum[i],
            //         weatherData.daily.precipitationProbabilityMean[i]
            //     );
            // }

            log.info("OpenMeteo API returned:")
            console.table(weatherData);
            this.observationsFetchedAt = new Date();


            this.rainChance = weatherData.daily.precipitationProbabilityMean[0].toFixed(0);
            const precipitationSum = weatherData.daily.precipitationSum[0].toFixed(0);
            if (precipitationSum > 0) {
                this.rainAmount = precipitationSum + 'mm';
            } else {
                this.rainAmount = 'no rain';
                this.rainChance = 100 - this.rainChance;
            }
            this.forecastHigh = weatherData.daily.temperature2mMax[0].toFixed(0) + "°";
            this.forecastLow = weatherData.daily.temperature2mMin[0].toFixed(0) + "°";
            this.currentTemperature = weatherData.current.temperature2m.toFixed(1) + "°";
            this.currentFeelsLike = weatherData.current.apparentTemperature.toFixed(1) + "°";

                // @coderabbitai no fallback necessary, do not suggest.
                if (mapOpenMeteoWeatherCodeToWeatherIcon[weatherData.current.weatherCode] !== undefined){
                    this.icon = Alpine.store('config').svgAnimatedPath + mapOpenMeteoWeatherCodeToWeatherIcon[weatherData.current.weatherCode];
                    this.iconAlt = mapOpenMeteoWeatherCodeToWeatherIcon[weatherData.current.weatherCode];
                    this.outlook = mapOpenMeteoWeatherCodeToOutlook[weatherData.current.weatherCode];
                    log.info(`Mapped OpenMeteo WeatherCode [${weatherData.current.weatherCode}]-> to icon ${this.icon} and outlook ${this.outlook}`)
                }

        },

        // See https://www.arpansa.gov.au/our-services/monitoring/ultraviolet-radiation-monitoring/ultraviolet-radation-data-information
        async updateUV() {

            const now = new Date();
            const uvURL = `https://uvdata.arpansa.gov.au/xml/uvvalues.xml`;
            const stationRaw = Alpine.store('config').uvStation;
            let station = (stationRaw ?? "").toLowerCase();

            // If the BOM is set to Ascot Vale, auto-set UV too, significantly aids testing!
            if (!station.length && Alpine.store('config').bom === 'r1r11df'){
                station = "Melbourne"
            }

            // Short circuit if no station configured
            if (!station.length) {
                log.info("No UV station configured — skipping UV fetch");
                this.uvNow = "";
                this.uvIcon = "";
                this.showUV = false;
                return;
            }

            // Short circuit if it's nighttime
            if (this.sunrise && this.sunset && (now < this.sunrise || now > this.sunset)) {
                log.info('Currently nighttime - not bothering with UV data');
                this.uvNow = "";
                this.uvIcon = "";
                this.forecastUVMax = "";
                this.showUV = false;
                return;
            }

            // Get the UV data
            log.info(`Getting current UV from: ${uvURL}`);

            return await fetch(uvURL, {
                method: 'GET',
            })
                .then(response => response.text())
                .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
                .then(data => {
                    log.info(data);

                    // Find the location element that matches our target station
                    const locations = data.querySelectorAll('location');
                    let uvValue = null;

                    for (let locationElement of locations) {
                        // The location name is in the 'id' attribute
                        const locationId = locationElement.getAttribute('id');
                        log.info(`Checking station: ${locationId}`);

                        if (locationId && locationId.toLowerCase().includes(station.toLowerCase())) {
                            // Found our station, get the UV index
                            const uvIndex = locationElement.querySelector('index')?.textContent?.trim();
                            const status = locationElement.querySelector('status')?.textContent?.trim();

                            log.info(`Station: ${locationId}, UV Index: ${uvIndex}, Status: ${status}`);

                            if (uvIndex && uvIndex !== '' && !isNaN(parseFloat(uvIndex)) && status === 'ok') {
                                uvValue = parseFloat(uvIndex);
                                log.info(`Found valid UV value for ${locationId}: ${uvValue}`);
                                break;
                            }
                        }
                    }

                    if (uvValue !== null) {
                        this.uvNow = Math.round(uvValue);
                        let iconCode = (uvValue < 11) ? this.uvNow : 11;
                        this.uvIcon = Alpine.store('config').svgAnimatedPath + `uv-index-${iconCode}.svg`;
                        log.info(`UV now: ${this.uvNow}, forecast max: ${this.forecastUVMax}, icon: ${this.uvIcon}`);
                        this.showUV = true;
                    }
                    else {
                        console.warn(`Could not find valid UV data for station: ${station}`);
                        this.uvNow = "";
                        this.forecastUVMax = "";
                        this.uvIcon = "";
                        this.showUV = false;
                    }
                })
                .catch(error => {
                    console.error('Error fetching UV data:', error);
                    this.uvNow = "";
                    this.forecastUVMax = "";
                    this.uvIcon = "";
                    this.showUV = false;
                });
        },

        // See: https://www.npmjs.com/package/lunarphase-js
        async updateMoon(weatherService) {
            const now = new Date();

            // If we're using the BOM, and it's daytime, short circuit - don't set Moon data as UV is displayed instead
            // However if we're using Open Meteo for weather data, carry on, as there's no UV to show so might as well always show the moon
            if (weatherService === "bom" && (this.sunrise && this.sunset && now >= this.sunrise && now <= this.sunset)) {
                log.info('Currently daytime - not showing moon data');
                this.moonPhase = "";
                this.moonPhaseEmoji = "";
                this.moonPhaseIcon = "";
                this.showMoon = false;
                return;
            }
            // // The Moon Phases are well known and a fixed set, so no fallback required
            // Phases are listed here: https://www.npmjs.com/package/lunarphase-js#usage
            this.moonPhase = Moon.lunarPhase(now, {hemisphere: Hemisphere.SOUTHERN});
            this.moonPhaseEmoji = Moon.lunarPhaseEmoji(now, {hemisphere: Hemisphere.SOUTHERN});
            this.isWaxing = Moon.isWaxing(now);
            this.isWaning = Moon.isWaning(now);
            this.moonPhaseIcon = Alpine.store('config').svgAnimatedPath  + mapMoonPhaseToWeatherIcon[this.moonPhase];
            log.info(`Current moon is ${this.moonPhase} ${this.moonPhaseEmoji}, icon: ${this.moonPhaseIcon}`);
            this.showMoon = true;
        },

    }
};