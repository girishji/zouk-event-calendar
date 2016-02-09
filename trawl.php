<?php
require('./vendor/autoload.php');
require('./config.php');

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
function getAccessToken(&$fb) {
    // Read file from Google Storage
    try {
        // get the url for our file
        $object = $storage->objects->get($bucket, $tokenFile); // use print_r($object) or var_dump to see the contents
        $url = $object['mediaLink'];
        $httpClient = $client->authorize(); // creates guzzle http client and authorizes it
        $response = $httpClient->get($url); // see guzzle docs for this
        echo $response->getBody();
        $tokensStr = (string) $response->getBody(); // local scope

        if (empty($tokensStr)) {
            quit("No more FB access tokens in storage -- login to app ASAP");
        } else {
            $tokens = json_decode($tokensStr, true); // 'true' will turn this into associative array instead of object
            // Validate the token before use. User may have logged off facebook, or deauthorized this app.
            // shuffle the array to get random order of iteration
            shuffle($tokens);
            foreach ($tokens as $token) {
                $facebook->setAccessToken($token);
                if (($userId = $facebook->getUser())) {
                    // access_token is valid token for user with id $userId
                    return $token;
                }
            }
            quit("None of the tokens are valid");
        }
    } catch (Exception $e) {
        quit($e->getMessage());
    }
}

/************************************************************/

$events = array();

$fb = new Facebook\Facebook([
    'app_id' => $appId,
    'app_secret' => $appSecret,
    'http_client_handler' => 'stream', // XXX: this does not need to be set, but if not set -
    // it used 'guzzle' http client from google-php-api (see composer.json); so set handler explicitely here
    'default_graph_version' => 'v2.2',
]);

$accessToken = getAccessToken($fb);
$fb->setDefaultAccessToken($accessToken);


// cron job calles GET on this. Following will be sent to cron.
// echo "done"
?>