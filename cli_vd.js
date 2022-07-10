#!/usr/bin/env node

// Get the commandline arguments library
const yargs = require("yargs");

// parse commandline arguments.s    
const options = yargs
    .usage("Usage: -u <url> -f <file>")

    .option("u", { alias: "url", describe: "The video URL to download", type: "string", demandOption: true })

    .option("f", { alias: "file", describe: "Your target filename", type: "string", demandOption: true })

    .argv; 


// Import the creator_studio module.
const vd  = require ('./video_download.js');

vd.video_downloader.download(`${options.url}`, `${options.file}`);