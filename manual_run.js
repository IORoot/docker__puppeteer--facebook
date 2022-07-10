/**
 * Add this to the bottom of the creator_studio.js
 * file and run in vscode to check the puppeteer steps.
 */

const cs = require ('./creator_studio.js');
const auth = require ('./auth.json');

cs.creator_studio.user(auth[0].user)
cs.creator_studio.pass(auth[0].pass);
cs.creator_studio.cookies(__dirname + "/cookies/cookies.json");
cs.creator_studio.screenshots(true);
cs.creator_studio.noop(true);

cs.creator_studio.settings({ 
    headless: false, 
    devtools: false,
    executablePath: "/Users/andrewpearson/Storage/Code/_Small_Experiments/test_puphpeteer/Chromium.app/Contents/MacOS/Chromium",
    args: ['--no-sandbox']
});

cs.creator_studio.IG_post.video     = "./videos/output.mp4";
cs.creator_studio.IG_post.cover     = "./images/cover.jpg";
cs.creator_studio.IG_post.date      = "11/11/2020";
cs.creator_studio.IG_post.time      = "12:30";
cs.creator_studio.IG_post.caption   = "autopost";
cs.creator_studio.IG_post.location  = "california";
cs.creator_studio.IG_post.crosspost = "yes";

cs.creator_studio.run();