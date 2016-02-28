<?php
require('./vendor/autoload.php');
require('./config.php');
require('./common.php');

// $file = (string) $_POST["file"];
// $data = (string) $_POST["content"];
// echo $file;
// echo $data;
// syslog(LOG_DEBUG, print_r($data, TRUE));
// syslog(LOG_DEBUG, print_r($file, TRUE));
// storeGCS($data, $bucket, $file);

//syslog(LOG_DEBUG, print_r($_POST));
print_r($_POST);
var_dump($_POST);

$post = file_get_contents('php://input');
echo $post;
var_dump($post);
//echo 'done'; // sent back to ajax caller
?>