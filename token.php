<?php

// Get FB token and send back DB content

// vendor dir has all the 3rd party php libs; on heroku you can put this in .gitignore since heroku installs all these on its side; 
//  same thing happens on google app engine
require('./vendor/autoload.php');
require('./config.php');
require('./common.php');

$accessToken = (string) $_GET["token"];

// send back (this is a GET call from client, so whatever you output from here goes there)
// echo "$accessToken";

// syslog(LOG_INFO, "FB token: " . $accessToken);

$fb = getFacebook($appId, $appSecret);

// To extend an access token, you can make use of the OAuth2Client.
// OAuth 2.0 client handler
$oAuth2Client = $fb->getOAuth2Client();
// Exchanges a short-lived access token for a long-lived one
$longLivedAccessToken = $oAuth2Client->getLongLivedAccessToken($accessToken)->getValue();

//echo $longLivedAccessToken;

/** store stuff **/

// Use Google Cloud Storage (not Cloud DataStore, which is a DB). GCS is unstructured data.
// Use this to create buckets and manage: https://console.cloud.google.com/storage/browser?project=zouk-event-calendar
// Code below is generally out of date with documentation. See source in vendor/google/... for correct usage
// I created 1 bucket through web interface (can also be created programmatically). Inside this bucket will be many files.

$client = getClient();
$storage = getStorageService($client);

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
$tokensStr = getTokens($client, $storage, $bucket, $tokenFile);
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
//var_dump($tokens);

/***
 * Write file to Google Storage
 */
$fileContent = json_encode($tokens);
//var_dump($fileContent);
//echo $fileContent;

try {
    $body = array( 
        'name' => $tokenFile, 
        'data' => $fileContent,
        'uploadType' => "media"
    );
    $gsso = new Google_Service_Storage_StorageObject();
    $gsso->setName($tokenFile);
    $result = $storage->objects->insert($bucket, $gsso, $body);
    //print_r($result);  // prints on browser console (or javascript, ajax)
} catch (Exception $e) {
    print $e->getMessage();
    sendMail('Cannot store access tokens: ' . $e->getMessage());
}


?>