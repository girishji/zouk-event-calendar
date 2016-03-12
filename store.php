<?php
require('./vendor/autoload.php');
require('./config.php');
require('./common.php');

// php object vs array
// $someobject->{'xx'} and $someobject.xx are same
// for associative array, do $somearray['xx']
// both objects and arrays can use 'foreach {$xx as $x}' statement

// using json_decode($xxx, true) will force convert and object into an array
// json_decode without 'true' means in a recursive tree object array, array part
// remains array and object part remains object

$post = file_get_contents('php://input');
$data = json_decode($post); // to object
$file = $data->{'file'};
$dtype = $data->{'type'};
$fbAccessToken = $data->{'token'};
$newEvents = $data->{'content'};

/* always merge */

if (fileExists($bucket, $file)) {
    $content = retrieveGCS($bucket, $file);
    if ($content) {
        $date = new DateTime();
        $curTime = $date->getTimestamp();
        if ($dtype == 'event') {
            $fb = getFacebook($appId, $appSecret);
            $oldEvents = json_decode($content); // array of objects (do not specify 'true' as it will force an array)
            foreach ($oldEvents as $event) {
                // is current?
                $startTime = $event->{'start_time'}; // 2013-01-25T00:11:02+0000
                $d = DateTime::createFromFormat(DateTime::ISO8601, $startTime);
                $evTime = $d->getTimestamp();
                $interval = 3 * 24 * 3600; // 3 days
                if ($curTime - $evTime < $interval) {
                    // see if this event is not already there
                    $found = false;
                    foreach ($newEvents as $newEv) {
                        if ($newEv->{'id'} == $event->{'id'}) {
                            $found = true;
                            break;
                        }
                    }
                    if (! $found) {
                        // verify if this event is not obsolete
                        try {
                            $response = $fb->get('/' . $event->{'id'}, $fbAccessToken);
                            if (! $response->isError()) {
                                // add it
                                array_push($newEvents, $event);
                                //sendMail('Adding event ' .  print_r($event, TRUE)); // just for verification
                                //when you get this email, check for duplicates
                            }
                        } catch (Exception $e) {
                            // do nothing
                        }
                    }
                }
            }
        } else if ($dtype == 'page') {
            // how do you know if a page is not removed? it is too expensive to query fb just for this, so don't do anything
            // let's store pages as they are sent here, without merging with old list
        } else {
            $msg = 'zouk calendar: content type not found' . $dtype;
            syslog(LOG_EMERG, $msg);
            sendMail($msg);
        }
    }
}

$content = json_encode($newEvents);
if (storeGCS($content, $bucket, $file) != 0) {
    echo "{ \"error\": \"zouk calendar: file store failed\" }";
    $msg = 'zouk calendar: failed to store file ' . $file;
    syslog(LOG_EMERG, $msg);
    sendMail($msg);
}
//var_dump($post);
?>