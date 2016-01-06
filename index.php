<!DOCTYPE html>
<html lang="en">
  <head>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
    <!-- Optional theme -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap-theme.min.css" integrity="sha384-fLW2N01lMqjakBkx3l/M9EahuwpSfeNvV63J5ezn3uZzapT0u7EYsXMjQV+0En5r" crossorigin="anonymous">
    <!-- Latest compiled and minified JavaScript -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <title>Zouk Event Calendar - Girish</title>

    <!-- Bootstrap -->
    <link href="css/bootstrap.min.css" rel="stylesheet">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->

    <!-- <link rel="stylesheet" type="text/css" href="/stylesheets/main.css" /> -->
  </head>
  <body>
    <h1>Hello, world!</h1>

    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="js/bootstrap.min.js"></script>


    <!--
      FB first makes a request to server with a signed-request. This has access-token in it.
      So server side should already have correct FB app-id. Then server sends this index.php
      after processing all php. Client (browser) proceeds to load this page in addition to
      processing Javascript in this page.

      You can search FB from client side or server side. First check if app has permission,
      otherwise prompt for login.
      Server side FB search: After login, or if access-token is obtained from pageHelper 
              (by the broser), send that token to server through ajax and get search 
              results back.
      Client side FB search: Use javascript to manipulate DOMs. No need for ajax, but
              still load jquery library since it is easier to manipulate objects through
              jquery (a wrapper on DOM objects like document etc.)
     -->
     <div id="fb-root"></div>
     <!-- <script src="/js/content.js" type="text/javascript" ></script> -->
     <!-- <div id="z_content" /> -->
     <?php
              //http://stackoverflow.com/questions/18846744/responsive-images-in-tables-bootstrap-3 
     ?>
  </body>
</html>

