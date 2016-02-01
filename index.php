<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- <meta name="viewport" content="initial-scale=1.0, user-scalable=no"> -->

    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <meta name="description" content="Brazilian Zouk Global Event Calendar (Real-time)">
    <meta name="author" content="Girish (BiggieG)">
    <link rel="shortcut icon" type="image/png" href="/images/favicon.png"/>

    <!-- google -->
    <meta name="Description" CONTENT="Author: Girish (@biggieg_zouk), Category: Dance">
    <!-- <meta name="google-site-verification" content="+nxGUDJ4QpAZ5l9Bsjdi102tLVC21AIh5d1Nl23908vVuFHs34="/> -->
    <title>Zouk Event Calendar - Brazilian Zouk Lambada Dance Events Worldwide</title>
    <meta name="robots" content="noindex,nofollow">

    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>

    <!-- Bootstrap core CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
    <!-- Optional theme -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap-theme.min.css" integrity="sha384-fLW2N01lMqjakBkx3l/M9EahuwpSfeNvV63J5ezn3uZzapT0u7EYsXMjQV+0En5r" crossorigin="anonymous">
    <!-- Latest compiled and minified JavaScript -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>
    <!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
    <link href="https://maxcdn.bootstrapcdn.com/js/ie10-viewport-bug-workaround.js" rel="stylesheet">

    <!-- google map -->
    <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js"></script>
 
   <!-- Custom styles for this template -->
    <link href="/stylesheets/jumbotron-narrow.css" rel="stylesheet">
    <link href="/stylesheets/custom.css" rel="stylesheet">

    <!-- my content -->
    <script src="/js/countries.js" type="text/javascript" ></script>
    <script src="/js/content.js" type="text/javascript" ></script>

  </head>

  <body>
    <div id="fb-root"></div>

    <!-- Nav bar -->
    <div class="container">
      <div class="header clearfix">
        <nav>
          <ul class="nav nav-pills pull-right">
            <!-- <li role="presentation" class="active"><a href="#">Home</a></li> -->
            <li role="presentation"><a href="#" data-toggle="modal" data-target="#aboutModal">About</a></li>
            <!-- <li role="presentation"><a href="#" data-toggle="modal" data-target="#contactModal">Contact</a></li> -->
            <li>
              <div class="fb-like" data-href="https://www.facebook.com/WorldZoukCalendar/" data-layout="standard" data-action="like" data-show-faces="true" data-share="true"></div>
            </li>
          </ul>
        </nav>
        <a href="http://zoukcalendar.com">
          <h3 class="text-muted">Zouk Calendar<small>&nbsp; Search Facebook for Zouk events!</small></h3>
        </a>
      </div>

      <!-- modals -->
      <div class="modal fade" id="aboutModal" tabindex="-1" role="dialog" aria-labelledby="about zouk">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
              <h4 class="modal-title" id="myModalLabel">About</h4>
            </div>
            <div class="modal-body">
              <p>
                Welcome to the Zouk Calendar! This app
                searches Facebook and displays a list of scheduled Brazilian Zouk events around the world.
                You will be able to filter events based on location, start time, and size. In spite of the comprehensive search
                a few events may get left out.
              </p>
              <p>Effort has been made to remove events not related to Brazilian Zouk based on attendance 
                patterns. All the filtered events are displayed in a separate tab. 
              </p>
              <p>Facebook requires you to login to their system before you can search. Regarding privacy, rest
                assured that this app will not be able to access your personal information.
              </p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal fade" id="contactModal" tabindex="-1" role="dialog" aria-labelledby="contact author">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
              <h4 class="modal-title">New message</h4>
            </div>
            <div class="modal-body">
              <form>
                <div class="form-group">
                  <label for="subject" class="control-label">Subject:</label>
                  <input type="text" class="form-control" id="message-subject">
                </div>
                <div class="form-group">
                  <label for="message-text" class="control-label">Message:</label>
                  <textarea class="form-control" id="message-text"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" onclick="sendMessage();">Send</button>
            </div>
          </div>
        </div>
      </div>
      <!--
      <div id="festivalsModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="festivals">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
              <h4 class="modal-title" id="myModalLabel">Selected Festivals</h4>
            </div>
            <div id="selectedFestivalsTable" class="modal-body">
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
      -->

      <!-- Welcome banner -->
      <div id="bannerMsg" style="display: none; margin-top: 20px; margin: 10px 20px 10px 20px;">
        <p>Welcome to the Zouk Calendar! Ever wondered what events are taking place
          in a city you are visiting or planning to visit? This app searches Facebook and displays a list
          of scheduled Brazilian Zouk events around the world.
          You will be able to filter events based on location, start time, and size. Facebook requires you to login 
          before you can search. Please click on the button below. Regarding privacy, rest assured (and you'll be able
          to verify) that this app will <strong>not</strong> be able to access your personal information.</p>
        <div class="fb-login-button" data-max-rows="1" data-size="medium" data-show-faces="false" data-auto-logout-link="false" onlogin="loginToFacebook();">
        </div>
        <br>
      </div>
      <!-- progress bars -->
      <div id="searchProgressBarDiv" style="display: none;">
        <div class="progress-bar-header">
          <h4 class="text-muted">Searching Facebook ...</h4>
        </div>
        <div class="progress">
          <div id="searchProgressBar" class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%;"></div>
        </div>
      </div>
      <div id="filterProgressBarDiv" style="display: none;">
        <div class="progress-bar-header">
          <h4 class="text-muted">Filtering results ...</h4>
        </div>
        <div class="progress">
          <div id="filterProgressBar" class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%;"></div>
        </div>
      </div>

      <h6 style="text-align: right; padding-right: 14px; margin: 0px;"><div id="totalEvents"></div></h6>

      <!-- Nav  -->
      <ul class="nav nav-tabs" id="contentNav" style="display: none;">
        <li role="presentation" class="active"><a href="#" onclick="showEventsByTime();">Events</a></li>
        <li role="presentation"><a href="#" onclick="showMap();">Map</a></li>
        <li role="presentation"><a href="#" onclick="showDashboard();">Dashboard</a></li>
        <li role="presentation"><a href="#" onclick="showFiltered();">Filtered</a></li>
      </ul>
      
      <div id="mainContent" style="display: none;">

        <table id="evTableHeader" style="width: 100%;">
          <tr style="font-weight: bold;">
            <td style="padding: 8px;">
              <a href="#" onclick="showEventsByTime();" title="Sort by start time" data-toggle="tooltip">
                <table><tr><td>Date</td><td><span class="caret"></span></td></tr></table>
              </a>
            </td>
            <td style="padding: 8px 40px 8px 40px;">
              <div class="input-group sort-group-header">
                <input id="locationInput" type="text" class="form-control" placeholder="Enter your address...">
                <span class="input-group-btn">
                  <button id="locationBtn" class="btn btn-default" type="button" title="Sort by location" data-toggle="tooltip">Go</button>
                </span>
              </div><!-- /input-group -->
            </td>
            <td style="padding: 8px;">
              <a href="#" onclick="showEventsByAttending();" title="Sort by number of people attending" data-toggle="tooltip">
                <table><tr><td>Attending</td><td><span class="caret"></span></td></tr></table>
              </a>
            </td>
          </tr>
        </table>

        <div id="evTableContent"></div>

        <div id="map" style="height: 430px; width: 100%; margin-top: 20px;"></div>

        <div id="dashboard"></div>

      </div>

      <footer class="footer">
        <p>&copy; 2016 girish (biggieg zouk)</p>
      </footer>

    </div> <!-- /container -->

    <?php
       ?>
  </body>
</html>

