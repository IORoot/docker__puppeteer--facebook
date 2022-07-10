# Javascript / Puppeteer Instagram Scheduler


## IMPORTANT

IMPORTANT - This puppeteer script will not run without a version of chromium that
has NOT been compiled with the video/audio codecs. Chrome comes with them as standard
but Chromium does not.

You can download a copy of Chromium with those codecs here:
https://chromium.woolyss.com/ to query these routes.

You can then set the `executablePath` of puppeteer-core in the puppeteer settings
to point to this version of chromium.

Warning - If you do not do this, then chromium will not upload any videos to the
creator studio because it will not recognise those file formats. Images will work,
however.




## Description

This puppeteer script will automatically open up a new page, visit (or login) to 
facebook creator studio and create a new post with all of your supplied details.

This is a bare-bones example to make it as understandable as possible. It's meant
for readability and help to understand the process.

It comes with a few components, that do separate things. The main parts are:

1. `creator_studio.js` is a node script that does the main work. This runs the 
puppeteer scripts to do the automation.

1. `cli.js` is the command-line interface to the `creator_studio.js`. It allows you
to run the scripts from the command prompt.

1. `manual_run.js` is for running the `creator_studio.js` with a load of settings
already made. Note that it will need changing the `executablePath` to your own path 
as a minimum.

1. `video_download.js` is a node script that will allow you to download a file to the
local filesystem. This is needed so that you can download a video/image to then upload 
it to the creator studio.

1. `cli_vd.js` is a command-line interface to the `video_download.js` script.

1. `server.js` is an HTTP REST server to the same `creator_studio.js` script, allowing
you to run the script remotely.



## Requirements

- Instagram 'business' account
- Facebook 'creator studio' account.
- Instagram account connected to the creator studio account.
- Puppeteer-Core (without chromium installed - we do that manually)



## Authentication

Before you can run the script you will need to create an `./auth.json` file in the following structure:

```json
[
    {
        "apikey": "randomAPIKEYstringTOuseFORauthenticatingYOURSELF",
        "user": "my_creator_studio_email@gmail.com",
        "pass": "my_creator_studio_password"
    }
]
```
If this is not set, then the puppeteer scripts will not be able to login and run.

The API KEY is used to authenticate yourself with the REST `server.js` file.


## `creator_studio.js`

The script is broken into the following parts:

### 1. Inputs and setting Defaults.

At the top of the script you have all of thee loading in required libraries, global variables,
default puppeteer_settings, default post settings, constants and XPATH locations.

### 2. Custom logger

The logger allows us to write to a file and prefix each line with a date/time. Logs are stored in `./logs/debug.log`

### 3. Setters

These are the methods that change (set) all of the variables declared above. Thesee variables
control the behaviour of the script.

- `publicSetUsername()` sets the username or email address the script will use to log into the 
creator studio with.

- `publicSetPassword()` sets the password for the account the script will log into.

- `publicSetCookieFile()` tells the script to write all cookies to this filename set. Use just a filename, like `cookies.json` 


- `publicSetPuppeteerSettings()` allows you to override the default puppeteer settings. This allows you to do things like turning 'headless' on/off, devtools on/off, give a new chrome path, etc... e.g.
```js
{ 
    headless: false, 
    devtools: false,
    executablePath: "/Users/me/Chromium.app/Contents/MacOS/Chromium",
    args: ['--no-sandbox']
}
```

- `publicSetScreenshots()` turns on the screenshot function. This means that each step of the puppeteer script will take an image. This is helpful for debugging purposes and status updates.

- `publicSetNOOP()` will turn on the NO OPeration functionality. Essentially, this will do every step as normal, however it will NOT submit everything at the end, within the creator_studio. THis is good for testing and making sure that all steps are working.


### 4. run

This is the main bulk of the script. Each step is broken up with a comment specifying what it will do. Use a debugger and the `manual_run.js` script (with headless off), to follow each step.

Each step will use the `selector` constant to reference the correct XPATH it should look for to perform it's task. For instance, the `publish_button` may change over time, so we can update the `selector` constant to look in a new XPATH location when that happens.


### 5. Public Methods

At the bottom of the script is a list of the public methods available to the CLI and the HTTP REST Server to access the Setter methods.


### Intricacies and XPATH Problems.

Instagram will obfuscate and randomise all of the classnames on the creator studio page. 
This will make it difficult to target the correct part of the page. All of the current
selectors and XPaths are in the `selector` object within the `creator_studio.js` file.

### Usage

See the contents of the `manual_run.js` file to see a working version of running the script manually.






## `cli.js`

This is the command-line interface to the script. 

### Usage

You can run the command through the command line (without installing), like this:

```bash
node . -u me@gmail.com  to query these routes.

#### `/` 

This is the main route. It will execute the -p PASSWORD -f /Users/me/cookies.json -v ./output.mov -c "Crosspost" -d 05/11/2020 -t 02:00 -x yes
```

Run the help file with:

```bash
❯ node ./cli.js --help
Usage: -u <user> -p <pass> -c <cookiefile> -v <videofile>

Options:
  --help             Show help                                         [boolean]
  --version          Show version number                               [boolean]
  -u, --user         Your facebook username/email            [string] [required]
  -p, --pass         Your facebook password                  [string] [required]
  -f, --cookiefile   Location of cookie file                 [string] [required]
  -v, --video        Instagram Video FilePath                [string] [required]
  -c, --caption      Instagram Caption Text                             [string]
  -i, --image        Instagram Video Cover FilePath                     [string]
  -l, --location     Instagram Location                                 [string]
  -d, --date         Instagram Schedule Date DD/MM/YYYY                 [string]
  -t, --time         Instagram Schedule Time HH:MM                      [string]
  -x, --crosspost    Post to Facebook Page too                          [string]
  -s, --screenshots  Screenshot every step
  -n, --noop         NO OPeration. Used to test script works
```


Install the commandline tool with: (while in the directory)
```bash
npm install -g .
```

Uninstall with:
```bash
npm uninstall -g ig-scheduler
```

Run an installed veersion with `cs` (which is the name of the command)
```bash
cs -u me@gmail.com  to query these routes.

#### `/` 

This is the main route. It will execute the -p PASSWORD -f /Users/me/cookies.json -v ./output.mov -c "Crosspost" -d 05/11/2020 -t 02:00 -x yes
```

You can track progress throught the debug log at `./logs/debug.log`

## `cli_vd.js`

This is a simpler script that acts as a command-line interface to the `video_download.js` script.

You can see usage here:

```bash
❯ node ./cli_vd.js --help
Usage: -u <url> -f <file>

Options:
  --help      Show help                                                [boolean]
  --version   Show version number                                      [boolean]
  -u, --url   The video URL to download                      [string] [required]
  -f, --file  Your target filename                           [string] [required]
```





## `video_download.js`

This has one public method, `download()` which takes two parameters, `url` and `filePath`. The `cli_vd.js` script should be used to run this method.


## `server.js`

So this is an HTTP REST web interface that uses `express.js`. Since this is all meant to run within a docker container, the `HOST` is `0.0.0.0` and `PORT` is `8080`. It requires docker to connect to those ports to its external one.

### Open Folders

There are four folders open that are used to allow you to access the contents. This uses the `serve-index` library to show the contents of the folder via a browser. visit the paths to see the contents.

#### `/logs`

This contains the `debug.log` file.

#### `/videos`

This contains the video files downloaded with the `video_download.js` script. Use this to check the video has downloaded.

#### `/images`

This contains the coverart files downloaded with the `video_download.js` script. Use to make sure the image file has downloaded.

#### `/screenshots`

Contains the last round of screenshots taken by the script if the `screenshot` parameter has been switched on.

### Routes

The following routes are available. Use something like `postman.com` to query these routes.

- POST to `/`
- POST to `/vd`
- POST to `/clearcookies`
- GET to `/clearlog`
- GET to `/status`

#### `POST` to `/` 

A `POST` request to the root of the domain will execute the main puppeteer script. 

Requires the following PARAMETERS:

- `apikey=APIKEYSETINAUTHJSONFILE123` 

Requires the following HEADERS:

- `CONTENT-TYPE = application/json`

Requires the following RAW JSON BODY:

```json
{
    "user":      "me@gmail.com", 
    "pass":      "mypassword",
    "cookies":   "cookies.json",
    "video":     "output.mp4",
    "cover":     "cover.jpg",
    "date":      "09/11/2022",
    "time":      "12:30",
    "location":  "New York",
    "caption":   "Testing from postman",
    "crosspost": "on",
    "screenshots": "on",
    "noop":       false
}
```


#### `POST` to `/vd`

This will instigate the video_download.js script.

Requires the following PARAMETERS:

- `apikey=APIKEYSETINAUTHJSONFILE123` 

Requires the following HEADERS:

- `CONTENT-TYPE = application/json`

Requires the following RAW JSON BODY:

```json
{
    "url": "https://domain.com/wp-content/uploads/2020/10/video.mp4", 
    "file": "./videos/output.mp4"
}
```


#### `POST` to `/clearcookies`

This will delete the cookie file so the puppeteer script will need to log in again.

Requires the following PARAMETERS:

- `apikey=APIKEYSETINAUTHJSONFILE123` 

Requires the following HEADERS:

- `CONTENT-TYPE = application/json`

Requires the following RAW JSON BODY:

```json
{
    "cookies":   "cookies.json"
}
```

#### GET to `/clearlog`

This will truncate the `debug.log` file.

Requires the following PARAMETERS:

- `apikey=APIKEYSETINAUTHJSONFILE123` 


#### GET to `/status`

This will get the last known status of the script. It will be one of the following states:

- success
- running
- error

Use this for alerting or metrics.

Requires the following PARAMETERS:

- `apikey=APIKEYSETINAUTHJSONFILE123` 


## Docker

This script is also dockerised and contains the dockerfile I use to setup my installation on DigitalOcean.


## Troubleshooting

If the puppeteer script isn't working, then it's probably because facebook have changed their interface.

Run the puppeteer locally in "HEAD" mode and with DevTools to change the puppeteer script to match the  current interface.

## Changelog

- v1.1.0 - Updated for public use (removed all personal creds)

- v1.0.0 - Initial Commit