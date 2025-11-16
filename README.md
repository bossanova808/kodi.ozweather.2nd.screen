# 10-Foot Dash :tv:

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/bossanova808)

## Introduction 

This project is designed to rescue older hardware most of us have lying around - old phones and tablets in particular - and resurrect them as a handy 'under tv' information dashboard.

The interface is designed as an easy to read '10 foot interface' - i.e. you should be able to see & read your screen comfortably, from a normal TV viewing position, some metres away.

It currently has 3 modes:

- Digital Clock (when unconfigured, or no network available)
- Clock & Weather information (using [OpenMeteo](https://open-meteo.com/) or the [Australian Bureau of Meteorology](https://www.bom.gov.au/) as the data source)
- Media Player 'Now Playing' artwork & info (Optional - tracking playbacks from [Jellyfin](https://jellyfin.org/) or [Kodi](https://kodi.tv) 

The idea is that you can use pretty much any old tablet or smartphone for this (most of us have a few of those in the cupboard by now...).  You could also use a Raspberry Pi with a screen.   Really - just about anything you have really, as long as it can run a browser with some basic, albeit _somewhat_ modern, features.  Of course, it needs to be on the same network as your media player, if you're using the media player features - but a wireless connection is fine.

Here's a few photos / screenshots to give you a better idea.

Tablet under a TV, with Kodi playing a movie:

![Kodi OzWeather 2nd Screen - Kodi Playing Movie](/other_images/Screen_movie.jpg?raw=true "Kodi Playing Movie")

And some screenshots.... 

_(And, remember, you're normally viewing this from 3 to 5 metres away, displayed on a screen maybe 6 to 9 inches in size!)._

![Kodi OzWeather 2nd Screen - Weather Screenshot](/other_images/Screenshot_Weather.png?raw=true "Weather Info")

Above, displaying the weather information:

_(n.b. this shows an Australian BOM example, OpenMeteo display is simpler)_

* Today's forecast High/Low - if before 6pm...
* ...otherwise, the forecast Overnight Low/Tomorrow High  (i.e. Next High & Next Low)
* (If between sunrise and sunset, and UV is available for your location) - current UV
* (If between sunrise and sunset, and UV is available for your location) - predicted max. UV
* Rain Chance/Amount Predicted
* Actual rain since 9am
* Current Temperature
* Current 'Feels Like' Temperature
* Current Time
* Weather Outlook Icon (animated weather icon)
* Weather Outlook Text

![Kodi OzWeather 2nd Screen - Kodi Now Playing Screenshot](/other_images/Screenshot_Kodi.png?raw=true "Kodi Now Playing Information")

Above, displaying Kodi 'Now Playing' information:

* Kodi Artwork - e.g. poster / thumbnail / channel logo / album cover etc
* Time Remaining
* Programme End Time
* Current Temperature
* Current 'Feels Like' Temperature
* Current Time

## Hardware Support

Supports hardware from ~2016 on - e.g. iPad 6th gen. and above, or Android devices with a modern-ish WebView.  As Android devices are cheap and plentiful, those are used for development and testing.

For my own lounge-room, I am currently using a Samsung A7 Lite tablet - which is a simple but relatively good quality 8-inch tablet.  This runs for weeks/months at a time, with complete stability.  I have also used a MiPad 4 (great screen!) - which can often be found secondhand - plus sundry older phones & tablets.

## Software

You can use any browser, really - but for best results a 'Kiosk' type app that provides a borderless display is the nicest.  

I use an Android app called [Fully Kiosk](https://www.fully-kiosk.com/) to actually load and display the 10-Foot Dash.  It's excellent and inexpensive and offers a lot of control and a seamless experience.

_(Fully Kiosk is just a very handy app helps with things like keeping the screen always on, and automatically re-starting the app should there be a network connection issue, and so on.  I bought a license for it (~AU $15) because I am using it extensively - but the free version is all you actually need to get going with this.  If you want more advanced features like on/off schedules for the tablet, you do need the paid version.)_

## Tech Stack

We all stand on the shoulders of giants. 

This project uses, and sends thanks to, these particular giants: 

* [Vite](https://vitejs.dev/) for dev/building/packaging
* [Alpine.js](https://alpinejs.dev/) for reactivity
* [Tailwind CSS](https://tailwindcss.com/) for CSS
* [CodeRabbit](https://www.coderabbit.ai/)) - for development assistance
* (Either) [OpenMeteo](https://open-meteo.com/) for weather data
* (Or) [Australian Bureau of Meteorology](http://www.bom.gov.au/) for weather data
* [ARPANSA](https://www.arpansa.gov.au/) for live UV data (some Australian locations)
* [Meteocons](https://bas.dev/work/meteocons) for the weather icons
* (Either) [Kodi](https://kodi.tv/) - my media player of choice (since 2008!)
* (Or)  [Jellyfin](https://jellyfin.org/) - my media server of choice (since 2025)

## Support & Development

**This project is very much a personal 'fun project'.**

If you do encounter issues, feel free to open an issue here.  Please provide as much information as you can in your initial report (e.g. hardware/software, console logs etc.).  If I have time I will try and help.

PRs will of course be considered!  See [Development](#development) below.  E.g. for other weather services or media components.

## Installation

There is no 'installation' as such - this is just a basic web app that runs in a  browser.  To get it, you just go to the app's URL (see below) - and the app will then just come up in your browser.  

_(If you wish, you_ can _download the app locally and use it entirely offline and/or install it as a PWA (i.e. Progressive Web App, via 'Add to Home Screen').  If you download/install it, then from them on, the app runs locally and_ only _communicates within your local network.  But note PWA support can be a bit hit-and-miss - you may e.g. struggle to get things working correctly (e.g. in nice clean fullscreen view, without any menu bars)...the cleanest way I have found to run this is to use a Kiosk app, e.g. Fully Kiosk, as described above)_.

_(You can also easily set up your own version to host, locally or otherwise, with any http server, should you wish - either by cloning this repo and building locally, or just by downloading my hosted version)._


## Loading The App 

This is the basic URL to visit:

`https://dash.bossanova808.net/`

Initially, you will simply see a large clock in the center of your screen.  This is the default display if the app is not configured, or the network is down.

Now, you need to provide some configuration.  All configuration is done via URL parameters.  These follow the URL and an initial `?` character, and take the form of: `parameter=value`, with each separated by `&`, given a URL that looks like this:

`https://dash.bossanova808.net/?param1=value1&param2=value2` ...and so on.

Notes:

* To use a default value, simply don't supply that parameter.  
* You can supply the parameters in any order.

## Configure: User Interface Size

`size=` UI size.  One of `small` `medium` or `large`.  Default is `large`. 

(Large is for tablets in the 7+ inch range, and small is e.g. for phones)

E.g. `size=small`

## Configure: Weather Data

### Weather from OpenMeteo (Worldwide :earth_americas:)

If you're *not* in Australia (see below for that) - then you should provide the necessary OpenMeteo data - you need latitude, longitude and timezone.  

To get these, search for these at the top of this page:
https://open-meteo.com/en/docs

**Important**: with the timezone, you must replace the `/` character with the URL encoded `%2F` value instead.

Build your URL arguments from those values, e.g.:

`latitude=-37.814&longitude=144.9633&timezone=Australia%2FSydney`

### Weather from the Australian Bureau of Meteorology (:australia:)

If you *are* in Australia, then definitely use this approach - the BOM weather data is much more accurate, and it's also easier to set up.

#### BOM Location ID (geohash)

`bom=` BOM location ID.  Default is `r1r11df` (Ascot Vale, Melbourne). 

You can get your location ID by querying the BOM localities API - just change the search string on the end of this url: `https://api.weather.bom.gov.au/v1/locations/?search=kyneton`

You'll get back some JSON, e.g. 

```json
{
    "metadata":
    {
        "response_timestamp": "2023-03-27T00:33:04Z"
    },
    "data": [
    {
        "geohash": "r1qsp5d",
        "id": "Kyneton-r1qsp5d",
        "name": "Kyneton",
        "postcode": "3444",
        "state": "VIC"
    },
    {
        "geohash": "r1qeyek",
        "id": "Kyneton South-r1qeyek",
        "name": "Kyneton South",
        "postcode": "3444",
        "state": "VIC"
    }]
}
```

...from which you can then find your geohash (`r1qsp5d` for Kyneton, in the above example).

E.g. `bom=r1r11df`

#### Ultraviolet (UV) Data - for Australian Cities

(UV observations courtesy of [ARPANSA](https://www.arpansa.gov.au/))

If your location has live UV (ultraviolet) data available from the list here: [ARPANSA](https://uvdata.arpansa.gov.au/xml/uvvalues.xml), you can add a parameter to display current UV / predicted max UV data (n.b. UV data only displays between sunrise and sunset - at night you will see Moon Phase data instead!). 

`uv=` (default is no value)

E.g.

`uv=Melbourne`

## Configure: Media Now Playing Info (Jellyfin/Kodi)

Currently, 10 Foot Dash supports Jellyfin and Kodi.

### Now Playing information from: Jellyfin

#### Setup Jellyfin

You will first need to create an API key in your Jellyfin Dashboard, if you don't have one set up already.

#### Jellyfin Host

`jellyfin=` Jellyfin host or IP address.  

**Note**: due to a [Chromium bug](https://issues.chromium.org/issues/40259678), you may have issues with images not loading if you use IP address and your Jellyfin does not use SSL (as this bug blocks the loading of mixed content from IP addresses) - so **it is strongly recommended to use a hostname if you can!**

#### Jellyfin Port

`jellyfin-port=` Change if you're running Jellyfin on a different port. 

Default is `8096`

#### Jellyfin SSL

`jellyfin-ssl` Default is `false` - set to `true` if your Jellyfin uses SSL. 

#### Jellyfin API Key

`jellyfin-api-key=` Your Jellyfin API key

#### Jellyfin Device

`jellyfin-device=`

By default, this app will show _any_ Jellyfin playbacks.  

If you have multiple Jellyfin clients (and especially if they are being used simultaneously), this can create issues.  Specify a device name to instead filter the displayed playback to only that device.  

(Note this is the device name, NOT the device ID - in most Jellyfin apps you can set up a custom device name, if needed).

e.g.

`jellyfin-device=LoungeInfuse` 

#### Jellyfin Pause Timeout

Some Jellyfin clients are pretty basic - e.g. the LG TV WebOS app is just a simple wrapper around the web UI.  

Unfortunately, with these clients, it is possible to 'back out of' the Jellyfin App in a way that 10-foot Dash can't detect - there is no 'media stop' event as such.  It seems like some of these clients auto-pause the media (others jsut keep playing in the backround!) - but that's it.  It's a pretty crap but of Jellyfin 'design', really.

As a work-around, you can set a 'pause timeout' that will hide the Jellyfin Now Playing display after a configurable number of seconds.  This will mean that your display doesn't get stuck on the Now Playing mode, but it has the undesired side effect of also happening with legitimate long pauses you when you _haven't_ backed out of the app. 

e.g.

`jellyfin-pause-timeout=30` 

### Now Playing information from: Kodi

#### Setup Kodi

In your Kodi installation's settings, you must enable the Webserver, and JSON-RPC as well as 'allow control from other systems' (which enables the websockets interface which this app uses for communication with Kodi). 

_All of this is fine and essentially completely safe to do **as long as your Kodi player is (as it almost always would be) hidden behind a router's NAT**.  Do **_not_** do this if your Kodi box is corrected directly to the internet (but that would be **_very bad_** anyway, for a lot of reasons...)._

#### Kodi Host & Authorisation

`kodi=` Kodi hostname or IP address.  Add the user/password if needed.

Default is `127.0.0.1`

.e.g.  `kodi=192.168.1.100` or `kodi=user:password@ip.address`

#### Kodi Webserver Port

`kodi-web=` Kodi webserver port.  Default is `8080`.

e.g. `kodi-web=8088`

#### Kodi JSON RPC Port

`kodi-json=` Kodi JSON RPC Port.  Default is `9090`.

e.g. `kodi-json=9999`

## Examples of Final, Configured URLs

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

### SSL/HTTPS Support / Notes

By default, the app connects to your Media system using plain HTTP and/or WebSocket (ws://) protocols - even though the web app itself is served over HTTPS. 

This supports the common scenario where the web app is served securely (e.g., via Cloudflare tunnel) - but your media runs on the local network with HTTP only, i.e. without SSL support (as is the default behaviour for both Kodi and Jellyfin).

This is known as a 'mixed-content' scenario.  You will probably need to enable mixed content in your browser or Fully Kiosk settings to get things working.

#### Examples

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

#### Mixed Content Notes

Most Media player installations use HTTP only. When serving this app over HTTPS but connecting to HTTP/WS Jellyfin/Kodi, browsers will block mixed content by default. 

Solutions:

* Fully Kiosk users: Enable "Allow Mixed Content" in Advanced Web Settings → Content Blocking
* Standard browsers: Most will show a "shield" icon in the address bar — click it and allow mixed content, for this app
* Host the app yourself over HTTP instead (avoids the issue entirely). As this is likely to be an entirely internal app, this is an easy and appropriate solution
* Set up [Kodi SSL](https://kodi.wiki/view/SSL_certificates) or [Jellyfin SSL](https://jellyfin.org/docs/general/post-install/networking/advanced/letsencrypt/)


## Development

(PRs will certainly be looked at, but if you're going to add something significant that you think might be generally useful, perhaps open an issue here for initial discussion). 

To get going for local development/tweaking for your particular need, all you really need to do is:

`npm install` (or `npm update` if you want to update dependencies)

`npm run dev`

_(**IMPORTANT:** do not use the `vite` or `vite build` tools directly!)_

Click on the URL Vite will then show in your terminal window, and you should have an HMR dev setup up and running (i.e. Hot Module Reload - which will automatically reload whenever you make changes). 

To build for deployment if you want to host this yourself somewhere:

`npm run build`

Note that if you're not deploying to the root of your site, i.e. you're using a sub‑folder for your deployment (something like `https://your.site/kodidash`), then you will need to modify the `vite.config.js` `base` property (see the [Vite docs](https://vite.dev/config/shared-options.html#base)). See the commented‑out [example](https://github.com/bossanova808/kodi.ozweather.2nd.screen/blob/d8356a0659e84db7c386df7aed85cc080837b35f/vite.config.js#L6).
