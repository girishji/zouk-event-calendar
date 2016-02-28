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
    $client = getClient();
    $storage = getStorageService($client);
    $tokensStr = getTokens($client, $storage, $bucket, $tokenFile);

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
    $length = count($batch);
    if ($length >= 45) { //FB limit for batch is 50 requests
        return $batch;
    }
    $vacant = 45 - $length;
    for ($i = 0; $i < $vacant; $i++) {
        if (count($remainingSearch) > 0) {
            $str = array_shift($remainingSearch);
            $request = $fb->request('GET', '/search?q=' . $str
                                    . '&type=event&fields=id,name,start_time,place,attending_count,cover,description');
            array_push($batch, $request);
        }
    }
    return $batch;
}

/************************************************************/
function gatherEvents(&$events, &$fb, $remainingSearch) {
    // $remainingSearch is array copy by value; array is not an object
    // (aside: when you assign one object to another only reference is copied)
    $batch = array();
    $batch = nextFullBatch($fb, $batch, $remainingSearch);
    while (count($batch) > 0) {
        try {
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

        foreach ($responses as $key => $response) {
            if ($response->isError()) {
                $e = $response->getThrownException();
                syslog(LOG_ERR, 'Error! Facebook SDK Said: ' . $e->getMessage());
                //echo 'Graph Said: ' . "\n\n"; //var_dump($e->getResponse());
            } else {
                //echo "Response: " . $response->getBody() . "\n";
                // turn nodes into edges for pagination and iteration
                $feedEdge = $response->getGraphEdge();
                //syslog(LOG_DEBUG, print_r($feedEdge, TRUE));
                foreach ($feedEdge as $graphNode) {
                    //syslog(LOG_DEBUG, print_r($graphNode, TRUE));
                }
            }
            // add next page request to batch
            $request = $response->getRequestForNextPage();
            syslog(LOG_DEBUG, print_r($request, TRUE));
            if (! is_null($request)) {
                array_push($batch, $request);
            }  
        }

        //$batch = nextFullBatch($fb, $batch, $remainingSearch);
    } // while
}

/************************************************************/

$fb = getFacebook($appId, $appSecret);
$accessToken = getAccessToken($fb, $bucket, $tokenFile);
$fb->setDefaultAccessToken($accessToken);

// $events = array();
// gatherEvents($events, $fb, $searchStrings);

// cron job calles GET on this. Any output (like 'echo') will be sent to cron.
// echo "done"
?>