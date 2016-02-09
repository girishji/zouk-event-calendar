<?php

$appId = '1261883747160137';
$appSecret = '4bba3be85ec4ca2542d9357ead478330';

// google cloud storage
$bucket = 'zouk-bucket';
$tokeFile = 'fb_access_token';

$searchStrings = [
    'zouk',
    'zouk+carnival',
    'zouk+time',
    'zouk+night',
    'brazilian+zouk',
    'zouk+festival',
    'zouk+family',
    'zouk+fest',
    'zouk+congress',
    'zouk+weekend',
    'zouk+beach',
    'zouk+holiday',
    'zouk+dance',
    'zouk+sea',
    'zouk+snow',
    'zouk+fever',
    'zouk+fusion',
    'zouk+flow',
    'zouk+day',
    'zouk+jam',
    'zouk+salsa',
    'zouk+samba',
    'zouk+kizomba',
    'zouk+bachata',

    'zouk+danse',

    'zouk+karneval',
    'zouk+čas',
    'zouk+noc',
    'brazilský zouk',
    'zouk+festival',
    'zouk+rodina',
    'zouk+fest',
    'zouk+kongres',
    'zouk+víkend',
    'zouk+pláž',
    'zouk+dovolená',
    'zouk+tanec',
    'zouk+moře',
    'zouk+sníh',
    'zouk+horečka',
    'zouk+tok',
    'zouk+den',
    'zouk+džem',

    'zouk+karnawał',
    "zouk+czas",
    'zouk+noc',
    'zouk brazylijski',
    'zouk+festiwal',
    'zouk+rodzina',
    'zouk+kongres',
    'zouk+Weekend',
    'zouk+plaża',
    'zouk+wakacje',
    'zouk+taniec',
    'zouk+morze',
    'zouk+śnieg',
    'zouk+gorączka',
    'zouk+fuzja',
    'zouk+dzień',
    'zouk+dżem',
    
    'зук',
    'зук+карнавал',
    'зук+время',
    'зук+ночь',
    'бразильский зук',
    'зук+фестиваль',
    'зук+семья',
    'зук+фест',
    'зук+конгресс',
    'зук+выходные',
    'зук+пляж ',
    'зук+праздничный',
    'зук+танец',
    'зук+море',
    'зук+снег',
    'зук+лихорадка',
    'зук+фьюжн',
    'зук+поток',
    'зук+День',
    'зук+джем',
    
    'зук+час',
    'зук+ніч',
    'зук+сім',
    'зук+конгрес',
    'зук+вихідні',
    'зук+святковий',
    'зук+сніг',
    'зук+лихоманка',
    'зук+фьюжн',
    'зук+потік',

    'zouk+carnaval',
    'zouk+tempo',
    'zouk+noite',
    'zouk brasileiro',
    'zouk+família',
    'zouk+congresso',
    'zouk fim de semana',
    'zouk+praia',
    'zouk+férias',
    'zouk+dança',
    'zouk+mar',
    'zouk+neve',
    'zouk+febre',
    'zouk+fusão',
    'zouk+fluxo',
    'zouk+dia',

    'zouka',
    'zouku',
    'zoukb',
    'zoukc',
    'zoukd',
    'zouke',
    'zoukf',
    'zoukg',
    'zoukh',
    'zouki',
    'zoukj',
    'zoukk',
    'zoukl',
    'zoukm',
    'zoukn',
    'zouko',
    'zoukp',
    'zoukq',
    'zoukr',
    'zouks',
    'zoukt',
    'zoukv',
    'zoukx',
    'zouky',
    'zoukz',


    'bachaturo',
    'zouk+marathon',
    'fall+zouk',
    'berg+zouk',
    'brazouka',
    'zoukdevils',
    'f.i.e.l+official',
    'lambazouk',
    'zouk+lambada', 
    'brasileiro+zouk',
    'oman+zouk',
    'international+zouk',
    'zouk+katowice',
    'carioca+zouk'
];

/************************************************************/
use \google\appengine\api\mail\Message;
function sendMail($msg) {
    try {
        $message = new Message();
        $message->setSender("girshji-cron@zouk-event-calendar.appspotmail.com");
        //$message->setSender("zouk-events@appspot.gserviceaccount.com");
        $message->addTo("girishji@gmail.com");
        $message->setSubject("zouk-calendar app - trawl");
        $message->setTextBody($msg);
        $message->send();
    } catch (InvalidArgumentException $e) {
        syslog(LOG_ERR, "Email send failed: " . $e);
    }
}

?>
