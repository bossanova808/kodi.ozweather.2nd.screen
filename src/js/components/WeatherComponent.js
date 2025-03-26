
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


window.weather = () => {
    return {
        // These hold the full JSON returned
        location: null,
        forecast: null,
        observations: null,
        observationsFetchedAt: null,
        uv: null,
        // How often to update weather (n minutes)
        updateWeatherEveryMinutes: 5,
        weatherConsideredStaleAtMinutes: 60,
        // set by updateLocation()
        locationName: null,
        locationLatitude: null,
        locationLongitude: null,
        // set by updateObservations()
        currentTemperature: null,
        currentFeelsLike: null,
        // set by updateForecast()
        icon: null,
        iconAlt: null,
        rainIcon: Alpine.store('config').svgAnimatedPath +'/raindrop.svg',
        outlook: null,
        forecastHigh: null,
        forecastHighText: null,
        forecastLow: null,
        forecastLowText: null,
        forecastUVMax: null,
        forecastUVMaxText: null,
        rainChance: null,
        rainAmount: null,
        rainSince9am: null,
        showRainSince9am: true,
        // set by updateUV() - but note this is not finished/disabled
        uvNow: null,
        uvIcon: null,

        // 'Private' methods
        _clearProperties() {
            console.log("Clearing Weather Properties.");
            // These hold the full JSON returned
            this.location = "";
            this.forecast = "";
            this.observations = "";
            this.observationsFetchedAt = "";
            this.uv = "";
            // set by updateLocation()
            this.locationName = "";
            this.locationLatitude = "";
            this.locationLongitude = "";
            // set by updateObservations()
            this.currentTemperature = "";
            this.currentFeelsLike = "";
            // set by updateForecast()
            this.icon = "";
            this.iconAlt = "";
            this.rainIcon = Alpine.store('config').svgAnimatedPath +'/raindrop.svg';
            this.outlook = "";
            this.forecastHigh = "";
            this.forecastHighText = "";
            this.forecastLow = "";
            this.forecastLowText = "";
            this.forecastUVMax = "";
            this.forecastUVMaxText = "";
            this.rainChance = "";
            this.rainAmount = "";
            this.rainSince9am = "";
            // set by updateUV() - but note this is not finished/disabled
            this.uvNow = "";
            this.uvIcon = "";
        },


        init() {
            console.log("WeatherComponent init");

            console.log("Pre-caching weather icons")
            for (const [key, value] of Object.entries(mapBOMConditionToWeatherIcon)) {
                this.preload_image(value).then();
            }

            let result = null;
            // Get the initial location & weather data
            result = this.updateWeather(true)
            // Give the above time to arrive before we actually show the weather...
            setTimeout( () => {
                Alpine.store('isAvailable').weather = true;
            }, 2000);
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
            let weatherAge = Math.round(((now - this.observationsFetchedAt) / 1000) / 60) ;
            console.log(`Current weather data was fetched ${weatherAge} minutes ago`);
            if (weatherAge > this.weatherConsideredStaleAtMinutes){
                console.log("Weather is stale.");
                this._clearProperties();
                Alpine.store('isAvailable').weather = false;
            }
        },

        // Utility function to pre-cache all the weather icons after initial load
        async preload_image(img_svg) {
            let img = new Image();
            img.src = `${Alpine.store('config').svgAnimatedPath}${img_svg}`;
            console.log(`Pre-cached ${img.src}`);
        },

        // 'Parent' function to trigger the various stages of updating the weather data.
        // (call with init = true to kick off)
        // Awaiting of fetch data method from:
        // https://stackoverflow.com/questions/41775517/waiting-for-the-fetch-to-complete-and-then-execute-the-next-instruction/51992739#51992739
        async updateWeather (init = false) {
            let result = null;
            // On initialisation, we must have the location data before we can
            if (init) {
                try {
                    result = await this.updateLocation();
                }
                catch (e) {
                    console.log("Error fetching weather location on startup - big problem!")
                    console.log(e);
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
                Alpine.store('isAvailable').weather = false;
                return;
            }
            try {
                result = await this.updateForecast();
            }
            catch (e) {
                console.log("Error fetching forecast.")
                console.log(e);
                Alpine.store('isAvailable').weather = false;
                return;
            }
            // If we get here, weather is available, so if we're not showing it, show it!
            Alpine.store('isAvailable').weather = true;
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
                    this.forecast = json;
                    // Is it currently day or night?
                    // All UTC/ISO - e.g. 2023-02-03T19:38:01Z
                    let now = new Date();
                    let sunrise = new Date(this.forecast.data['0'].astronomical.sunrise_time);
                    let sunset = new Date(this.forecast.data['0'].astronomical.sunset_time);
                    let dayOrNight = '-night';
                    // console.log("Now", now);
                    // console.log("Sunrise", sunrise);
                    // console.log("Sunset", sunset);
                    if ( now > sunrise && now < sunset ) {
                        dayOrNight = '-day';
                    }
                    // What is the general outlook?
                    this.outlook = this.forecast.data['0'].short_text;
                    // Remove full stop on end
                    this.outlook = this.outlook.replace(/\.$/, '')

                    // Save the icon - we convert the short text and use that to get the icon, if we can
                    // as sometimes the BOM will return an outlook of 'Sunny' but an icon of 'shower' if there is even
                    // a small percentage of 0mm of rain or whatever.
                    let iconFromShortText = this.outlook.toLowerCase().replace(" ","_").replace(".","").trim() + dayOrNight;
                    console.log(`iconFromShortText is ${iconFromShortText}`);
                    if (mapBOMConditionToWeatherIcon[iconFromShortText] !== undefined){
                        this.icon = Alpine.store('config').svgAnimatedPath + mapBOMConditionToWeatherIcon[iconFromShortText];
                        this.iconAlt = iconFromShortText;
                        console.log(`Mapped BOM Short Text [${this.outlook}] -> [${iconFromShortText}] -> to actual icon ${this.icon}`)
                    }
                    else {
                        let bomIconDescriptor = this.forecast.data['0'].icon_descriptor + dayOrNight;
                        this.icon = Alpine.store('config').svgAnimatedPath + mapBOMConditionToWeatherIcon[bomIconDescriptor];
                        this.iconAlt = this.forecast.data['0'].icon_descriptor;
                        console.log(`Mapped BOM Icon Descriptor [${this.iconAlt}] -> [${bomIconDescriptor}] -> to actual icon ${this.icon}`)
                    }
                    // Clean up the outlook text


                    // Rain
                    this.rainChance = this.forecast.data['0'].rain.chance;
                    if (this.forecast.data['0'].rain.amount.max != null)
                    {
                        this.rainAmount = this.forecast.data['0'].rain.amount.min + "-" + this.forecast.data['0'].rain.amount.max + "mm";
                    }
                    else {
                        // Instead of 5% of none, present it as 95% chance of no rain
                        this.rainAmount = 'no rain';
                        this.rainChance = 100 - this.rainChance;
                    }
                    // UV Max
                    this.forecastUVMax = this.forecast.data['0'].uv.max_index;
                    this.forecastUVMaxText = mapUVValueToText[this.forecastUVMax];
                    // Max and Min
                    this.forecastLow = this.forecast.data['0'].now.temp_later;
                    this.forecastLowText = this.forecast.data['0'].now.later_label;
                    this.forecastHigh = this.forecast.data['0'].now.temp_now;
                    this.forecastHighText = this.forecast.data['0'].now.now_label;

                    // Hack to deal with the bizarro BOM API 'Now' issue...
                    if (this.forecastLow > this.forecastHigh){
                        let temp = this.forecastLow;
                        this.forecastLow = this.forecastHigh;
                        this.forecastHigh = temp;
                    }
                    this.forecastHigh = this.forecastHigh + '°';
                    this.forecastLow = this.forecastLow + '°';
                })
        },

        // Runs every update to get the current UV data
        // @TODO At the moment gets only 'Raw' UVI - need elevation and cloud cover to get scaled UVI
        // async updateUV() {
        //
        //     // Uses my Cloudflare worker to bypass CORS restrictions
        //     // https://github.com/Zibri/cloudflare-cors-anywhere
        //     let uvURL = `https://cors.bossanova808.workers.dev/?https://www.uvindex.app/api/getUvCurrent?lat=${this.locationLatitude}&lng=${this.locationLongitude}`;
        //     console.log(`Getting current UV from: ${uvURL}`);
        //     return await fetch(uvURL, {
        //         method: 'GET',
        //         headers: {
        //             'Accept': 'application/json',
        //         },
        //     })
        //         .then(response => response.json())
        //         .then(json => {
        //             console.log(JSON.stringify(json));
        //             this.uv = json;
        //             this.uvNow = this.uv.uv.toFixed(0);
        //             let iconCode = (this.uv < 11) ? this.uvNow  : 11;
        //             this.uvIcon = `${svgAnimatedPath}uv-index-${iconCode}.svg`
        //             console.log(`Mapped current UV ${this.uv.uv} to rounded ${this.uvNow} and icon ${this.uvIcon}`);
        //         })
        // },
    }
};
