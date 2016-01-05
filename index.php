<!DOCTYPE html>
<html>
<head>
<!--
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
-->
<link rel="stylesheet" type="text/css" href="/stylesheets/main.css" />
</head>
<body>
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
<script src="/js/content.js" type="text/javascript" ></script>

<div id="z_content">
</div>

<?php
 
?>
</body>
</html>

