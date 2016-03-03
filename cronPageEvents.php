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
function nextFullBatch(&$fb, &$batch, &$remainingSearch) {
    syslog(LOG_DEBUG, 'nextFullBatch');
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
    $pages = array();
    fbBatchSearch($pages, $fb, $pageSearchStrings, 'nextFullBatch', 'validatePage');
    $pagesContent = json_encode($pages);
    if (storeGCS($pagesContent, $bucket, $pagesFile) != 0) {
        syslog(LOG_ERR, "Failed to store " . $pagesFile);
    }
}

//    echo "{ \"error\": \"zouk calendar: file not found\" }";

?>