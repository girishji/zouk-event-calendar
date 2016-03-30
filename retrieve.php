<?php
require('./vendor/autoload.php');
require('./config.php');
require('./common.php');

function fileValid($bucket, $file, $interval) {
    syslog(LOG_DEBUG, "fileValid: retrieving file " . $file);
    try {
        if (fileExists($bucket, $file)) {
            $mTime = lastModifiedTime($bucket, $file);
            $date = new DateTime();
            $curTime = $date->getTimestamp();
            if ($curTime - $mTime < $interval) {
                return true;
            }
        }
        return false;
    } catch (Exception $e) {
        syslog(LOG_ERR, $e->getMessage());
        return false;
    }
}

function retrieveFile($bucket, $file) {
    syslog(LOG_DEBUG, "retrieveFile: file " . $file);
    $content = retrieveGCS($bucket, $file);
    if ($content) {
        echo $content;
        return true;
    }
    return false;
}

$type = (string) $_GET['type'];
if ($type == 'data') {
    $valStr = (string) $_GET['value'];
    $val = json_decode($valStr);
    $file = $val->{'file'};
    $intervalStr = $val->{'interval'};
    $interval = intval($intervalStr);

    if (fileValid($bucket, $file, $interval)) {
        if (retrieveFile($bucket, $file)) {
            return;
        }
    }

    // file expired, create a token, see if search can be done
    $token = $file . ".token";
    $expiryInterval = 60 * 60; // someone tried to search 1 hr ago, 1 hr is where fb updates quotas
    if (fileValid($bucket, $token, $expiryInterval)) {
        // someone else is searching, so retrieve existing file
        // XXX: IF I forcefully remove this events file, and if token says someone else is searching, then
        // console will have an error saying 404 (file not found). This will go to client and client says
        // (I print in jsonStore function) that client has a problem try later. This should be ok. Just
        // forcefully remove token file to start search.
        retrieveFile($bucket, $file); // if this fails, do nothing
    } else {
        // either token is not there, or its old and carried over from previous search
        // or someone created token, tried to search but aborted search
        // renew token
        $content = "foo";
        if (storeGCS($content, $bucket, $token) != 0) {
            $msg = 'zouk calendar: failed to store token ' . $file;
            syslog(LOG_EMERG, $msg);
            sendMail($msg);
        }
        // file not valid, send json object as error
        echo "{ \"error\": \"zouk calendar: file not found\" }";
    }

} else if ($type == 'cache') { // check if cache is expired
    $valStr = (string) $_GET['value'];
    $tuples = json_decode($valStr);
    if (count($tuples) < 3) {
        $retVal = json_encode(array('result' => false));
        echo $retVal;
        sendMail("retrieve.php, cache names not valid");
        return;
    }
    foreach ($tuples as $tuple) {
        $file = $tuple->{'file'};
        $intervalStr = $tuple->{'interval'};
        $interval = intval($intervalStr) + (5 * 60); // add 5 min so file is valid when actually retrieved
        if (! fileValid($bucket, $file, $interval)) {
            $retVal = json_encode(array('result' => false));
            echo $retVal;
            return;
        }
    }
    $retVal = json_encode(array('result' => true));
    echo $retVal;
} else {
       echo "{ \"error\": \"zouk calendar: type invalid\" }";
}

//$data = json_decode($post); // to object
//$file = $data->{'file'};
//$content = json_encode($data->{'content'});
//
//storeGCS($content, $bucket, $file);
//echo $post;
//echo $content;
//var_dump($post);
//echo 'done'; // sent back to ajax caller
?>