// utils.js

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
                                        suspect.push(event);
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
function getEventIdFromName(events, name) {
    for (var i = 0; i < events.length; i++) {
        var re = new RegExp(name, "i");
        if (event[i].name.search(re) !== -1) { // found
            return event[i].id;
        }
    }
    console.log(name + ' not found');
    return null;
}



