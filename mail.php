<?php

use \google\appengine\api\mail\Message;

try {
    $message = new Message();
    $message->setSender("girshji-zc@zouk-event-calendar.appspotmail.com");
    $message->setSubject((string) $_GET["subject"]);
    $message->setTextBody((string) $_GET["message"]);
    $message->addTo("girishji@gmail.com");
    $message->send();
} catch (InvalidArgumentException $e) {
    syslog(LOG_WARNING, "Email send failed: " . $e);
}


// Following is for Heroku
// require 'vendor/autoload.php';
// $sendgrid = new SendGrid('app45746838@heroku.com', 'o5tymy0g1404');
// 
// $message = new SendGrid\Email();
// $message->addTo('girishji@gmail.com')->
//     setFrom('worldzoukcalendar@heroku.com')->
//     setSubject((string) $_GET["subject"])->
//     setText((string) $_GET["message"]);
// 
// //    setHtml('<strong>Hello World!</strong>');
// 
// try {
//     $response = $sendgrid->send($message);
// } catch(\SendGrid\Exception $e) {
//     echo $e->getCode();
//     foreach($e->getErrors() as $er) {
//         echo $er;
//     }
// }
//var_dump($response); // appears on chrome console
echo 'done';
//
?>