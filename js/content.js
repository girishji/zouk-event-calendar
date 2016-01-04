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
var searches = [
    'zouk',
    'zouk+carnival',
    'zouk+time',
    'zouk+night',
    'f.i.e.l+official',
    'lambazouk',
    'zouk+lambada',
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

// All events
var events = [];

// Search FB
function buildContent(accessToken) {
    var timeNow = new Date();
    var batchCmd = [];

    function display() {
        var str = '<table id="z_table" border="1" style="width:100%">';
        var monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
            "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        for (var i = 0; i < events.length; i++) {
            var splitS = events[i].start_time.split('T'); // 2016-04-07T19:00:00-0300
            var dateS = splitS[0].split('-');
            var month = monthNames[parseInt(dateS[1]) - 1];
            // var timeS = splitS[1].split(':');
            // Use template strings
            // also http://stackoverflow.com/questions/6629188/facebook-graph-api-how-do-you-retrieve-the-different-size-photos-from-an-album
            var imageUrl;
            if (events[i].hasOwnProperty('cover') && events[i].cover) {
                var pic = events[i].cover;
                if (pic.hasOwnProperty('id') && pic.id) {
                    imageUrl = 'https://graph.facebook.com/' + pic.id + '/picture?access_token='
                        + accessToken + '&type=thumbnail';
                }
            }
            if (imageUrl === undefined) {
                imageUrl = '/images/square.jpg'; // 50x50
            }
            str += `
                <tr>
                <td>${i}</td>
                <td><img src="${imageUrl}"/></td>
                <td>${month} ${dateS[2]}</td>
                <td><a title="${events[i].name}" href="https://www.facebook.com/events/${events[i].id}">
                ${events[i].name}</a></td>
                </tr>
                `;
        }
        str += '</table>';
        // console.log(str);
        document.getElementById("z_content").innerHTML = str;
    }

    function inLocalTZ(timeStr) {
        // If actual time zone is used then after sorting newer events
        // will appear older after adjusting for timezone
        // 2016-04-07T19:00:00-0300 or 2016-04-07T19:00:00+0300
        var d = timeStr.split('T');
        var t = d[1].split('+');
        t = t[0].split('-');
        //console.log('tz ' + d[0] + 'T' + t[0]);
        return d[0] + 'T' + t[0];
    }

    var responseCallback = function(response) {
        if (!response || response.error) {
            console.log('FB.api: Error occured');
            console.log(response);
        } else {
            // print response in console log. You'll see that you get back an array of 
            // objects, and each is a JSON serialied string. To turn it into a javascript
            // objects, use parse().
            var nextPage = [];
            for (var i = 0; i < response.length; i++) {
                if (response[i] && response[i].hasOwnProperty('body') && response[i].body) {
                    var body = JSON.parse(response[i].body);
                    // console.log('properties ' + Object.getOwnPropertyNames(body));                           
                    if (body.hasOwnProperty('data') && body.data) {
                        var data = body.data;
                        for (var j = 0; j < data.length; j++) {
                            if (data[j] && data[j].hasOwnProperty('start_time')) {
                                var startTime = new Date(data[j].start_time);
                                // Add events even if 2 days old
                                if ((timeNow < startTime) 
                                    || ((timeNow.getTime() - startTime.getTime()) < (2 * 24 * 3600 * 1000))) {
                                    events.push(data[j]);
                                }
                                // console.log('name: ' + data[j].name + ' id: ' + data[j].id);
                            }
                        }
                    } 
                    // next paging link
                    if (body.hasOwnProperty('paging') && body.paging) {
                        var paging = body.paging;
                        if (paging.hasOwnProperty('next') && paging.next) {
                            var next = paging.next.split('?'); // like .../search?q=...
                            next = 'search?' + next;
                            console.log('next: ' + next);
                            nextPage.push(next);
                        }
                    }
                } 
            }
            // post process
            events.sort(function(at, bt) {
                var a = new Date(inLocalTZ(at.start_time));
                var b = new Date(inLocalTZ(bt.start_time));
                if (a.getTime() < b.getTime()) return -1;
                if (a.getTime() > b.getTime()) return 1;
                if (a.getTime() === b.getTime()) return 0;
            });
            // Show
            if (events.length > 0) {
                display();
            }
            // Recurse:
            // Clear out the batchCmd array, remember other places contain references
            batchCmd.length = 0;
            // create batch command
            if (nextPage !== undefined) {
                for (var i = 0; i < nextPage.length; i++) {
                    batchCmd.push( { method: 'GET', relative_url: nextPage[i] } );
                }
                if (batchCmd.length > 0) {
                    FB.api('/', 'POST', { batch: batchCmd }, responseCallback);
                }
            }
        }
    };

    for (var i = 0; i < searches.length; i++) {
        batchCmd.push( { method: 'GET', 
                         relative_url: 'search?q=' + searches[i] 
                         + '&type=event&fields=id,name,start_time,place,attending_count,cover&access_token='
                         + accessToken }
                     );
    }

    FB.api('/', 'POST', { batch: batchCmd }, responseCallback);
    // Response of FB.api is asynchronous, make it resursive from callback
}

