<?php
require('./vendor/autoload.php');
require('./config.php');
require('./common.php');


$post = file_get_contents('php://input');
$data = json_decode($post); // to object
$file = $data->{'file'};
$content = json_encode($data->{'content'});

storeGCS($content, $bucket, $file);
echo $post;
echo $content;
echo $file;
//var_dump($post);
//echo 'done'; // sent back to ajax caller
?>