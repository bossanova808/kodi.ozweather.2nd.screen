import { fetchWeatherApi } from 'openmeteo';

window.weatherOpenMeteo = () => {
    return {

        forecastHigh: null,
        forecastLow: null,
        rainChance: null,
        rainAmount: null,
        rainSince9am: null,
        outlook: null,
        icon: null,
        iconAlt: null,
        currentTemperature: null,
        currentFeelsLike: null,

        init() {
            console.log("WeatherComponentOpenMeteo init");
            let result = null;
            result = this.updateWeather(true)
            // Give the above time to arrive before we actually show the weather...
            setTimeout( () => {
                Alpine.store('isAvailable').weather = true;
            }, 2000);

        },

        async updateWeather (init = false) {

            console.log("updateWeather");

            const params = {
                "latitude": -37.814,
                "longitude": 144.9633,
                "current": ["temperature_2m", "apparent_temperature", "precipitation", "weather_code"],
                "daily": ["precipitation_sum", "precipitation_probability_max"],
                "timezone": "Australia/Sydney",
                "forecast_days": 1
            };
            const url = "https://api.open-meteo.com/v1/forecast";
            const responses = await fetchWeatherApi(url, params);

            // Helper function to form time ranges
            const range = (start, stop, step) =>
                Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

            // Process first location. Add a for-loop for multiple locations or weather models
            const response = responses[0];

            // Attributes for timezone and location
            const utcOffsetSeconds = response.utcOffsetSeconds();
            const timezone = response.timezone();
            const timezoneAbbreviation = response.timezoneAbbreviation();
            const latitude = response.latitude();
            const longitude = response.longitude();

            const current = response.current();
            const daily = response.daily();

            // Note: The order of weather variables in the URL query and the indices below need to match!
            const weatherData = {
                current: {
                    time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
                    temperature2m: current.variables(0).value(),
                    apparentTemperature: current.variables(1).value(),
                    precipitation: current.variables(1).value(),
                    weatherCode: current.variables(2).value(),
                },
                daily: {
                    time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
                        (t) => new Date((t + utcOffsetSeconds) * 1000)
                    ),
                    precipitationSum: daily.variables(0).valuesArray(),
                    precipitationProbabilityMax: daily.variables(1).valuesArray(),
                },

            };

            // `weatherData` now contains a simple structure with arrays for datetime and weather data
            for (let i = 0; i < weatherData.daily.time.length; i++) {
                console.log(
                    weatherData.daily.time[i].toISOString(),
                    weatherData.daily.precipitationSum[i],
                    weatherData.daily.precipitationProbabilityMax[i]
                );
            }

            console.table(weatherData);

            this.currentTemperature = weatherData.current.temperature2m.toFixed(1) + "°";
            this.currentFeelsLike = weatherData.current.apparentTemperature.toFixed(1) + "°";
        }
    }
};
