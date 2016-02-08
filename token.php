<?php

// Store FB token
$accessToken = (string) $_GET["token"];

// send back
echo $accessToken;

// log
syslog(LOG_INFO, "FB token: " . $accessToken);
?>