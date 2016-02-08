<?php
use \google\appengine\api\mail\Message;

try {
    $message = new Message();
    $message->setSender("girshji-cron@zouk-event-calendar.appspotmail.com");
    //$message->setSender("zouk-events@appspot.gserviceaccount.com");
    $message->addTo("girishji@gmail.com");
    $message->setSubject("Example email");
    $message->setTextBody("Hello, world!");
    //$message->send();
} catch (InvalidArgumentException $e) {
    syslog(LOG_WARNING, "Email send failed: " . $e);
}

// cron job calles GET on this. Following will be sent to cron.
echo "done"
?>
