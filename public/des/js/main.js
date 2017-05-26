	
	//prevent # links from moving to top
	
	$('a[href="#"][data-top!=true]').click(function(e){
		e.preventDefault();
	});
	
	
	// SMOOTH SCROLL
	smoothScroll.init({
		offset: 0
	});
	
	
	// GALLERY
	if($('.popup-link').length > 0){	
		$('.popup-link').magnificPopup({ 
		  type: 'image',
		  gallery:{
			enabled:true
		  }
			// other options
		});
	}	
	
	
	
	
	// toggle menu
	$( ".menu-block" ).hide();
	
	$( ".toggle-nav" ).click(function() {
	  $( ".menu-block" ).slideToggle( "slow");
	});
	
	$( ".menu li a" ).click(function() {
	  $( ".menu-block" ).slideToggle( "slow");
	});
	
	
	// PORTFOLIO FILTER
		
	$(document).ready(function() {
	  $('ul#filter a').click(function() {
		$(this).css('outline','none');
		$('ul#filter .current').removeClass('current');
		$(this).parent().addClass('current');
		
		var filterVal = $(this).text().toLowerCase().replace(' ','-');
		

		
		if(filterVal == 'all') {
		  $('ul#portfolio-filter li.hidden').fadeIn('slow').removeClass('hidden');
		} else {
		  $('ul#portfolio-filter li').each(function() {
							
			if(!$(this).hasClass(filterVal)) {
			  $(this).fadeOut('normal').addClass('hidden');

				
			} else {
			$(this).fadeIn('slow').removeClass('hidden');

			}
		  });
		}
		
		return false;
	  });
	});
	
	
	// SCROLL

	$(window).scroll(function() {    
		var scroll = $(window).scrollTop();

		if (scroll >= 100) {
			$(".navbar-inverse").addClass("navbar-scroll");
		} else {
			$(".navbar-inverse").removeClass("navbar-scroll");
		}
				
	});
	
	
	
	// ONEPAGE ACTIVE LINK
	
	jQuery(document).ready(function() {
	
		var sections = $('section')
		  , nav = $('nav')
		  , nav_height = nav.outerHeight();
		 
		$(window).on('scroll', function () {
		  var cur_pos = $(this).scrollTop();
		 
		  sections.each(function() {
			var top = $(this).offset().top - nav_height,
				bottom = top + $(this).outerHeight();
		 
			if (cur_pos >= top && cur_pos <= bottom) {
			  nav.find('a').removeClass('active');
			  sections.removeClass('active');
		 
			  $(this).addClass('active');
			  nav.find('a[href="#'+$(this).attr('id')+'"]').addClass('active');
			}
		  });
		});
	});
	
	
	// SLIDER BACKGROUND (BACKSTRETCH)
	
	jQuery(document).ready(function () {
		if($('.slider-background').length > 0){
			 $.backstretch([
				  "static/des/img/bg4.jpg"
				, "static/des/img/bg5.jpg"
				, "static/des/img/bg2.jpg"
			  ], {duration: 4000, fade: 1000});
		}		
	});

	
	// MENU-TOGGLE

	jQuery(document).ready(function () {
		$( ".menu-toggle" ).click(function() {
			 $( ".menu" ).slideToggle( "slow", function() {
				// Animation complete.
			  });
			
		});
	});
	
	

	
	// SCROLL TO TOP
	
	$(document).ready(function(){

		// Check to see if the window is top if not then display button
		$(window).scroll(function(){
			if ($(this).scrollTop() > 100) {
				$('.scrollToTop').fadeIn();
			} else {
				$('.scrollToTop').fadeOut();
			}
		});
		
		// Click event to scroll to top
		$('.scrollToTop').click(function(){
			$('html, body').animate({scrollTop : 0},800);
			return false;
		});
		
	});	
	
	
	// PRELOADER
	
	// <![CDATA[
		$(window).load(function() { // makes sure the whole site is loaded
			$('#status').fadeOut(); // will first fade out the loading animation
			$('#preloader').delay(350).fadeOut('slow'); // will fade out the
														// white DIV that covers
														// the website.
			$('body').delay(350).css({'overflow':'visible'});
		})
	// ]]>
	
	
	// BANNER CAROUSEL
		
	$(document).ready(function() {
		if($('#slider').length > 0){	
			var owl = $("#slider");
		 
			owl.owlCarousel({			 
				// items : 1,
				
				autoPlay : true,
				pagination : true,
				singleItem:true	
			});
		  
			// Custom Navigation Events
			$(".next").click(function(){
				owl.trigger('owl.next');
			})
			$(".prev").click(function(){
				owl.trigger('owl.prev');
			})
		}

	});	
	
	// TESTIMONIAL CAROUSEL
		
	$(document).ready(function() {
		if($('#testimonial-carousel').length > 0){
			var owl = $("#testimonial-carousel");
		 
			owl.owlCarousel({			 
				// items : 1,
				
				autoPlay : true,
				pagination : true,
				singleItem:true	
			});
		  
			// Custom Navigation Events
			$(".next").click(function(){
				owl.trigger('owl.next');
			})
			$(".prev").click(function(){
				owl.trigger('owl.prev');
			})
		}

	});	
	
	// BLOG CAROUSEL
		
	$(document).ready(function() {
	
		if($('#blog-carousel, #blog-carousel2').length > 0){
			 var owl = $("#blog-carousel, #blog-carousel2");		 
				
			  owl.owlCarousel({
					items : 4,
					autoPlay : true,
					pagination : true
			  });
				
			  // Custom Navigation Events
			  $(".next").click(function(){
					owl.trigger('owl.next');
			  })
			  $(".prev").click(function(){
					owl.trigger('owl.prev');
			  })
		  }

	});	
	
	
	// WOW
	
	var wow = new WOW(
	  {
		boxClass:     'wow',      // animated element css class (default is
									// wow)
		animateClass: 'animated', // animation css class (default is animated)
		offset:       100,          // distance to the element when triggering
									// the animation (default is 0)
		mobile:       true,       // trigger animations on mobile devices
									// (default is true)
		live:         true,       // act on asynchronously loaded content
									// (default is true)
		callback:     function(box) {
		  // the callback is fired every time an animation is started
		  // the argument that is passed in is the DOM node being animated
		},
		scrollContainer: null // optional scroll container selector, otherwise
								// use window
	  }
	);
	wow.init();
	
	
	
	
	/* findCost와 sellCost 문구 바꾸기 */
	$(function() {
	if ($('#findCost .element').length > 0) {
		$("#findCost .element").typed(
				{
					strings : [ " ^1000 지금보다 저렴한", " ^1000 내 생활패턴에 맞는",
							" ^1000 간단한 질문 몇 가지로" ],
					typeSpeed : 60,
					loop : true,
					showCursor : false
				});
	}
	
	if ($('#sellCost .element').length > 0) {
		$("#sellCost .element").typed(
				{
					strings : [ " ^1000 마케팅이나 광고없이", " ^1000 추가적인 상담없이",
							" ^1000 오로지 내용으로 승부하는" ],
					typeSpeed : 60,
					loop : true,
					showCursor : false
				});
	}
  });
	
	
	 // COUNTDOWN
		
	
	if($('#countdown').length > 0){		
		 $('#countdown').countdown('2017/11/18', function(event) {
		   var $this = $(this).html(event.strftime(''
			 + '<div class="box"><span>%w</span><br> Weeks </div> '
			 + '<div class="box"><span>%d</span><br> days </div>  '
			 + '<div class="box"><span>%H</span><br> hr </div>  '
			 + '<div class="box"><span>%M</span><br> min </div> '
			 + '<div class="box"><span>%S</span><br> sec </div> '));			
		 });
	 }
	
	
	
// ****************************************************************
// Form Validation - Contact Form
// ****************************************************************
		
/*
 * Jquery Validation using jqBootstrapValidation example is taken from
 * jqBootstrapValidation docs
 */
 
 
  
$(document).ready(function() {	
	if($('#contactForm').length > 0){
    $("input,textarea").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {
            // something to have when submit produces an error ?
            // Not decided if I need it yet
        },
        submitSuccess: function($form, event) {
            event.preventDefault(); // prevent default submit behaviour
            // get values from FORM
            var name = $("input#name").val();
            var email = $("input#email").val();
            var message = $("textarea#message").val();
            var firstName = name; // For Success/Failure Message
            // Check for white space in name for Success/Fail message
            if (firstName.indexOf(' ') >= 0) {
                firstName = name.split(' ').slice(0, -1).join(' ');
            }
            $.ajax({
                url: "contact-process.php",
                type: "POST",
                data: {
                    name: name,
                    email: email,
                    message: message
                },
                cache: false,
                success: function() {
                    // Success message
                    $('#success').html("<div class='alert alert-success'>");
                    $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                        .append("</button>");
                    $('#success > .alert-success')
                        .append("Your message has been sent.");
                    $('#success > .alert-success')
                        .append('</div>');

                    // clear all fields
                    $('#contactForm').trigger("reset");
                },
                error: function() {
                    // Fail message
                    $('#success').html("<div class='alert alert-danger'>");
                    $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                        .append("</button>");
                    $('#success > .alert-danger').append("Sorry " + firstName + " it seems that my mail server is not responding... Could you please email me directly to <a href='mailto:me@example.com?Subject=Message_Me from myprogrammingblog.com;>me@example.com</a> ? Sorry for the inconvenience!");
                    $('#success > .alert-danger').append('</div>');
                    // clear all fields
                    $('#contactForm').trigger("reset");
                },
            })
        },
        filter: function() {
            return $(this).is(":visible");
        },
    });

    $("a[data-toggle=\"tab\"]").click(function(e) {
        e.preventDefault();
        $(this).tab("show");
    });
	
	 }
	
});


/* When clicking on Full hide fail/success boxes */
$('#name').focus(function() {
    $('#success').html('');
});
	
	
	
	
	
$(document).on('click','.navbar-collapse.in',function(e) {
    if( $(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle' ) {
        $(this).collapse('hide');
    }
});	
	
	

	