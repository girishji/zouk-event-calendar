<?php

$appId = '1261883747160137';
$appSecret = '4bba3be85ec4ca2542d9357ead478330';

// google cloud storage
$bucket = 'zouk-bucket';
$tokenFile = 'fb_access_tokens.data';
$eventsFile = 'fb_events.data';

$pagesFile = "fb_pages.data";
$pagesInterval = 23 * 3600;
$pageEventsFile = "fb_pages_events.data";
$pageEventsInterval = 12 * 3600;
$discardedEventsFile = "fb_discarded_events.data";
$discardedEventsInterval = 2 * 24 * 3600;


$pageSearchStrings = [
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


// These are known festivals to compare against
$knownMajorEvents = [ 
    'zouk\\s+libre.*festival',
    'prague.*zouk.*congress',
    'prague\\s+zouk\\s+marathon',
    'rio.*zouk.*congress',
    'f.i.e.l',
    'zoukmx\\s',
    '\\s*zoukfest\\s',
    'l.*a.*Zouk.*congress',
    '[^t]zouktime!\|^zouktime!\\s',
    'dutch.+international.+zouk.+congr',
    'berg.*congres',
    'i\'m\\s*zouk',
    'russian\\s+zouk\\s+congress',
    'canada.*zouk' ];

$knownUnrelatedPlaces = [
    [ "latitude" => '48.812053039547',  "longitude" => '2.4038419249911' ],
    [ "latitude" => '-22.882511415042', "longitude" => '-48.452376032727' ],
    [ "latitude" => '46.01244',         "longitude" => '-0.28403' ],
    [ "latitude" => '-22.9937382',      "longitude" => '-44.2409439' ]
];

?>
