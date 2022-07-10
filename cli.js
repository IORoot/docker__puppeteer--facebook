#!/usr/bin/env node

// Get the commandline arguments library
const yargs = require("yargs");

// parse commandline arguments.s    
const options = yargs
    .usage("Usage: -u <user> -p <pass> -c <cookiefile> -v <videofile>")

    .option("u", { alias: "user", describe: "Your facebook username/email", type: "string", demandOption: true })

    .option("p", { alias: "pass", describe: "Your facebook password", type: "string", demandOption: true })

    .option("f", { alias: "cookiefile", describe: "Location of cookie file", type: "string", demandOption: true })

    .option("v", { alias: "video", describe: "Instagram Video FilePath", type: "string", demandOption: true })

    .option("c", { alias: "caption", describe: "Instagram Caption Text", type: "string" })

    .option("i", { alias: "image", describe: "Instagram Video Cover FilePath", type: "string" })

    .option("l", { alias: "location", describe: "Instagram Location", type: "string" })

    .option("d", { alias: "date", describe: "Instagram Schedule Date DD/MM/YYYY", type: "string" })

    .option("t", { alias: "time", describe: "Instagram Schedule Time HH:MM", type: "string" })

    .option("x", { alias: "crosspost", describe: "Post to Facebook Page too", type: "string" })

    .option("s", { alias: "screenshots", describe: "Screenshot every step", type: "bool" })

    .option("n", { alias: "noop", describe: "NO OPeration. Used to test script works", type: "bool" })

    .argv; 



// Import the creator_studio module.
const cs  = require ('./creator_studio.js');

// Update the puppeteer launch settings.
// Use to update the executablePath of the Chromium location you downloaded
// with the media codecs included.
cs.creator_studio.settings({ 
    headless: false, 
    devtools: false,    
    executablePath: "/usr/bin/google-chrome-stable",
    args: ['--no-sandbox']
});

// Set your facebook username
cs.creator_studio.user(`${options.user}`);

// Set your facebook password
cs.creator_studio.pass(`${options.pass}`);

// Set the cookie file location
cs.creator_studio.cookies(`${options.cookiefile}`);

// Required Args
cs.creator_studio.IG_post.video         = `${options.video}`;


// optional args
if (options.image){
    cs.creator_studio.IG_post.cover         = `${options.image}`;
}

if (options.caption){
    cs.creator_studio.IG_post.caption       = `${options.caption}`;
}

if (options.location){
    cs.creator_studio.IG_post.location      = `${options.location}`;
}

if (options.date){
    cs.creator_studio.IG_post.date          = `${options.date}`;
}

if (options.time){
    cs.creator_studio.IG_post.time          = `${options.time}`;
}   

if (options.crosspost){
    cs.creator_studio.IG_post.crosspost     = `${options.crosspost}`;
}   

if (options.screenshots){
    cs.creator_studio.IG_post.screenshots(true);
}

if (options.noop){
    cs.creator_studio.IG_post.noop     = `${options.noop}`;
}


// Run, you fools!
cs.creator_studio.run();