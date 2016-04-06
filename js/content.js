// content.js

// Facebook SDK for JavaScript doesn't have any standalone files 
// that need to be downloaded or installed, instead you simply need to 
// include a short piece of regular JavaScript in your HTML that will 
// asynchronously load the SDK into your pages. You should insert it 
// directly after the opening <body> tag on each page you want to load it:
window.fbAsyncInit = function() {
    FB.init({
        //appId      : <?php echo getenv('FACEBOOK_APP_ID'); ?>, //set from server side
        //appId      : 955332727853853, // from FB app settings page
        appId      : 1261883747160137, // from FB app settings page
        cookie     : true,
        xfbml      : true,
        version    : 'v2.5'
    });

    // setAutoGrow works but slowly and consumes cycles
    // Without setautogrow you get frame in a frame effect on facebook page
    FB.Canvas.setAutoGrow();

    // manually set size (also slow)
    // FB.Canvas.setSize({ width: 640, height: 4000 });

    // check if you can retrieve cache without logging in
    // cacheValid();
    // Check if logged in, and obtain events
    loginAndDo(retrieveEvents);
};

// load the facebook SDK async
(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    // XXX: For debug only. Otherwise use minified version of FB sdk above
    //js.src = "//connect.facebook.net/en_US/sdk/debug.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// for fb like button (appId is embedded)
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.5&appId=1261883747160137";
    //js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.5&appId=955332727853853";
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
    $("#filterEventsBtn").click(function() {
        //console.log('in filterBtn');
        if (locationFilter) {
            var geocoder =  new google.maps.Geocoder();
            var loc = $('#filterValueInput').val();
            geocoder.geocode( { 'address': loc }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    showLocation(results[0]);
                } else {
                    str = 'Enter a valid address...';
                    $('#filterValueInput').val(str);
                    //alert('not found');
                }
            });
        } else { // attendees filter
            var minStr = $('#filterValueInput').val();
            var valid = false;
            if (! isNaN(minStr)) {
                var min;
                min = parseInt(minStr, 10);
                if (min > 0) {
                    valid = true;
                    showByAttendeeCount(min);
                }
            }
            if (! valid) {
                str = 'Enter a valid number...';
                $('#filterValueInput').val(str);
                //alert("Enter a valid number.");
            }
        }
    });
});


// Global
// Batch request maximum is 50
var eventSearchStrings = [
    'zouk',
    'zouk+carnival',
    'zouk+time',
    'zouk+night',
    'brazilian+zouk',
    'zouk+festival',
    'zouk+family',
    'zouk+fest',
    'zouk+congress',
    'zouk+weekend',
    'zouk+beach',
    'zouk+holiday',
    'zouk+dance',
    'zouk+sea',
    'zouk+snow',
    'zouk+fever',
    'zouk+fusion',
    'zouk+flow',
    'zouk+day',
    'zouk+jam',
    'zouk+salsa',
    'zouk+samba',
    'zouk+kizomba',
    'zouk+bachata',

    'zouk+danse',

    'zouk+karneval',
    'zouk+čas',
    'zouk+noc',
    'brazilský zouk',
    'zouk+festival',
    'zouk+rodina',
    'zouk+fest',
    'zouk+kongres',
    'zouk+víkend',
    'zouk+pláž',
    'zouk+dovolená',
    'zouk+tanec',
    'zouk+moře',
    'zouk+sníh',
    'zouk+horečka',
    'zouk+tok',
    'zouk+den',
    'zouk+džem',

    'zouk+karnawał',
    "zouk+czas",
    'zouk+noc',
    'zouk brazylijski',
    'zouk+festiwal',
    'zouk+rodzina',
    'zouk+kongres',
    'zouk+Weekend',
    'zouk+plaża',
    'zouk+wakacje',
    'zouk+taniec',
    'zouk+morze',
    'zouk+śnieg',
    'zouk+gorączka',
    'zouk+fuzja',
    'zouk+dzień',
    'zouk+dżem',
    
    'зук',
    'зук+карнавал',
    'зук+время',
    'зук+ночь',
    'бразильский зук',
    'зук+фестиваль',
    'зук+семья',
    'зук+фест',
    'зук+конгресс',
    'зук+выходные',
    'зук+пляж ',
    'зук+праздничный',
    'зук+танец',
    'зук+море',
    'зук+снег',
    'зук+лихорадка',
    'зук+фьюжн',
    'зук+поток',
    'зук+День',
    'зук+джем',
    
    'зук+час',
    'зук+ніч',
    'зук+сім',
    'зук+конгрес',
    'зук+вихідні',
    'зук+святковий',
    'зук+сніг',
    'зук+лихоманка',
    'зук+фьюжн',
    'зук+потік',

    'zouk+carnaval',
    'zouk+tempo',
    'zouk+noite',
    'zouk brasileiro',
    'zouk+família',
    'zouk+congresso',
    'zouk fim de semana',
    'zouk+praia',
    'zouk+férias',
    'zouk+dança',
    'zouk+mar',
    'zouk+neve',
    'zouk+febre',
    'zouk+fusão',
    'zouk+fluxo',
    'zouk+dia',

    'zouka',
    'zouku',
    'zoukb',
    'zoukc',
    'zoukd',
    'zouke',
    'zoukf',
    'zoukg',
    'zoukh',
    'zouki',
    'zoukj',
    'zoukk',
    'zoukl',
    'zoukm',
    'zoukn',
    'zouko',
    'zoukp',
    'zoukq',
    'zoukr',
    'zouks',
    'zoukt',
    'zoukv',
    'zoukx',
    'zouky',
    'zoukz',


    'bachaturo',
    'zouk+marathon',
    'fall+zouk',
    'berg+zouk',
    'brazouka',
    'zoukdevils',
    'f.i.e.l+official',
    'lambazouk',
    'zouk+lambada', 
    'brasileiro+zouk',
    'oman+zouk',
    'international+zouk',
    'zouk+katowice',
    'carioca+zouk'
];

var pageSearchStrings = eventSearchStrings;

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
                    'russian\\s+zouk\\s+congress',
                    'canada.*zouk' ];

var knownSuspectPlaces = [ { latitude: '48.812053039547',  longitude: '2.4038419249911' }, 
                           { latitude: '-22.882511415042', longitude: '-48.452376032727' },
                           { latitude: '46.01244',         longitude: '-0.28403' },
                           { latitude: '-22.9937382',      longitude: '-44.2409439' }
                         ];

var timeNow = new Date();
// All found events
var allFoundEvents = [];
var storeAllFoundEvents = false; // set this to true to store all events
// All current events
var events = [];    
// Suspect events
var discarded = [];
// Set of legit attendees; Use an object since objects are ordered pairs in javascript, 
// like: var obj = {"1":true, "2":true, "3":true, "9":true}
var legitAttendees = {}; // empty object
// Access token, set only from FB.getLoginStatus().
var accessToken;
// Progress bar
var progress = 0;
// undecided suspect list
var validatableEvents = [];
// Facebook has 50 commands per batch limit
var BATCH_MAX = 45; // don't use const as it may not be supported in earlier browsers
// Each query comes back with 25 results (even if you set higher limit). For deciding
// on suspicious events, get max 1000 attendees and compare to known zouk attendees
//var MAX_PAGE_ITERATIONS = 40; // 40x25=1000
var MAX_PAGE_ITERATIONS = 10;
var maxAttendeesToConsider = 200;
var pageIterationCount = 0;
// pages set using an object
var pages = {};
// cursor for search strings to indicate how far we have searched
var searchStringsCursor = 0;
//
var previousBatch = [];
//
var totalErrorsNotified = 0;
//
var tokenFile = 'fb_access_tokens.data';
var eventsFile = "fb_events.data";
var eventsInterval = 3 * 3600; // seconds
var pagesFile = "fb_pages.data";
var pagesInterval = 48 * 3600;
var pageEventsFile = "fb_pages_events.data";
var pageEventsInterval = 12 * 3600; // the most search intensive, and the weak spot for facebook
var discardedEventsFile = "fb_discarded_events.data";
var discardedEventsInterval = 4 * 24 * 3600;
var allFoundEventsFile = "fb_all_found_events.data";
//
var locationFilter = true;

/************************************************************/
// Note: there are 2 ways to send data in POST: as a query string
// in url itself (?x=y;j=u etc). For this to work data: should be
// key value pairs, and processData should be true (default).
// Another way is to send data in body (DOM). For this data: should
// be a string (use JSON.stringify any object or array), and processData
// should be false. On the server side php you use $_POST for former
// and file_get_contents() for latter
function storeJSON(fileName, dataType, dataVal) {
    var content = {
        file: fileName,
        type: dataType,
        token: accessToken,
        content: dataVal
    };
    //console.log(content);
    //console.log(JSON.stringify(content));
    // JSON is a string representation of javascript object
    $.ajax({
        url: "/store.php",
        data: JSON.stringify(content),
        contentType: 'application/json',
        type: 'POST',
        processData: false,
        success: function(data) {
            // expect nothing back
            console.log(data);
        },
        error: function(xhr, status, errorThrown) {
            //alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        }
    });
}

/************************************************************/
function retrieveJSON(fileName, intervalVal, callback) {
    retrieveJSON_Inner('data', {file: fileName, interval: intervalVal}, callback);
}

/************************************************************/
function retrieveJSON_Inner(dataType, dataObj, callback) {
    $.ajax({
        // The URL for the request
        url: "/retrieve.php",
        // The data to send (has to be key value pairs, will be converted to a query string)
        data: {
            type: dataType,
            value: JSON.stringify(dataObj)
        },
        // Whether this is a POST or GET request
        type: 'GET',
        // The type of data we expect back
        dataType : 'json',
        success: function( data ) {
            //console.log(data);
            callback(data);
        },
        error: function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem! Try loading this website in a new window." );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        }
    });
}

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
        }
    });
}

/************************************************************/
// Use explicit button to login, otherwise popup blockers will 
// prevent login window from opening.         
function loginToFacebook() {
    FB.getLoginStatus(function(response) {
    //FB.login(function(response) {
        if (response.authResponse) {
            if (response.status === 'connected') {
                //console.log('Welcome!  Fetching information.... ');
                accessToken = response.authResponse.accessToken;
                $('#bannerMsg').hide();
                retrieveEvents();
            }
        } else {
            console.log('User cancelled login or did not fully authorize.');
        }
    });
}

/************************************************************/
function cacheValid() {
    console.log("cacheValid()");
    var cache = [ { file: eventsFile, interval: eventsInterval },
                { file: pageEventsFile, interval: pageEventsInterval },
                { file: discardedEventsFile, interval: discardedEventsInterval } ];
    retrieveJSON_Inner('cache', cache, cacheValidCallback);
}

/************************************************************/
var cacheValidCallback = function (data) {
    if (data.hasOwnProperty('result')) {
        if (data.result) { // valid cache, data is bool
            console.log("cache is valid");
            retrieveEvents();
            return;
        }
    }
    // Check if logged in, and obtain events
    loginAndDo(retrieveEvents);
}

/************************************************************/
// Get events from DB
function retrieveEvents() {
    $('#searchProgressBarDiv').show();
    //storeToken(); // on the server side it exchanges for long lived token
    //console.log("retrieveEvents");
    retrieveJSON(eventsFile, eventsInterval, retrieveEventsCallback); // 1 hr = 3600 sec
}

/************************************************************/
var retrieveEventsCallback = function (data) {
    //console.log("retrieveEventsCallback");
    if (data.hasOwnProperty('error')) {
        searchForEvents();
    } else {
        for (var i = 0; i < data.length; i++) {
            addEvent(data[i]);
        }
        progress = 30;
        $('#searchProgressBar').css('width', progress + '%').attr('aria-valuenow', progress);
        console.log('retrieveEventsCallback: total events ' + events.length);
        retrievePageEvents();
    }
};

/************************************************************/
// Search FB
function searchForEvents() {    
    searchStringsCursor = 0;
    startBatchSearchEvents(searchStringsCursor);
}

/************************************************************/
function startBatchSearchEvents(cursor) {
    //console.log('startBatchSearch');
    // interested_count and maybe_count are the same (fb returns same value)
    var batchCmd = [];
    for (var i = cursor, count = 0; i < eventSearchStrings.length && count < BATCH_MAX; i++, count++) {
        batchCmd.push( { method: 'GET', 
                         relative_url: 'search?q=' + eventSearchStrings[i] 
                         + '&type=event&fields=id,name,start_time,place,attending_count,interested_count,'
                         + 'cover,description&access_token='
                         + accessToken }
                     );
    }
    searchStringsCursor += count;
    previousBatch = batchCmd.slice(); // copy array by value
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
            if (isError(body, previousBatch[i])) {
                if (bogusItem(body.error)) {
                    continue;
                } else {
                    logError(body.error, previousBatch[i]);
                }
            }
            // console.log('properties ' + Object.getOwnPropertyNames(body));                           
            if (body.hasOwnProperty('data') && body.data) {
                var data = body.data;
                for (var j = 0; j < data.length; j++) {
                    addEvent(data[j]);
                }
            }
            // next paging link
            var nextPageFound = false;
            if (body.hasOwnProperty('paging') && body.paging) {
                var paging = body.paging;
                if (paging.hasOwnProperty('next') && paging.next) {
                    var splitted = paging.next.split('?');
                    var rel_url = 'search?' + splitted[1];
                    //console.log('rel url of event ' + rel_url);
                    batchCmd.push( { method: 'GET', relative_url: rel_url } );
                    nextPageFound = true;
                }
            }
            if (! nextPageFound) {
                if (searchStringsCursor < eventSearchStrings.length) {
                    batchCmd.push( { method: 'GET', 
                                     relative_url: 'search?q=' + eventSearchStrings[searchStringsCursor] 
                                     + '&type=event&fields=id,name,start_time,place,attending_count,interested_count,'
                                     + 'cover,description&access_token='
                                     + accessToken }
                                 );
                    searchStringsCursor += 1;
                }
            }
        } 
    }
    // Update progress bar
    progress = (progress < 30) ? progress + 2 : progress;
    $('#searchProgressBar').css('width', progress + '%').attr('aria-valuenow', progress);

    // Recurse:
    if (batchCmd.length > 0) {
        previousBatch = batchCmd.slice(); // copy array by value
        FB.api('/', 'POST', { batch: batchCmd }, eventsCallback);
    } else {
        // We are done, check pages and their events
        console.log('total events ' + events.length);
        storeJSON(eventsFile, 'event', events);
        retrievePageEvents();
    }
};

/************************************************************/
function retrievePageEvents() {
    retrieveJSON(pageEventsFile, pageEventsInterval, retrievePageEventsCallback);
}

/************************************************************/
var retrievePageEventsCallback = function (data) {
    if (data.hasOwnProperty('error')) {
        retrievePages();
    } else {
        for (var i = 0; i < data.length; i++) {
            addEvent(data[i]);
        }
        progress = 60;
        $('#searchProgressBar').css('width', progress + '%').attr('aria-valuenow', progress);
        console.log('retrievePageEventsCallback: total events ' + events.length);
        retrieveDiscardedEvents();
    }
}

/************************************************************/
function retrievePages() {
    retrieveJSON(pagesFile, pagesInterval, retrievePagesCallback);
}

/************************************************************/
var retrievePagesCallback = function (data) {
    if (data.hasOwnProperty('error')) {
        searchForPages();
    } else {
        for (var i = 0; i < data.length; i++) {
           pages[data[i]] = true; // data[i] is page id
        }
        progress = 50;
        $('#searchProgressBar').css('width', progress + '%').attr('aria-valuenow', progress);
        console.log('retrievePagesCallback: total pages ' + Object.keys(pages).length);
        getEventsFromPages();
    }
}

/************************************************************/
function searchForPages() {
    searchStringsCursor = 0;
    firstBatchPageSearch(searchStringsCursor);
}

/************************************************************/
function firstBatchPageSearch(cursor) {
    //console.log('firstBatchPageSearch');
    var batchCmd = [];
    for (var i = cursor, count = 0; i < pageSearchStrings.length && count < BATCH_MAX; i++, count++) {
        batchCmd.push( { method: 'GET', 
                         relative_url: 'search?q=' + pageSearchStrings[i] 
                         + '&type=page&fields=id,name&access_token='
                         + accessToken }
                     );
    }
    searchStringsCursor += count;
    previousBatch = batchCmd.slice(); // copy array by value
    FB.api('/', 'POST', { batch: batchCmd }, pagesCallback);
}

/************************************************************/
var pagesCallback = function(response) {
    console.log('pagesCallback');

    if (!response || response.error) {
        console.log('FB.api: Error occured');
        console.log(response);
        return;
    }
    var batchCmd = [];
    for (var i = 0; i < response.length; i++) {
        if (response[i] && response[i].hasOwnProperty('body') && response[i].body) {
            var body = JSON.parse(response[i].body);
            if (isError(body, previousBatch[i])) {
                if (bogusItem(body.error)) {
                    continue;
                } else {
                    logError(body.error, previousBatch[i]);
                }
            }
            // console.log('properties ' + Object.getOwnPropertyNames(body));                           
            if (body.hasOwnProperty('data') && body.data) {
                var data = body.data;
                for (var j = 0; j < data.length; j++) {
                    // Filter out pages that don't have zouk in their name
                    var page = data[j];
                    var pageName = page.name.toLowerCase();
                    if (pageName.includes('zouk') || pageName.includes('lambada')
                        || pageName.includes('зук')) {
                        //console.log("Including page " + page.name);
                        pages[page.id] = true; // overwrites any previous value (set)
                    } else {
                        //console.log("Discarding page " + page.name);
                    }
                }
            }
            // next paging link
            var foundNextPage = false;
            if (body.hasOwnProperty('paging') && body.paging) {
                var paging = body.paging;
                if (paging.hasOwnProperty('next') && paging.next) {
                    var splitted = paging.next.split('?');
                    var rel_url = 'search?' + splitted[1];
                    //console.log('rel url of event ' + rel_url);
                    batchCmd.push( { method: 'GET', relative_url: rel_url } );
                    foundNextPage = true;
                }
            }
            if (! foundNextPage) {
                if (searchStringsCursor < pageSearchStrings.length) {
                    batchCmd.push( { method: 'GET', 
                                     relative_url: 'search?q=' + pageSearchStrings[searchStringsCursor] 
                                     + '&type=page&fields=id,name&access_token='
                                     + accessToken }
                                 );
                    searchStringsCursor++;
                }
            }
        } 
    }
    // Update progress bar
    progress = (progress < 42) ? progress + 1 : progress;
    $('#searchProgressBar').css('width', progress + '%').attr('aria-valuenow', progress);

    // Recurse:
    if (batchCmd.length > 0) {
        previousBatch = batchCmd.slice(); // copy array by value
        FB.api('/', 'POST', { batch: batchCmd }, pagesCallback);
    } else {
        // We are done, do further filtering
        console.log('total pages ' + Object.keys(pages).length);
        storeJSON(pagesFile, 'page', Object.keys(pages));
        getEventsFromPages();
    }
};

/************************************************************/
function getBatchCmdFromPages() {
    var batchCmd = [];
    var ids = Object.keys(pages);
    if (ids.length <= 0) {
        return batchCmd;
    }
    var limit = ids.length > BATCH_MAX ? BATCH_MAX : ids.length;
    for (var i = 0; i < limit; i++) {
        var pid = ids[i]; // page id
        var url = pid + '/events?fields=id,name,start_time,place,'
            + 'attending_count,interested_count,cover,description&limit=5&access_token='
            + accessToken;
        batchCmd.push( { method: 'GET',
                         relative_url: url }
                     );
    }
    // remove pages from top
    for (var i = 0; i < limit; i++) {
        var pid = ids[i]; // page id
        delete pages[pid];
    }
    return batchCmd;
}

/************************************************************/
function getEventsFromPages() {
    var batchCmd = getBatchCmdFromPages();
    // Only get first page of events, usually latest events show up first
    if (batchCmd.length > 0) {
        previousBatch = batchCmd.slice(); // copy array by value
        FB.api('/', 'POST', { batch: batchCmd }, pageEventsCallback);
    }
}

/************************************************************/
var pageEventsCallback = function(response) {
    console.log('pageEventsCallback');
    if (!response || response.error) {
        console.log('FB.api: Error occured');
        console.log(response);
        return;
    }
    for (var i = 0; i < response.length; i++) {
        if (response[i] && response[i].hasOwnProperty('body') && response[i].body) {
            var body = JSON.parse(response[i].body);
            if (isError(body, previousBatch[i])) {
                if (bogusItem(body.error)) {
                    continue;
                } else {
                    logError(body.error, previousBatch[i]);
                }
            }
            if (body.hasOwnProperty('data') && body.data) {
                var data = body.data;
                for (var j = 0; j < data.length; j++) {
                    addEvent(data[j]);
                }
            }
        }
    }
    // we process only one page 
    // Update progress bar
    progress = (progress < 80) ? progress + 0.5 : progress;
    $('#searchProgressBar').css('width', progress + '%').attr('aria-valuenow', progress);
    // Recurse
    var batchCmd = getBatchCmdFromPages();
    // Only get first page of events, usually latest events show up first
    if (batchCmd.length > 0) {
        previousBatch = batchCmd.slice(); // copy array by value
        FB.api('/', 'POST', { batch: batchCmd }, pageEventsCallback);
    } else {
        // We are done, do further filtering
        //console.log(events);
        console.log('total events ' + events.length);
        //$('#searchProgressBar').css('width', '100%').attr('aria-valuenow', 100);
        //$('#filterProgressBarDiv').show();
        //progress = 0; // for next progress bar
        storeJSON(pageEventsFile, 'event', events);
        retrieveDiscardedEvents();
        if (storeAllFoundEvents) {
            storeJSON(allFoundEventsFile, 'event', allFoundEvents);
        }
    }
};
    
/************************************************************/
function retrieveDiscardedEvents() {
    retrieveJSON(discardedEventsFile, discardedEventsInterval, retrieveDiscardedEventsCallback);
}

/************************************************************/
var retrieveDiscardedEventsCallback = function (data) {
    if (data.hasOwnProperty('error')) {
        searchForDiscardedEvents();
    } else {
        for (var i = 0; i < data.length; i++) {
            var event = data[i];
            if (isCurrent(event, true)) {
                discarded.push(event);
                // get the event index, remove it from list if exists
                for (var evIdx = 0; evIdx < events.length; evIdx++) {
                    if (events[evIdx].id == event.id) {
                        events.splice(evIdx, 1); // returns array of 1
                        break;
                    }
                }
            }
        }   
        progress = 100;
        $('#searchProgressBar').css('width', progress + '%').attr('aria-valuenow', progress);
        console.log('retrieveDiscardedEventsCallback: total discarded events ' + discarded.length);
        postProcess(false);
    }
};

/************************************************************/
function searchForDiscardedEvents() {
    getMajorLegitEventAttendees();
}

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
        previousBatch = batchCmd.slice(); // copy array by value
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
    // progress = (progress < 10) ? progress + 2 : progress;
    // $('#filterProgressBar').css('width', progress + '%').attr('aria-valuenow', progress);
    progress = (progress < 85) ? progress + 1 : progress;
    $('#searchProgressBar').css('width', progress + '%').attr('aria-valuenow', progress);

    var batchCmd = [];
    for (var i = 0; i < response.length; i++) {
        if (response[i] && response[i].hasOwnProperty('body') && response[i].body) {
            var body = JSON.parse(response[i].body);
            if (isError(body, previousBatch[i])) {
                if (bogusItem(body.error)) {
                    continue;
                } else {
                    logError(body.error, previousBatch[i]);
                }
            }
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
        previousBatch = batchCmd.slice(); // copy array by value
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
        if (events[i].attending_count > 120) {
            // verify this event's legitimacy
            validatableEvents.push( { id: events[i].id, attending: {}, batched: false } );
        }
    }
    //console.log('total validatableEvents ' + validatableEvents.length);
    // Pick top BATCH_MAX from the list, batch them, after done remove from list, repeat
    var batchCmd = [];
    var limit =  validatableEvents.length < BATCH_MAX ? validatableEvents.length : BATCH_MAX;
    //console.log('batch size of validatableEvents ' + limit);
    for (var i = 0; i < limit; i++) {
        batchCmd.push( { method: 'GET', 
                         relative_url:  validatableEvents[i].id + '/attending?' + 'access_token=' + accessToken } );
        validatableEvents[i].batched = true;
    }
    previousBatch = batchCmd.slice(); // copy array by value
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
    // progress = (progress < 95) ? progress + 2 : progress;
    // $('#filterProgressBar').css('width', progress + '%').attr('aria-valuenow', progress);
    progress = (progress < 96) ? progress + 1 : progress;
    $('#searchProgressBar').css('width', progress + '%').attr('aria-valuenow', progress);
    
    //console.log('response length ' + response.length + ' u-discarded ' + Object.keys(validatableEvents).length);
    var batchCmd = [];

    for (var i = 0; i < response.length; i++) {
        if (response[i] && response[i].hasOwnProperty('body') && response[i].body) {
            var body = JSON.parse(response[i].body);
            if (isError(body, previousBatch[i])) {
                if (bogusItem(body.error)) {
                    continue;
                } else {
                    logError(body.error, previousBatch[i]);
                }
            }
            // responses correspond with requests sent in batch command
            if (body.hasOwnProperty('paging') && body.paging) {
                var paging = body.paging;
                if (! paging.next) {
                    continue;
                }
                var eventId = getEventIdFromUrl(paging.next);
                // match the request with response
                var uIdx = -1;
                for (uIdx = 0; uIdx < validatableEvents.length; uIdx++) {
                    if (validatableEvents[uIdx].id == eventId) {
                        break;
                    }
                }
                if (uIdx == -1) {
                    console.log("Unexpected Error: " + eventId + " not found");
                } else {
                    if (body.hasOwnProperty('data') && body.data) {
                        var data = body.data;
                        for (var j = 0; j < data.length; j++) {
                            // add id if it is not there
                            if (! validatableEvents[uIdx].attending.hasOwnProperty(data[j].id)) {
                                validatableEvents[uIdx].attending[data[j].id] = true;
                            }
                        }
                    }
                    // next paging link
                    var pageRemaining = false;
                    if (paging.hasOwnProperty('next') && paging.next) {
                        if (Object.keys(validatableEvents[uIdx].attending).length < maxAttendeesToConsider) {
                            var relUrl = getRelativeUrl(paging.next);
                            batchCmd.push( { method: 'GET', relative_url: relUrl } );
                            pageRemaining = true;
                        }
                    }
                    if (! pageRemaining) {
                        // add a new entry to batch cmd
                        for (var x = 0; x < validatableEvents.length; x++) {
                            if (! validatableEvents[x].batched) {
                                batchCmd.push( { method: 'GET', 
                                                 relative_url:  validatableEvents[x].id + '/attending?' + 'access_token=' + accessToken } );
                                validatableEvents[x].batched = true;
                                break;
                            }
                        }
                    }
                }
            }
        } 
    }

    // Recurse:
    if (batchCmd.length > 0) {
        //console.log('request length of batch ' + batchCmd.length);
        previousBatch = batchCmd.slice(); // copy array by value
        FB.api('/', 'POST', { batch: batchCmd }, suspectEventAttendeesCallback);
    } else {
        // we are done, filter finished events
        for (var i = 0; i < validatableEvents.length; i++) {
            filterValidatableEvent(validatableEvents[i].id, validatableEvents[i].attending);
        }
        // sort and display
        // $('#filterProgressBar').css('width', '100%').attr('aria-valuenow', 100);
        $('#searchProgressBar').css('width', '100%').attr('aria-valuenow', 100);
        postProcess(true);
    }
};
    
/************************************************************/
function postProcess(fresh) {        
    if (events.length > 0) {
        var currentEvents = [];
        var pastEvents = [];
        // Filter only current and future events (not older events)
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            if (isCurrent(event, false)) {
                currentEvents.push(event)
            } else {
                pastEvents.push(event);
            }
        }

        // post process, filter out more events
        var sortTime = function(at, bt) {
            var a = parseTime(at.start_time);
            var b = parseTime(bt.start_time);
            return (a > b) ? 1 : -1;
        };
        var reverseSortTime = function(at, bt) {
            var a = parseTime(at.start_time);
            var b = parseTime(bt.start_time);
            return (a < b) ? 1 : -1;
        };
        events.sort(sortTime);
        discarded.sort(sortTime);
        if (pastEvents.length > 0) {
            pastEvents.sort(reverseSortTime);
        }
        if (currentEvents.length > 0) {
            currentEvents.sort(sortTime);
            // wait for some millisec so progress bar shows completion
            setTimeout(function() { display(currentEvents, accessToken); }, 700);
        }
        // cookies have 4k limit - so can't be used to store events. It siliently fails. Use
        // localStorage / sessionStorage. They have 5MB limit
        if (typeof(Storage) !== "undefined") { // This browser supports sessionStorage and localStorage
            // Save data to sessionStorage
            if (currentEvents.length > 0) {
                sessionStorage.setItem('zoukcurrentevents', JSON.stringify(currentEvents));
            }
            if (pastEvents.length > 0) {
                sessionStorage.setItem('zoukpastevents', JSON.stringify(pastEvents));
            }
            if (discarded.length > 0) {
                sessionStorage.setItem('zoukdiscardedevents', JSON.stringify(discarded));
            }
        }
        if (fresh) {
            storeJSON(discardedEventsFile, 'event', discarded);
        }
    }
}

/************************************************************/
function logError(error, request) {
    console.log(error);
    console.log(request);
    var msg = "error: " + JSON.stringify(error) + ", request: " + JSON.stringify(request);
    // Send only a few mail, otherwise google will charge you and your mailbox will be full
    // After removing throttling of errors from facebook, there could be potentially thousands of errors coming back
    if (totalErrorsNotified < 2) {
        sendMessageInner("Facebook api error", msg, "zoucalendar@noemail.com");
        totalErrorsNotified++;
    }
    // XXX not going to stop the app and annoy user
    //alert('Facebook returned error (code: ' + error.code + ')' + ', try again later');    
}

/************************************************************/
function bogusItem(error) {
    if (error.hasOwnProperty('code') && error.code) {
        if (error.code == 100) {
            // this is 'unsupported get request' error;
            // sometimes event id returned by searching a page is not valid,
            // when you look for event through its id, event is not there
            return true;
        }
    }
    return false;
}

/************************************************************/
function isError(body, request) {
    if (body.hasOwnProperty('error') && body.error) {
        return true;
    }
    return false;
}

/************************************************************/
function showEventsByTime() {
    loginAndDo(showEventsByTimeInner);
}

/************************************************************/
function showEventsByTimeInner() {
    if (typeof(Storage) !== "undefined") {
        var data = sessionStorage.getItem('zoukcurrentevents');
        if (data !== undefined && data) {
            var events = JSON.parse(data);
            if (events.length > 0) {
                display(events, accessToken);
            } else {
                console.log('No events in showEventsByTimeInner');
            }
        }
    } else {
        console.log('Session data not found');
    }
}

/************************************************************/
function showEventsByAttending() {
    loginAndDo(showEventsByAttendingInner);
}

/************************************************************/
function showEventsByAttendingInner() {
    if (typeof(Storage) !== "undefined") {
        var data = sessionStorage.getItem('zoukcurrentevents');
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
function showPastEvents() {
    if (typeof(Storage) !== "undefined") {
        var data = sessionStorage.getItem('zoukpastevents');
        if (data !== undefined && data) {
            var events = JSON.parse(data);
            if (events.length > 0) {
                var str = `
                    <table class="table table-condensed" style="margin-top: 20px; margin-bottom: 10px;">
                    <thead>
                    <th>Date</th>
                    <th>Event</th>
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
                $("#dashboard").hide();
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
function showDiscarded() {
    if (typeof(Storage) !== "undefined") {
        var data = sessionStorage.getItem('zoukdiscardedevents');
        if (data !== undefined && data) {
            var events = JSON.parse(data);
            if (events.length > 0) {
                // <button type="button" class="btn btn-default btn-sm" onclick="showEventsByTimeInner();" style="margin-top:10px; margin-bottom: 5px;">
                // <span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span> Back
                // </button>

                var str = `
                    <table class="table table-condensed" style="margin-top: 20px;">
                    <thead>
                    <th>Date</th>
                    <th>Event</th>
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
                $("#dashboard").hide();
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
    var data = sessionStorage.getItem('zoukcurrentevents');
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
                    //var dist = distHaversine(lat, lng, location.latitude, location.longitude); 
                    var dist = distVincenty(lat, lng, location.latitude, location.longitude)
                        * 0.000621371; // miles
                    events[i].column_value = Math.round(dist);
                    selected.push(events[i]);
                }
            }
        }
    }
    if (selected.length > 0) { // sort
        selected.sort(function(at, bt) {
            var a = parseInt(at.column_value);
            var b = parseInt(bt.column_value);
            return (a > b) ? 1 : -1; 
        });
        // <table style="margin-top: 10px;"><tr><td>
        // <button type="button" class="btn btn-default btn-sm" onclick="showEventsByTimeInner();">
        // <span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span> Back
        // </button>
        // </td>
        // <td><h5 style="padding-left:20px;">Address: ${geoResult.formatted_address}</h5></td></tr>
        // </table>

        var str = `
            <button type="button" style="margin-top:10px" class="btn btn-default btn-sm" onclick="showEventsByTimeInner();">
            <span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span> Back
            </button>
            <h5 style="margin: 20px 0px 10px 5px;">Address: ${geoResult.formatted_address}</h5>
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
        $("#dashboard").hide();
        $("#evTableContent").hide().html(str).fadeIn('fast');
        $('#mainContent').show();
    }
}

/************************************************************/
function showByAttendeeCount(minCount) {
    if (typeof(Storage) === "undefined") {
        alert('Your browser does not support this operation');
        return;
    }
    var data = sessionStorage.getItem('zoukcurrentevents');
    if (data === undefined || (! data)) {
        console.log('No events in showByAttendeeCount');
    }
    events = JSON.parse(data);
    var selected = [];

    for (var i = 0; i < events.length; i++) {
        if (events[i].hasOwnProperty('attending_count') && events[i].attending_count) {
            var attending = events[i].attending_count;
            if (attending > minCount) {
                selected.push(events[i]);
            }
        }
    }
    if (selected.length > 0) { // sort
        selected.sort(function(at, bt) {
            var a = parseTime(at.start_time);
            var b = parseTime(bt.start_time);
            return (a > b) ? 1 : -1; 
        });
        // <table style="margin-top: 10px;"><tr><td>
        // <button type="button" class="btn btn-default btn-sm" onclick="showEventsByTimeInner();">
        // <span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span> Back
        // </button>
        // </td>
        // <td><h5 style="padding-left:20px;">Address: ${geoResult.formatted_address}</h5></td></tr>
        // </table>

        var str = `
            <button type="button" style="margin-top:10px" class="btn btn-default btn-sm" onclick="showEventsByTimeInner();">
            <span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span> Back
            </button>
            <h5 style="margin: 20px 0px 10px 5px;">Minimum Number of Attendees: `;
        str += minCount;
        str += `</h5>
            <table class="table table-condensed">
            <thead>
            <th>Date</th>
            <th>Event</th>
            <th>Attending</th>
            <tr>
            </tr>
            </thead>
            `;
        str += getTableBody(selected);
        str += '</table>';
        $('#map').hide();
        $('#evTableHeader').hide();
        $("#dashboard").hide();
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
    var data = sessionStorage.getItem('zoukcurrentevents');
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
        //var str = `
        //    <button type="button" class="btn btn-default btn-sm" onclick="showEventsByTimeInner();" style="margin: 10px 0px 10px 0px;">
        //    <span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span> Back
        //    </button>
        //    `;
        $('#evTableHeader').hide();
        $("#evTableContent").hide();
        $("#dashboard").hide();
        //$("#evTableContent").hide().html(str).fadeIn('fast');
        $('#mainContent').show();
        $('#map').show();

        var myLatLng = {lat: 32.0, lng: -9.0};
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 2,
            center: myLatLng
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
function showDashboard() {
    if (typeof(Storage) === "undefined") {
        alert('Your browser does not support this operation');
        return;
    }
    var data = sessionStorage.getItem('zoukcurrentevents');
    if (data === undefined || (! data)) {
        console.log('No events in showDashboard');
    }
    events = JSON.parse(data);
    var selected = [];
    var distribution = {
        'North America': 0,
        'South America': 0,
        'Europe': 0,
        'Australia': 0,
        'Asia': 0
    };
    var distributionOfBig = Object.assign({}, distribution); // copy object

    for (var i = 0; i < events.length; i++) {
        if (events[i].hasOwnProperty('continent') && events[i].continent) {
            distribution[events[i].continent]++;
            if (events[i].attending_count >= 100) {
                distributionOfBig[events[i].continent]++;
            }
        }
    }

    var str = `
        <table class="table table-bordered" style="margin:20px 0px 0px 0px">
        <thead><th>#</th><th>N. America</th><th>S. America</th><th>Europe</th><th>Australia</th><th>Asia</th></thead>
        <tbody><tr>
        <th scope="row">Events</th>
        <td>${distribution['North America']}</td>
        <td>${distribution['South America']}</td>
        <td>${distribution['Europe']}</td>
        <td>${distribution['Australia']}</td>
        <td>${distribution['Asia']}</td>
        </tr><tr>
        <th scope="row">Events w/ over 100 attending</th>
        <td>${distributionOfBig['North America']}</td>
        <td>${distributionOfBig['South America']}</td>
        <td>${distributionOfBig['Europe']}</td>
        <td>${distributionOfBig['Australia']}</td>
        <td>${distributionOfBig['Asia']}</td>
        </tr></tbody>
    </table>
    `;
    //<!-- <h7>* some events are kizomba/bachata events that include Zouk</h7> -->

    // Major festival info not availabe when retrieving from GAE    
    //  // Major festivals
    //  var selected = [];
    //  for (var i = 0; i < knownEvents.length; i++) {
    //      var ev = getEventFromName(knownEvents[i], events);
    //      if (ev) {
    //          selected.push(ev);
    //      }
    //  }
    //  
    //  if (selected.length > 0) {
    //      str += `
    //          <h4 style="margin:30px 0px 0px 5px">Some Major Festivals</h4>
    //          `;
    //      if (typeof(Storage) !== "undefined") {
    //          var data = sessionStorage.getItem('zoukattendees');
    //          if (data !== undefined && data) {
    //              str += `<div style="margin: 10px 0px 10px 5px"><span class="badge">${data}</span> attending</div>`;
    //          }
    //      }
    //      str += `
    //          <table class="table table-condensed" style="margin-top:5px">
    //          <thead><th>Date</th><th>Event</th><th>Attending</th><tr></tr></thead>
    //          `;
    //      str += getTableBody(selected);
    //      str += '</table>';
    //   }
    $('#evTableHeader').hide();
    $("#evTableContent").hide();
    $('#map').hide();
    $("#dashboard").hide().html(str).fadeIn('fast');
    $('#mainContent').show();
}

/************************************************************/
function display(events) {
    //console.log('total: ' + events.length);
    var msg = '';
    var str = `
        <table class="table table-condensed">
        `;
    str += getTableBody(events);
    str += '</table>';
    str += '<p>* Bachata dominant congresses have their attendee count reduced by 75% to better reflect Zouk participation</p>';
    $('#searchProgressBarDiv').hide();
    $('#filterProgressBarDiv').hide();
    $("#dashboard").hide();
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
        var column_value = events[i].column_value;
        if (events[i].hasOwnProperty('normalized')) {
            column_value = column_value + '*';
        }
        str += `<tr><td><h5>${month} ${dateS[2]}</h5></td>
            <td> 
            <table>
            <tr>
            <td>
            <a href="https://www.facebook.com/events/${events[i].id}" target="_blank">
            <div id="img_inner" style='background-image: url("${imageUrl}"); width: ${imgWidth}; height: ${imgHeight}; background-size: ${imgWidth} ${imgHeight};' >
            </div>
            </a>
            </td>
            <td style="padding-left: 20px">
            <a href="https://www.facebook.com/events/${events[i].id}" target="_blank">
            <h5 title="${events[i].name}" data-toggle="tooltip" data-container="body" style='width: ${textWidth}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 7px; margin-bottom: 6px;'>${events[i].name}</h5>
            </a>
            <h5 class='small' title="${placeStr}" data-toggle="tooltip" data-container="body" style='margin-top: 3px; margin-bottom: 1px; width: ${textWidth}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis'>${placeStr}<h5>
            </td>
            </tr>
            </table>
            </td>
            <td>${column_value}</a></td>
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
function addEvent(event) {
    if (preFilter(event)) {
        if (events.length < 9000) { // Can store about 10000 in sessionStorage
            // remove description as this will eat up sessionStorage
            if (event.hasOwnProperty('description') && event.description) {
                event.description = null;
            }
            addContinent(event);
            event.column_value = event.attending_count;
            events.push(event);
        }
    }
    if (storeAllFoundEvents) {
        allFoundEvents.push(event);
    }
}

/************************************************************/
function isCurrent(event, older) {
    // Parsing does not work in Safari. Recommended that you parse manually (see article below)
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
    // Add events even if a day old
    var interval = older ? 7 * 24 * 3600 * 1000 : 6 * 3600 * 1000;  // 7 days or current (few hrs)
    if (event && event.hasOwnProperty('start_time')) {
        var startTime = parseTime(event.start_time);
        if ((timeNow < startTime) 
            || ((timeNow.getTime() - startTime.getTime()) < interval)) {
            return true;
        }
    }
    return false;
}
            
/************************************************************/
function preFilter(event) {
    if (! isCurrent(event, true)) {
        return false;
    }
    // console.log("interested, maybe: " + event.interested_count;
    // Insert only if unique; Different search strings give same results
    for (var ev = 0; ev < events.length; ev++) {
        if (event.id == events[ev].id) { // use == not === so str get casted to number
            return false; // found
        }
    }
    // If event location has zouk but name and description don't have it then discard.
    // Also, if there is just a url with name zouk in description, discard
    // If event has over 500 people and no Zouk in name or description then discard (some
    // bachaturo salsa event shows up as zouk)
    var zoukPlace = false;
    if (event.hasOwnProperty('place') && event.place) {
        placeStr = JSON.stringify(event.place);
        if (placeStr.search(/zouk/i) !== -1) {
            zoukPlace = true;
        }
    }
    if (zoukPlace || (event.attending_count > 500)) { // found or >500
        if (event.hasOwnProperty('name') && event.name) {
            if (event.name.search(/zouk/i) === -1) { // not found
                if (event.hasOwnProperty('description') && event.description) {
                    var description = event.description;
                    // remove http:... or https...
                    var desc = description.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
                    if (desc.search(/zouk/i) === -1) { // not found
                        // remove description as this will eat up sessionStorage
                        event.description = null;
                        discarded.push(event);
                        return false;
                    }
                }
            }
        }
    }
    // if event is happening in a suspect location, discard
    if (event.hasOwnProperty('place') && event.place) {
        if (event.place.hasOwnProperty('location') && event.place.location) {
            var location = event.place.location;
            if (location.hasOwnProperty('latitude') && location.hasOwnProperty('longitude')) {
                for (var k = 0; k < knownSuspectPlaces.length; k++) {
                    if ((location.latitude == knownSuspectPlaces[k].latitude) 
                        && (location.longitude == knownSuspectPlaces[k].longitude)) {
                        // remove description as this will eat up sessionStorage
                        event.description = null;
                        discarded.push(event);
                        return false;
                    }
                }
            }
        }
    }
    // If this is a bachata event w/ over 500 people, normalize attending count
    if (event.attending_count > 500) { // found or >500
        if (event.hasOwnProperty('name') && event.name) {
            if (event.name.search(/bachata/i) !== -1) { // bachata event
                normalized = Math.round(event.attending_count / 4);
                event.attending_count = normalized;
                event.normalized = 1;
                if (event.hasOwnProperty('interested_count') && event.interested_count) {
                    normalized = Math.round(event.interested_count / 4);
                    event.interested_count = normalized;
                }
            }
        }
    }
    return true;
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
function filterValidatableEvent(id, attending) {
    // We asked fb to give all attendees of events where more
    // than 200 are going. But we many not get all the attendee id's
    // Discard events with less attendees
    if (attending && Object.keys(attending).length < 200) {
        return;
    }
    // get the event
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
        discarded.splice(0, 0, event[0]);
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
function getEventIdFromUrl(url) {
    var splitted = url.split('?');
    var before = splitted[0].split('/');
    var len = before.length;
    return before[len - 2];
}

/************************************************************/
function addContinent(event) {
    var continent = null;
    if (event.hasOwnProperty('place') && event.place) {
        if (event.place.hasOwnProperty('location') && event.place.location) {
            var location = event.place.location;
            if (location.hasOwnProperty('country')) {
                var continent = getContinent(location.country);
            }
        }
    }
    event.continent = continent;
}

/************************************************************/
function sendMessageInner(sub, msg, email) {
    $.ajax({
        // The URL for the request
        url: "/mail.php",
        // The data to send (will be converted to a query string)
        data: {
            subject: sub,
            email: email,
            message: msg
        },
        // Whether this is a POST or GET request
        type: "GET",
        // The type of data we expect back
        dataType : "text",
        success: function( data ) {
            console.log(data);
        },
        error: function( xhr, status, errorThrown ) {
            //alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        }
    });
}

/************************************************************/
function sendMessage() {
    $('#contactModal').modal('hide');
    var sub = $('#message-subject').val();
    if (!sub || (sub == '')) {
        sub = 'no subject';
    }
    var msg = $('#message-text').val();
    if (!msg || (msg == '')) {
        msg = 'no message';
    }
    var email = $('#message-email').val();
    if (!email || (email == '')) {
        email = 'no email';
    }
    sendMessageInner(sub, msg, email);
}

/************************************************************/
function storeToken() {
    console.log('storeToken');
    $.ajax({
        // The URL for the request
        url: "/token.php",
        // The data to send (will be converted to a query string)
        data: {
            token: accessToken
        },
        // Whether this is a POST or GET request
        type: "GET",
        // The type of data we expect back
        dataType : "text",
        success: function( data ) {
            console.log(data);
        },
        error: function( xhr, status, errorThrown ) {
            //alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        }
    });
}

/************************************************************/
// Haversine formula, in miles
function distHaversine(lat1, lon1, lat2, lon2, unit) {
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

//https://gist.github.com/mathiasbynens/354587
/*
 * JavaScript function to calculate the geodetic distance between two points specified by latitude/longitude
 *  using the Vincenty inverse formula for ellipsoids.
 *
 * Original scripts by Chris Veness
 * Taken from http://movable-type.co.uk/scripts/latlong-vincenty.html and optimized / cleaned up by Mathias Bynens <http://mathiasbynens.be/>
 * Based on the Vincenty direct formula by T. Vincenty, “Direct and Inverse Solutions of Geodesics on the 
 * Ellipsoid with application of nested equations”, Survey Review, vol XXII no 176, 1975 <http://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf>
 *
 * @param   {Number} lat1, lon1: first point in decimal degrees
 * @param   {Number} lat2, lon2: second point in decimal degrees
 * @returns {Number} distance in metres between points
 */
function toRad(n) {
    return n * Math.PI / 180;
};
function distVincenty(lat1, lon1, lat2, lon2) {
    var a = 6378137,
    b = 6356752.3142,
    f = 1 / 298.257223563, // WGS-84 ellipsoid params
    L = toRad(lon2-lon1),
    U1 = Math.atan((1 - f) * Math.tan(toRad(lat1))),
    U2 = Math.atan((1 - f) * Math.tan(toRad(lat2))),
    sinU1 = Math.sin(U1),
    cosU1 = Math.cos(U1),
    sinU2 = Math.sin(U2),
    cosU2 = Math.cos(U2),
    lambda = L,
    lambdaP,
    iterLimit = 100;
    do {
        var sinLambda = Math.sin(lambda),
        cosLambda = Math.cos(lambda),
        sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
        if (0 === sinSigma) {
            return 0; // co-incident points
        };
        var cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda,
        sigma = Math.atan2(sinSigma, cosSigma),
        sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma,
        cosSqAlpha = 1 - sinAlpha * sinAlpha,
        cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha,
        C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
        if (isNaN(cos2SigmaM)) {
            cos2SigmaM = 0; // equatorial line: cosSqAlpha = 0 (§6)
        };
        lambdaP = lambda;
        lambda = L + (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    } while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0);

    if (!iterLimit) {
        return NaN; // formula failed to converge
    };

    var uSq = cosSqAlpha * (a * a - b * b) / (b * b),
    A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq))),
    B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq))),
    deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM))),
    s = b * A * (sigma - deltaSigma);
    return s.toFixed(3); // round to 1mm precision
};

/************************************************************/
function filterButtonAction() {
    if (locationFilter) {
        locationFilter = false;
        $("#filterToggleBtn").html("By Attendance <span class=\"caret\"></span>");
        $("#filterMenuItem").replaceWith("<a href=\"#\" id=\"filterMenuItem\" onclick=\"filterButtonAction();\">By Location</a>");
        $("#filterValueInput").attr("placeholder", "Enter a number ( > 0 )...");
        $("#filterValueInput").val("");
    } else { // attendee filter
        locationFilter = true;
        $("#filterToggleBtn").html("By Location <span class=\"caret\"></span>");
        $("#filterMenuItem").replaceWith("<a href=\"#\" id=\"filterMenuItem\" onclick=\"filterButtonAction();\">By Attendance</a>");
        $("#filterValueInput").attr("placeholder", "Enter your address...");
        $("#filterValueInput").val("");
    }
}
