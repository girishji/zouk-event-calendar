// content.js

// To debug FB only. Otherwise minified version of FB sdk is alreay loaded.
js.src = "//connect.facebook.net/en_US/sdk/debug.js";

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
        appId      : '1263842110297634', //test app
        cookie     : true,
        xfbml      : true,
        version    : 'v2.5'
    });
    // setAutoGrow works but slowly and consumes cycles
    FB.Canvas.setAutoGrow();
    // manually set size (also slow)
    // FB.Canvas.setSize({ width: 640, height: 4000 });
};
// load the facebook SDK async
(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Check if user has approved this app, else prompt for login.

