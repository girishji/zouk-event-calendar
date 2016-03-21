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
    //$client->addScope(Google_Service_Storage::DEVSTORAGE_FULL_CONTROL);
    $client->addScope(Google_Service_Storage::DEVSTORAGE_READ_WRITE);
    // see ~/sandbox/zouk-event-calendar/vendor/google/apiclient/src/Google/Service/Storage.php
    $client->setAccessType("offline");
    $client->useApplicationDefaultCredentials();  // no need to acquire special credentials

    $token = $client->getAccessToken();
    if (!$token) {
        // this is always the case, and same access token is aquired in the fetch call below (can be printed)
        //syslog(LOG_DEBUG, "girish: access token not present");
        $token = $client->fetchAccessTokenWithAssertion();
        $client->setAccessToken($token);
        //syslog(LOG_DEBUG, $token['access_token']);
    }
    // token acquried above is always expired. and even if you run fetchAccess...Refreshtoken() it still stays expired
    //if ($client->isAccessTokenExpired()) {
    //    syslog(LOG_DEBUG, "girish: access token expired");
    //    $client->fetchAccessTokenWithRefreshToken($token);
    //}
    //if ($client->isAccessTokenExpired()) {
    //    syslog(LOG_DEBUG, "girish: access token still expired!"); // no idea how this works
    //}
    return $client;
}

/************************************************************/
function getStorageService(&$client) {
    $storage = new Google_Service_Storage($client);
    return $storage;
}

/************************************************************/
// https://cloud.google.com/appengine/docs/php/googlestorage/
// https://cloud.google.com/appengine/docs/php/googlestorage/advanced#php_filesystem_functions_support_on_google_cloud_storage
function lastModifiedTime($bucket, $file) {
    $path = "gs://" . $bucket . "/" . $file;
    return filemtime($path); // returns int
}

/************************************************************/
// https://cloud.google.com/appengine/docs/php/googlestorage/
// https://cloud.google.com/appengine/docs/php/googlestorage/advanced#php_filesystem_functions_support_on_google_cloud_storage
function fileExists($bucket, $file) {
    $path = "gs://" . $bucket . "/" . $file;
    return file_exists($path); // returns bool
}

/************************************************************/
function storeGCS(&$content, $bucket, $file) {
    $client = getClient();
    $storage = getStorageService($client);
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
        syslog(LOG_EMERG, $e->getMessage());
        print $e->getMessage();
        sendMail('Cannot store data in GCS: ' . $e->getMessage());
        return 1;    
    }
    return 0;
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
        $str = (string) $response->getBody(); // local scope
        return $str;
    } catch (Exception $e) {
        syslog(LOG_EMERG, $e->getMessage());
        sendMail('Cannot get data from GCS: ' . $e->getMessage());
    }
    return NULL;
}


/************************************************************/
function fbBatchSearch(&$resultArray, &$fb, $remainingSearch, $nextBatchCallback, $filterResultCallback) {
    syslog(LOG_DEBUG, 'fbBatchSearch');
    // $remainingSearch is array copy by value; array is not an object
    // (aside: when you assign one object to another only reference is copied)
    $batch = array();
    $batch = $nextBatchCallback($fb, $batch, $remainingSearch);
    while (count($batch) > 0) {
        try {
            //syslog(LOG_DEBUG, 'fbBatchSearch: sending batch request');
            $responses = $fb->sendBatchRequest($batch);
        } catch(Facebook\Exceptions\FacebookResponseException $e) {
            // When Graph returns an error
            syslog(LOG_ERR, 'Graph returned an error: ' . $e->getMessage());
            exit;
        } catch(Facebook\Exceptions\FacebookSDKException $e) {
            // When validation fails or other local issues
            syslog(LOG_ERR, 'Facebook SDK returned an error: ' . $e->getMessage());
            exit;
        }

        $batch = array(); // reinit
        foreach ($responses as $key => $response) {
            if ($response->isError()) {
                $e = $response->getThrownException();
                syslog(LOG_ERR, 'Error! Facebook SDK Said: ' . $e->getMessage());
                //echo 'Graph Said: ' . "\n\n"; //var_dump($e->getResponse());
            } else {
                //echo "Response: " . $response->getBody() . "\n";
                // turn nodes into edges for pagination and iteration
                $feedEdge = $response->getGraphEdge();
                //syslog(LOG_DEBUG, print_r($feedEdge, TRUE));
                foreach ($feedEdge as $graphNode) {
                    //syslog(LOG_DEBUG, print_r($graphNode, TRUE));
                    $filterResultCallback($resultArray, $graphNode);
                }
            }
            // add next page request to batch
            
            // $request = $response->getRequestForNextPage();
            $body = $response->getDecodedBody();
            syslog(LOG_DEBUG, print_r($body, TRUE));
            //if (! is_null($request)) {
            //    array_push($batch, $request);
            //}
            break;
        }
        break;

        //$batch = $nextBatchCallback($fb, $batch, $remainingSearch);
    } // while
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