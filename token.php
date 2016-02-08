<?php

// Get FB token and send back DB content

// Store FB token
$accessToken = (string) $_GET["token"];

// send back
echo "$accessToken";

// log
syslog(LOG_INFO, "FB token: " . $accessToken);

$appId = '1261883747160137';
$appSecret = '4bba3be85ec4ca2542d9357ead478330';

use Facebook\FacebookSession;

FacebookSession::setDefaultApplication($appId, $appSecret);

// If you already have a valid access token:
$session = new FacebookSession($accessToken);

// To validate the session:
try {
    $session->validate();
} catch (FacebookRequestException $ex) {
    // Session not valid, Graph API returned an exception with the reason.
    echo $ex->getMessage();
} catch (\Exception $ex) {
    // Graph API returned info, but it may mismatch the current app or have expired.
    echo $ex->getMessage();
}

$session2 = $session->getLongLivedSession($appId, $appSecret);
$longLivedToken = $session2->getToken();

?>