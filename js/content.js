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
    // Without setautogrow you get frame in a frame effect on facebook page
    FB.Canvas.setAutoGrow();
    // manually set size (also slow)
    // FB.Canvas.setSize({ width: 640, height: 4000 });

    // Check if logged in, and search for events
    loginAndDo(buildContent);
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

// all javascript code should go (including jquery) in
// a $(document).ready(function() {}); block.
$(document).ready(function() {
    // bootstrap:
    // For performance reasons, the Tooltip and Popover data-apis are opt-in, meaning you must initialize them yourself.
    // One way to initialize all tooltips on a page would be to select them by their data-toggle attribute:
    $(function() {
        $('[data-toggle="tooltip"]').tooltip();
    });

    // get location and sort
    $("#locationBtn").click(function() {
        console.log('in locationBtn');
        var geocoder =  new google.maps.Geocoder();
        var loc = $('#locationInput').val();
        geocoder.geocode( { 'address': loc }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                showLocation(results[0]);
            } else {
                str = 'Enter a valid address...';
                $('#locationInput').val(str);
                //alert('not found');
            }
        });
    });

    // Modal for top festivals
    $('#festivalsModal').on('show.bs.modal', function (event) {
        if (typeof(Storage) !== "undefined") {
            var data = sessionStorage.getItem('zoukevents');
            if (data !== undefined && data) {
                var events = JSON.parse(data);
                if (events.length > 0) {
                    var selected = [];
                    for (var i = 0; i < knownEvents.length; i++) {
                        var ev = getEventFromName(knownEvents[i], events);
                        if (ev) {
                            selected.push(ev);
                        }
                    }
                    if (selected.length > 0) {
                        var str = `
                            <table class="table table-condensed">
                            <thead><th>Date</th><th>Event</th><th>Attending</th><tr></tr></thead>
                            `;
                        str += getTableBody(selected);
                        str += '</table>';
                        $("#selectedFestivalsTable").html(str);
                    }
                }
            }
        }
    });
});


// Global
// Batch request maximum is 50
var searcheStrings = [
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

// These are known festivals to compare against
var knownEvents = [ 'zouk\\s+libre.*festival',
                    'prague.*zouk.*congress',
                    'prague\\s+zouk\\s+marathon',
                    'rio.*zouk.*congress',
                    'f.i.e.l',
                    'zoukmx\\s',
                    '\\s*zoukfest\\s',
                    'l.*a.*Zouk.*congress',
                    '[^t]zouktime!\|^zouktime!\\s',
                    'dutch.+international.+zouk.+congr',
                    'berg.*congres',
                    'i\'m\\s*zouk',
                    'canada.*zouk' ];

var knownSuspectPlaces = [ { latitude: '48.812053039547',  longitude: '2.4038419249911' }, 
                           { latitude: '-22.882511415042', longitude: '-48.452376032727' },
                           { latitude: '46.01244',         longitude: '-0.28403' },
                           { latitude: '-22.9937382',      longitude: '-44.2409439' }
                         ];

var timeNow = new Date();
// All events
var events = [];    
// Suspect events
var suspects = [];
// Set of legit attendees; Use an object since objects are ordered pairs in javascript, 
// like: var obj = {"1":true, "2":true, "3":true, "9":true}
var legitAttendees = {}; // empty object
// Access token, set only from FB.getLoginStatus().
var accessToken;
// Progress bar
var progress = 0;
// undecided suspect list
var unknownEvents = [];
// Facebook has 50 commands per batch limit
var BATCH_MAX = 45; // don't use const as it may not be supported in earlier browsers
// Each query comes back with 25 results (even if you set higher limit). For deciding
// on suspicious events, get max 1000 attendees and compare to known zouk attendees
//var MAX_PAGE_ITERATIONS = 40; // 40x25=1000
var MAX_PAGE_ITERATIONS = 20;
var pageIterationCount = 0;

/************************************************************/
function loginAndDo(doFunct) {
    // Get access token and use it to do something (async).
    // accessToken is obtained and set globally only from this function.
    // FB.api() response does not have accessToken.
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            // console.log('Logged in.');
            accessToken = response.authResponse.accessToken;
            doFunct();
        } else {
            $('#bannerMsg').show();
            FB.login(function(response) {
                if (response.authResponse) {
                    if (response.status === 'connected') {
                        //console.log('Welcome!  Fetching information.... ');
                        accessToken = response.authResponse.accessToken;
                        $('#bannerMsg').hide();
                        doFunct();
                    }
                } else {
                    console.log('User cancelled login or did not fully authorize.');
                }
            });
        }
    });
}

/************************************************************/
// Search FB
function buildContent() {
    var batchCmd = [];
    for (var i = 0; i < searcheStrings.length; i++) {
        batchCmd.push( { method: 'GET', 
                         relative_url: 'search?q=' + searcheStrings[i] 
                         + '&type=event&fields=id,name,start_time,place,attending_count,cover,description&access_token='
                         + accessToken }
                     );
    }

    $('#searchProgressBarDiv').show();
    FB.api('/', 'POST', { batch: batchCmd }, eventsCallback);
    // Response of FB.api is asynchronous, make it resursive from callback
}

/************************************************************/
var eventsCallback = function(response) {
    //console.log('eventsCallback');

    if (!response || response.error) {
        console.log('FB.api: Error occured');
        console.log(response);
        return;
    }
    // print response in console log. You'll see that you get back an array of 
    // objects, and each is a JSON serialied string. To turn it into a javascript
    // objects, use parse().
    var batchCmd = [];
    for (var i = 0; i < response.length; i++) {
        if (response[i] && response[i].hasOwnProperty('body') && response[i].body) {
            var body = JSON.parse(response[i].body);
            // console.log('properties ' + Object.getOwnPropertyNames(body));                           
            if (body.hasOwnProperty('data') && body.data) {
                var data = body.data;
                for (var j = 0; j < data.length; j++) {
                    if (preFilter(data[j])) {
                        if (events.length < 9000) { // Can store about 10000 in sessionStorage
                            // remove description as this will eat up sessionStorage
                            if (data[j].hasOwnProperty('description') && data[j].description) {
                                data[j].description = null;
                            }
                            events.push(data[j]);
                        }
                    }
                }
            }
            // next paging link
            if (body.hasOwnProperty('paging') && body.paging) {
                var paging = body.paging;
                if (paging.hasOwnProperty('next') && paging.next) {
                    var splitted = paging.next.split('?');
                    var rel_url = 'search?' + splitted[1];
                    //console.log('rel url of event ' + rel_url);
                    batchCmd.push( { method: 'GET', relative_url: rel_url } );
                }
            }
        } 
    }
    // Update progress bar
    progress = (progress < 90) ? progress + 10 : progress;
    $('#searchProgressBar').css('width', progress + '%').attr('aria-valuenow', progress);

    // Recurse:
    if (batchCmd.length > 0) {
        FB.api('/', 'POST', { batch: batchCmd }, eventsCallback);
    } else {
        // We are done, do further filtering
        console.log('total events ' + events.length);
        $('#searchProgressBar').css('width', '100%').attr('aria-valuenow', 100);
        $('#filterProgressBarDiv').show();
        progress = 0; // for next progress bar
        getMajorLegitEventAttendees();
    }
};

/************************************************************/
function getMajorLegitEventAttendees() {
    //console.log('getMajorLegitEventAttendees');
    // get api links
    var batchCmd = [];
    for (var i = 0; i < knownEvents.length; i++) {
        var ev = getEventFromName(knownEvents[i], events);
        if (ev) {
            batchCmd.push( { method: 'GET',
                             relative_url: ev.id + '/attending?' + 'access_token=' + accessToken } );
        }
    }
    if (batchCmd.length > 0) {
        // get a set of legit attendees
        FB.api('/', 'POST', { batch: batchCmd }, legitAttendeesCallback);
    }
}
   
/************************************************************/
var legitAttendeesCallback = function(response) {
    // XXX facebook is limited 3 pages of results (less than 75); verfied with facebook api explorer
    // maybe it is a bug they neex to fix
    //console.log('legitAttendeesCallback');
    if (!response || response.error) {
        console.log('FB.api: Error occured');
        console.log(response);
        return;
    }
    // Update progress bar
    progress = (progress < 10) ? progress + 2 : progress;
    $('#filterProgressBar').css('width', progress + '%').attr('aria-valuenow', progress);

    var batchCmd = [];
    for (var i = 0; i < response.length; i++) {
        if (response[i] && response[i].hasOwnProperty('body') && response[i].body) {
            var body = JSON.parse(response[i].body);
            //console.log(body);                
            if (body.hasOwnProperty('data') && body.data) {
                var data = body.data;
                for (var j = 0; j < data.length; j++) {
                    // add id if it is not there
                    if (! legitAttendees.hasOwnProperty(data[j].id)) {
                        legitAttendees[data[j].id] = true;
                        //console.log('adding ' + data[j].id + ' -- ' + Object.keys(legitAttendees).length);
                    }
                }
            }
            // next paging link
            if (body.hasOwnProperty('paging') && body.paging) {
                var paging = body.paging;
                if (paging.hasOwnProperty('next') && paging.next) {
                    var rel_url = getRelativeUrl(paging.next);
                    //console.log('rel url ' + rel_url);
                    batchCmd.push( { method: 'GET', relative_url: rel_url } );
                }
            }
        } 
    }
    // Recurse:
    if (batchCmd.length > 0) {
        FB.api('/', 'POST', { batch: batchCmd }, legitAttendeesCallback);
    } else {
        // We are done. Store, and get suspect events
        if(typeof(Storage) !== "undefined") { // This browser supports sessionStorage and localStorage
            sessionStorage.setItem('zoukattendees', Object.keys(legitAttendees).length);
        } 
        getSuspectEventAttendees();
    }
};

/************************************************************/
function getSuspectEventAttendees() {
    //console.log('getSuspectEventAttendees');
    // Batch requests are chained, after one finishes next one starts.
    // javascript is single threaded so thread safe
    for (var i = 0; i < events.length; i++) {
        if (events[i].attending_count > 100) {
            // verify this event's legitimacy
            unknownEvents.push( { id: events[i].id, attending: {}, done: false } );
        }
    }
    //console.log('total unknownEvents ' + unknownEvents.length);
    // Pick top BATCH_MAX from the list, batch them, after done remove from list, repeat
    var batchCmd = [];
    var limit =  unknownEvents.length < BATCH_MAX ? unknownEvents.length : BATCH_MAX;
    //console.log('batch size of unknownEvents ' + limit);
    for (var i = 0; i < limit; i++) {
        batchCmd.push( { method: 'GET', 
                         relative_url:  unknownEvents[i].id + '/attending?' + 'access_token=' + accessToken } );
    }
    FB.api('/', 'POST', { batch: batchCmd }, suspectEventAttendeesCallback);
}

/************************************************************/
var suspectEventAttendeesCallback = function(response) {
    //console.log('suspectEventAttendeesCallback');
    pageIterationCount++;

    if (!response || response.error) {
        console.log('FB.api: Error occured');
        console.log(response);
        return;
    }

    // Update progress bar
    progress = (progress < 95) ? progress + 2 : progress;
    $('#filterProgressBar').css('width', progress + '%').attr('aria-valuenow', progress);

    //console.log('response length ' + response.length + ' u-suspects ' + Object.keys(unknownEvents).length);
    var batchCmd = [];

    for (var i = 0; i < response.length; i++) {
        if (response[i] && response[i].hasOwnProperty('body') && response[i].body) {
            var body = JSON.parse(response[i].body);
            // responses correspond with requests sent in batch command
            if (body.hasOwnProperty('data') && body.data) {
                var data = body.data;
                for (var j = 0; j < data.length; j++) {
                    // add id if it is not there
                    if (! unknownEvents[i].attending.hasOwnProperty(data[j].id)) {
                        unknownEvents[i].attending[data[j].id] = true;
                    }
                }
            }

            // next paging link
            var done = true;
            if (body.hasOwnProperty('paging') && body.paging) {
                var paging = body.paging;
                if (paging.hasOwnProperty('next') && paging.next) {
                    var relUrl = getRelativeUrl(paging.next);
                    batchCmd.push( { method: 'GET', relative_url: relUrl } );
                    done = false;
                }
            }
            unknownEvents[i].done = done;
        } 
    }

    // check if there are too many iterations (big events with thousands of attendees)
    if (pageIterationCount >= MAX_PAGE_ITERATIONS) {
        // mark batch done
        //console.log('MAX_PAGE_ITERATIONS reached');
        for (var i = 0; i < response.length; i++) {
            unknownEvents[i].done = true;
        }
        pageIterationCount = 0;
        batchCmd.length = 0; // remove batch commands
    }
    // filter and remove finished events, do this outside above loop so as not to affect array indexes
    for (var i = 0; i < unknownEvents.length; i++) {
        if (unknownEvents[i].done) {
            filterSuspect(unknownEvents[i].id, unknownEvents[i].attending);
            // remove
            unknownEvents.splice(i, 1);
        }
    }

    // Recurse:
    if (batchCmd.length > 0) {
        //console.log('request length of batch ' + batchCmd.length);
        FB.api('/', 'POST', { batch: batchCmd }, suspectEventAttendeesCallback);
    } else {
        // We are done with this batch, process next
        var batchCmd = []; // reinitialize (recreate) batchCmd, old one has stuff in it
        var limit = unknownEvents.length < BATCH_MAX ? unknownEvents.length : BATCH_MAX;
        if (limit > 0) {
            for (var i = 0; i < limit; i++) {
                batchCmd.push( { method: 'GET', 
                                 relative_url:  unknownEvents[i].id + '/attending?' + 'access_token=' + accessToken } );
            }
            //console.log('new batch size of unknownEvents ' + batchCmd.length);
            FB.api('/', 'POST', { batch: batchCmd }, suspectEventAttendeesCallback);
        } else {
            // we are done, no more unknownEvents 
            // sort and display
            $('#filterProgressBar').css('width', '100%').attr('aria-valuenow', 100);

            if (events.length > 0) {
                // post process, filter out more events
                var sortTime = function(at, bt) {
                    var a = parseTime(at.start_time);
                    var b = parseTime(bt.start_time);
                    return (a > b) ? 1 : -1;
                };
                events.sort(sortTime);
                suspects.sort(sortTime);
                // wait for some millisec so progress bar shows completion
                setTimeout(function() { display(events, accessToken); }, 700); 
                // cookies have 4k limit - so can't be used to store events. It siliently fails. Use
                // localStorage / sessionStorage. They have 5MB limit
                if(typeof(Storage) !== "undefined") { // This browser supports sessionStorage and localStorage
                    // Save data to sessionStorage
                    sessionStorage.setItem('zoukevents', JSON.stringify(events));
                    sessionStorage.setItem('suspectevents', JSON.stringify(suspects));
                } 
            }
        }
    }
};


/************************************************************/
function showEventsByTime() {
    loginAndDo(showEventsByTimeInner);
}

/************************************************************/
function showEventsByTimeInner() {
    if (typeof(Storage) !== "undefined") {
        var data = sessionStorage.getItem('zoukevents');
        if (data !== undefined && data) {
            var events = JSON.parse(data);
            if (events.length > 0) {
                display(events, accessToken);
            } else {
                console.log('No events in showEventsByTimeInner');
            }
        }
    } else {
        buildContent();
    }
}

/************************************************************/
function showEventsByAttending() {
    loginAndDo(showEventsByAttendingInner);
}

/************************************************************/
function showEventsByAttendingInner() {
    if (typeof(Storage) !== "undefined") {
        var data = sessionStorage.getItem('zoukevents');
        if (data !== undefined && data) {
            var events = JSON.parse(data);
            events.sort(function(at, bt) {
                var a = at.attending_count;
                var b = bt.attending_count;
                return (a < b) ? 1 : -1; // descending
            });
            if (events.length > 0) {
                display(events);
            } else {
                console.log('No events in showEventsByAttendingInner');
            }
        }
    } else {
        alert('Your browser does not support this operation');
    }
}

/************************************************************/
function showFiltered() {
    if (typeof(Storage) !== "undefined") {
        var data = sessionStorage.getItem('suspectevents');
        if (data !== undefined && data) {
            var events = JSON.parse(data);
            if (events.length > 0) {
                var str = `
                    <button type="button" class="btn btn-default btn-sm" onclick="showEventsByTimeInner();" style="margin-top:10px; margin-bottom: 5px;">
                    <span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span> Back
                    </button>
                    <table class="table table-condensed">
                    <thead>
                    <th>Date</th>
                    <th>Filtered Event</th>
                    <th>Attending</th>
                    <tr>
                    </tr>
                    </thead>
                    `;
                str += getTableBody(events);
                str += '</table>';
                $('#searchProgressBarDiv').hide();
                $('#filterProgressBarDiv').hide();
                $('#evTableHeader').hide();
                $('#map').hide();
                $("#evTableContent").hide().html(str).fadeIn('fast');
                $('#mainContent').show();
            } else {
                console.log('No events to show');
            }
        }
    } else {
        alert('Your browser does not support this operation');
    }
}

/************************************************************/
function showLocation(geoResult) {
    var lat = geoResult.geometry.location.lat();
    var lng = geoResult.geometry.location.lng();
    if (typeof(Storage) === "undefined") {
        alert('Your browser does not support this operation');
        return;
    }
    var data = sessionStorage.getItem('zoukevents');
    if (data === undefined || (! data)) {
        console.log('No events in showEventsByAttendingInner');
    }
    events = JSON.parse(data);
    var selected = [];

    for (var i = 0; i < events.length; i++) {
        if (events[i].hasOwnProperty('place') && events[i].place) {
            var place = events[i].place;
            if (place.hasOwnProperty('location') && place.location) {
                var location = place.location;  
                if ((location.hasOwnProperty('latitude') && location.latitude) && 
                    (location.hasOwnProperty('longitude') && location.longitude)) {
                    var dist = distance(lat, lng, location.latitude, location.longitude);
                    events[i].attending_count = Math.round(dist); // kludge alert: replace attening_count with dist
                    selected.push(events[i]);
                }
            }
        }
    }
    if (selected.length > 0) { // sort
        selected.sort(function(at, bt) {
            var a = parseInt(at.attending_count);
            var b = parseInt(bt.attending_count);
            return (a > b) ? 1 : -1; 
        });
        var str = `
            <table style="margin-top: 10px;"><tr><td>
            <button type="button" class="btn btn-default btn-sm" onclick="showEventsByTimeInner();">
            <span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span> Back
            </button>
            </td>
            <td><h5 style="padding-left:20px;">Address: ${geoResult.formatted_address}</h5></td></tr>
            </table>
            <table class="table table-condensed">
            <thead>
            <th>Date</th>
            <th>Event</th>
            <th>Distance (mi)</th>
            <tr>
            </tr>
            </thead>
            `;
        str += getTableBody(selected);
        str += '</table>';
        $('#map').hide();
        $('#evTableHeader').hide();
        $("#evTableContent").hide().html(str).fadeIn('fast');
        $('#mainContent').show();
    }
}

/************************************************************/
function showMap() {
    if (typeof(Storage) === "undefined") {
        alert('Your browser does not support this operation');
        return;
    }
    var data = sessionStorage.getItem('zoukevents');
    if (data === undefined || (! data)) {
        console.log('No events in showEventsByAttendingInner');
    }
    events = JSON.parse(data);
    var selected = [];

    for (var i = 0; i < events.length; i++) {
        if (events[i].hasOwnProperty('place') && events[i].place) {
            var place = events[i].place;
            if (place.hasOwnProperty('location') && place.location) {
                var location = place.location;  
                if ((location.hasOwnProperty('latitude') && location.latitude) && 
                    (location.hasOwnProperty('longitude') && location.longitude)) {
                    selected.push(events[i]);
                }
            }
        }
    }
    if (selected.length > 0) { 
        var str = `
            <button type="button" class="btn btn-default btn-sm" onclick="showEventsByTimeInner();" style="margin: 10px 0px 10px 0px;">
            <span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span> Back
            </button>
            `;
        $('#evTableHeader').hide();
        $("#evTableContent").hide().html(str).fadeIn('fast');
        $('#mainContent').show();
        $('#map').show();

        var myLatLng = {lat: -27.363, lng: 0.0};
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 0,
            center: myLatLng
        });

        var marker = new google.maps.Marker({
            position: myLatLng,
            map: map,
            title: 'Hello World!'
        });
        for (var i = 0; i < selected.length; i++) {
            var myLatLng = {lat: selected[i].place.location.latitude,
                            lng: selected[i].place.location.longitude };
            var marker = new google.maps.Marker({
                position: myLatLng,
                map: map,
                title: selected[i].name
            });
        }
    }
}

/************************************************************/
function display(events) {
    //console.log('total: ' + events.length);
    var msg = '';
    if (typeof(Storage) !== "undefined") {
        var data = sessionStorage.getItem('zoukattendees');
        if (data !== undefined && data) {
            msg += '&nbsp; &nbsp; ' + '<span class="badge">' + data + '</span>' 
                + ' attending <a href="#" data-toggle="modal" data-target="#festivalsModal">major festivals</a>';
        }
    }
    var str = `
        <table class="table table-condensed">
        `;
    str += getTableBody(events);
    str += '</table>';
    $('#searchProgressBarDiv').hide();
    $('#filterProgressBarDiv').hide();
    $('#map').hide();
    $('#contentNav').show();
    $('#evTableHeader').show();
    $("#evTableContent").hide().html(str).fadeIn('fast');
    msg = '<span class="badge">' + events.length + '</span>' + ' events' + msg;
    $("#totalEvents").hide().html(msg).fadeIn('fast');
    $('#mainContent').show();
    //document.getElementById("z_content").innerHTML = str;
}

/************************************************************/
function getTableBody(events) {
    var monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    var str = `
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

        var imgWidth = '75px';
        var imgHeight = '42px';
        var textWidth = '400px';
        str += `<tr><td><h5>${month} ${dateS[2]}</h5></td>
            <td> 
            <table>
            <tr>
            <td>
            <a href="https://www.facebook.com/events/${events[i].id}">
            <div id="img_inner" style='background-image: url("${imageUrl}"); width: ${imgWidth}; height: ${imgHeight}; background-size: ${imgWidth} ${imgHeight};' >
            </div>
            </a>
            </td>
            <td style="padding-left: 20px">
            <a href="https://www.facebook.com/events/${events[i].id}">
            <h5 title="${events[i].name}" data-toggle="tooltip" data-container="body" style='width: ${textWidth}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 7px; margin-bottom: 6px;'>${events[i].name}</h5>
            </a>
            <h5 class='small' title="${placeStr}" data-toggle="tooltip" data-container="body" style='margin-top: 3px; margin-bottom: 1px; width: ${textWidth}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis'>${placeStr}<h5>
            </td>
            </tr>
            </table>
            </td>
            <td>${events[i].attending_count}</a></td>
            </tr>`;
    }

    str += `
    </tbody>
        `;
    return str;
}

/************************************************************/
function parseTime(str) { // milliseconds since 1970 00:00:00
    // http://stackoverflow.com/questions/6427204/date-parsing-in-javascript-is-different-between-safari-and-chrome
    // If actual time zone is used then after sorting, newer events
    // will appear older after adjusting for timezones. So ignore
    // timezones by removing timezone field.
    // 2016-04-07T19:00:00-0300 or 2016-04-07T19:00:00+0300
    var a = str.split(/[^0-9]/);
    return new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
}

/************************************************************/
function preFilter(event) {
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
            if (! found) { // not a duplicate
                // If event location has zouk but name and description don't have it then discard.
                // Also, if there is just a url with name zouk in description, discard
                if (event.hasOwnProperty('place') && event.place) {
                    placeStr = JSON.stringify(event.place);
                    if (placeStr.search(/zouk/i) !== -1) { // found
                        if (event.hasOwnProperty('name') && event.name) {
                            if (event.name.search(/zouk/i) === -1) { // not found
                                if (event.hasOwnProperty('description') && event.description) {
                                    var description = event.description;
                                    // remove http:... or https...
                                    var desc = description.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
                                    if (desc.search(/zouk/i) === -1) { // not found
                                        // remove description as this will eat up sessionStorage
                                        event.description = null;
                                        suspects.push(event);
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                    // if event is happening in a suspect location, discard
                    if (event.place.hasOwnProperty('location') && event.place.location) {
                        var location = event.place.location;
                        if (location.hasOwnProperty('latitude') && location.hasOwnProperty('longitude')) {
                            for (var k = 0; k < knownSuspectPlaces.length; k++) {
                                if ((location.latitude == knownSuspectPlaces[k].latitude) 
                                    && (location.longitude == knownSuspectPlaces[k].longitude)) {
                                    // remove description as this will eat up sessionStorage
                                    event.description = null;
                                    suspects.push(event);
                                    return false;
                                }
                            }
                        }
                    }
                } // place
                return true;
            }
        }
    }
    return false;
}

/************************************************************/
function getEventFromName(name, events) {
    // if you find more than one event, pick one with more attending.
    var event = null;
    var attending = 0;
    for (var i = 0; i < events.length; i++) {
        var re = new RegExp(name, "i");
        if (events[i].name.search(re) !== -1) { // found
            //console.log('festival ' + events[i].name);
            if (events[i].attending_count > attending) {
                event = events[i];
                attending = events[i].attending_count;
            }
        }
    }
    if (! event) {
        console.log(name + ' not found');
    }
    return event;
}

/************************************************************/
function filterSuspect(id, attending) {
    // get the even
    var evIdx = 0;
    for (; evIdx < events.length; evIdx++) {
        if (events[evIdx].id == id) {
            break;
        }
    }
    if (evIdx >= events.length) {
        console.log('Not expected, event not found ' + id);
        return;
    }
    //console.log('examining ' + events[i].name);
    // do sets intersection
    var attendees = Object.keys(attending);
    var intersection = 0;
    for (var i = 0; i < attendees.length; i++) {
        if (legitAttendees.hasOwnProperty(attendees[i])) {
            intersection++;
        }
    }
    var ratio = 100.0 * intersection / attendees.length
    //console.log('ratio ' + ratio);
    if (ratio < 2) {
        // remove event
        var event = events.splice(evIdx, 1); // returns array of 1
        suspects.splice(0, 0, event[0]);
        //console.log('Removing ' + event[0].name);
    }
}

/************************************************************/
function getRelativeUrl(url) {
    var splitted = url.split('?');
    var before = splitted[0].split('/');
    var len = before.length;
    return before[len - 2] + '/' + before[len - 1] + '?' + splitted[1];
}

/************************************************************/
// Havershine formula, in miles
function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var radlon1 = Math.PI * lon1/180
    var radlon2 = Math.PI * lon2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist
}

