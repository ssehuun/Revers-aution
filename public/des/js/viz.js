var mode = "exploration";
var codetraceColor = 'white';

// codetrace highlight
function highlightLine(lineNumbers) {  /* lineNumbers can be an array or a single number. Yay overloading! */
  $('#codetrace p').css('background-color', colourTheThird).css('color', codetraceColor);
  if (lineNumbers instanceof Array) {
    for (var i = 0; i < lineNumbers.length; i++)
      if (lineNumbers[i] != 0)
        $('#code'+lineNumbers[i]).css('background-color', 'black').css('color', 'white');
  }
  else
    $('#code'+lineNumbers).css('background-color', 'black').css('color', 'white');
}

var isPlaying = false;

// Opening and closing panels
var isActionsOpen = true, isStatusOpen = false, isCodetraceOpen = false;
var cur_slide = 1;
var last_click = 0;

// vars actionsWidth and statusCodetraceWidth must be defined in the specific visualization module
function showActionsPanel() {
  if (!isActionsOpen) {
    $('#actions-hide img').removeClass('rotateLeft').addClass('rotateRight');
    $('#actions').animate({
      width: "+=" + actionsWidth,
    });
    isActionsOpen = true;
  }
}

function hideActionsPanel() {
  if (isActionsOpen) {
    $('#actions-hide img').removeClass('rotateRight').addClass('rotateLeft');
    $('#actions').animate({
      width: "-=" + actionsWidth,
    });
    isActionsOpen = false;
  }
}

function showStatusPanel() {
  if (!isStatusOpen) {
    $('#status-hide img').removeClass('rotateLeft').addClass('rotateRight');
    $('#current-action').show();
    $('#status').animate({
      width: "+=" + statusCodetraceWidth,
    });
    isStatusOpen = true;
  }
}

function hideStatusPanel() {
  if (isStatusOpen) {
    $('#status-hide img').removeClass('rotateRight').addClass('rotateLeft');
    $('#current-action').hide();
    $('#status').animate({
      width: "-=" + statusCodetraceWidth,
    });
    isStatusOpen = false;
  }
}

function showCodetracePanel() {
  if (!isCodetraceOpen) {
    $('#codetrace-hide img').removeClass('rotateLeft').addClass('rotateRight');
    $('#codetrace').animate({
      width: "+=" + statusCodetraceWidth,
    });
    isCodetraceOpen = true;
  }
}

function hideCodetracePanel() {
  if (isCodetraceOpen) {
    $('#codetrace-hide img').removeClass('rotateRight').addClass('rotateLeft');
    $('#codetrace').animate({
      width: "-=" + statusCodetraceWidth,
    });
    isCodetraceOpen = false;
  }
}

function triggerRightPanels() {
  hideEntireActionsPanel();
  showStatusPanel();
  showCodetracePanel();
}

function extractQnGraph(graph) {
  var vList = graph.internalAdjList;
  var eList = graph.internalEdgeList;
  for (var key in vList) {
    var temp;
    var v = vList[key];
    temp = v.cxPercentage;
    v.cxPercentage = v.cx;
    v.cx = (temp / 100) * MAIN_SVG_WIDTH;
    temp = v.cyPercentage;
    v.cyPercentage = v.cy;
    v.cy = (temp / 100) * MAIN_SVG_HEIGHT;
  }
  return graph;
}

function rateGraph() {
  var rating = $(this).attr('id').substring(18);
  $.ajax({
    url: PHP_DOMAIN + '/php/Graph.php?mode=' + MODE_ADD_SUBMITTED_GRAPH_RATING,
    type: "POST",
    data: {graphID: randomGraphID, rating: rating}
  }).done(function(data) {
    $('#rate-sample-graph').hide();
  });
}

function hoverRating() {
  var rating = $(this).attr('id').substring(18);
  for (var i = 1; i <= 5; i++)
    $('#rate-sample-graph-'+i).html('&#9734;');
  for (var i = 1; i <= rating; i++)
    $('#rate-sample-graph-'+i).html('&#9733;');
}

$(function() {
  // playback control
  $("#speed-input").slider({
    min: 200,
    max: 2000,
    value: 1500, // previously 1700, I make the default slower
    change: function(event, ui) {
      gw.setAnimationDuration(2200-ui.value);
    }
  });

  $("#progress-bar").slider({
    range: "min",
    min: 0,
    value: 0,
    slide: function(event, ui) {
      gw.pause();
      gw.jumpToIteration(ui.value, 0);
    },
    stop: function(event, ui) {
      if (!isPaused) {
        setTimeout(function() {
          gw.play();
        }, 500)
      }
    }
  });

  var actionsHeight = ($('#actions p').length) * 27 + 10;
  $('#actions').css('height', actionsHeight);
  $('#actions').css('width', actionsWidth);
  var actionsHideTop = Math.floor((actionsHeight-16) / 2);
  var actionsHideBottom = (actionsHeight-16) - actionsHideTop;
  $('#actions-hide').css('padding-top', actionsHideTop);
  $('#actions-hide').css('padding-bottom', actionsHideBottom);

  $('#current-action').hide();
  $('#actions-hide img').addClass('rotateRight');

  $('.rating-star').hover(hoverRating, function() {
    for (var i = 1; i <= 5; i++) {
      $('#rate-sample-graph-' + i).html('&#9734;');
    }
  });
  $('.rating-star').click(rateGraph);

  // surpriseColour stuff
  $('.tutorial-end').css("background-color", surpriseColour);
  $('.tutorial-prev').css("background-color", surpriseColour);
  $('.tutorial-next').css("background-color", surpriseColour);
  if (surpriseColour == "#fec515" || surpriseColour == '#a7d41e') {
    //$('.tutorial-next').css("color", "black"); // this is the source of bug (sometimes next button is black?)
    $('.tutorial-next img').attr("src", "img/arrow_black_right.png");
  }
  $('#progress-bar .ui-slider-range').css("background-color", surpriseColour);

  $('#actions').css("background-color", colourTheSecond);
  $('#actions-hide').css("background-color", colourTheSecond);
  $('.action-menu-pullout').css('left', actionsWidth+43+'px');
  $('.action-menu-pullout').children().css('float', 'left');
  $('.coloured-menu-option').css("background-color", colourTheSecond).css('color', 'white');
  // this part causes color bug :(..., I turn it off
  // if (colourTheSecond == '#fec515' || colourTheSecond == '#a7d41e') {
    // //$('#actions p').css('color', 'black');
    // $('#actions p').hover(function() {
    //   $(this).css('color', 'white');
    // }, function() {
    //   $(this).css('color', 'black');
    // });
    // $('.coloured-menu-option').css('color', 'black');
    // $('.coloured-menu-option').hover(function() {
    //   $(this).css('color', 'white');
    // }, function() {
    //   $(this).css('color', 'black');
    // });
    // $('#actions-hide img').attr('src', 'img/arrow_black_right.png');
  // }

  $('#codetrace').css("background-color", colourTheThird);
  $('#codetrace-hide').css("background-color", colourTheThird);
  if (colourTheThird == '#fec515' || colourTheThird == '#a7d41e') {
    $('#codetrace').css('color', 'black');
    $('#codetrace-hide img').attr('src', 'img/arrow_black_right.png');
    codetraceColor = 'black';
  }

  $('#status').css("background-color", colourTheFourth);
  $('#status-hide').css("background-color", colourTheFourth);
  if (colourTheFourth == '#fec515' || colourTheFourth == '#a7d41e') {
    $('#status').css('color', 'black');
    $('#status-hide img').attr('src', 'img/arrow_black_right.png');
  }

  // mode menu
  $('#mode-button').click(function() {
    $('#other-modes').toggle();
  });
  $('#mode-menu').hover(function() {
    $('#other-modes').toggle();
  });

  $('#mode-menu a').hover(function() {
    $(this).css("background", surpriseColour);
  }, function() {
    $(this).css("background", "black");
  });

  function loadtut() {
    mode = "tutorial";
    if (isPlaying) stop();
    // if (cur_slide == 1) {
      $('#status-hide').show();
      $('#codetrace-hide').show();
      $('#actions-hide').show();
      $('#current-action').html("");
      $('#status').show();
      $('#codetrace').show();
      $('#actions').show();
      hideEntireActionsPanel();
      hideStatusPanel();
      hideCodetracePanel();
      $('#tutorial-2 .tutorial-prev').click();
    // }
    // else
    //   $('#tutorial-' + (cur_slide-1) + ' .tutorial-next').click(); // ask previous slide to load this slide
  }

$('#mode-menu a').click(function() {
  var currentMode = $('#mode-button').attr('mode'); // html().split("<")[0];
  var newMode = $(this).attr('mode'); // html();
  var tmp = $('#mode-button').html().substring(0, $('#mode-button').html().length-2);
  $('#mode-button').html($(this).html() + ' &#9663;'); // + '<img src="img/arrow_white.png"/>');
  $(this).html(tmp);

  if (currentMode == "explore") { // Tutorial Mode") {
    loadtut();
    $('#mode-button').attr('mode', 'tutorial');
  }
  else if (newMode == "tutorial") { // Exploration Mode") {
    mode = "exploration";
    $('#mode-button').attr('mode', 'explore');
    $('#status-hide').show();
    $('#codetrace-hide').show();
    $('#actions-hide').show();
    $('#status').show();
    $('#codetrace').show();
    $('#actions').show();
    $('.tutorial-dialog').hide();
    hideStatusPanel();
    hideCodetracePanel();
    showActionsPanel();
    /*} else if(newMode=="Training Mode") {
     mode = "training";
     $('#status').hide();
     $('#codetrace').hide();
     $('#actions').hide();
     $('#status-hide').hide();
     $('#codetrace-hide').hide();
     $('#actions-hide').hide();
     */
  }
});

  // arrow buttons to show/hide panels 
  $('#status-hide').click(function() {
    if (isStatusOpen)
      hideStatusPanel();
    else
      showStatusPanel();
  });

  $('#codetrace-hide').click(function() {
    if (isCodetraceOpen)
      hideCodetracePanel();
    else
      showCodetracePanel();
  });

  $('#actions-hide').click(function() {
    if (isActionsOpen)
      hideEntireActionsPanel(); // as each visualization is different, we must define a custom hideEntireActionsPanel() function in visualization module
    else
      showActionsPanel();
  });

  // tutorial mode
  $('.tutorial-dialog .tutorial-end').click(function() {
    $(".menu-highlighted").removeClass("menu-highlighted");
    $("#mode-menu a").trigger("click");
    cur_slide = 1; // for now, reset to front
  });

  $('.tutorial-dialog .tutorial-prev').click(function() {
    $(".menu-highlighted").removeClass("menu-highlighted");
    var this_click = (new Date()).getTime();
    if ((this_click - last_click) < 200) return; // more than 0.2s delay
    last_click = this_click;

    var nextNo = parseInt($(this).parent().attr('id').split('-')[1])-1;
    var nextId = 'tutorial-' + nextNo;
    cur_slide = nextNo;
    $(this).parent().fadeOut(100, function() {
      $('#'+nextId).fadeIn(100);
    });
  });

  $('.tutorial-dialog .tutorial-next').click(function() {
    $(".menu-highlighted").removeClass("menu-highlighted");
    var this_click = (new Date()).getTime();
    if ((this_click - last_click) < 200) return; // more than 0.2s delay
    last_click = this_click;

    var nextNo = parseInt($(this).parent().attr('id').split('-')[1])+1;
    var nextId = 'tutorial-' + nextNo;
    cur_slide = nextNo;
    $(this).parent().fadeOut(100, function() {
      $('#'+nextId).fadeIn(100);
    });
  });

  $(document).keydown(function(event) {
    if (event.which == 32) { // spacebar
      if (isPaused)
        play();
      else
        pause();
    }
    else if (event.which == 37) { // left arrow
      if (mode == "tutorial")
        $('#tutorial-' + cur_slide + ' .tutorial-prev').click();
      else
        stepBackward();
      event.preventDefault(); // don't change the cursor position
    }
    else if (event.which == 39) { // right arrow
      if (mode == "tutorial")
        $('#tutorial-' + cur_slide + ' .tutorial-next').click();
      else
        stepForward();
      event.preventDefault(); // don't change the cursor position
    }
    else if (event.which == 27) { // escape (turn on/off lecture mode)
      $(".menu-highlighted").removeClass("menu-highlighted");
      $("#mode-menu a").trigger("click");
      cur_slide = 1; // for now, reset to front
    }
    else if (event.which == 35) // end
      stop();
    else if (event.which == 189) { // minus
      var d = (2200-gw.getAnimationDuration()) - 100;
      $("#speed-input").slider("value", d > 0 ? d : 0);
    }
    else if (event.which == 187) { // plus
      var d = (2200-gw.getAnimationDuration()) + 100;
      $("#speed-input").slider("value", d <= 2000 ? d : 2000);
    }
  });
});



var isPaused = false;
function isAtEnd() {
  return (gw.getCurrentIteration() == (gw.getTotalIteration()-1));
}

function pause() {
  if (isPlaying) {
    isPaused = true;
    gw.pause();
    $('#play').show();
    $('#pause').hide();
  }
}

function play() {
  if (isPlaying) {
    isPaused = false;
    $('#pause').show();
    $('#play').hide();
    if (isAtEnd())
      gw.replay();
    else
      gw.play();
  }
}

function stepForward() {
  if (isPlaying) {
    pause();
    gw.forceNext(250);
  }
}

function stepBackward() {
  if (isPlaying) {
    pause();
    gw.forcePrevious(250);
  }
}

function goToBeginning() {
  if (isPlaying) {
    gw.jumpToIteration(0, 0);
    pause();
  }
}

function goToEnd() {
  if (isPlaying) {
    gw.jumpToIteration(gw.getTotalIteration()-1, 0);
    pause();
  }
}

function stop() {
  gw.stop();
  isPaused = false;
  isPlaying = false;
  $('#pause').show();
  $('#play').hide();
}