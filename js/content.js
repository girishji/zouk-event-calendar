// content.js

// Load ajax only after document (all elements) finish loading
$(document).ready(function() {
    $.ajaxSetup({ cache: true });
});

// The Facebook SDK for JavaScript doesn't have any standalone files 
// that need to be downloaded or installed, instead you simply need to 
// include a short piece of regular JavaScript in your HTML that will 
// asynchronously load the SDK into your pages. You should insert it 
// directly after the opening <body> tag on each page you want to load it:
window.fbAsyncInit = function() {
    FB.init({
        appId      : "<?php echo getenv('FACEBOOK_APP_ID') ?>", //set from server side
        cookie     : true,
        xfbml      : true,
        version    : 'v2.5'
    });

    // setAutoGrow works but slowly and consumes cycles
    FB.Canvas.setAutoGrow();
    // manually set size (also slow)
    // FB.Canvas.setSize({ width: 640, height: 4000 });

    // Check if logged in
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            // console.log('Logged in.');
            buildContent(response.authResponse.accessToken);
        } else {
            FB.login(function(response) {
                if (response.authResponse) {
                    if (response.status === 'connected') {
                        console.log('Welcome!  Fetching information.... ');
                        buildContent(response.authResponse.accessToken);
                    }
                } else {
                    console.log('User cancelled login or did not fully authorize.');
                }
            });
        }
    });

};
// load the facebook SDK async
(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    //js.src = "//connect.facebook.net/en_US/sdk.js";
    // XXX: For debug only. Otherwise use minified version of FB sdk above
    js.src = "//connect.facebook.net/en_US/sdk/debug.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Search FB
function buildContent(accessToken) {


}

