# Kodi OzWeather '2nd Screen'

y[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/bossanova808)

A companion project to my Kodi [OzWeather](https://github.com/bossanova808/weather.ozweather) add-on (which provides accurate Australian BOM weather & animated radars on Kodi).

This is a '2nd screen' project - i.e. provides a simple (web based) GUI dashboard system to display the current time, basic current & upcoming weather information (sourced, of course, from the Australian Bureau of Meteorology), and simple Kodi 'Now Playing' information (Time Remaining and Poster/Thumbnail Artwork).  All of this is '10ft' interface size - i.e. you should be able to see & read it comfortably, from a normal viewing position.

The idea is that you use pretty much any old tablet or smartphone for this, or a Raspberry Pi with a screen (really - just about anything you have really, as long as it can run a browser with some basic, albeit modern, features).

Here's a few photos / screenshots to give you an idea.

Tablet under a TV, with Kodi playing a movie:

![Kodi OzWeather 2nd Screen - Kodi Playing Movie](/other_images/Screen_movie.jpg?raw=true "Kodi Playing Movie")

And some screenshots. (And, remember, you're normally viewing this from 3 to 5 metres away, displayed on a screen maybe 6 to 9 inches in size!).

First, displaying the weather information, i.e.

* Today's High/Low - if before 6pm, otherwise Overnight Low/Tomorrow High
* Rain Chance/Amount
* Rain since 9am
* Current Temperature
* (Current Feels Like)
* Current Time
* Outlook icon (animated)
* Outlook text

![Kodi OzWeather 2nd Screen - Weather Screenshot](/other_images/Screenshot_Weather.png?raw=true "Weather Info")

Display Kodi Now Playing info:

* Media poster / thumbnail
* Time remaining
* Current Temperature
* (Current Feels Like)
* Current Time

![Kodi OzWeather 2nd Screen - Kodi Now Playing Screenshot](/other_images/Screenshot_Kodi.png?raw=true "Kodi Now Playing Information")

For my own lounge-room, I am using a ~~[Blackview 6](https://www.blackview.hk/products/item/tab6) - an 8 inch Android tablet for about AU $125, via eBay~~. (that turned out to be complete crap, constant spontaneous reboots and any _awful_ company to deal with re: returing it)...I am now using a Samsung A7 Lite (about $185 from Officeworks IIRC) - which is a much much better 8 inch tablet, and runs for weeks/months at a time, with completely stability.  (With my [Kodi-a-go-go travelling setup](https://github.com/bossanova808/MediaCopier), I use a much older Samsung A6 7 inch tablet and that also works very well). 

I use a Play store app called [Fully Kiosk](https://www.fully-kiosk.com/) to actually load and display the URL - but really any tablet and browser should work (including iOS devices).  

Fully Kiosk is just a very handy app helps with things like keeping the screen permanently on, and re-starting the app should there be a network connection issue, and so on.  I bought a license for it (AU $15) because I am using it extensively, but the free version is all you actually need to get going with this.  If you want more advanced features like on/off schedules, you do need the paid version.

## Tech Stack

We all stand on the shoulders of giants. 

This project uses, and sends thanks to, these particular giants: 

* [Vite](https://vitejs.dev/) for dev/building/packaging
* [Alpine.js](https://alpinejs.dev/) for reactivity
* [Tailwind CSS](https://tailwindcss.com/) for CSS
* [Australian Bureau of Meteorology](http://www.bom.gov.au/) for weather data
* [Meteocons](https://bas.dev/work/meteocons) for the weather icons
* [Kodi](https://kodi.tv/) - my media player of choice (since 2008!)

## Support

Support for this is via this Kodi OzWeather [forum thread](<https://forum.kodi.tv/showthread.php?tid=116905>).  You can also open an issue here.

**Note, though - support for this will likely be quite limited as this is really just a personal project, and is very much provided 'as-is'** - in case it is handy for other people as provided, or they want to use it as a base/starting point for their own similar project.

## Installation

There is no 'installation' as such - this is just a basic web app that runs in your local browser.  To get it, you just go to the app's URL (see below for building this), and the app should then just come up in your browser.

All configuration is done via URL parameters.  To use the default value, just don't supply the parameter.  You can supply parameters in any order.

In your Kodi installation's settings, you must enable the Webserver, and JSON-RPC as well as 'allow control from other systems' (which enables the websockets interface used for the Kodi communication). All of this is fine and essentially safe to do **as long as your Kodi player is behind your router's NAT**.  Do **_not_** do this if your Kodi box is corrected directly to the internet (but that would be **_bad_** anyway, for a lot of reasons...).

Note, the whole app runs entirely locally in your browser - the app (which is just a web pages and some relatively basic JS code) - is completely downloaded to your browser, and runs within that.  Of course, it must be able to contact the BOM to retrieve the weather info, and to reach your Kodi installation on your local network (your tablet's wi-fi should be more than adequate for this).

### The URL

This is the basic URL to visit:

`http://bossanova808.net:2095/deploy.kodidash/`

...however, you will almost certainly need to provide some configuration to get things working as you want it.  

(N.B. **this app is deliberately served over HTTP, i.e. NOT HTTPS** - specifically to avoid mixed content warnings/errors that would otherwise result - this is ultimately a Kodi limitation - Kodi provides artwork etc. to this app, without SSL, using its internal webserver, and there is no cross platform support for SSL with the Kodi internal webserver).


### Kodi IP & Auth
`kodi=` Kodi IP address.  Default is `127.0.0.1` (i.e. locahost).  Add your auth info if you need to.

.e.g.  `kodi=192.168.1.53` or `kodi=user:password@127.0.0.1`

### Kodi Webserver Port

`kodi-web=` Kodi webserver port.  Default is `8080`.

e.g. `kodi-web=8088`

### Kodi JSON RPC Port

`kodi-json=` Kodi JSON RPC Port.  Default is `9090`.

e.g. `kodi-json=9999`


### BOM Location ID (geohash)

`bom=` BOM location ID.  Default is `r1r11df` (Ascot Vale, Melbourne). 

You get this by querying the BOM localities API - change the search string on this: `https://api.weather.bom.gov.au/v1/locations/?search=kyneton`

You get back some JSON, e.g. 

```
{"metadata":{"response_timestamp":"2023-03-27T00:33:04Z"},"data":[{"geohash":"r1qsp5d","id":"Kyneton-r1qsp5d","name":"Kyneton","postcode":"3444","state":"VIC"},{"geohash":"r1qeyek","id":"Kyneton South-r1qeyek","name":"Kyneton South","postcode":"3444","state":"VIC"}]}
```

...from which you can then find your geohash (`r1qsp5d` in this example).

E.g. `bom=r1r11df`

### UI Size

`size=` UI size.  Default is `large`. One of `small` `medium` or `large`.

E.g. `size=small`

## Deployment URLs

**Putting it all together...**

From the above, you build a full URL for you local deployment.

I.e. you start with the base URL (followed by a question mark to being the parameter list, i.e.:

`http://bossanova808.net:2095/deploy.kodidash/?`

...and follow that with the rest of your parameters, each separated by an ampersand (`&`).

Of course once everything is working, you will just bookmark this URL (and e.g. set it as the URL in your Kiosk app) - so you don't have to remember all this stuff!

Some full examples:

Supplying your local Kodi machine's IP, the geohash for Kyneton, and setting the UI size to small:

`http://bossanova808.net:2095/deploy.kodidash/?kodi=192.168.1.51&bom=r1qsp5d&size=small`

Similar, but with auth for the Kodi webserver, and specifying a non-standard port (9999) for the Kodi JSON-rpc:

`http://bossanova808.net:2095/deploy.kodidash/?kodi=kodi:kodi@192.168.1.51&kodi-json=9999&bom=r1qsp5d`

## Development

To get going for local development/tweaking, all you need to do is:

`npm install`

`npm run dev`

**IMPORTANT** Do not use the `vite` or `vite build` things directly!

Click on the URL Vite will then show in your terminal window, and you should have an HMR dev setup up and running (i.e. Hot Module Reload - which will automatically reload whenever you make changes). 

To build for deployment:

`npm run build`
