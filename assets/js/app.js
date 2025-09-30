var viewed = false;
var viewed_about = false;

window.onscroll = function() {
    animateAboutBottom()
    animateNumbers()
}

var width = window.innerWidth;

var documentHasScroll = function() {
    return window.innerHeight <= document.body.offsetHeight;
};

window.addEventListener('scroll', function (e) {
    var headernavbar = document.getElementById("headernavbar");
    var scrollable = headernavbar.offsetHeight;

    if (window.scrollY > scrollable) {
        var headerNavbarNav = document.querySelector('#headerNavbarNav')
        headernavbar.classList.add('scrolled');
    } else {
        headernavbar.classList.remove('scrolled');
    }
});


function animateAboutBottom(){
    var el = $(".about_bottom_section .animated_paragraph");
    if (isScrolledIntoView(el) && !viewed_about) {
        viewed_about = true;
        animateAboutText(el);
    }
}



$(document).ready(function () {
    // $("nav").removeClass("no-transition");
    /* MENU */
    $('.navbar-nav').attr('id', 'menu'); // please don't remove this line
    $('<div class="calendar-top"></div>').insertBefore("#calendar");
    $('<div class="card-profile-top"></div>').insertBefore(".card.profile.card-profile");
    var divs = $(".card-profiles > div");
    for (var i = 0; i < divs.length; i += 2) {
        divs.slice(i, i + 2).wrapAll('<div class="col-xs" />');
    }

    // $('.library .library-item .btn-primary').each(function (){
    //     $(this).html('<i></i> Download');
    // });


    $('.malta .label1').text('95% urban population');
    $('.malta .label2').text('Tourism-driven rconomy');
    $('.malta .label3').text('Highly-urbanised landscpae');
    $('.greece .label1').text('Diverse geography');
    $('.greece .label2').text('Growing urbanisation');
    $('.greece .label3').text('Strong tourism and agriculture');
    $('.cyprus .label1').text('60% urban population');
    $('.cyprus .label2').text('Tourism and construction-led economy');
    $('.cyprus .label3').text('Coastal and mountainous terrain');
    $('.bulgaria .label1').text('70% urban population');
    $('.bulgaria .label2').text('Diverse economy');
    $('.bulgaria .label3').text('Mountainous heartland and lowlands');


    var headerNavbar = $('#headerNavbar');
    var width100 = $('.width100');
    var innerWidth = $('body').innerWidth();
    headerNavbar.width(innerWidth);
    width100.width(innerWidth);

    $('.nav-item').children("a").each(function () {
        if ($(this).attr('data-toggle') == 'dropdown') {
            $(this).removeAttr('data-toggle')
        }
    });

    $("nav").removeClass("no-transition");

    if (width < 992) { // mobile
        $('#menuToggle input[type="checkbox"]').change(function () {
            var checked = $(this).is(":checked");
            if (checked) {
                $('#menu').show("slide", { direction: "right" }, 400);
                $('#search').hide();
                $('#menu, #menu *').css({
                    'visibility': 'visible'
                });
                $('body', 'html').css({
                    'overflow': 'hidden'
                });
            } else {
                $('#menu').hide("slide", { direction: "right" }, 400);
                $('#search').hide();
                $('body', 'html').css({
                    'overflow': 'auto'
                });
            }
        });
    }


    $('body').on('click', '.work_packages .accordion-toggle', function () {
        if ($(this).children().find(".accordion-content").is(':visible')) {
            $(this).children().find(".accordion-content").slideUp(300);
            $(this).children().find(".plusminus").html('<span class="plus">Read more</span>');
        } else {
            $(this).children().find(".accordion-content").slideDown(300);
            $(this).children().find(".plusminus").html('<span class="minus">Read less</span>');
        }
    });

    $('.work_packages .accordion-content').each(function (index, value) {
        $(value).find('a').attr("onclick", "window.open(this.href, '_blank');")
    });

    $('.nav-item').children("a").each(function () {
        if ($(this).attr('data-toggle') == 'dropdown') {
            $(this).removeAttr('data-toggle')
        }
    });

    $("nav").removeClass("no-transition");

    if (window.location.hash) {
        var link = window.location.hash;
        var anchorId = link.substr(link.indexOf("#") + 1);
        if ($("#" + anchorId).offset()) {
            $('html, body').animate({
                scrollTop: $("#" + anchorId).offset().top - 150
            }, 500);
        } else {
            $('.accordion-border').each(function () {
                var title = $(this).find(".accordion-toggle .col-xs.start-xs").text().toUpperCase();
                var toggler = $(this).find(".accordion-toggle");
                if (title.indexOf(anchorId.toUpperCase()) >= 0 && !toggler.next(".accordion-content").is(':visible')) {
                    $('html, body').animate({
                        scrollTop: toggler.parent().offset().top - 150
                    }, 500);
                    toggler.trigger("click");
                }
            });
        }
    }

    // $('.sticked_image').parents().css("overflow", "visible");

    $('.dropdown a').click(function (event) {

        if (location.href.indexOf("#") != -1) {
            var link = $(this).attr('href');
            var anchorId = link.substr(link.indexOf("#") + 1);
            if ($("#" + anchorId).length > 0) {
                $('html, body').animate({
                    scrollTop: $("#" + anchorId).offset().top - 150
                }, 500);
            } else {
                // event.preventDefault();
                $("path[title='" + anchorId.toUpperCase() + "']").addClass('active_path');

                $('.accordion-border').each(function () {
                    var title = $(this).find(".accordion-toggle .col-xs.start-xs").text().toUpperCase();
                    var toggler = $(this).find(".accordion-toggle");
                    if (title.indexOf(anchorId.toUpperCase()) >= 0 && !toggler.next(".accordion-content").is(':visible')) {
                        $('html, body').animate({
                            scrollTop: toggler.parent().offset().top - 150
                        }, 500);
                        toggler.trigger("click");
                        event.preventDefault();
                    }
                });
            }
        }
    });


    $('.work_packages .accordion-content, .messages .accordion-toggle').each(function (index, value) {
        $(value).find('a').attr("onclick", "window.open(this.href, '_blank');")
    });

    $('.nav.nav-pills').removeAttr('id');

    var count = $("h1").text().length;



    $('.news-image-hover').click(function () {
        var url = $(this).find('a.more').attr('href');
        window.location.href = url;
    });
    $('.library-item').attr('data-aos', 'fade-up');
    $('.about_timeline_container').attr('data-aos', 'fade-up');
    $('.entry_item ').attr('data-aos', 'fade-up');

    $('.see_all_partners_link').hide();

    $(".timeline_container.left .blue_line").width(function () {
        return (innerWidth - $('.container').width()) / 2;
    });


    $('.dorsal').click(function () {
        var link = $(this);
        link.parent().parent().find('.toogle-contact-paragraphs').slideToggle('slow', function () {
            if ($(this).is(':visible')) {
                link.text('Read less');
            } else {
                link.text('Read more');
            }
        });

    });

    $('.events .tabs, .partners .tabs, .objectives .tabs, .demonstration-hubs .tabs').each(function(){
        // For each set of tabs, we want to keep track of
        // which tab is active and its associated content
        var $active, $content, $links = $(this).find('a');
        var speed = "fast";
        var activeTab = $(location.hash);
        // If the location.hash matches one of the links, use that as the active tab.
        // If no match is found, use the first link as the initial active tab.
        $active = $($links.filter("[href=\'"+location.hash+"\']")[0] || $links[0]);

        if($(this).parent().parent().hasClass('videos')){
            $active.addClass('active');
        }

        if($(this).parent().parent().hasClass('events')){
            $active.addClass('active');
        }
        if($(this).parent().hasClass('partners')){
            $active.addClass('active');
        }
        if($(this).parent().parent().hasClass('objectives')){
            $active.addClass('active');
        }
        if($(this).parent().parent().hasClass('demonstration-hubs')){
            $active.addClass('active');
        }

        $content = $($active[0].hash);

        // Hide the remaining content
        $links.not($active).each(function () {
            $(this.hash).hide();
        });

        if(activeTab.length){
            $content.fadeIn(speed);
            //scroll to element
            $('html, body').animate({
                scrollTop:  activeTab.offset().top - $('header').height()
            }, speed);
        }

        // Bind the click event handler
        $(this).find("a").click(function (e) {
            if($(this).hasClass('active')) {
                $content.fadeIn({
                    scrollTop: $content.offset().top - $('header').height()
                }, speed);
                var screenSize = getScreenSize();
                if (screenSize.width < 800) {
                    // scroll to element
                    $('html, body').animate({
                        scrollTop: $content.offset().top - $('header').height() + 300  // mobile
                    }, speed);
                }else{
                    //scroll to element icons top
                    $('html, body').animate({
                        scrollTop:  $content.offset().top - $('header').height() + 300
                    }, speed);
                }
                e.preventDefault();
                return false;
            }
            // Make the old tab inactive.
            $active.removeClass('active');
            $content.hide();

            // Update the variables with the new link and content
            $active = $(this);
            $content = $(this.hash);

            location.hash = $active[0].hash;

            // Make the tab active.
            $active.addClass('active');
            $content.fadeIn({
                scrollTop: $content.offset().top - $('header').height()
            }, speed);

            // Prevent the anchor\'s default click action
            e.preventDefault();
        });
    });



    // bootstrap 3 responsive multi column slick carousel
    if($('#slick').length){
        $('#slick').slick({
            autoplay: true,
            autoplaySpeed: 1000,
            centerMode: true,
            centerPadding: '50px',
            slidesToShow: 6,
            slidesToScroll: 2,
            focusOnSelect: false,
            dots: false,
            infinite: true,
            responsive: [
                {
                    breakpoint: 768,
                    settings: {
                        arrows: false,
                        dots: true,
                        centerMode: false,
                        centerPadding: '2px',
                        slidesToShow: 1
                    }
                }
            ]
        });
    }

});


function expandBiography(el){
    $el = $(el) // read-more link
    $body  = $el.parent().parent().find('.body');
    if($body.is(':visible')){
        $body.slideUp(300);
        $el.addClass('expanded');
    }else{
        $body.slideDown(300);
        $el.removeClass('expanded');
    }
}

function expandReadMore(el) {
    var $el, $ps, $up, totalHeight;

    totalHeight = 115;

    $el = $(el) // read-more link

    $up = $el.parent(); // coordinator_info

    if ($el.text() == "Read more") {

        $ps = $up.find("p");

        // measure how tall inside should be by adding together heights of all inside paragraphs (except read-more paragraph)
        $ps.each(function () {
            totalHeight += $(this).outerHeight();
        });

        $up.addClass('changed');

        $el.css({
            top: totalHeight - 120
        });
        // $el.html('<a class="revert" href="" onclick="revertChanges(this);">Read less</a>');

        $up.css({
            // Set height to prevent instant jumpdown when max height is removed
            "height": $up.height(),
            "max-height": 9999,
        })
            .animate({
                "height": totalHeight
            });

        //Stuff to do when btn is in the read more state
        $el.html("Read less");
        // $up.slideDown();
    } else {

        $up.removeClass('changed');

        $el.css({
            top: 53
        });
        // $el.html('<a class="revert" href="" onclick="revertChanges(this);">Read less</a>');

        $up.css({
            // Set height to prevent instant jumpdown when max height is removed
            "height": $up.height(),
            "max-height": 460,
        })
            .animate({
                "height": totalHeight
            });
        //Stuff to do when btn is in the read less state
        $el.html("Read more");

        $('html, body').animate({
            scrollTop: $up.offset().top - $('header').height()
        });
    }
    return false;
}

function onHashChange() {
    $("path").removeClass('active_path');
    $(".accordion-content").hide();
    var caseStudiesHashTitle = location.hash;

    if (caseStudiesHashTitle) {
        var caseStudiesTitle = caseStudiesHashTitle.substring(1, caseStudiesHashTitle.length);
        $("path[title='" + caseStudiesTitle.toUpperCase() + "']").addClass('active_path');


    }
}

function encodeURIObject(data) {
    return Object.keys(data).map(function (i) {
        return encodeURIComponent(i) + '=' + encodeURIComponent(data[i])
    }).join('&');
}


function redirectAndRefresh(url) {
    $(".tabs a").each(function () {
        this.href = window.location.hash;
    });
    window.open(url, '_blank');
    location.reload();
}

function isBreakpointLarge() {
    return window.innerWidth <= 991;
}

function showSearchForm() {
    $('#layout-header').toggleClass('full-width');
    $('#search').toggle();
    $('.navbar a.p-search').css('visibility', 'hidden');
    $('#menu li').hide();
}

function hideSearchForm() {
    $('#layout-header').toggleClass('full-width');
    $('#search').hide();
    $('.navbar a.p-search').css('visibility', 'visible');
    $('#menu li').show();
}

function requestFormLibrary() {
    $('#mylibraryForm').on('click', 'a', function () {
        var $form = $(this).closest('form');
        $form.request();
    })
}

function getScreenSize() {
    var myHeight = 0;
    var myWidth = 0;
    if (window.innerWidth && window.innerHeight) {
        // Netscape & Mozilla
        myHeight = window.innerHeight;
        myWidth = window.innerWidth;
    } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
        // IE > 6
        myHeight = document.documentElement.clientHeight;
        myWidth = document.documentElement.clientWidth;
    } else if (document.body.offsetWidth && document.body.offsetHeight) {
        // IE = 6
        myHeight = document.body.offsetHeight;
        myWidth = document.body.offsetWidth;
    } else if (document.body.clientWidth && document.body.clientHeight) {
        // IE < 6
        myHeight = document.body.clientHeight;
        myWidth = document.body.clientWidth;
    }

    return { 'width': myWidth, 'height': myHeight };
}

function init() {
    window.addEventListener('resize', function () {
        if (isBreakpointLarge()) {
            $('#card-carousel').slick('unslick');
        } else {
            if (typeof cardCarousel === 'function') {
                cardCarousel({
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    autoplay: true,
                    autoplaySpeed: 6000,
                    prevArrow: '<i class="slick-prev"/>',
                    nextArrow: '<i class="slick-next"/>',
                });
            }
        }
        // keepFooter(documentHasScroll());

    });
    document.addEventListener('DOMContentLoaded', function () {
        if (!isBreakpointLarge()) {
            if (typeof cardCarousel === 'function') {
                cardCarousel({
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    autoplay: true,
                    autoplaySpeed: 6000,
                    prevArrow: '<i class="slick-prev"/>',
                    nextArrow: '<i class="slick-next"/>',
                });
            }
        }
        requestFormLibrary();
    });
    appendSignIn()
    appendSignOut()
}


function scrollToField(errors) {
    $(".get_involved_form input, .get_involved_form select, .get_involved_form .row").removeClass('red_err_field');
    $.each(errors.scroll_to_field, function (key, valueObj) {
        $("#" + key).addClass('red_err_field');
        $('html, body').animate({
            scrollTop: $("#" + key).offset().top - 200
        }, 1000);
        return false; // breaks
    });
}

function appendProfile() {
    $(document).on('profile', function (e) {
        var headerNavbarNav = $('#headerNavbarNav');
        var li = '<li class="nav-item"><a href="/profile" target = "_self">Profile</a></li >';
        headerNavbarNav.find('>ul').append(li);
    });
}
function appendSignIn(){
    $(document).on('signin', function (e) {
        var headerNavbarLogin = $('#headerNavbarNav');
        var li = '<li class="nav-item sign-in"><a href="/login" target = "_self">Login</a></li >';
        headerNavbarLogin.find('>ul').append(li);
        var menu = $('#menuToggle');
        menu.find('>ul').append(li);
    });
}

function appendSignOut() {
    $(document).on('signout', function (e) {
        var headerNavbarNav = $('#headerNavbarNav');
        var li = '<li class="nav-item  sign-in"><a data-request="onLogout" data-request-data="redirect: \'/\'">Logout</a></li >';
        headerNavbarNav.find('>ul').append(li);
        var menu = $('#menuToggle');
        menu.find('>ul').append(li);
    });
}


init()
