<?php

/************************************************************/
function getFacebook($appId, $appSecret) {
    $fb = new Facebook\Facebook([
        'app_id' => $appId,
        'app_secret' => $appSecret,
        'http_client_handler' => 'stream', // XXX: this does not need to be set, but if not set -
        // it used 'guzzle' http client from google-php-api (see composer.json); so set handler explicitely here
        'default_graph_version' => 'v2.2',
    ]);
    return $fb;
}

/************************************************************/
function getClient() {
    // Authenticate your API Client
    $client = new Google_Client();
    $client->useApplicationDefaultCredentials();  // no need to acquire special credentials
    $client->addScope(Google_Service_Storage::DEVSTORAGE_FULL_CONTROL);
    // see ~/sandbox/zouk-event-calendar/vendor/google/apiclient/src/Google/Service/Storage.php
    return $client;
}

/************************************************************/
function getStorageService(&$client) {
    $storage = new Google_Service_Storage($client);
    return $storage;
}

/************************************************************/
function getTokens(&$client, &$storage, $bucket, $tokenFile) {
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
        return $tokensStr;
    } catch (Exception $e) {
        syslog(LOG_EMERG, $e->getMessage());
        sendMail('Cannot get access tokens: ' . $e->getMessage());
        echo 'Cannot get access tokens: ' . $e->getMessage();
        //exit('Cannot get access tokens: ' . $e->getMessage());
    }
}

/************************************************************/
use \google\appengine\api\mail\Message;
function sendMail($msg) {
    try {
        $message = new Message();
        $message->setSender("girshji-cron@zouk-event-calendar.appspotmail.com");
        //$message->setSender("zouk-events@appspot.gserviceaccount.com");
        $message->addTo("girishji@gmail.com");
        $message->setSubject("zouk-calendar app - trawl");
        $message->setTextBody($msg);
        $message->send();
    } catch (InvalidArgumentException $e) {
        syslog(LOG_ERR, "Email send failed: " . $e);
    }
}

?>