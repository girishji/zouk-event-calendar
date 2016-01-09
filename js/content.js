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

// bootstrap:
// For performance reasons, the Tooltip and Popover data-apis are opt-in, meaning you must initialize them yourself.
// One way to initialize all tooltips on a page would be to select them by their data-toggle attribute:
$(function () {
    $('[data-toggle="tooltip"]').tooltip();
})

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

var timeNow = new Date();
// All events
var events = [];    
// Suspect events
var suspectEvents = [];
// Set of legit attendees; Use an object since objects are ordered pairs in javascript, 
// like: var obj = {"1":true, "2":true, "3":true, "9":true}
var legitAttendees = {}; // empty object


/************************************************************/
function loginAndDo(doFunct) {
    // Get access token and use it to do something (async).
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            // console.log('Logged in.');
            doFunct(response.authResponse.accessToken);
        } else {
            FB.login(function(response) {
                if (response.authResponse) {
                    if (response.status === 'connected') {
                        //console.log('Welcome!  Fetching information.... ');
                        doFunct(response.authResponse.accessToken);
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
function buildContent(accessToken) {
    var batchCmd = [];

    for (var i = 0; i < searches.length; i++) {
        batchCmd.push( { method: 'GET', 
                         relative_url: 'search?q=' + searches[i] 
                         + '&type=event&fields=id,name,start_time,place,attending_count,cover,description&access_token='
                         + accessToken }
                     );
    }

    FB.api('/', 'POST', { batch: batchCmd }, eventsCallback);
    // Response of FB.api is asynchronous, make it resursive from callback

    /************************************************************/
    var eventsCallback = function(response) {
        // Progress bar
        var progress = 0;

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
                            nextPage.push(paging.next);
                        }
                    }
                } 
            }
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
                    FB.api('/', 'POST', { batch: batchCmd }, eventsCallback);
            } else {
                // We are done, do further filtering
                getMajorLegitEvents();
            }
        }

        /************************************************************/
        function getMajorLegitEvents() {
            // These are known festivals
            var knownEvents = [ 'zouk libre', 
                                'prague zouk congress',
                                'prague zouk marathon',
                                'rio zouk congress',
                                'F.I.E.L',
                                'zoukmx',
                                'zoukfest',
                                'L A Zouk congress',
                                'L.A. Zouk congress',
                                'zouktime',
                                'dutch international',
                                'canada zouk' ];
            // get api links
            var batchCmd = [];
            for (var i = 0; i < knownEvents.length; i++) {
                var id = getEventIdFromName(knownEvents[i]);
                if (id) {
                    batchCmd.push( { method: 'GET',
                                     relative_url:  id + '/attending?' + 'access_token=' + accessToken } );
                }
            }
            if (batchCmd.length > 0) {
                console.log('legitAttendees batch ' + batchCmd.length);
                // get a set of legit attendees
                FB.api('/', 'POST', { batch: batchCmd }, legitAttendeesCallback);
            }
        
            /************************************************************/
            var legitAttendeesCallback = function(response) {
                console.log('legitAttendeesCallback');
                if (!response || response.error) {
                    console.log('FB.api: Error occured');
                    console.log(response);
                } else {
                    var nextPage = [];
                    for (var i = 0; i < response.length; i++) {
                        if (response[i] && response[i].hasOwnProperty('body') && response[i].body) {
                            var body = JSON.parse(response[i].body);
                            if (body.hasOwnProperty('data') && body.data) {
                                var data = body.data;
                                for (var j = 0; j < data.length; j++) {
                                    // add id if it is not there
                                    if (! legitAttendees.hasOwnProperty(data[j].id)) {
                                        legitAttendees[data[j].id] = true;
                                    }
                                }
                            }
                            // next paging link
                            if (body.hasOwnProperty('paging') && body.paging) {
                                var paging = body.paging;
                                if (paging.hasOwnProperty('next') && paging.next) {
                                    nextPage.push(paging.next);
                                }
                            }
                        } 
                    }
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
                        FB.api('/', 'POST', { batch: batchCmd }, legitAttendeesCallback);
                    } else {
                        // We are done. Get suspect events
                        console.log('legit set size ' + Object.keys(legitAttendees).length);
                        getSuspectEventAttendees();
                    }
                }

                /************************************************************/
                function getSuspectEventAttendees(batchCmd) {
                    console.log('getSuspectEventAttendees');
                    // Many batch commands are executed in parallel. There is no issue with thread safety
                    // as javascript is single threaded, but need to be able to know when all of them
                    // finished their async execution. Set this number to 
                    var damForBatchRequests = 0;
                    var maxCmdsInBatch = 40; // Facebook limit is 50
                    var batchInfo = [];
                    for (var i = 0, count = 0; i < events.length; i++) {
                        if (events[i].attending_count > 100) {
                            // verify this event's legitimacy
                            batchInfo.push( { eventId: events[i].id, attendees: {} } );
                            count++;
                            if (count >= maxCmdsInBatch) {
                                count = 0;
                                damForBatchRequests++;
                                processOneBatch(batchInfo);
                                batchCmd = []; // create new array to prevent overwriting
                            }
                        }
                    }
                    console.log('damForBatchRequests ' + damForBatchRequests);

                    /************************************************************/
                    function processOneBatch(batchInfo) {
                        var batchCmd = [];
                        for (var i = 0; i < batchInfo.length; i++) {
                            batchCmd.push( { method: 'GET', 
                                             relative_url:  batchInfo[i].eventId + '/attending?' + 'access_token=' + accessToken } );
                        }
                        FB.api('/', 'POST', { batch: batchCmd }, suspectEventAttendeesCallback);
                        
                        /************************************************************/
                        var suspectEventAttendeesCallback = function(response) {
                            if (!response || response.error) {
                                console.log('FB.api: Error occured');
                                console.log(response);
                            } else {
                                var nextPage = [];
                                for (var i = 0; i < response.length; i++) {
                                    if (response[i] && response[i].hasOwnProperty('body') && response[i].body) {
                                        var body = JSON.parse(response[i].body);
                                        if (body.hasOwnProperty('data') && body.data) {
                                            var data = body.data;
                                            for (var j = 0; j < data.length; j++) {
                                                // add id if it is not there
                                                if (! batchInfo[i].attendees.hasOwnProperty(data[j].id)) {
                                                    batchInfo[i].attendees[data[j].id] = true;
                                                }
                                            }
                                        }
                                        // next paging link
                                        var done = true;
                                        if (body.hasOwnProperty('paging') && body.paging) {
                                            var paging = body.paging;
                                            if (paging.hasOwnProperty('next') && paging.next) {
                                                nextPage.push(paging.next); // i-th event still has attendees left
                                                done = false;
                                            }
                                        }
                                        if (done) {
                                            // finally, check if this event is relevant
                                            filterSuspect(batchInfo[i].eventId, batchInfo[i].attending);
                                            // remove from list
                                            batchInfo.splice(i, 1);
                                        }
                                    } 
                                }
                                // Recurse:
                                // Clear out the batchCmd array, remember other places contain references
                                batchCmd.length = 0;
                                // create batch command
                                if (nextPage !== undefined) {
                                    if (batchInfo.length != nextPage.length) {
                                        console.log('Oops, something went wrong ' + batchInfo.length + ', ' + nextPage.length); 
                                    }
                                    for (var i = 0; i < nextPage.length; i++) {
                                        batchCmd.push( { method: 'GET', relative_url: nextPage[i] } );
                                    }
                                }
                                if (batchCmd.length > 0) {
                                    FB.api('/', 'POST', { batch: batchCmd }, suspectEventAttendeesCallback);
                                } else {
                                    // We are done with this batch
                                    damForBatchRequests--;
                                    if (damForBatchRequests <= 0) { // all batches done
                                        // sort and display
                                        $('.progress-bar').css('width', '100%').attr('aria-valuenow', 100);
                                        if (events.length > 0) {
                                            // post process, filter out more events
                                            events.sort(function(at, bt) {
                                                var a = parseTime(at.start_time);
                                                var b = parseTime(bt.start_time);
                                                return (a > b) ? 1 : -1;
                                            });
                                            // wait for some millisec so progress bar shows completion
                                            setTimeout(function() { display(events, accessToken); }, 800); 
                                            // cookies have 4k limit - so can't be used to store events. It siliently fails. Use
                                            // localStorage / sessionStorage. They have 5MB limit
                                            if(typeof(Storage) !== "undefined") { // This browser supports sessionStorage and localStorage
                                                // Save data to sessionStorage
                                                sessionStorage.setItem('zoukevents', JSON.stringify(events));
                                                sessionStorage.setItem('suspectevents', JSON.stringify(suspectEvents));
                                            } 
                                        }
                                    }
                                }
                            }
                        };
                    }
                }
            };
        }
    };
}



/************************************************************/
function showEventsByTime() {
    loginAndDo(showEventsByTimeInner);
}

/************************************************************/
function showEventsByTimeInner(accessToken) {
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
        buildContent(accessToken);
    }
}

/************************************************************/
function showEventsByAttending() {
    loginAndDo(showEventsByAttendingInner);
}

/************************************************************/
function showEventsByAttendingInner(accessToken) {
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
                display(events, accessToken);
            } else {
                console.log('No events in showEventsByAttendingInner');
            }
        }
    } else {
        alert('Your browser does not support this operation');
    }
}


/************************************************************/
function display(events, accessToken) {
    console.log('total: ' + events.length);
    var monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    var str = `
        <table class="table table-condensed">
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
        </table>
        `;
    $('#progressBar').hide();
    $('#contentNav').show();
    $("#evTableContent").hide().html(str).fadeIn('fast');
    $("#totalEvents").hide().html('<span class="badge">' + events.length + '</span>' + ' events').fadeIn('fast');
    $('#mainContent').show();
    //document.getElementById("z_content").innerHTML = str;
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
                                        suspectEvents.push(event);
                                        return false;
                                    }
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
function getEventIdFromName(name) {
    for (var i = 0; i < events.length; i++) {
        var re = new RegExp(name, "i");
        if (event[i].name.search(re) !== -1) { // found
            return event[i].id;
        }
    }
    console.log(name + ' not found');
    return null;
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
    for (var i = 0; i < attendees.length; i++) {
        if (legitAttendees.hasOwnProperty(attendees[i])) {
            return; // legit event
        }
    }
    // remove event
    events.splice(evIdx, 1);
}

