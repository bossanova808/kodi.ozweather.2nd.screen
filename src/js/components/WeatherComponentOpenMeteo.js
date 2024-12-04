import { fetchWeatherApi } from 'openmeteo';

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

window.weatherOpenMeteo = () => {
    return {

        forecastHigh: null,
        forecastLow: null,
        rainChance: null,
        rainAmount: null,
        rainSince9am: null,
        showRainSince9am: false,
        outlook: null,
        icon: null,
        iconAlt: null,
        currentTemperature: null,
        currentFeelsLike: null,

        init() {
            console.log("WeatherComponentOpenMeteo init");

            console.log("Pre-caching weather icons")
            for (const [key, value] of Object.entries(mapOpenMeteoWeatherCodeToWeatherIcon)) {
                this.preload_image(value).then();
            }

            let result = null;
            result = this.updateWeather(true)
            // Give the above time to arrive before we actually show the weather...
            setTimeout( () => {
                Alpine.store('isAvailable').weather = true;
            }, 2000);
        },

        // Utility function to pre-cache all the weather icons after initial load
        async preload_image(img_svg) {
            let img = new Image();
            img.src = `${Alpine.store('config').svgAnimatedPath}${img_svg}`;
            console.log(`Pre-cached ${img.src}`);
        },

        async updateWeather (init = false) {

            console.log("updateWeather");

            const params = {
                "latitude": Alpine.store('config').latitude,
                "longitude": Alpine.store('config').longitude,
                "current": ["temperature_2m", "apparent_temperature", "precipitation", "weather_code"],
                "daily": ["temperature_2m_max", "temperature_2m_min", "precipitation_sum", "precipitation_probability_mean"],
                "timezone": Alpine.store('config').timezone,
                "forecast_days": 1
            };
            const url = "https://api.open-meteo.com/v1/forecast";
            console.log(`Calling ${url} with params:`)
            console.table(params);
            const responses = await fetchWeatherApi(url, params);

            // Helper function to form time ranges
            const range = (start, stop, step) =>
                Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

            // Process first location. Add a for-loop for multiple locations or weather models
            const response = responses[0];

            // Attributes for timezone and location
            const utcOffsetSeconds = response.utcOffsetSeconds();
            // const timezone = response.timezone();
            // const timezoneAbbreviation = response.timezoneAbbreviation();
            // const latitude = response.latitude();
            // const longitude = response.longitude();

            const current = response.current();
            const daily = response.daily();

            // Note: The order of weather variables in the URL query and the indices below need to match!
            const weatherData = {
                current: {
                    time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
                    temperature2m: current.variables(0).value(),
                    apparentTemperature: current.variables(1).value(),
                    precipitation: current.variables(1).value(),
                    weatherCode: parseInt(current.variables(2).value()),
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
            //     console.log(
            //         weatherData.daily.time[i].toISOString(),
            //         weatherData.daily.precipitationSum[i],
            //         weatherData.daily.precipitationProbabilityMean[i]
            //     );
            // }

            console.log("OpenMeteo API returned:")
            console.table(weatherData);

            this.rainChance = weatherData.daily.precipitationProbabilityMean[0];
            this.rainAmount = weatherData.daily.precipitationSum[0] + 'mm';
            this.forecastHigh = weatherData.daily.temperature2mMax[0].toFixed(0) + "°";
            this.forecastLow = weatherData.daily.temperature2mMin[0].toFixed(0) + "°";
            this.currentTemperature = weatherData.current.temperature2m.toFixed(1) + "°";
            this.currentFeelsLike = weatherData.current.apparentTemperature.toFixed(1) + "°";

                if (mapOpenMeteoWeatherCodeToWeatherIcon[weatherData.current.weatherCode] !== undefined){
                    this.icon = Alpine.store('config').svgAnimatedPath + mapOpenMeteoWeatherCodeToWeatherIcon[weatherData.current.weatherCode];
                    this.iconAlt = mapOpenMeteoWeatherCodeToWeatherIcon[weatherData.current.weatherCode];
                    this.outlook = mapOpenMeteoWeatherCodeToOutlook[weatherData.current.weatherCode];
                    console.log(`Mapped OpenMeteo WeatherCode [${weatherData.current.weatherCode}]-> to icon ${this.icon} and outlook ${this.outlook}`)
                }

        }
    }
};
