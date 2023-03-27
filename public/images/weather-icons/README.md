# Weather Icons

Animated SVG Weather Icons from:

https://bas.dev/work/meteocons

2023-04-02 Used 'Download (Pre-release)', copied `svg` and `svg-static` folders from production.

in `WeatherComponent.js` there is an object `bomConditionToWeatherIcon` that maps the BOM condition (as `condition-day` or `condition-night`) to an actual icon.

## BOM Icons & Description

From page 24 of the BOM [adfdUserGuide.pdf]('/notes/adfdUserGuide.pdf')

Number, Description, BOM API `icon_descriptor` 

- 1 Sunny
- 2 Clear
- 3 Mostly sunny/partly cloudy*
- 4 Cloudy `cloudy`
- 6 Hazy
- 8 Light rain
- 9 Windy
- 10 Fog
- 11 Shower `shower`
- 12 Rain
- 13 Dusty
- 14 Frost
- 15 Snow
- 16 Storm
- 17 Light shower
- 18 Heavy shower
- 19 Tropical Cyclone

(* Apparently: icon number 3 ‘mostly_sunny’ if clear sky >= 30%, otherwise ‘partly_cloudy’.)

Note the above list is missing 5 & 7, and that 3 is actually two things! Total is 18 states of weather, so need to map to 36 icons.

There is no real icon for frost from this set, so using a 'Thermometer & Snow' icon.
