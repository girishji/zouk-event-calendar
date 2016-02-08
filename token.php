<?php

// Get FB token and send back DB content

// vendor dir has all the 3rd party php libs; on heroku you can put this in .gitignore since heroku installs all these on its side; 
//  however google app engine i am not sure
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

if (! $_SESSION['facebook_access_token']) {
    // User has approved this app through fb login prior to coming here. Get access token from GET
    // request of ajax
    // caution: can't use getJavaScriptHelper since this is server side.
    $_SESSION['facebook_access_token'] = $accessToken;
}

//To extend an access token, you can make use of the OAuth2Client.
// OAuth 2.0 client handler
$oAuth2Client = $fb->getOAuth2Client();

// Exchanges a short-lived access token for a long-lived one
$longLivedAccessToken = $oAuth2Client->getLongLivedAccessToken('{access-token}');


?>