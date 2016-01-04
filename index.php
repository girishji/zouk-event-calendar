<!DOCTYPE html>
<html>
<head>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
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

<div id="zec_content">
</div>
<?php
//  
//      // You still need to login the user from inside your app and ask for permissions (not desirable to log them out).
//  
//      // To see the format of the data you are retrieving, use the "Graph API
//      // Explorer" which is at https://developers.facebook.com/tools/explorer/
//  
//      // vendor dir exists on heroku server, you can download locally also for local execution.
//      require('../vendor/autoload.php');
//  
//      //$appID = getenv('FACEBOOK_APP_ID');
//      //$appSecret = getenv('FACEBOOK_SECRET');
//  
//      $appID = '1263842110297634';
//      $appSecret = 'fbf6c8e32c3da1ace6f11805decb49e4';
//  
//      $fb = new Facebook\Facebook([
//          'app_id' => $appID,
//          'app_secret' => $appSecret,
//          'default_graph_version' => 'v2.2',
//      ]);
//  
//      // Get access token
//      // https://www.sammyk.me/upgrading-the-facebook-php-sdk-from-v4-to-v5
//      // https://developers.facebook.com/docs/php/howto/example_access_token_from_page_tab
//  
//      $helper = $fb->getPageTabHelper();
//  
//      $signedRequest = $helper->getSignedRequest();
//  
//      if ($signedRequest) {
//          // $payload = $signedRequest->getPayload();
//          // var_dump($payload);
//          if (! $signedRequest->getUserId()) {
//              // User has not logged in to this app and granted permissions (they could be logged into fb)
//  
//              // Below we include the Login Button social plugin. This button uses
//              // the JavaScript SDK to present a graphical Login button that triggers
//              //           the FB.login() function when clicked.
//              echo '<div id="zouk_content">';
//          echo 'Facebook requires that you grant permission for this app to access Facebook graph. In order to do that you have to grant this app permission to view your basic public profile. This app does *not* ask for permission to view private or sensitive data (you will verify it in the next step). Please click the login button and grant permission. <br /><br />';
//          echo '</div>';
//  
//          // This button uses the JavaScript SDK to present a graphical Login button that triggers
//          // the FB.login() function when clicked.
//          echo <<<EOD
//          <div id="fb_login_button">
//          <fb:login-button scope="public_profile" onlogin="checkLoginState();">
//          </fb:login-button>
//          <div id="my_status">
//          </div>
//          </div>
//  EOD;
//          return;
//      }
//  } else {
//      echo 'Signed Request not found';
//      exit;
//  }
//  
//  try {
//      $accessToken = $helper->getAccessToken();
//  } catch(Facebook\Exceptions\FacebookResponseException $e) {
//      // When Graph returns an error
//      echo 'ZEC: Graph returned an error: ' . $e->getMessage();
//      exit;
//  } catch(Facebook\Exceptions\FacebookSDKException $e) {
//      // When validation fails or other local issues
//      echo 'ZEC: Facebook SDK returned an error: ' . $e->getMessage();
//      exit;
//  }
//  
//  
//  if (! isset($accessToken)) {
//      echo 'ZEC: No OAuth data could be obtained from the signed request. User has not authorized your app yet.';
//      exit;
//  } else {
//      // Logged in.
//      $_SESSION['facebook_access_token'] = (string) $accessToken;
//      require 'content.php';
//  }
//  
//  
?>
</body>
</html>

