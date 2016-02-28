<?php
require('./vendor/autoload.php');
require('./config.php');
require('./common.php');

$file = (string) $_GET["file"];
$data = (string) $_GET["data"];
storeGCS($data, $bucket, $file);

//echo 'done'; // sent back to ajax caller
?>