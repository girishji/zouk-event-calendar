<?php

// Get FB token and send back DB content

// vendor dir has all the 3rd party php libs; on heroku you can put this in .gitignore since heroku installs all these on its side; 
//  same thing happens on google app engine
require('./vendor/autoload.php');
require('./config.php');

$accessToken = (string) $_GET["token"];

// send back (this is a GET call from client, so whatever you output from here goes there)
// echo "$accessToken";

// syslog(LOG_INFO, "FB token: " . $accessToken);

$fb = new Facebook\Facebook([
    'app_id' => $appId,
    'app_secret' => $appSecret,
    'http_client_handler' => 'stream', // XXX: this does not need to be set, but if not set -
    // it used 'guzzle' http client from google-php-api (see composer.json); so set handler explicitely here
    'default_graph_version' => 'v2.2',
]);

// To extend an access token, you can make use of the OAuth2Client.
// OAuth 2.0 client handler
$oAuth2Client = $fb->getOAuth2Client();

// Exchanges a short-lived access token for a long-lived one
$longLivedAccessToken = $oAuth2Client->getLongLivedAccessToken($accessToken);

//echo $longLivedAccessToken;

/** store stuff **/

// Use Google Cloud Storage (not Cloud DataStore, which is a DB). GCS is unstructured data.
// Use this to create buckets and manage: https://console.cloud.google.com/storage/browser?project=zouk-event-calendar
// Code below is generally out of date with documentation. See source in vendor/google/... for correct usage
// I created 1 bucket through web interface (can also be created programmatically). Inside this bucket will be many files.

// Authenticate your API Client
$client = new Google_Client();
$client->useApplicationDefaultCredentials();  // no need to acquire special credentials
$client->addScope(Google_Service_Storage::DEVSTORAGE_FULL_CONTROL); // see ~/sandbox/zouk-event-calendar/vendor/google/apiclient/src/Google/Service/Storage.php

$storage = new Google_Service_Storage($client);

// /**
//  * Google Cloud Storage API request to retrieve the list of buckets in your project.
//  */
// $projectId = 'zouk-event-calendar';
// $buckets = $storage->buckets->listBuckets($projectId);
// 
// foreach ($buckets['items'] as $bucket) {
//     printf("%s\n", $bucket->getName());
//     syslog(LOG_INFO, $bucket->getName());
// }

/** Get tokens already stored **/
// Read file from Google Storage
try {
    // get the url for our file
    $object = $storage->objects->get($bucket, $tokenFile); // use print_r($object) or var_dump to see the contents
    $url = $object['mediaLink'];
    $httpClient = $client->authorize(); // creates guzzle http client and authorizes it
    $response = $httpClient->get($url); // see guzzle docs for this
    echo $response->getBody();
    $tokensStr = (string) $response->getBody(); // local scope
} catch (Exception $e) {
    syslog(LOG_EMERG, $e->getMessage());
    sendMail('Cannot get access tokens: ' . $e->getMessage());
    echo 'Cannot get access tokens: ' . $e->getMessage();
    //exit('Cannot get access tokens: ' . $e->getMessage());
}

if (empty($tokensStr)) {
    $tokens = array();
} else {
    $tokens = json_decode($tokensStr, true); // 'true' will turn this into associative array instead of object
}

// Limit size of array to 50
if (count($tokens) > 50) {
    array_shift($tokens);  // remove one element from beginning
}

// add the new token to end of array
array_push($tokens, $longLivedAccessToken);

/***
 * Write file to Google Storage
 */
$fileContent = json_encode($tokens);
try {
    $body = array( 
        'name' => $tokenFile, 
        'data' => $fileContent,
        'uploadType' => "media"
    );
    $gsso = new Google_Service_Storage_StorageObject();
    $gsso->setName($tokenFile);
    $result = $storage->objects->insert($bucket, $gsso, $body);
    print_r($result);
} catch (Exception $e) {
    print $e->getMessage();
    sendMail('Cannot store access tokens: ' . $e->getMessage());
}


?>