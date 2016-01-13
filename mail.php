<?php

require 'vendor/autoload.php';
$sendgrid = new SendGrid('app45746838@heroku.com', 'o5tymy0g1404');

$message = new SendGrid\Email();
$message->addTo('girishji@gmail.com')->
    setFrom('zouk-calendar@heroku.com')->
    setSubject((string) $_GET["message-subject"])->
    setText((string) $_GET["message-text"]);
$response = $sendgrid->send($message);

//->    setHtml('<strong>Hello World!</strong>');
?>