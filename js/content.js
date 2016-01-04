// content.js

// The Facebook SDK for JavaScript doesn't have any standalone files 
// that need to be downloaded or installed, instead you simply need to 
// include a short piece of regular JavaScript in your HTML that will 
// asynchronously load the SDK into your pages. You should insert it 
// directly after the opening <body> tag on each page you want to load it:
window.fbAsyncInit = function() {
    FB.init({
        //appId      : <?php echo getenv('FACEBOOK_APP_ID'); ?>, //set from server side
        appId      : 1263842110297634, // from FB app settings page
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
                        // console.log('Welcome!  Fetching information.... ');
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

// Global
var zEvents = [];
var zSearch = [
    'zouk',
    'zouk+carnival',
    /// 'zouk+time',
    /// 'zouk+night',
    /// 'f.i.e.l+official',
    /// 'lambazouk',
    /// 'zouk+lambada',
    /// 'brazilian+zouk',
    /// 'zouk+festival',
    /// 'zouk+marathon',
    /// 'zouk+family',
    /// 'zouk+fest',
    /// 'zouk+congress',
    /// 'zouk+weekend',
    /// 'zouk+salsa',
    /// 'zouk+samba',
    /// 'zouk+beach',
    /// 'zouk+holiday',
    /// 'bachaturo',
    /// 'zouk+kizomba',
    /// 'zouk+dance',
    /// 'zouk+sea',
    /// 'zoukdevils',
    /// 'fall+zouk',
    /// 'berg+zouk',
    /// 'brazouka',
    // 'zouk+fever',
    // 'brasileiro+zouk',
    // 'zouk+fusion',
    // 'zouk+flow',
    // 'zouk+day',
    // 'zouk+jam',
    // 'zouk+danse',
    // 'international+zouk',
    // 'zouk+bachata',
    'carioca+zouk'
];

// Search FB
function buildContent(accessToken) {
    console.log('buildContent ' + accessToken);
    var timeNow = new Date();
    var batchCmd = [];
    for (var i = 0; i < zSearch.length; i++) {
        batchCmd.push( { method: 'GET', 
                         relative_url: 'search?q=' + zSearch[i] 
                         + '&type=event&fields=id,name,start_time,place,attending_count&access_token='
                         + accessToken }
                     );
    }

    FB.api('/', 'POST', { batch: batchCmd }, 
           function(response) {
               if (!response || response.error) {
                   console.log('FB.api: Error occured');
                   console.log(response);
               } else {
                   console.log('success girish ' + response.length);
                   //alert('success girish');
                   // print response in console log. You'll see that you get back an array of 
                   // objects, and each is a JSON serialied string. To turn it into a javascript
                   // objects, use parse().
                   for (var i = 0; i < response.length; i++) {
                       if (response[i].hasOwnProperty('body')) {
                           var body = JSON.parse(response[i].body);
                           console.log('properties ' + Object.getOwnPropertyNames(body));                           
                           if (body.hasOwnProperty('data')) {
                               var data = body.data;
                               console.log('length: ' + data.length);
                               for (var j = 0; j < data.length; j++) {
                                   var startTime = new Date(data[j].start_time);
                                   // Add events even if 3 days old
                                   if ((timeNow < startTime) 
                                       || ((timeNow.getTime() - startTime()) < (3 * 24 * 3600 * 1000))) {
                                       zEvents.push(data[j]);
                                   }
                                   console.log('name: ' + data[j].name + ' id: ' + data[j].id);
                               } 
                           } 
                           // next paging link
                           if (body.hasOwnProperty('paging')) {
                               var paging = body.paging;
                               if (paging.hasOwnProperty('next')) {
                                   var next = paging.next;
                                   console.log('next: ' + next);
                               }
                           }
                       } 
                   }
               }
           });

    var options = {
        weekday: "narrow", year: "2-digit", month: "short",
        day: "2-digit", hour: "2-digit"
    };
    for (var i = 0; i < zEvents.length; i++) {
        var date = new Date(zEvents[i].start_time);
        console.log('Added ' + date.toLocaleTimeString("en-us", options) + ' : ' + zEvents.name);
    }
}

