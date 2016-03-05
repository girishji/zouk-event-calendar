<?php
require('./vendor/autoload.php');
require('./config.php');
require('./common.php');

// php variable scope is strange:
// http://stackoverflow.com/questions/16959576/reference-what-is-variable-scope-which-variables-are-accessible-from-where-and

/************************************************************/
function quit($msg) {
    sendMail($msg);
    echo $msg;
    syslog(LOG_EMERG, $msg);
    exit($msg);
}

/************************************************************/
function getAccessToken(&$fb, $bucket, $tokenFile) {
    // Read file from Google Storage
    $tokensStr = retrieveGCS($bucket, $tokenFile);

    if (empty($tokensStr)) {
        quit("No more FB access tokens in storage -- login to app ASAP to generate a token");
    } else {
        $tokens = json_decode($tokensStr, true); // 'true' will turn this into associative array instead of object
        // Validate the token before use. User may have logged off facebook, or deauthorized this app.
        // shuffle the array to get random order of iteration
        shuffle($tokens);
        //var_dump($tokens);
        foreach ($tokens as $token) {
            $response = $fb->get('/me', $token);
            if (! $response->isError()) {
                // access_token is valid token 
                return $token;
            }
        }
        quit("None of the tokens are valid");
    }
}

/************************************************************/
// add more requests to the batch if possible
function nextFullBatchPages(&$fb, &$batch, &$remainingSearch) {
    syslog(LOG_DEBUG, 'nextFullBatchPages');
    $length = count($batch);
    if ($length >= 45) { //FB limit for batch is 50 requests
        return $batch;
    }
    $vacant = 45 - $length;
    for ($i = 0; $i < $vacant; $i++) {
        if (count($remainingSearch) > 0) {
            $str = array_shift($remainingSearch);
            $request = $fb->request('GET', '/search?q=' . $str
                                    . '&type=page&fields=id,name');
            array_push($batch, $request);
        }
    }
    return $batch;
}

/************************************************************/
function validatePage(&$pages, $page) {
    if ((stripos($page['name'], 'zouk') !== false) ||
        (stripos($page['name'], 'lambada') !== false) ||
        (stripos($page['name'], 'зук') !== false)) {
        $pages[$page['id']] = true;
    }
}

/************************************************************/
function fbSearchPageEvents(&$fb, &$events, &$pages) {
    syslog(LOG_DEBUG, 'fbSearchPageEvents');
    do {
        $batch = array();            
        for ($i = 0; $i < 45; $i++) {
            if (empty($pages)) {
                break;
            }
            $pageId = array_shift($pages);
            $request = $fb->request('GET', $pageId . '/events?fields=id,name,start_time,place,'
                                    . 'attending_count,cover,description');
            array_push($batch, $request);
        }
        if (count($batch) <= 0) {
            // done
            break;
        }
        // Send request
        try {
            //syslog(LOG_DEBUG, 'fbBatchSearch: sending batch request');
            $responses = $fb->sendBatchRequest($batch);
        } catch(Facebook\Exceptions\FacebookResponseException $e) {
            // When Graph returns an error
            syslog(LOG_ERR, 'Graph returned an error: ' . $e->getMessage());
            exit;
        } catch(Facebook\Exceptions\FacebookSDKException $e) {
            // When validation fails or other local issues
            syslog(LOG_ERR, 'Facebook SDK returned an error: ' . $e->getMessage());
            exit;
        }
        // Read all events returned by facebook-page only once (one pagination only)
        foreach ($responses as $key => $response) {
            if ($response->isError()) {
                $e = $response->getThrownException();
                syslog(LOG_ERR, 'Error! Facebook SDK Said: ' . $e->getMessage());
            } else {
                // turn nodes into edges for pagination and iteration
                $feedEdge = $response->getGraphEdge();
                //syslog(LOG_DEBUG, print_r($feedEdge, TRUE));
                foreach ($feedEdge as $graphNode) {
                    $event = $graphNode;
                    /* Do only basic filtering, all other filtering happens in addEvent() javascript 
                     * function on the client side when this event gets retrieved.
                     */
                    if (isCurrent($events, $event) && (! isPresent($events, $event))) {
                        array_push($events, $event);
                        //syslog(LOG_DEBUG, print_r($graphNode, TRUE));
                    }
                }
            }
        }
    } while (true);
}

/************************************************************/
syslog(LOG_DEBUG, 'cronPageEvents start');

$fb = getFacebook($appId, $appSecret);
$accessToken = getAccessToken($fb, $bucket, $tokenFile);
$fb->setDefaultAccessToken($accessToken);

/* cron job calles GET on this. Any output (like 'echo') will be sent to cron.
 * echo "done"
 */

// FB usually resets search quotas after 1 hr. Do every search at least 1 hr apart.
$interval = 3600; // 1 hr

$proceed = true;
if (fileExists($bucket, $eventsFile)) {
    $mTime = lastModifiedTime($bucket, $eventsFile);
    $date = new DateTime();
    $curTime = $date->getTimestamp();
    if ($curTime - $mTime < $interval) {
        $proceed = false;
    } 
}

if ($proceed) {
    if (fileExists($bucket, $pagesFile)) {
        $mTime = lastModifiedTime($bucket, $pagesFile);
        $date = new DateTime();
        $curTime = $date->getTimestamp();
        if ($curTime - $mTime < $interval) {
            $proceed = false;
        }
    }
}

if ($proceed) {
    $pages = array();
    fbBatchSearch($pages, $fb, $pageSearchStrings, 'nextFullBatchPages', 'validatePage');
    $pagesContent = json_encode($pages);
    if (storeGCS($pagesContent, $bucket, $pagesFile) != 0) {
        syslog(LOG_ERR, "Failed to store " . $pagesFile);
    }

    if (count($pages) > 0) {
        $events = array();
        fbSearchPageEvents($fb, $events, $pages);
        if (count($events) > 0) {
            $pageEventsContent = json_encode($events);
            if (storeGCS($pageEventsContent, $bucket, $pageEventsFile) != 0) {
                syslog(LOG_ERR, "Failed to store " . $pageEventsFile);
            }
        }
    }
}
//    echo "{ \"error\": \"zouk calendar: file not found\" }";

?>