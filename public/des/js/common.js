var PHP_DOMAIN = "";

/*
var fbAccessToken = "";

// check status of facebook login
function fbStatusChangeCallback(response) {
  // The response object is returned with a status field that lets the
  // app know the current login status of the person.
  // Full docs on the response object can be found in the documentation
  // for FB.getLoginStatus().
  if (response.status === 'connected') {
    // sync facebook session with server
    // Logged into your app and Facebook.
    FB.api('/me', function(response) {
      $('#login-link').html('Logout <b>' + response.name + '</b>');
    });
  } else {
    $('#login-link').text('Login');
  }
  if (response.authResponse !== undefined) {
    fbAccessToken = response.authResponse.accessToken;
  }
}

window.fbAsyncInit = function() {
  FB.init({
    appId: '512208288834370', // 519543441523397',
    cookie: true, // enable cookies to allow the server to access 
    // the session
    xfbml: true, // parse social plugins on this page
    version: 'v2.1' // use version 2.1
  });

  // This function gets the state of the person visiting this page and can return one of three states to the callback you provide.  They can be:
  // 1. Logged into your app ('connected')
  // 2. Logged into Facebook, but not your app ('not_authorized')
  // 3. Not logged into Facebook and can't tell if they are logged into your app or not.
  FB.getLoginStatus(function(response) {
    fbStatusChangeCallback(response);
  });
};

// Load the SDK asynchronously
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id))
      return;
  js = d.createElement(s);
  js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
*/

// surprise colour!
// Referenced to in  home.js and viz.js also
var colourArray = ["#52bc69", "#d65775"/*"#ed5a7d"*/, "#2ebbd1", "#d9513c", "#fec515", "#4b65ba", "#ff8a27", "#a7d41e"]; // green, pink, blue, red, yellow, indigo, orange, lime

function disableScroll() { $('html').css('overflow', 'hidden'); }

function enableScroll() { $('html').css('overflow', 'visible'); }

function replaceAll(find, replace, str) { return str.replace(new RegExp(find, 'g'), replace); }

function getColours() {
  var generatedColours = new Array();
  while (generatedColours.length < 4) {
    var n = (Math.floor(Math.random() * colourArray.length));
    if ($.inArray(n, generatedColours) == -1)
      generatedColours.push(n);
  }
  return generatedColours;
}

function customAlert(msg) {
  $('#custom-alert p').html(msg);
  var m = -1 * ($('#custom-alert').outerHeight()/2);
  $('#custom-alert').css('margin-top', m+'px');
  $('#dark-overlay').fadeIn(function() {
    $('#custom-alert').fadeIn(function() {
      setTimeout(function() {
        $('#custom-alert').fadeOut(function() {
          $('#dark-overlay').fadeOut();
        });
      }, 1000);
    });
  });
}

function showLoadingScreen() {
  $('#loading-overlay').show();
  $('#loading-message').show();
}

function hideLoadingScreen() {
  $('#loading-overlay').hide();
}

function commonAction(retval, msg) {
  setTimeout(function() {
    if (mode == "exploration" && retval) {
      $('#current-action').show();
      $('#current-action p').html(msg);
      $('#progress-bar').slider("option", "max", gw.getTotalIteration()-1);
      triggerRightPanels();
      isPlaying = true;
    }
  }, 500);
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) == variable)
      return decodeURIComponent(pair[1]);
  }
  return "";
}

var generatedColours = getColours();
var surpriseColour = colourArray[generatedColours[0]];
var colourTheSecond = colourArray[generatedColours[1]];
var colourTheThird = colourArray[generatedColours[2]];
var colourTheFourth = colourArray[generatedColours[3]];

$(function() {
  // $('#login-link').click(function() {
  //       if ($('#login-link').text() == 'Login') {
  //           $('#login-overlay').fadeIn('fast');
  //           $('#login-overlay-content').show();
  //           disableScroll();
  //       } else {
  //           FB.logout(function(response) {
  //               fbStatusChangeCallback(response);
  //           });
  //       }
  //   });
  //   /*-------LOG IN AUTHENTICATION-------*/
  //   $('#login-overlay-content #login-go').click(function() {
  //       FB.login(function(response) {
  //           fbStatusChangeCallback(response);
  //           $('#login-overlay').fadeOut('fast');
  //           $('#login-overlay-content').hide();
  //       });
  //   });
  //   /*-------LOG IN CSS-------*/
  //   $('#login-id').focusin(function() {
  //       $(this).css('box-shadow', '0px 0px 3px ' + surpriseColour + ' inset');
  //       if ($(this).val() == "user id") {
  //           $(this).css('color', 'black');
  //           $(this).val("");
  //       }
  //   }).focusout(function() {
  //       $(this).css('box-shadow', '0px 0px 3px #929292 inset');
  //       if ($(this).val() == "") {
  //           $(this).css('color', '#aaa');
  //           $(this).val("user id");
  //       }
  //   });
  //   $('#login-pw').focusin(function() {
  //       $(this).css('box-shadow', '0px 0px 3px ' + surpriseColour + ' inset');
  //       if ($(this).val() == "password") {
  //           $(this).attr('type', 'password');
  //           $(this).css('color', 'black');
  //           $(this).val("");
  //       }
  //   }).focusout(function() {
  //       $(this).css('box-shadow', '0px 0px 3px #929292 inset');
  //       if ($(this).val() == "") {
  //           $(this).css('color', '#aaa');
  //           $(this).attr('type', 'text');
  //           $(this).val("password");
  //       }
  //   });
  // $('#login-overlay').click(function() {
  //   $('#login-overlay').fadeOut('fast');
  //   enableScroll();
  // });

  // $('#login-overlay-content').click(function(event) {
  //   event.stopPropagation();
  // });

  $('.links').css('background', surpriseColour);
  $('.right-links').css('background', surpriseColour);
  $('#login-go').css('background', surpriseColour);

  $('.colour').css("color", surpriseColour); // name
  $('h4').css("background-color", surpriseColour); // about, contact us etc. button background

  // title
  $('#title a').click(function() {
    $('#title a').removeClass('selected-viz');
    $(this).addClass('selected-viz');
    // temporary quick fix for Google Chrome Aug 2016 issue...
    setTimeout(function(){ document.body.style.zoom = "100.1%"; }, 100); // force resize/redraw...
    setTimeout(function(){ document.body.style.zoom = "100%"; }, 600);
  });

  // overlays stuffs
  $('#trigger-about').click(function() {
    if ($(window).width() > 600) {
      $('#dark-overlay').fadeIn(function() {
        $('#about').fadeIn();
      });
    }
    else
      alert('Sorry, this dialog is too big. Please load it on bigger screen');
  });

  $('#trigger-team').click(function() {
    if ($(window).width() > 600) {
      $('#dark-overlay').fadeIn(function() {
        $('#team').fadeIn();
      });
    }
    else
      alert('Sorry, this dialog is too big. Please load it on bigger screen');
  });

  $('#trigger-terms').click(function() {
    if ($(window).width() > 600) {
      $('#dark-overlay').fadeIn(function() {
        $('#termsofuse').fadeIn();
      });
    }
    else
      alert('Sorry, this dialog is too big. Please load it on bigger screen');
  });

  $('.close-overlay').click(function() {
    $('.overlays').fadeOut(function() {
      $('#dark-overlay').fadeOut();
    });
  });

  $('#dark-overlay').click(function() {
    $('.overlays').fadeOut();
    $('#dark-overlay').fadeOut();
  });
});