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
function storeGCS(&$content, $bucket, $file) {
    try {
        $body = array( 
            'name' => $file, 
            'data' => $content,
            'uploadType' => "media"
        );
        $gsso = new Google_Service_Storage_StorageObject();
        $gsso->setName($file);
        $result = $storage->objects->insert($bucket, $gsso, $body);
        //print_r($result);  // prints on browser console (or javascript, ajax)
    } catch (Exception $e) {
        print $e->getMessage();
        sendMail('Cannot store data in GCS: ' . $e->getMessage());
    }
}

/************************************************************/
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

/************************************************************/
function retrieveGCS($bucket, $file) {
    // Use Google Cloud Storage (not Cloud DataStore, which is a DB). GCS is unstructured data.
    // Use this to create buckets and manage: https://console.cloud.google.com/storage/browser?project=zouk-event-calendar
    // Code below is generally out of date with documentation. See source in vendor/google/... for correct usage
    // I created 1 bucket through web interface (can also be created programmatically). Inside this bucket will be many files.
    $client = getClient();
    $storage = getStorageService($client);
    try {
        // get the url for our file
        $object = $storage->objects->get($bucket, $file); // use print_r($object) or var_dump to see the contents
        $url = $object['mediaLink'];
        $httpClient = $client->authorize(); // creates guzzle http client and authorizes it
        $response = $httpClient->get($url); // see guzzle docs for this
        echo $response->getBody();
        $str = (string) $response->getBody(); // local scope
        return $str;
    } catch (Exception $e) {
        syslog(LOG_EMERG, $e->getMessage());
        sendMail('Cannot get data from GCS: ' . $e->getMessage());
        echo 'Cannot get data: ' . $e->getMessage();
        //exit('Cannot get access tokens: ' . $e->getMessage());
    }
    return NULL;
}

/************************************************************/
use \google\appengine\api\mail\Message;
function sendMail($msg, $sub = "zouk-calendar app") {
    try {
        $message = new Message();
        $message->setSender("gae-zouk-calendar@zouk-event-calendar.appspotmail.com");
        //$message->setSender("zouk-events@appspot.gserviceaccount.com");
        $message->addTo("girishji@gmail.com");
        $message->setSubject($sub);
        $message->setTextBody($msg);
        $message->send();
    } catch (InvalidArgumentException $e) {
        syslog(LOG_ERR, "Email send failed: " . $e);
    }
}

?>