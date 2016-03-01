<?php
require('./vendor/autoload.php');
require('./config.php');
require('./common.php');

$file = (string) $_GET['file'];
$intervalStr = (string) $_GET['interval'];
$interval = intval($intervalStr);

$found = false;
if (fileExists($bucket, $file)) {
    $mTime = lastModifiedTime($bucket, $file);
    $date = new DateTime();
    $curTime = $date->getTimestamp();
    if ($curTime - $mTime < $interval) {
        $content = retrieveGCS($bucket, $file);
        if ($content) {
            $found = true;
            echo $content;
        }
    } 
}

if (!$found) {
    // file not valid, send json object as error
    echo "{ \"error\": \"zouk calendar: file not found\" }";
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