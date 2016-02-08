<?php

// Get FB token and send back DB content

// vendor dir has all the 3rd party php libs; on heroku you can put this in .gitignore since heroku installs all these on its side; 
//  same thing happens on google app engine
require('./vendor/autoload.php');

// Store FB token
$accessToken = (string) $_GET["token"];

// send back (this is a GET call from client, so whatever you output from here goes there)
// echo "$accessToken";

// log
syslog(LOG_INFO, "FB token: " . $accessToken);

$appId = '1261883747160137';
$appSecret = '4bba3be85ec4ca2542d9357ead478330';

$fb = new Facebook\Facebook([
    'app_id' => $appId,
    'app_secret' => $appSecret,
    'http_client_handler' => 'curl', // dont' let it use guzzle from google-api
    'default_graph_version' => 'v2.2',
]);

//To extend an access token, you can make use of the OAuth2Client.
// OAuth 2.0 client handler
$oAuth2Client = $fb->getOAuth2Client();

// Exchanges a short-lived access token for a long-lived one
$longLivedAccessToken = $oAuth2Client->getLongLivedAccessToken($accessToken);

echo $longLivedAccessToken;

// Use Google Cloud Storage (not Cloud DataStore, which is a DB). GCS is unstructured data.
// Use this to create buckets and manage: https://console.cloud.google.com/storage/browser?project=zouk-event-calendar

$projectId = 'zouk-event-calendar';

// Authenticate your API Client
$client = new Google_Client();
$client->useApplicationDefaultCredentials();  // no need to aquire special credentials
$client->addScope(Google_Service_Storage::DEVSTORAGE_FULL_CONTROL);

$storage = new Google_Service_Storage($client);

/**
 * Google Cloud Storage API request to retrieve the list of buckets in your project.
 */
$buckets = $storage->buckets->listBuckets($projectId);

foreach ($buckets['items'] as $bucket) {
    printf("%s\n", $bucket->getName());
    syslog(LOG_INFO, $bucket->getName());
}


?>