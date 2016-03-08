<?php
require('./vendor/autoload.php');
require('./config.php');
require('./common.php');

function fileValid($bucket, $file, $interval) {
    if (fileExists($bucket, $file)) {
        $mTime = lastModifiedTime($bucket, $file);
        $date = new DateTime();
        $curTime = $date->getTimestamp();
        if ($curTime - $mTime < $interval) {
            return true;
        }
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
        $content = retrieveGCS($bucket, $file);
        if ($content) {
            echo $content;
            return;
        }
    }
    // file not valid, send json object as error
    echo "{ \"error\": \"zouk calendar: file not found\" }";

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