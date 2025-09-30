# Kodi '2nd Screen'

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/bossanova808)

## Introduction

This is a Kodi '2nd screen' project - i.e. for a second screen that runs alongside/below your main Kodi display, and which displays useful/related information about what is playing etc.  

_(Actually, if you_ just _want a nice clock with some handy key weather data, you can just ignore the Kodi side of this altogether!)._

This app provides a simple GUI dashboard which displays the current time, basic current & upcoming weather information, and - if Kodi is playing something - some simple Kodi 'Now Playing' information (Time Remaining and Poster/Thumbnail Artwork).

All of this with an easy to read '10ft' interface size - i.e. you should be able to see & read your screen comfortably, from a normal TV viewing position, some metres away.

The weather data is sourced from either OpenMeteo or, if you're in Australia, you get the much more accurate weather data directly from the Australian Bureau of Meteorology.

The idea is that you can use pretty much any old tablet or smartphone for this (most of us have a few of those in the cupboard by now..).  You could also use a Raspberry Pi with a screen.   Really - just about anything you have really, as long as it can run a browser with some basic, albeit somewhat modern, features, and you can connect it to the same local network on which your Kodi is running).

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
* (not shown, added later) Programme End Time
* Current Temperature
* (Current 'Feels Like' Temperature)
* Current Time

For my own lounge-room, I am using a Samsung A7 Lite (about AU$185 from OfficeWorks IIRC) - which is simple but high quality 8-inch tablet, and runs for weeks/months at a time, with complete stability.  

(With my mobile [Kodi-a-go-go travelling setup](https://github.com/bossanova808/MediaCopier), I use a much older Samsung A6 7-inch tablet, and that also works very well, although it's wireless has always been a bit flakey...). 

In practise, I use a Google Play store app called [Fully Kiosk](https://www.fully-kiosk.com/) to actually load and display the 2nd Screen app URL - but really any tablet and basic browser should work (including iOS devices).  

_(Fully Kiosk is just a very handy app helps with things like keeping the screen always on, and automatically re-starting the app should there be a network connection issue, and so on.  I bought a license for it (AU $15) because I am using it extensively, but the free version is all you actually need to get going with this.  If you want more advanced features like on/off schedules for the tablet, you do need the paid version.)_

## Tech Stack

We all stand on the shoulders of giants. 

This project uses, and sends thanks to, these particular giants: 

* [Vite](https://vitejs.dev/) for dev/building/packaging
* [Alpine.js](https://alpinejs.dev/) for reactivity
* [Tailwind CSS](https://tailwindcss.com/) for CSS
* (Either) [Australian Bureau of Meteorology](http://www.bom.gov.au/) for weather data
* (Or) [OpenMeteo](https://open-meteo.com/) for weather data
* [Meteocons](https://bas.dev/work/meteocons) for the weather icons
* [Kodi](https://kodi.tv/) - my media player of choice (since 2008!)

## Support

Support for this is via this Kodi OzWeather [forum thread](<https://forum.kodi.tv/showthread.php?tid=116905>).  Or just open an issue here.

**Note, though - support for this will likely be quite limited as this is really just a personal project, and is very much provided 'as-is'** - in case it is handy for other people as provided, or they want to use it as a base/starting point for their own similar project.

PRs welcome, of course.  See [Development](#development) below.

## Installation

There is no 'installation' as such - this is just a basic web app that runs in a  browser.  To get it, you just go to the app's URL (see below) - and the app should then just come up in your browser.  

_(If you wish, you can download the app locally and use it offline and/or install it as a PWA (i.e. Progressive Web App, via 'Add to Home Screen').  If you download/install it, then from them on, the app runs locally and only communicates within your local network.  But note PWA support can be a bit hit and miss and you may e.g. struggle to get things working correctly (e.g. in nice clean fullscreen view, without any menu bars)...the best way I have found is to use a Kiosk app, e.g. Fully Kiosk, as described above)_.

_(You can also easily set up your own version to host, locally or otherwise, with any http server, should you wish - either by cloning this repo and building locally or just by downloading my hosted version)._

### Setup Kodi

In your Kodi installation's settings, you must enable the Webserver, and JSON-RPC as well as 'allow control from other systems' (which enables the websockets interface which this app uses for communication with Kodi). 

_All of this is fine and essentially completely safe to do **as long as your Kodi player is (as it almost always would be) hidden behind a router's NAT**.  Do **_not_** do this if your Kodi box is corrected directly to the internet (but that would be **_bad_** anyway, for a lot of reasons...)._

Of course, it must be able to contact the weather provider you choose to retrieve the weather info, and must also be able to reach your Kodi installation on your local network (wi-fi should be more than adequate for this).

### The URL

This is the basic URL to visit:

`https://dash.bossanova808.net/`

By default you will see a large clock and then some weather info.

Now, you need to provide some configuration.  All configuration is done via URL parameters.  

To use the default value, just don't supply the parameter.  You can supply the parameters in any order.

### URL Parameters

#### Kodi IP & Auth
`kodi=` Kodi IP address.  Default is `127.0.0.1` (which assumes you have auth turned off in Kodi's settings as you're not exposing your Kodi to the internet..).

.e.g.  `kodi=192.168.1.100` or `kodi=user:password@ip.address`

#### Kodi Webserver Port

`kodi-web=` Kodi webserver port.  Default is `8080`.

e.g. `kodi-web=8088`

#### Kodi JSON RPC Port

`kodi-json=` Kodi JSON RPC Port.  Default is `9090`.

e.g. `kodi-json=9999`


#### (_EITHER_) OpenMeteo Latitude, Longitude, and Timezone 

If you're *not* in Australia, then you will need to provide OpenMeteo data - the latitude, longitude and timezone.

You can search for these at the top of this page:
https://open-meteo.com/en/docs

And build URL arguments from those values, e.g.:
`latitude=-37.814&longitude=144.9633&timezone=Australia%2FSydney`

#### (_OR_) BOM Location ID (geohash)

If you *ARE* in Australia, then definitely use this approach - the BOM weather data is much more accurate, and it's easier to set up.

`bom=` BOM location ID.  Default is `r1r11df` (Ascot Vale, Melbourne). 

You get this by querying the BOM localities API - just change the search string on the end of this url: `https://api.weather.bom.gov.au/v1/locations/?search=kyneton`

You'll get back some JSON, e.g. 

```
{"metadata":{"response_timestamp":"2023-03-27T00:33:04Z"},"data":[{"geohash":"r1qsp5d","id":"Kyneton-r1qsp5d","name":"Kyneton","postcode":"3444","state":"VIC"},{"geohash":"r1qeyek","id":"Kyneton South-r1qeyek","name":"Kyneton South","postcode":"3444","state":"VIC"}]}
```

...from which you can then find your geohash (`r1qsp5d` in the above example).

E.g. `bom=r1r11df`

#### Ultraviolet Data for Australian Cities

(UV observations courtesy of [ARPANSA](https://www.arpansa.gov.au/))

If your location has live UV (ultraviolet) data available from the list here: [ARPANSA](https://uvdata.arpansa.gov.au/xml/uvvalues.xml), you can add a parameter to display current UV / predicted max UV data (n.b. this data only displays between sunrise and sunset).

`uv=` (default is no value)

E.g.

`uv=Melbourne`

#### UI Size

`size=` UI size.  One of `small` `medium` or `large`.  Default is `large`. 

(Large is for tablets in the 7+ inch range, and small is e.g. for phones)

E.g. `size=small`

## Example Configured URLs

**Putting it all together...**

From the above, you build a full URL for your local deployment.

I.e. you start with the base URL (followed by a question mark to being the parameter list, i.e.:

`https://dash.bossanova808.net/?`

...and follow that with the rest of your parameters, with each separated by an ampersand (`&`).

Of course once everything is working, you will just bookmark this URL (and e.g. set it as the URL in your Kiosk app) - so you don't have to remember all this stuff!

Some full examples:

Supplying your local Kodi machine's IP, the geohash for Kyneton, and setting the UI size to small:

`https://dash.bossanova808.net/?kodi=192.168.1.51&bom=r1qsp5d&size=small`

Similar, but with auth for the Kodi webserver, and specifying a non-standard port (9999) for the Kodi JSON-rpc, and using OpenMeteo weather information:

```
https://dash.bossanova808.net/?kodi=kodi:kodi@192.168.1.51&kodi-json=9999&latitude=-37.814&longitude=144.9633&timezone=Australia%2FSydney
```

### SSL/HTTPS Support

By default, the app connects to Kodi using HTTP and WebSocket (ws://) protocols, even when the web app itself is served over HTTPS. This supports the common scenario where the web app is served securely (e.g., via Cloudflare tunnel) but Kodi runs on the local network with HTTP only, i.e. without SSL support, as is the default Kodi behaviour.

See below for examples with and without SSL.

### Usage Examples

#### Standard Usage (Mixed Content)

`https://yourapp.com/?kodi=192.168.1.100&kodi-web=8080`

- Web app itself served over HTTPS (Cloudflare tunnel, reverse proxy etc.)
- Kodi communication uses `ws://192.168.1.100:9090/jsonrpc` (default; override via `kodi-json`)
- Artwork URLs use `http://192.168.1.100:8080/image/...`
- Works with Fully Kiosk Browser's "Allow Mixed Content" setting

#### SSL-Enabled Kodi (Rare)

(See: [Kodi SSL](https://kodi.wiki/view/SSL_certificates))

`https://yourapp.com/?kodi=kodi.local&kodi-web=8443&kodi-ssl=true`

- For rare Kodi installations with SSL certificates
- Kodi communication uses `wss://kodi.local:9090/jsonrpc`
- Artwork URLs use `https://kodi.local:8443/image/...`

#### Local Development

`http://localhost:5173/?kodi=127.0.0.1&kodi-web=8080`

- Both web app and Kodi use HTTP protocols
- No mixed content concerns

#### URL Parameters controlling Kodi connection

| Parameter  | Default | Description |
|------------|---------|-------------|
| `kodi`     | `127.0.0.1` | Kodi server IP address or hostname |
| `kodi-web` | `8080` | Kodi web server port |
| `kodi-json` | `9090` | Kodi JSON-RPC WebSocket port |
| `kodi-ssl` | `false` | Set to `true` for HTTPS/WSS Kodi connections |

#### Mixed Content Note

Most Kodi installations use HTTP only. When serving this app over HTTPS but connecting to HTTP Kodi, browsers will block mixed content by default. 

Solutions:

* Fully Kiosk users: Enable "Allow Mixed Content" in Advanced Web Settings → Content Blocking
* Standard browsers: Most will show a "shield" icon in the address bar — click it and allow mixed content, for this app
* Host the app over HTTP instead (avoids the issue entirely). As this is likely to be an entirely internal app, this is an easy and appropriate solution
* Set up [Kodi SSL](https://kodi.wiki/view/SSL_certificates)


## Development

(PRs will certainly be looked at but if you're going to add something you think might be generally useful perhaps open an issue here for initial discussion). 

To get going for local development/tweaking for your particular need, all you really need to do is:

`npm install` (or `npm update` if you want to update dependencies)

`npm run dev`

_(**IMPORTANT:** do not use the `vite` or `vite build` tools directly!)_

Click on the URL Vite will then show in your terminal window, and you should have an HMR dev setup up and running (i.e. Hot Module Reload - which will automatically reload whenever you make changes). 

To build for deployment if you want to host this yourself somewhere:

`npm run build`

Note that if you're not deploying to the root of your site, i.e. you're using a sub‑folder for your deployment (something like `https://your.site/kodidash`), then you will need to modify the `vite.config.js` `base` property (see the [Vite docs](https://vite.dev/config/shared-options.html#base)). See the commented‑out [example](https://github.com/bossanova808/kodi.ozweather.2nd.screen/blob/d8356a0659e84db7c386df7aed85cc080837b35f/vite.config.js#L6).
