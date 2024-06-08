# Kodi OzWeather '2nd Screen'

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/bossanova808)

## Introduction

This is a companion project to my Kodi [OzWeather add-on](https://github.com/bossanova808/weather.ozweather)  (which provides accurate **Australian** Bureau of Meteorology (BOM) weather data & animated radars, within Kodi itself).  

_Note the two projects are related in spirit, but are independent projects - i.e. you can use just one or both - they don't depend on each other in any way)._

This is a Kodi '2nd screen' project - i.e. for a second screen that runs alongside your main Kodi display, and which displays useful/related information.  

_(Actually, if you_ just _want a nice clock with some handy key weather data, you can just ignore the Kodi side of this altogether!)._

This app provides a simple GUI dashboard which displays the current time, basic current & upcoming weather information (sourced, of course, from the Australian Bureau of Meteorology), and (if Kodi is active), some simple Kodi 'Now Playing' information (Time Remaining and Poster/Thumbnail Artwork).  All of this with an easy to read '10ft' interface size - i.e. you should be able to see & read your screen comfortably, from a normal TV viewing position, some metres away.

The idea is that you can use pretty much any old tablet or smartphone for this (most of us have a few of those in the cupboard by now..).  You could also use a Raspberry Pi with a screen.   Really - just about anything you have really, as long as it can run a browser with some basic, albeit somewhat modern, features, and you can connect it to the same local network your Kodi is running).

Here's a few photos / screenshots to give you an idea.

Tablet under a TV, with Kodi playing a movie:

![Kodi OzWeather 2nd Screen - Kodi Playing Movie](/other_images/Screen_movie.jpg?raw=true "Kodi Playing Movie")

And some screenshots.... 

_(And, remember, you're normally viewing this from 3 to 5 metres away, displayed on a screen maybe 6 to 9 inches in size!)._

![Kodi OzWeather 2nd Screen - Weather Screenshot](/other_images/Screenshot_Weather.png?raw=true "Weather Info")

Above, displaying the weather information:

* Today's forecast High/Low - if before 6pm...
* ...otherwise, the forecast Overnight Low/Tomorrow High
* Rain Chance/Amount
* Actual rain recorded since 9am
* Current Temperature
* (Current 'Feels Like' Temperature)
* Current Time
* Weather Outlook Icon (animated weather icon)
* Weather Outlook Text

![Kodi OzWeather 2nd Screen - Kodi Now Playing Screenshot](/other_images/Screenshot_Kodi.png?raw=true "Kodi Now Playing Information")

Above, displaying Kodi 'Now Playing' information:

* Kodi Artwork - e.g. poster / thumbnail / channel logo / album cover etc
* Time Remaining
* Current Temperature
* (Current 'Feels Like' Temperature)
* Current Time

For my own lounge-room, I am using a ~~[Blackview 6](https://www.blackview.hk/products/item/tab6) - an 8-inch Android tablet for about AU $125, via eBay~~. (that turned out to be complete crap, constant spontaneous reboots and any _awful_ company to deal with re: returning it)...I am _now_ instead using a Samsung A7 Lite (about $185 from OfficeWorks IIRC) - which is a much, much better 8-inch tablet, and runs for weeks/months at a time, with completely stability.  

(With my mobile [Kodi-a-go-go travelling setup](https://github.com/bossanova808/MediaCopier), I use a much older Samsung A6 7-inch tablet, and that also works very well). 

In practise, I use a Google Play store app called [Fully Kiosk](https://www.fully-kiosk.com/) to actually load and display the app URL - but really any tablet and basic browser should work (including iOS devices).  

_(Fully Kiosk is just a very handy app helps with things like keeping the screen always on, and automatically re-starting the app should there be a network connection issue, and so on.  I bought a license for it (AU $15) because I am using it extensively, but the free version is all you actually need to get going with this.  If you want more advanced features like on/off schedules, you do need the paid version.)_

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

Support for this is via this Kodi OzWeather [forum thread](<https://forum.kodi.tv/showthread.php?tid=116905>).  Or just open an issue here.

**Note, though - support for this will likely be quite limited as this is really just a personal project, and is very much provided 'as-is'** - in case it is handy for other people as provided, or they want to use it as a base/starting point for their own similar project.

PRs welcome, of course.  See [Development](#development) below.

## Installation

There is no 'installation' as such - this is just a basic web app that runs in your local browser.  To get it, you just go to the app's URL (see below) - and the app should then just come up in your browser.  

The app code is initially served to your device this way.  From them on, the app runs locally and only communicates within your local network.

_(N.B. this app is deliberately served over **HTTP, i.e. NOT HTTPS** - specifically to avoid 'mixed content' warnings/errors that would otherwise result. This is a Kodi limitation - Kodi provides artwork etc. to this app, without SSL, using its internal webserver - and there is no cross platform support for SSL with the Kodi internal webserver)._

_(You can also easily set up your own version to host, locally or otherwise, with any http server, should you wish - either by cloning this repo and building locally or just by downloading my hosted version)._

### Setup Kodi

In your Kodi installation's settings, you must enable the Webserver, and JSON-RPC as well as 'allow control from other systems' (which enables the websockets interface which this app uses for communication with Kodi). 

_All of this is fine and essentially completely safe to do **as long as your Kodi player is (as it almost always would be) hidden behind a router's NAT**.  Do **_not_** do this if your Kodi box is corrected directly to the internet (but that would be **_bad_** anyway, for a lot of reasons...)._

Note, the whole app runs entirely locally in your browser - the app (which is just a web pages and some relatively basic JS code) - is completely downloaded to your browser, and then runs entirely within that.  

Of course, it must be able to contact the BOM to retrieve the weather info, and must also be able to reach your Kodi installation on your local network (your wi-fi should be more than adequate for this).

### The URL

This is the basic URL to visit:

_(important - must be `http` NOT `https` or communication with Kodi will not work!)_


`http://dash.bossanova808.net/`

By default you will see a large clock and then some weather info.

Now, you need to provide some configuration.  All configuration is done via URL parameters.  

To use the default value, just don't supply the parameter.  You can supply the parameters in any order.

### URL Parameters

#### Kodi IP & Auth
`kodi=` Kodi IP address.  Default is `127.0.0.1` (i.e. locahost).  Add your auth info if you need to.

.e.g.  `kodi=192.168.1.53` or `kodi=user:password@127.0.0.1`

#### Kodi Webserver Port

`kodi-web=` Kodi webserver port.  Default is `8080`.

e.g. `kodi-web=8088`

#### Kodi JSON RPC Port

`kodi-json=` Kodi JSON RPC Port.  Default is `9090`.

e.g. `kodi-json=9999`


#### BOM Location ID (geohash)

`bom=` BOM location ID.  Default is `r1r11df` (Ascot Vale, Melbourne). 

You get this by querying the BOM localities API - just change the search string on the end of this url: `https://api.weather.bom.gov.au/v1/locations/?search=kyneton`

You'll get back some JSON, e.g. 

```
{"metadata":{"response_timestamp":"2023-03-27T00:33:04Z"},"data":[{"geohash":"r1qsp5d","id":"Kyneton-r1qsp5d","name":"Kyneton","postcode":"3444","state":"VIC"},{"geohash":"r1qeyek","id":"Kyneton South-r1qeyek","name":"Kyneton South","postcode":"3444","state":"VIC"}]}
```

...from which you can then find your geohash (`r1qsp5d` in the above example).

E.g. `bom=r1r11df`

#### UI Size

`size=` UI size.  One of `small` `medium` or `large`.  Default is `large`. 

(Large is for tablets in the 7+ inch range, and small is e.g. for phones)

E.g. `size=small`

## Example Configured URLs

**Putting it all together...**

From the above, you build a full URL for your local deployment.

I.e. you start with the base URL (followed by a question mark to being the parameter list, i.e.:

`http://dash.bossanova808.net/?`

...and follow that with the rest of your parameters, with each separated by an ampersand (`&`).

Of course once everything is working, you will just bookmark this URL (and e.g. set it as the URL in your Kiosk app) - so you don't have to remember all this stuff!

Some full examples:

Supplying your local Kodi machine's IP, the geohash for Kyneton, and setting the UI size to small:

`http://dash.bossanova808.net/?kodi=192.168.1.51&bom=r1qsp5d&size=small`

Similar, but with auth for the Kodi webserver, and specifying a non-standard port (9999) for the Kodi JSON-rpc:

`http://dash.bossanova808.net/?kodi=kodi:kodi@192.168.1.51&kodi-json=9999&bom=r1qsp5d`

## Development

(PRs will certainly be looked at but if you're going to add something you think might be generally useful perhaps open an issue here for initial discussion). 

To get going for local development/tweaking for your particular need, all you need to do is:

`npm install`

`npm run dev`

_(**IMPORTANT:** do not use the `vite` or `vite build` tools directly!)_

Click on the URL Vite will then show in your terminal window, and you should have an HMR dev setup up and running (i.e. Hot Module Reload - which will automatically reload whenever you make changes). 

To build for deployment if you want to host this yourself somewhere:

`npm run build`

