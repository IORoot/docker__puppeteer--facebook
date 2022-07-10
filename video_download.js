var video_downloader = (function () {

    const fs = require('fs');
    const http = require('http');
    const https = require('https');
    const util = require('util');


    // ┌──────────────────────────────────────────────────────────┐
    // │                                                          │
    // │                Custom Debugger / Logger                  │
    // │                                                          │
    // └──────────────────────────────────────────────────────────┘
    var log_file = fs.createWriteStream(__dirname + '/logs/debug.log', {flags : 'w'});
    var log_stdout = process.stdout;

    console.log = function(d) { //
        log_file.write(Date() + ' ' + util.format(d) + '\n');
        log_stdout.write(Date() + ' ' + util.format(d) + '\n');
    };


    /**
     * Downloads file from remote HTTP[S] host and puts its contents to the
     * specified location.
     */
    async function download(url, filePath) {

        if (url == undefined) { return }
        if (filePath == undefined) { return }

        console.log('Downloading: ' + url + ' to: ' +  filePath);

        const proto = !url.charAt(4).localeCompare('s') ? https : http;

        return new Promise((resolve, reject) => {

            const file = fs.createWriteStream(filePath);
            let fileInfo = null;

            const request = proto.get(url, response => {
                
                if (response.statusCode !== 200) {
                    console.log('Failed to download URL. Code:'  + response.statusCode);
                    fs.writeFile(__dirname + '/status', 'error', (err, data) => {} );
                    return;
                }

                fileInfo = {
                    mime: response.headers['content-type'],
                    size: parseInt(response.headers['content-length'], 10),
                };

                response.pipe(file);
            });

            // The destination stream is ended by the time it's  called
            file.on('finish', () => {
                console.log('Download complete.');
                fs.writeFile(__dirname + '/status', 'success', (err, data) => {} );
                resolve(fileInfo)
            });

            request.on('error', err => {
                console.log('Request Error.' + err);
                fs.writeFile(__dirname + '/status', 'error', (err, data) => {} );
                fs.unlink(filePath, () => reject(err));
            });

            file.on('error', err => {
                console.log('Request Error.' + err);
                fs.writeFile(__dirname + '/status', 'error', (err, data) => {} );
                fs.unlink(filePath, () => reject(err));
            });

            request.end();
        });
    }


    // ┌─────────────────────────────────────────────────────────────────────────────┐
    // │                                                                             │
    // │ Make these things public:                                                   │
    // │                                                                             │
    // └─────────────────────────────────────────────────────────────────────────────┘
    return {
        download: download
    };

})();


// ┌─────────────────────────────────────────────────────────┐
// │                                                         │
// │           Export the video_downloader variable.         │
// │        Use the require() function to import it.         │
// │                                                         │
// │ https://stackoverflow.com/questions/950087/how-do-i-inc │
// │    lude-a-javascript-file-in-another-javascript-file    │
// │                                                         │
// └─────────────────────────────────────────────────────────┘
module.exports = { video_downloader };
