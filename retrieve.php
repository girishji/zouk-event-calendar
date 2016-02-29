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
        echo retrieveGCS($bucket, $file);
        $found = true;
    } 
}

if (!$found) {
    // file not valid, send json object as error
    //echo "{ error: 1 }";
    echo retrieveGCS($bucket, $file);
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