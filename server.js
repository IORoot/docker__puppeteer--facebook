'use strict';

const express = require('express');
const serveIndex = require('serve-index')
const body_parser = require('body-parser');
const fs = require('fs');
const util = require('util');

// Import the creator_studio module.
const cs = require ('./creator_studio.js');
const vd = require ('./video_download.js');
const au = require ('./auth.json');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();


/**
 * Open folders
 */
app.use('/logs', express.static('logs'));
app.use('/videos', express.static('videos'), serveIndex('videos', {'icons': true}));
app.use('/images', express.static('images'), serveIndex('images', {'icons': true}));
app.use('/screenshots', express.static('screenshots'), serveIndex('screenshots', {'icons': true}));

app.use(body_parser.json());


/**
 * Main route - run puppeteer
 */
app.post('/', (req, res) => {   

    /**
     * Check that the APIKEY is set and equal
     * to the configured one in auth.json file.
     */
    if (req.query.apikey != au[0].apikey){
        res.send('Please supply a correct apikey query parameter');
        return;
    }


    // Set your facebook username
    if (req.body.user){     
        cs.creator_studio.user(req.body.user);
    } else {
        res.send('Please supply a username');
        return;
    }


    // Set your facebook password
    if (req.body.pass){
        cs.creator_studio.pass(req.body.pass);
    } else {
        res.send('Please supply a password');
        return;
    }


    // Video filename
    if (req.body.video){
        cs.creator_studio.IG_post.video = __dirname + '/videos/' + req.body.video;
    } else {
        res.send('Please supply a video file');
        return;
    }


    // Set the cookie file locations
    if (req.body.cookies){
        cs.creator_studio.cookies(__dirname + '/cookies/' + req.body.cookies);
    } else {
        res.send('Please supply a cookie file');
        return;
    }


    /**
     * All optional parameters
     */
    if (req.body.caption){
        cs.creator_studio.IG_post.caption = req.body.caption;
    }

    if (req.body.location){
        cs.creator_studio.IG_post.location = req.body.location;
    }

    if (req.body.date){
        cs.creator_studio.IG_post.date = req.body.date;
    }

    if (req.body.time){
        cs.creator_studio.IG_post.time = req.body.time;
    }

    if (req.body.cover){
        cs.creator_studio.IG_post.cover = __dirname + '/images/' + req.body.cover;
    }

    if (req.body.crosspost){
        cs.creator_studio.IG_post.crosspost = req.body.crosspost;
    }

    if (req.body.screenshots){
        cs.creator_studio.screenshots(req.body.screenshots);
    }

    if (req.body.noop){
        console.log('server.js NOOP switched ON.')
        cs.creator_studio.noop();
    }

    /**
     * Set the puppeteer settings
     */
    if (req.body.settings){
        cs.creator_studio.settings(req.body.settings);
    } else {
        cs.creator_studio.settings({ 
            headless: true, 
            devtools: false,    
            executablePath: "/usr/bin/google-chrome-stable",
            args: ['--no-sandbox']
        });
    }    
    
    fs.writeFile(__dirname + '/status', 'running', (err, data) => {} );

    // Run, you fools!  
    cs.creator_studio.run();

    res.send('Puppeteer Started. Please check log file for status.');

});


/**
 * Video Downloader
 */
app.post('/vd', (req, res) => {  

    if (req.query.apikey != au[0].apikey){
        res.send('Please supply a correct apikey query parameter');
        return;
    }

    if (!req.body.url){
        res.send('Please supply a URL');
        return;
    }
    if (!req.body.file){
        res.send('Please supply a Filename');
        return;
    }

    fs.writeFile(__dirname + '/status', 'running', (err, data) => {} );

    // Run, you fools!  
    vd.video_downloader.download(req.body.url, req.body.file);

    res.send('Video Downloader Ran. URL: ' + req.body.url + '. To File: ' + req.body.file);

});


/**
 * Clear cookies
 */
app.post('/clearcookies', (req, res) => {   

    /**
     * Check that the APIKEY is set and equal
     * to the configured one in auth.json file.
     */
    if (req.query.apikey != au[0].apikey){
        res.send('Please supply a correct apikey query parameter');
        return;
    }

    // Set the cookie file locations
    if (req.body.cookies){

        let cookieFilename = __dirname + '/cookies/' + req.body.cookies;

        // Overwrite with blank.
        fs.writeFile(cookieFilename, JSON.stringify([]), (err, data) => {
            if (err) throw err;
                console.log(data);
            }
        );

    } else {
        res.send('Please supply a cookie file');
        return;
    }

    res.send('Cookies Cleared');
});


/**
 * Clear Screenshots
 */
app.get('/clearscreenshots', (req, res) => {   

    /**
     * Check that the APIKEY is set and equal
     * to the configured one in auth.json file.
     */
    if (req.query.apikey != au[0].apikey){
        res.send('Please supply a correct apikey query parameter');
        return;
    }

    /**
     * Match regex and delete.
     */
    const path = __dirname + '/screenshots/'
    let regex = /[.]png$/
    fs.readdirSync(path)
        .filter(f => regex.test(f))
        .map(f => fs.unlinkSync(path + f))

    res.send('Screenshots Cleared');
});



/**
 * Clear Logfile
 */
app.get('/clearlog', (req, res) => {   

    /**
     * Check that the APIKEY is set and equal
     * to the configured one in auth.json file.
     */
    if (req.query.apikey != au[0].apikey){
        res.send('Please supply a correct apikey query parameter');
        return;
    }

    // Overwrite with blank.
    fs.writeFile(__dirname + '/logs/debug.log', '', (err, data) => {} );

    res.send('Log Cleared');
});


/**
 * Get Status
 */
app.get('/status', (req, res) => {   

    /**
     * Check that the APIKEY is set and equal
     * to the configured one in auth.json file.
     */
    if (req.query.apikey != au[0].apikey){
        res.send('Please supply a correct apikey query parameter');
        return;
    }

    fs.readFile(__dirname + '/status', 'utf8', function (err,data) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(data);
    });

});

app.listen(PORT, HOST); 