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
    syslog(LOG_DEBUG, $tokensStr);

    if (empty($tokensStr)) {
        quit("No more FB access tokens in storage -- login to app ASAP to generate a token");
    } else {
        $tokens = json_decode($tokensStr, true); // 'true' will turn this into associative array instead of object
        // Validate the token before use. User may have logged off facebook, or deauthorized this app.
        // shuffle the array to get random order of iteration
        shuffle($tokens);
        //var_dump($tokens);
        foreach ($tokens as $token) {
            syslog(LOG_DEBUG, $token);
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

$events = array();

$fb = getFacebook($appId, $appSecret);
$accessToken = getAccessToken($fb, $bucket, $tokenFile);
$fb->setDefaultAccessToken($accessToken);

syslog(LOG_DEBUG, $accessToken);

// cron job calles GET on this. Any output (like 'echo') will be sent to cron.
// echo "done"
?>