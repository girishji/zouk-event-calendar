<?php
require('./vendor/autoload.php');
require('./config.php');
require('./common.php');

$file = (string) $_GET["file"];
$data = (string) $_GET["data"];
syslog(LOG_DEBUG, print_r($data, TRUE));
syslog(LOG_DEBUG, print_r($file, TRUE));
// storeGCS($data, $bucket, $file);

syslog(LOG_DEBUG, print_r($_GET));
print_r($_GET);
var_dump($_GET);
//echo 'done'; // sent back to ajax caller
?>