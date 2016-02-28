<?php
require('./vendor/autoload.php');
require('./config.php');
require('./common.php');

$file = (string) $_GET['file'];
$interval = (string) $_GET['interval'];

if (fileExists($bucket, $file)) {
    $mTime = lastModifiedTime($bucket, $file);
    echo $mTime;
} else {
    echo "file not found";
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