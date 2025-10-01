import { Moon, Hemisphere } from "lunarphase-js";

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
        showMoon: false,

        // 'Private' methods
        _clearProperties() {
            console.log("Clearing Weather Properties.");
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
            this.showMoon = false;
        },


        init() {
            console.log("WeatherComponent init");

            console.log("Pre-caching weather icons")
            for (const [_key, value] of Object.entries(mapBOMConditionToWeatherIcon)) {
                this.preload_image(value).then();
            }
            // Add UV icon pre-caching
            console.log("Pre-caching UV icons")
            for (let i = 0; i <= 11; i++) {
                this.preload_image(`uv-index-${i}.svg`).then();
            }

            let result = null;
            // Get the initial location & weather data
            result = this.updateWeather(true)

            // Then, update every 5 minutes (5 * 60 * 1000)
            setInterval(() => {
                result = this.updateWeather(false)
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
            console.log(`Current weather data was fetched ${weatherAge} minutes ago`);
            if (weatherAge > this.weatherConsideredStaleAtMinutes) {
                console.log("Weather is stale.");
                this._clearProperties();
                Alpine.store('isAvailable').weather = false;
            }
        },

        // Utility function to pre-cache all the weather icons after initial load
        async preload_image(img_svg) {
            let img = new Image();
            img.src = Alpine.store('config').svgAnimatedPath + img_svg;
            console.log(`Pre-cached ${img.src}`);
        },

        // 'Parent' function to trigger the various stages of updating the weather data.
        // (call with init = true to kick off)
        // Awaiting of fetch data method from:
        // https://stackoverflow.com/questions/41775517/waiting-for-the-fetch-to-complete-and-then-execute-the-next-instruction/51992739#51992739
        async updateWeather (init = false) {
            let result = null;

            // On initialisation, we must have the location data
            if (init) {
                try {
                    result = await this.updateLocation();
                }
                catch (e) {
                    console.log("Error fetching weather location on startup - big problem!")
                    console.log(e);
                    this._clearProperties();
                    Alpine.store('isAvailable').weather = false;
                    return;
                }
            }

            try {
                result = await this.updateObservations();
            }
            catch (e) {
                console.log("Error fetching observations.")
                console.log(e);
                this._clearProperties();
                Alpine.store('isAvailable').weather = false;
                return;
            }

            try {
                result = await this.updateForecast();
            }
            catch (e) {
                console.log("Error fetching forecast.")
                console.log(e);
                this._clearProperties();
                Alpine.store('isAvailable').weather = false;
                return;
            }

            // ***
            // Data below here is less essential so don't block availability
            // ***

            try{
                result = await this.updateUV();
            }
            catch (e) {
                console.log("Error fetching UV.")
                console.log(e);
                // return;
            }

            try{
                result = await this.updateMoon();
            }
            catch (e) {
                console.log("Error calculating moon phase.")
                console.log(e);
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
                    console.log(JSON.stringify(json));
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
                    console.log(JSON.stringify(json));
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
                    console.log(JSON.stringify(json));
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
                    // console.log("Now", now);
                    // console.log("Sunrise", sunrise);
                    // console.log("Sunset", sunset);
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
                    console.log(`iconFromShortText is ${iconFromShortText}`);
                    if (mapBOMConditionToWeatherIcon[iconFromShortText] !== undefined){
                        this.icon = Alpine.store('config').svgAnimatedPath + mapBOMConditionToWeatherIcon[iconFromShortText];
                        this.iconAlt = iconFromShortText;
                        console.log(`Mapped BOM Short Text [${this.outlook}] -> [${iconFromShortText}] -> to actual icon ${this.icon}`)
                    }
                    else {
                        let bomIconDescriptor = todayForecast.icon_descriptor + dayOrNight;
                        this.icon = Alpine.store('config').svgAnimatedPath + mapBOMConditionToWeatherIcon[bomIconDescriptor];
                        this.iconAlt = todayForecast.icon_descriptor;
                        console.log(`Mapped BOM Icon Descriptor [${this.iconAlt}] -> [${bomIconDescriptor}] -> to actual icon ${this.icon}`)
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

        // See https://www.arpansa.gov.au/our-services/monitoring/ultraviolet-radiation-monitoring/ultraviolet-radation-data-information
        async updateUV() {

            const uvURL = `https://uvdata.arpansa.gov.au/xml/uvvalues.xml`;
            const stationRaw = Alpine.store('config').uvStation;
            const station = (stationRaw ?? "").toLowerCase();

            // Short circuit if not configured
            if (!station.length) {
                console.log("No UV station configured — skipping UV fetch");
                this.uvNow = "";
                this.uvIcon = "";
                this.showUV = false;
                return;
            }

            console.log(`Getting current UV from: ${uvURL}`);

            return await fetch(uvURL, {
                method: 'GET',
            })
                .then(response => response.text())
                .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
                .then(data => {
                    console.log(data);

                    // If it's nighttime, don't set UV data
                    const now = new Date();
                    if (this.sunrise && this.sunset && (now < this.sunrise || now > this.sunset)) {
                        console.log('Currently nighttime - not bothering with UV data');
                        this.uvNow = "";
                        this.uvIcon = "";
                        this.forecastUVMax = "";
                        this.showUV = false;
                        return;
                    }

                    // Find the location element that matches our target station
                    const locations = data.querySelectorAll('location');
                    let uvValue = null;

                    for (let locationElement of locations) {
                        // The location name is in the 'id' attribute
                        const locationId = locationElement.getAttribute('id');
                        console.log(`Checking station: ${locationId}`);

                        if (locationId && locationId.toLowerCase().includes(station.toLowerCase())) {
                            // Found our station, get the UV index
                            const uvIndex = locationElement.querySelector('index')?.textContent?.trim();
                            const status = locationElement.querySelector('status')?.textContent?.trim();

                            console.log(`Station: ${locationId}, UV Index: ${uvIndex}, Status: ${status}`);

                            if (uvIndex && uvIndex !== '' && !isNaN(parseFloat(uvIndex)) && status === 'ok') {
                                uvValue = parseFloat(uvIndex);
                                console.log(`Found valid UV value for ${locationId}: ${uvValue}`);
                                break;
                            }
                        }
                    }

                    if (uvValue !== null) {
                        this.uvNow = Math.round(uvValue);
                        let iconCode = (uvValue < 11) ? this.uvNow : 11;
                        this.uvIcon = Alpine.store('config').svgAnimatedPath + `uv-index-${iconCode}.svg`;
                        console.log(`UV now: ${this.uvNow}, forecast max: ${this.forecastUVMax}, icon: ${this.uvIcon}`);
                        this.showUV = true;
                    }
                    else {
                        console.warn(`Could not find valid UV data for station: ${station}`);
                        this.uvNow = "";
                        this.forecastUVMax = "";
                        this.uvIcon = "";
                    }
                })
                .catch(error => {
                    console.error('Error fetching UV data:', error);
                    this.uvNow = "";
                    this.forecastUVMax = "";
                    this.uvIcon = "";
                });
        },

        // See: https://www.npmjs.com/package/lunarphase-js
        async updateMoon() {
            const now = new Date();

            // If it's daytime, short circuit - don't set Moon data
            if (this.sunrise && this.sunset && (this.sunset < now < this.sunrise)) {
                console.log('Currently daytime - not showing moon data');
                this.moonPhase = "";
                this.moonPhaseEmoji = "";
                this.moonPhaseIcon = "";
                this.showMoon = false;
                return;
            }
            // These default to using now...
            this.moonPhase = Moon.lunarPhase(now, {hemisphere: Hemisphere.SOUTHERN});
            this.moonPhaseEmoji = Moon.lunarPhaseEmoji(now, {hemisphere: Hemisphere.SOUTHERN});
            this.moonPhaseIcon = Alpine.store('config').svgAnimatedPath  + mapMoonPhaseToWeatherIcon[this.moonPhase];
            console.log(`Current moon is ${this.moonPhase} ${this.moonPhaseEmoji}, icon: ${this.moonPhaseIcon}`);
            this.showMoon = true;
        }
    }
};