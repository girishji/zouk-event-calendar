<?php
require('./vendor/autoload.php');
require('./config.php');
require('./common.php');

$post = file_get_contents('php://input');
$data = json_decode($post); // to object
$file = $data->{'file'};
$content = json_encode($data->{'content'});

if (storeGCS($content, $bucket, $file) != 0) {
    echo "{ \"error\": \"zouk calendar: file store failed\" }";
}
//var_dump($post);
?>