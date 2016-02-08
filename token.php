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
    'default_graph_version' => 'v2.2',
]);

//To extend an access token, you can make use of the OAuth2Client.
// OAuth 2.0 client handler
$oAuth2Client = $fb->getOAuth2Client();

// Exchanges a short-lived access token for a long-lived one
$longLivedAccessToken = $oAuth2Client->getLongLivedAccessToken($accessToken);

echo $longLivedAccessToken;

// for database: https://developers.google.com/api-client-library/php/guide/aaa_overview

?>