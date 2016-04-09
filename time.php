<?php
require('./vendor/autoload.php');
require('./config.php');
require('./common.php');

try {
    $date = new DateTime();
    $curTime = $date->getTimestamp() * 1000; // make it milliseconds since 1970
    echo $curTime;
    //echo $date->format(DateTime::ATOM); // 2016-04-09T15:36:48+00:00, millisecond is different from ISO8601/facebook formate
} catch (Exception $e) {
    syslog(LOG_ERR, $e->getMessage());
    echo "-1";
}

?>