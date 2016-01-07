// content.js

// Facebook SDK for JavaScript doesn't have any standalone files 
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
// Batch request maximum is 50
var searches = [
    'zouk',
    'zouk+carnival',
    'zouk+time',
    'zouk+night',
    'f.i.e.l+official',
    'lambazouk',
    'zouk+lambada',
    'brazilian+zouk',
    'zouk+festival',
    'zouk+marathon',
    'zouk+family',
    'zouk+fest',
    'zouk+congress',
    'zouk+weekend',
    'zouk+salsa',
    'zouk+samba',
    'zouk+beach',
    'zouk+holiday',
    'bachaturo',
    'zouk+kizomba',
    'zouk+dance',
    'zouk+sea',
    'fall+zouk',
    'зук',
    'berg+zouk',
    'brazouka',
    'zoukdevils',
    'zouk+fever',
    'brasileiro+zouk',
    'zouk+fusion',
    'zouk+flow',
    'zouk+day',
    'zouk+jam',
    'zouk+danse',
    'oman+zouk',
    'international+zouk',
    'zouk+bachata',
    'carioca+zouk'
];

// All events
var events = [];

// Progress bar
var progress = 0;

// Search FB
function buildContent(accessToken) {
    var timeNow = new Date();
    var batchCmd = [];

    function display() {
        var monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
            "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        var str = `
              <table class="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Event</th>
                    <th>foo</th>
                    <th>Attending</th>
                  </tr>
                </thead>
                <tbody>
            `;
        for (var i = 0; i < events.length; i++) {
            var splitS = events[i].start_time.split('T'); // 2016-04-07T19:00:00-0300
            var dateS = splitS[0].split('-');
            var month = monthNames[parseInt(dateS[1]) - 1];
            // var timeS = splitS[1].split(':');
            // Use template strings
            // also http://stackoverflow.com/questions/6629188/facebook-graph-api-how-do-you-retrieve-the-different-size-photos-from-an-album

            var imageUrl = '/images/blank.jpg';
            if (events[i].hasOwnProperty('cover') && events[i].cover) {
                var pic = events[i].cover;
                if (pic.hasOwnProperty('id') && pic.id) {
                    imageUrl = 'https://graph.facebook.com/' + pic.id + '/picture?access_token='
                        + accessToken + '&type=thumbnail';
                }
            }
            var placeStr = '';
            var placeName = null;
            if (events[i].hasOwnProperty('place') && events[i].place) {
                var place = events[i].place;
                if (place.hasOwnProperty('name') && place.name) {
                    placeStr += place.name;
                    placeName = place.name;
                }
                if (place.hasOwnProperty('location') && place.location) {
                    var location = place.location;
                    if (location.hasOwnProperty('street') && location.street) {
                        placeStr += ', ' + location.street;
                    }
                    if ((location.hasOwnProperty('city') && location.city) && 
                        (location.hasOwnProperty('country') && location.country)) {
                        placeStr += ', ' + location.city + ', ' + location.country;
                        if (! placeName) {
                            placeName = location.city + ', ' + location.country;
                        }
                    }
                }
            }
            if (! placeName) {
                placeName = 'tbd';
            }

            str += `<tr><td><span style='width: 50px;'><h5>${month} ${dateS[2]}</h5><span></td>
                <td> 
                   <a href="https://www.facebook.com/events/${events[i].id}">
                      <div id="img_inner" style='background-image: url("${imageUrl}"); width: 75px; height: 50px; background-size: 75px 50px;' >
                      </div>
                    </a>
                 </td>
                 <td>
                   <a title="${events[i].name}" href="https://www.facebook.com/events/${events[i].id}">
                     <span style='width: 400px; padding-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis'><h5>${events[i].name}</h5></span>
                   </a>
                   <span title="${placeStr}" style='width: 400px; padding-top: 1px; padding-bottom: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis'>
                     <h5 class='small'>${placeName}<h5>
                   </span>
                </td>
                <td>${events[i].attending_count}</a></td>
                </tr>`;
        }

        str += `
                </tbody>
              </table>
            `;
        $('#progressBar').hide();
        //$('#tableBody').replaceWith(str);
        $('#z-table').replaceWith(str);
        //$('.z-content').css('display', 'inline');
        // console.log(str);
        //document.getElementById("z_content").innerHTML = str;
    }

    function inLocalTZ(timeStr) {
        // If actual time zone is used then after sorting, newer events
        // will appear older after adjusting for timezones. So ignore
        // timezones by removing timezone field.
        // 2016-04-07T19:00:00-0300 or 2016-04-07T19:00:00+0300
        var d = timeStr.split('T');
        var t = d[1].split('+');
        t = t[0].split('-');
        //console.log('tz ' + d[0] + 'T' + t[0]);
        return d[0] + 'T' + t[0];
    }

    function parseTime(str) { // milliseconds since 1970 00:00:00
        // http://stackoverflow.com/questions/6427204/date-parsing-in-javascript-is-different-between-safari-and-chrome
        var a = str.split(/[^0-9]/);
        return new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
    }

    function isValid(event) {
        if (event && event.hasOwnProperty('start_time')) {
            // Parsing does not work in Safari. Recommended that you parse manually (see article below)
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
            // Add events even if a day old
            var startTime = parseTime(event.start_time);
            if ((timeNow < startTime) 
                || ((timeNow.getTime() - startTime.getTime()) < (24 * 3600 * 1000))) {
                // Insert only if unique; Different search strings give same results
                var found = false;
                for (var ev = 0; ev < events.length; ev++) {
                    if (event.id == events[ev].id) { // use == not === so str get casted to number
                        found = true;
                    }
                }
                if (! found) {
                    // Check for bogus events happening in clubs named Zouk
                    if (event.hasOwnProperty('place')) {
                        var placeStr = JSON.stringify(event.place);
                        if (placeStr.search(/zouk/i) === -1) { // case insensitive
                            return true;
                        }
                    }
                }
            }
        }
        return false;
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
                            if (isValid(data[j])) {
                                events.push(data[j]);
                            }
                        }
                    }
                    // next paging link
                    if (body.hasOwnProperty('paging') && body.paging) {
                        var paging = body.paging;
                        if (paging.hasOwnProperty('next') && paging.next) {
                            var next = paging.next.split('?'); // like .../search?q=...
                            next = 'search?' + next;
                            nextPage.push(next);
                        }
                    }
                } 
            }
            // post process
            events.sort(function(at, bt) {
                var a = parseTime(at.start_time);
                var b = parseTime(bt.start_time);
                return (a > b) ? 1 : -1;
            });
            // Update progress bar
            progress = (progress < 90) ? progress + 10 : progress;
            $('.progress-bar').css('width', progress + '%').attr('aria-valuenow', progress);

            // Recurse:
            // Clear out the batchCmd array, remember other places contain references
            batchCmd.length = 0;
            // create batch command
            if (nextPage !== undefined) {
                for (var i = 0; i < nextPage.length; i++) {
                    batchCmd.push( { method: 'GET', relative_url: nextPage[i] } );
                }
            }
            if (batchCmd.length > 0) {
                    FB.api('/', 'POST', { batch: batchCmd }, responseCallback);
            } else {
                // We are done, show results
                $('.progress-bar').css('width', '100%').attr('aria-valuenow', 100);
                if (events.length > 0) {
                    setTimeout(function() { display(); }, 800); // wait for some millisec so progress bar shows completion
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

    progress = 0;
    FB.api('/', 'POST', { batch: batchCmd }, responseCallback);
    // Response of FB.api is asynchronous, make it resursive from callback
}

