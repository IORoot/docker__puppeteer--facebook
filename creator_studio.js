
/**
 * ISSUE - CHROMIUM NOT ABLE TO UPLOAD VIDEO
 * 
 * https://github.com/puppeteer/puppeteer/issues/291
 * 
 * Chromium cannot upload video, however, Chrome can. This is 
 * because chromium is compiled without any codec support. Therefore,
 * use a chromium version WITH support or use Chrome.
 * 
 * You can download a chromium version here:
 * https://chromium.woolyss.com/#mac-stable-ungoogled-marmaduke
 * 
 * Change the executablePath to a google chrome instance
 * executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
 */

var creator_studio = (function () {



    // ┌──────────────────────────────────────────────────────────┐
    // │                                                          │
    // │                       Requirements                       │
    // │                                                          │
    // └──────────────────────────────────────────────────────────┘
    const puppeteer = require('puppeteer-core');
    const fs = require('fs');
    const util = require('util');





    // ┌──────────────────────────────────────────────────────────┐
    // │                                                          │
    // │                     Global Variables                     │
    // │                                                          │
    // └──────────────────────────────────────────────────────────┘
    
    let browser;

    let page;

    let cookieFilename;

    let cookiefile;

    let new_cookies;

    let screenshots = false;

    let noop = false;


    // ┌──────────────────────────────────────────────────────────┐
    // │                                                          │
    // │                   Username / Password                    │
    // │                                                          │
    // └──────────────────────────────────────────────────────────┘

    let user;

    let pass;



    // ┌──────────────────────────────────────────────────────────┐
    // │                                                          │
    // │                    Puppeteer Settings                    │
    // │                                                          │
    // └──────────────────────────────────────────────────────────┘

    let puppeteer_settings = { 
        headless: true, 
        devtools: false,
        args: ['--no-sandbox']
    }


    // ┌──────────────────────────────────────────────────────────┐
    // │                                                          │
    // │                 Instagram Post Variables                 │
    // │                                                          │
    // └──────────────────────────────────────────────────────────┘


    let IG_post = {
        caption:   "Test Puppeteer",
        location:  "London",
        date:      "",
        time:      "",
        video:     "",
        cover:     "",
        crosspost: "",
    };


    // ┌──────────────────────────────────────────────────────────┐
    // │                                                          │
    // │                        Page URLS                         │
    // │                                                          │
    // └──────────────────────────────────────────────────────────┘

    const pages = {
        facebook:               'https://www.facebook.com',
        facebook_login:         'https://www.facebook.com/login',
        IG_creator_studio:      'https://business.facebook.com/creatorstudio/?tab=instagram_content_posts&collection_id=free_form_collection&content_table=INSTAGRAM_POSTS',
    };



    // ┌──────────────────────────────────────────────────────────┐
    // │                                                          │
    // │                    Selectors / XPaths                    │
    // │                                                          │
    // └──────────────────────────────────────────────────────────┘
    
    const selector = {
        cookie_banner:          '[data-cookiebanner="accept_button"]',
        login_button:           '#loginbutton',
        new_post_button:        '#mediaManagerLeftNavigation [role="button"]',
        instagram_feed_link:    '[data-testid="ContextualLayerRoot"] [role="menuitem"]:first-of-type',
        tray_side:              '#creator_studio_sliding_tray_root',
        textarea_caption:       '[contenteditable="true"]',
        link_add_content:       '#creator_studio_sliding_tray_root [aria-haspopup="true"]:first-of-type',
        filebrowser_open:       '[rel="ignore"]',
        xpath_cover_image:      '//*[@id="creator_studio_sliding_tray_root"]/div/div/div[2]/div[2]/div[2]',
        xpath_custom_upload:    '//*[@id="creator_studio_sliding_tray_root"]/div/div/div[2]/div[1]/div/div/div/div[2]',
        input_add_image:        'input[type="file"]',
        publish_chooser:        '//div[@id="creator_studio_sliding_tray_root"]/div/div/div[3]/div[2]/div/button',
        schedule_checkbox:      'body > div:nth-last-child(1) div[aria-checked="false"]',
        crosspost_checkbox:     '#creator_studio_sliding_tray_root button[role="checkbox"]',
        crosspost_chooser:      '#creator_studio_sliding_tray_root button[aria-haspopup="true"]',
        crosspost_schedule:     '.uiContextualLayerAboveRight div div div div:nth-of-type(3)',
        publish_button:         '#creator_studio_sliding_tray_root div div div:nth-of-type(3) button[aria-disabled]',
    };





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



    function privateErrorStatus(){
        fs.writeFile(__dirname + '/status', 'error', (err, data) => {} );
    }



    // ┌──────────────────────────────────────────────────────────┐
    // │                                                          │
    // │                Set the Facebook Username                 │
    // │                                                          │
    // └──────────────────────────────────────────────────────────┘

    function publicSetUsername(username){
        user = username;
    }




    // ┌──────────────────────────────────────────────────────────┐
    // │                                                          │
    // │                Set the Facebook Password                 │
    // │                                                          │
    // └──────────────────────────────────────────────────────────┘
    function publicSetPassword(password){
        pass = password;
    }




    
    // ┌──────────────────────────────────────────────────────────┐
    // │                                                          │
    // │                 Set Cookie Storage File                  │
    // │                                                          │
    // └──────────────────────────────────────────────────────────┘
    function publicSetCookieFile(cookieFile){
        cookieFilename = cookieFile;

        try {
            const jsonString = fs.readFileSync(cookieFilename)
            cookiefile = JSON.parse(jsonString)
        } catch(err) {
            console.log(err)
            return
        }

    }





    // ┌─────────────────────────────────────────────────────────┐
    // │                                                         │
    // │                Update Puppeteer Settings                │
    // │                                                         │
    // └─────────────────────────────────────────────────────────┘
    function publicSetPuppeteerSettings(settings){
        puppeteer_settings = settings;
    }

    


    // ┌──────────────────────────────────────────────────────────┐
    // │                                                          │
    // │               Turn screenshots on or off                 │
    // │                                                          │
    // └──────────────────────────────────────────────────────────┘

    function publicSetScreenshots(trueOrFalse){
        console.log('Screenshot set to:' + trueOrFalse);
        screenshots = trueOrFalse;
    }

    


    // ┌──────────────────────────────────────────────────────────┐
    // │                                                          │
    // │                  Turn NOOP on or off                     │
    // │                                                          │
    // └──────────────────────────────────────────────────────────┘

    function publicSetNOOP(trueOrFalse){
        console.log('NOOP set to true.');
        noop = true;
    }




    // ┌──────────────────────────────────────────────────────────┐
    // │                                                          │
    // │                       Run Function                       │
    // │                                                          │
    // └──────────────────────────────────────────────────────────┘
    function publicRun(){


        (async () => {
        

            /**
             * New puppeteer
             */
            try {
                console.log('Launch Puppeteer');
                browser = await puppeteer.launch(puppeteer_settings);
            } catch (err) {
                console.log('Error launching puppeteer : ' + err);
                privateErrorStatus();
                return;
            } 





            /**
             * New Browser
             */
            try {
                console.log('create browser');
                const context = browser.defaultBrowserContext();
                context.overridePermissions(pages.facebook, []);
            } catch (err) {
                console.log('Error creating browser : ' + err);
                privateErrorStatus();
                return;
            } 





            
            /**
             * New Page
             */
            try {
            console.log('create page');
                page = await browser.newPage();
                await page.setDefaultNavigationTimeout(30000);
                await page.setViewport({ width: 1200, height: 800 });
            } catch (err) {
                console.log('Error creating page : ' + err);
                privateErrorStatus();
                return;
            } 





            /**
             * Cookie File exists
             */
            console.log('cookiefile:' + cookiefile);
            console.log('cookiefile length:' + Object.keys(cookiefile).length);
            console.log('cookiefilename:' + cookieFilename);

            if (Object.keys(cookiefile).length) {

                /**
                 * Read file.
                 */
                try {
                    console.log('load cookies');
                    await page.setCookie(...cookiefile); // ... spread all cookies.
                } catch (err) {
                    console.log('Error loading cookies : ' + err);
                } 

            }




            /**
             * No cookies, Login instead
             */
            if (!Object.keys(cookiefile).length) {

                console.log('No cookies found');

            
                /**
                 * Goto Facebook Page
                 */
                try {
                    console.log('Goto login page');
                    await page.goto(pages.facebook_login, { waitUntil: "networkidle2" });
                    if (screenshots == true){ await page.screenshot({path: './screenshots/010_login_page.png'}) }
                } catch (err) {
                    console.log('Error Visiting Facebook login page : ' + err);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/011_login_page_error.png'}) }
                } 




                /**
                 * Click on Cookie Banner
                 */
                try {
                    console.log('Clicking of accept cookies popup');
                    await page.click(selector.cookie_banner);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/020_click_cookie_banner.png'}) }
                } catch (err) {
                    console.log('Error Clicking on cookie banner : ' + err);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/021_click_cookie_banner_error.png'}) }
                } 




                /**
                 * Run a javascript function in puppeteer.
                 * This passes in 'user' and sets the value.
                 */
                try {
                    console.log('Entering email');
                    await page.evaluate(x => {
                        document.getElementById('email').value = x
                    }, user);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/030_fill_email_address.png'}) }
                } catch (err) {
                    console.log('Error Setting User email in textbox : ' + err);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/031_fill_email_address_error.png'}) }
                } 





                /**
                 * Run a javascript function in puppeteer.
                 * This passes in 'pass' and sets the value.
                 */
                try {
                    console.log('Entering Password');
                    await page.evaluate(x => {
                        document.getElementById('pass').value = x
                    }, pass);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/040_fill_password.png'}) }
                } catch (err) {
                    console.log('Error Setting User Password in textbox : ' + err);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/041_fill_password_error.png'}) }
                } 





                /**
                 * Wait
                 */
                try {
                    console.log('Waiting 1 second.');
                    await page.waitForTimeout(1000);
                } catch (err) {
                    console.log('Error waiting : ' + err);
                } 





                /**
                 * Click the login button
                 */
                try {
                    console.log('Clicking login Button');
                    await page.click(selector.login_button);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/050_click_login_button.png'}) }
                } catch (err) {
                    console.log('Error Clicking on Login button : ' + err);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/051_click_login_button_error.png'}) }
                } 
            }




            /**
             * Visit Creator Studio.
             */
            try {
                await page.waitForTimeout(4000);
                console.log('Visiting Creator Studio');
                page.goto(pages.IG_creator_studio, {waitUntil: 'domcontentloaded'});
                await page.waitForTimeout(4000);
                if (screenshots == true){ await page.screenshot({path: './screenshots/060_visit_creator_studio.png'}) }
            } catch (err) {
                console.log('Error visiting Creator Studio : ' + err);
                if (screenshots == true){ await page.screenshot({path: './screenshots/061_visit_creator_studio_error.png'}) }
                return;
            } 
            


            /**
             * Save Cookies
             */
            try {
                await page.waitForTimeout(4000);
                console.log('Retrieving New Cookies');
                new_cookies = await page.cookies();
                if (screenshots == true){ await page.screenshot({path: './screenshots/070_save_cookies.png'}) }
            } catch (err) {
                console.log('Error Saving Cookies : ' + err);
                if (screenshots == true){ await page.screenshot({path: './screenshots/071_save_cookies_error.png'}) }
            } 





            /**
             * Write to file.
             * 
             * Note : needs a callback function as 3rd parameter to run once
             * complete. This canbe a simple error catcher console.log
             */
            try {
                console.log('Saving Cookies to file: ' + cookieFilename);
                await fs.writeFile(cookieFilename, JSON.stringify(new_cookies, null, 2), (err, data) => {
                        if (err != null){
                            console.log('ERROR writing new_cookies to cookieFilename: ' + err);
                        }
                    }
                );
                if (screenshots == true){ await page.screenshot({path: './screenshots/080_write_cookies_to_file.png'}) } 
            } catch (err) {
                console.log('Error writing cookies to file : ' + err);
                if (screenshots == true){ await page.screenshot({path: './screenshots/081_write_cookies_to_file_error.png'}) } 
            } 




            /**
             * Click "New Post" Button
             */
            try {
                console.log('click "new post" button');
                await page.waitForSelector(selector.new_post_button);
                await page.click(selector.new_post_button);
                if (screenshots == true){ await page.screenshot({path: './screenshots/090_click_new_post_button.png'}) } 
            } catch (err) {
                console.log('Error clicking the "new post" button : ' + err);
                if (screenshots == true){ await page.screenshot({path: './screenshots/091_click_new_post_button_error.png'}) } 
                privateErrorStatus();
                return;
            } 





            /**
             * Select the "instagram feed" button
             */
            try {
                console.log('Selecting Instagram Feed link');
                await page.waitForSelector(selector.instagram_feed_link);
                await page.click(selector.instagram_feed_link);
                if (screenshots == true){ await page.screenshot({path: './screenshots/100_click_ig_feed.png'}) } 
            } catch (err) {
                console.log('Error clicking the instagram feed link : ' + err);
                if (screenshots == true){ await page.screenshot({path: './screenshots/101_click_ig_feed_error.png'}) } 
                privateErrorStatus();
                return;
            } 
            




            /**
             * Wait for side tray
             */
            try {
                console.log('Wait for side tray');
                await page.waitForSelector(selector.tray_side);
                if (screenshots == true){ await page.screenshot({path: './screenshots/110_wait_side_tray.png'}) } 
            } catch (err) {
                console.log('Error waiting for the side tray : ' + err);
                if (screenshots == true){ await page.screenshot({path: './screenshots/111_wait_side_tray_error.png'}) } 
                privateErrorStatus();
                return;
            }





            /**
             * Type in the caption of the new Instagram posts
             */
            try {
                console.log('Entering a Caption');
                await page.type(selector.textarea_caption, IG_post.caption);
                if (screenshots == true){ await page.screenshot({path: './screenshots/120_type_caption.png'}) } 
            } catch (err) {
                console.log('Error filling in the caption into the textarea : ' + err);
                if (screenshots == true){ await page.screenshot({path: './screenshots/121_type_caption_error.png'}) } 
            }
            




            /**
             * Enter a Location
             */
            try {
                console.log('Entering a Location');
                await page.keyboard.press('Tab');
                await page.keyboard.press('Tab');
                await page.keyboard.press('Backspace');
                await page.keyboard.type( IG_post.location, {delay: 10} );
                await page.keyboard.press('Tab');
                if (screenshots == true){ await page.screenshot({path: './screenshots/130_type_location.png'}) } 
            } catch (err) {
                console.log('Error filling in the location textbox : ' + err);
                if (screenshots == true){ await page.screenshot({path: './screenshots/131_type_location_error.png'}) } 
            }





            /**
             * Click on the +Add Content link
             */
            try {
                console.log('Clicking on the "+Add Content" link');
                await page.click(selector.link_add_content);
                await page.waitForTimeout(1000);
                if (screenshots == true){ await page.screenshot({path: './screenshots/140_click_add_content.png'}) } 
            } catch (err) {
                console.log('Error clicking on the "+add content" link : ' + err);
                if (screenshots == true){ await page.screenshot({path: './screenshots/141_click_add_content_error.png'}) } 
                privateErrorStatus();
                return;
            }


            


            /**
             *  Upload Video WITHOUT filebrowser
             */
            try {
                console.log('Selecting File');
                await page.waitForSelector('.uiContextualLayerPositioner input[type="file"]');
                const inputUploadHandle = await page.$('.uiContextualLayerPositioner input[type="file"]'); 
                await inputUploadHandle.uploadFile(IG_post.video);
                if (screenshots == true){ await page.screenshot({path: './screenshots/150_upload_video.png'}) } 
            } catch (err) {
                console.log('Error using the filebrowser and accepting input file : ' + err);
                if (screenshots == true){ await page.screenshot({path: './screenshots/151_upload_video_error.png'}) } 
                privateErrorStatus();
                return;
            }




            /**
             * Cross-post to facebook page
             */
            if ('' !== IG_post.crosspost ){
                try {
                    console.log('Click Facebook Page checkbox');
                    await page.waitForTimeout(500);
                    await page.click(selector.crosspost_checkbox);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/160_select_crosspost.png'}) } 
                } catch (err) {
                    console.log('Error clicking the facebook crosspost checkbox : ' + err);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/161_select_crosspost_error.png'}) } 
                }
            }


            

            /**
             * Schedule the facebook crossposts
             */
            if ('' !== IG_post.crosspost && '' !== IG_post.date && '' !== IG_post.time){
                



                /**
                 * Click down arrow next to crosspost 'publish'
                 */
                try {
                    console.log('Click crosspost down-arrow');
                    await page.waitForTimeout(500);
                    await page.click(selector.crosspost_chooser);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/170_select_crosspost_publish_options.png'}) } 
                } catch (err) {
                    console.log('Error clicking crosspost options down-arrow : ' + err);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/171_select_crosspost_publish_options_error.png'}) } 
                }




                /**
                 * Click down arrow next to crosspost 'publish'
                 */
                try {
                    console.log('Click crosspost schedule checkbox');
                    await page.waitForTimeout(1000);
                    await page.click(selector.crosspost_schedule);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/180_click_checkbox_crosspost_schedule.png'}) } 
                } catch (err) {
                    console.log('Error clicking crosspost schedule checkbox : ' + err);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/181_click_checkbox_crosspost_schedule_error.png'}) } 
                }




                /**
                 * Add date
                 */
                try {
                    console.log('Add crosspost date');
                    await page.keyboard.press('Tab', {delay: 100});
                    await page.keyboard.press('Tab', {delay: 100});
                    await page.keyboard.press('Tab', {delay: 100});
                    await page.keyboard.type( IG_post.date );
                    if (screenshots == true){ await page.screenshot({path: './screenshots/190_crosspost_date.png'}) } 
                } catch (err) {
                    console.log('Error typing in the crosspost date : ' + err);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/191_crosspost_date_error.png'}) } 
                }




                /**
                 * Add Time
                 */
                try {
                    console.log('Add time');
                    await page.keyboard.press('Tab', {delay: 100});
                    await page.keyboard.type( IG_post.time );
                    if (screenshots == true){ await page.screenshot({path: './screenshots/200_crosspost_time.png'}) } 
                } catch (err) {
                    console.log('Error typing in the crosspost time : ' + err);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/201_crosspost_time_error.png'}) } 
                }


            }




            /**
             * Skip if Cover image is empty.
             */
            if ('' !== IG_post.cover){


                /**
                 * Change Cover Image
                 */
                try {
                    console.log('Selecting Cover Image');
                    await page.waitForXPath(selector.xpath_cover_image);
                    const [cover_image] = await page.$x(selector.xpath_cover_image);
                    await cover_image.click();
                    if (screenshots == true){ await page.screenshot({path: './screenshots/210_click_cover_image_sidebar.png'}) } 
                } catch (err) {
                    console.log('Error selecting the "cover image" sidebar : ' + err);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/211_click_cover_image_sidebar_error.png'}) } 
                }




                /**
                 * Custom upload box
                 */
            
                try {
                    console.log('Click custom upload box');
                    await page.waitForXPath(selector.xpath_custom_upload);
                    const [custom_upload] = await page.$x(selector.xpath_custom_upload);
                    await custom_upload.click();
                    if (screenshots == true){ await page.screenshot({path: './screenshots/220_click_custom_image.png'}) } 
                } catch (err) {
                    console.log('Error clicking the "custom upload" box : ' + err);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/221_click_custom_image_error.png'}) } 
                }




                /**
                 * Click "Add Image" within custom upload.
                 */
            
                try {
                    console.log('Click "add image"');
                    await page.waitForSelector(selector.input_add_image);
                    const fileInput = await page.$(selector.input_add_image);
                    await fileInput.uploadFile(IG_post.cover);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/230_add_custom_image.png'}) } 
                } catch (err) {
                    console.log('Error clicking the "Add Image" button : ' + err);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/231_add_custom_image_error.png'}) } 
                }
            }






            /**
             * Publish immediately if no date or time supplied.
             */
            if ('' !== IG_post.date && '' !== IG_post.time ){

                /**
                 * Click down arrow next to 'publish'
                 */
                try {
                    console.log('Click down-arrow');
                    const [down_arrow] = await page.$x(selector.publish_chooser);
                    await down_arrow.click();
                    if (screenshots == true){ await page.screenshot({path: './screenshots/240_click_publish_options.png'}) } 
                } catch (err) {
                    console.log('Error clicking publish options down-arrow : ' + err);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/241_click_publish_options_error.png'}) } 
                }




                /**
                 * Click schedule checkbox
                 */
                try {
                    console.log('Click schedule checkbox');
                    await page.waitForTimeout(500);
                    await page.click(selector.schedule_checkbox);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/250_click_schedule.png'}) } 
                } catch (err) {
                    console.log('Error clicking the schedule checkbox : ' + err);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/251_click_schedule_error.png'}) } 
                }



                /**
                 * Add date
                 */
                try {
                    console.log('Add date');
                    await page.keyboard.press('Tab', {delay: 100});
                    await page.keyboard.press('Tab', {delay: 100});
                    await page.keyboard.press('Tab', {delay: 100});
                    await page.keyboard.type( IG_post.date );
                    if (screenshots == true){ await page.screenshot({path: './screenshots/260_schedule_date.png'}) } 
                } catch (err) {
                    console.log('Error typing in the date : ' + err);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/261_schedule_date_error.png'}) } 
                }





                /**
                 * Add Time
                 */
                try {
                    console.log('Add time');
                    await page.keyboard.press('Tab', {delay: 100});
                    await page.keyboard.type( IG_post.time );
                    if (screenshots == true){ await page.screenshot({path: './screenshots/270_schedule_time.png'}) } 
                } catch (err) {
                    console.log('Error typing in the time : ' + err);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/271_schedule_time_error.png'}) } 
                }

            }





            




            /**
             * PUBLISH if not a NOOP
             */
            if (noop == false){

                console.log('FALSE NOOP = ' + noop);

                try {
                    console.log('Click Publish');
                    await page.waitForTimeout(1000);
                    await page.click(selector.publish_button);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/280_publish.png'}) } 
                } catch (err) {
                    console.log('Error clicking the publish button : ' + err);
                    if (screenshots == true){ await page.screenshot({path: './screenshots/280_publish_error.png'}) } 
                    privateErrorStatus();
                    return;
                }
            } else {

                /**
                 * NOOP
                 */
                console.log('TRUE NOOP = ' + noop);
                if (screenshots == true){ await page.screenshot({path: './screenshots/300_NOOP.png'}) } 
                // switch it back off again.
                noop = false;
            }





            
            





            /**
             * Done
             */
            try {
                console.log('Done');
                fs.writeFile(__dirname + '/status', 'success', (err, data) => {} );
                if (screenshots == true){ await page.screenshot({path: './screenshots/290_done.png'}) } 
                await page.waitForTimeout(20000);
                await browser.close();
            } catch (err) { 
                console.log('Error closing the browser : ' + err);
                if (screenshots == true){ await page.screenshot({path: './screenshots/291_done_error.png'}) } 
                privateErrorStatus();
                return;
            }
        
        })();

    }


    // ┌─────────────────────────────────────────────────────────────────────────────┐
    // │                                                                             │
    // │ Make these things public:                                                   │
    // │                                                                             │
    // │ 1. puppeteer_settings object So you can update and change the defaults.     │
    // │                                                                             │
    // │ 2. IG_post object to update the default post values.                        │
    // │                                                                             │
    // │ 3. user() method to set the facebook username to login with.                │
    // │                                                                             │
    // │ 4. pass() method to login with.                                             │
    // │                                                                             │
    // │ 5. run() method to kick everything off.                                     │
    // │                                                                             │
    // │ 6. cookiefile is the path to the json file to store all cookies.            │
    // │                                                                             │
    // └─────────────────────────────────────────────────────────────────────────────┘
    return {
        puppeteer_settings,     
        IG_post,
        run: publicRun,
        user: publicSetUsername,
        pass: publicSetPassword,
        cookies: publicSetCookieFile,
        settings: publicSetPuppeteerSettings,
        screenshots: publicSetScreenshots,
        noop: publicSetNOOP,
    };

})();


// ┌─────────────────────────────────────────────────────────┐
// │                                                         │
// │           Export the creator_studio variable.           │
// │        Use the require() function to import it.         │
// │                                                         │
// │ https://stackoverflow.com/questions/950087/how-do-i-inc │
// │    lude-a-javascript-file-in-another-javascript-file    │
// │                                                         │
// └─────────────────────────────────────────────────────────┘
module.exports = { creator_studio };