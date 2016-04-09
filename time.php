<?php
require('./vendor/autoload.php');
require('./config.php');
require('./common.php');

try {
    $date = new DateTime();
    //$curTime = $date->getTimestamp();
    //echo $curTime;
    echo $date->format(DateTime::ATOM);
} catch (Exception $e) {
    syslog(LOG_ERR, $e->getMessage());
    echo "-1";
}

?>