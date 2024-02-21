
// ----- Global vars -------

// is the site running local or remote? if it's local, the URL's subdomain would be "local"
var pISLOCAL = (document.domain.substr(0, 5) == "local");

// is it us running a test? if so, the URL would have a "test" querystring
var pISTEST = (UTIL_querystring("test") != "");

// is it generating HTML?
var pISGENERATE = (UTIL_querystring("generatehtml") != "");

// current item
var item = 1;
var theEnd = false;

// current shared item id
var sharedItem = 0;

// have menu slideshows been populated already?
var slideshowsMenuPopulated = false;

// load taboola ads?
var Taboola = ((!pISTEST && !pISLOCAL) || pISGENERATE);
var TaboolaLoaded = false;

// should we show the GA alert when working on local?
var GAshowalert = false;



// ------ Slideshow --------

// show a fact on screen
function getItem( isPrev , goTo ) {

	// if no specific item was specified...
	if (goTo==null) {

		// set current item number.. either if we are going backwards (PREV)
		if (isPrev) { 
			item -= 1; 
			theEnd = false; 

		// ... or we are going forward (NEXT)...
		} else { 

			item += 1;

		};

	// if a specific item was specified... go to it
	} else {
		item = goTo;
	}


	// if the item requested is before the first...
	if (item < 1) { 

		// --- go to the PREV button's URL, if there is one, and get out of here ----

		// reset item # and theEnd and get out
		item = 1;
		theEnd = false;

		var prevPage = $("#prevA").attr("href");
		if (prevPage!='' && prevPage!='#') { 
			location = prevPage + '#gi' + pageSize;
		} else {			
			return false;
		}


	// if the item requested is above the last one... and we haven't shown theEnd even thou we should because current page is 1...
	} else if (item >= totalItems && (!theEnd && pageN==1)) {

		// --- show theEnd ----

		// set flag for theEnd of the collection
		theEnd = true;
		

		

		// load taboola
		if (Taboola) {
			window._taboola = window._taboola || [];
			_taboola.push({mode:'thumbs-2r', container:'taboola-endslate', placement:'endslate'});
			_taboola.push({flush:true});
		}
 
		// hide all items
		$(".i").hide()

		// show the end
		$("#fe").css("opacity", "1");
		$("#fe").show();

		// g analytics
		GApageview( pageURL + "/TheEnd"); 		

		$("#nextA").hide();
	// if the item requested is above the last one... and we have shown theEnd or the current page 1...
	} else if (item > totalItems && (theEnd || pageN > 1)) {

		// --- go to the NEXT button's URL ---
		location = $("#nextA").attr("href");


	// in any other case.. 
	} else {


		// ------ load images
		if (!isPrev) { 
			if (item==2) { loadImgs( item ) }; 
			loadImgs( item + 1 ); 
		}


		// ------ buttons and ads 

		// hide "The End", if it was on and PREV was requested
		if (theEnd && isPrev) { $("#fe").hide() };

		// show / hide the prev button
		if (item > 1 || pageN > 1) { $("#prevA").show() } else { $("#prevA").hide() };
		$("#nextA").show();
		

		// ------ move the slider

		//  move the previous item to the left... move the current item to the middle... move the next item to the right
		$(".i").hide()
		getItemSlideEffect( -2, isPrev );
		getItemSlideEffect( -1, isPrev );
		getItemSlideEffect( 0,  isPrev );
		getItemSlideEffect( +1, isPrev );


		//------- Analytics

		// Analytics: Add this as a pageview.. if it's not a single fact, which was already added when loading
		if (!isPrev && pageType != "SingleFact") { GApageview( pageURL + "/Item" + item ) }
      
	}


	//---- Load taboola if it was never loaded
	if (Taboola && !TaboolaLoaded) { loadTaboola() }

}

function loadImgs( i ) {
	var iN = $("#i" + i);
	if (iN.length > 0) {
		iN.find("img[src2]").each( function( index, element ){
   			$(this).attr("src", $(this).attr("src2"));
			$(this).removeAttr("src2")
		});
	}
}

function getItemSlideEffect( i, isPrev ) {
	var obj = $("#items").find("ol").find("#i" + (item + i));
	if (obj==null) { return false };

	switch(i) {
		case -2:
			obj.animate({ opacity: "0.3", left: "-200%" }, 500);
			break;
		case -1:
			if (isPrev) { obj.css("left", "-200%") };
			obj.show();
			obj.animate({ opacity: "0.3", left: "-100%" }, 500);
			break;

		// place the item on the screen
		case 0: 
			if (isPrev) { obj.css("left", "-100%") };
			obj.show();
			obj.animate({ opacity: "1", left: "0%" }, 500);
			break;

		// place the item up next
		case 1:
			obj.css("left", (!isPrev ? "200%" : "0%"));
			obj.show();
			obj.animate({ opacity: "0.3", left: "100%" }, 500);
			break;			
	}
}



// page key down (when a keyboard key was pressed) 
function pKeyDown(e) {
	var evt = e || window.event;
	var alertVisible = $(".alert").is(":visible");

	// if the key was the -> arrow... get next slide
	if (evt.keyCode == 39 && !alertVisible) { 
		getItem();

	// if the key was the <- arrow... get prev slide
	} else if (evt.keyCode == 37 && !alertVisible) { 
		getItem( true ); 

	// if the key was ESCAPE.. hide all alerts
	} else if (evt.keyCode == 27 && alertVisible) { 
		$(".alert").hide();
	}
}



// ------ Categories --------

function categories_show(mainCategory, category, isOnMouseOver) {

	// show the main categories menu
	$("#mainCategories_menu").show();

	// are we in mobile mode?
	var isMobileMode = $("#mainCategories_menu img").is(":visible") == false
	if (isMobileMode && isOnMouseOver){ return false }

	// show the back
	$("#categories_menu_back").show();

	// if a main category was specified...
	if (mainCategory!=null) {

		// color the main category
		$("#mainCategories_menu div").removeClass("mainCategories_menu_selected");
		$("#mainCategories_menu_" + mainCategory).addClass("mainCategories_menu_selected");

		// if we are in mobile mode.. put the subcategories under this main category
		if (isMobileMode) {
			$(".categories_menu_" + mainCategory).addClass("categories_menu_selectedmobile");
			$("#mainCategories_menuMobile_" + mainCategory).append( $(".categories_menu_" + mainCategory) );
			$("#mainCategories_menuMobile_" + mainCategory).show();
		}

		// hide all categories
		$("#categories_menu_left div").hide();

		// show only the categories from the main category selected
		$(".categories_menu_" + mainCategory).show();

		// show the categories menu
		$("#categories_menu").show();

		// hide the slideshows menu
		$("#slideshows_menu").hide();

		// position the right arrow
		$("#categories_menu_right img").css("padding-top", $("#mainCategories_menu_" + mainCategory).offset().top - $("#categories_menu").offset().top  )

	}

	// if a category was specified...
	if (category!=null) {

		// color the category
		$("#categories_menu div").removeClass("mainCategories_menu_selected");
		$("#categories_menu_" + category).addClass("mainCategories_menu_selected");

		// hide all slides
		$("#slideshows_menu_left div").hide();

		// if we are in mobile mode.. put the slideshows under this category
		if (isMobileMode) {
			$(".categories_menuMobile").hide();
			//$("#slideshows_menu_left").append( $(".slideshows_menu_item") );
			$("#categories_menuMobile_" + category).append( $(".slideshows_menu_" + category) );
			$("#categories_menuMobile_" + category).css("display","block");
			$('html, body').animate({
			        scrollTop: $("#categories_menu_" + category).offset().top
			}, 1000);
		}

		// show only the categories from the main category selected
		$(".slideshows_menu_" + category).show();

		// show the slideshows menu
		$("#slideshows_menu").show();
		
		// position the right arrow
		var arrowpos = $("#categories_menu_" + category).offset().top - $("#slideshows_menu").offset().top;
		$("#slideshows_menu_right img").css("padding-top", arrowpos  )

		// if the right arrow is located below the end of the menu.. enlarge the menu.. otherwise.. set the height back to auto
		var mr = $("#slideshows_menu_left");
		if (arrowpos + $("#slideshows_menu_right img").height() > mr.height() ) { 
			mr.css("padding-top", arrowpos );
		} else { 
			mr.css("padding-top", "0" );
		}
	}

	// if slideshows menu were never populated... do it now
	if (slideshowsMenuPopulated == false) {
		slideshowsMenuPopulated = true;

		var sm = "";
		$(".trending_item_title").each( function( index, element ){
    			sm += '<div onclick="slideshows_click($(this))" class="' + $(this).attr('categories') + '"><a href="/' + $(this).find('a').attr('href') + '">' + $( this ).text() + '</a></div>'
		});

		$("#slideshows_menu_left").html(sm)	
	}
}



function categories_toggle() {
	if ($("#mainCategories_menu").is(":visible")) {
		categories_hide()
	} else {
		categories_show()
	}
}

function categories_hide() {
	UTIL_obj("mainCategories_menu").style.display = 'none';
	UTIL_obj("categories_menu").style.display = 'none';
	UTIL_obj("slideshows_menu").style.display = 'none';
}

function slideshows_click(t) {
	location = t.find("a").attr('href')
}



// ------ Source --------

function src(ob) {
	GAevent('Source', 'click', ob.href); 	
}


// ------ Share --------


function shr(si) {
	sharedItem = si;
	GAevent('Share', 'click', si); 
	if (pageType=="RandomFacts" || pageType=="UserPersonalized") { 
		$("#rbl_share_slide_i").prop("checked", true);
		$("#alert_share_slide").hide();
	} else {
		$("#alert_share_slide").show();
	};
	$("#alert_share").show()
	location='#top'
}


function share_getText() {
	var itemOBJ = $("#i" + sharedItem);
	return $.trim( itemOBJ.text().replace(/(\r\n|\n|\r)/gm," ").replace(/	/gm," ").replace(/ +(?= )/g,"").replace(itemOBJ.find(".factTools").text(),'') );
}

function share_getURL() {
	if ( $("#rbl_share_slide_i").prop("checked") ) {	
		return 'https://www.factslides.com/i-' + sharedItem
	} else {			
		return window.location.href	
	}
}

function share_getImage() {
	return 'https://www.factslides.com/imgs/ISHOTS/' + sharedItem + '.png';
}


function share_FB() {
	var url = share_getURL();
	UTIL_sWin('https://www.facebook.com/sharer/sharer.php?u=' + url)
}

function share_TW() {
	var url = share_getURL()
	var purl = 'https://twitter.com/intent/tweet?hashtags=fact&text=' +  encodeURIComponent(share_getText()) + '&url=' +  encodeURIComponent(url) + '&via=factslides';
	var pw = 450;
	var ph = 380;
	var pl = (screen.width/2) - (pw/2);
	var pt = (screen.height/2) - (ph/2);
	var pwin = window.open(purl, "twittershare", "width=" + pw + ",height=" + ph + ",top="+ pt + ",left=" + pl);	
	GAevent('Share', 'TW', url);
}

function share_PI() {
	var url = share_getURL()
	var purl = 'https://pinterest.com/pin/create/button/?url=' +  encodeURIComponent(url) + '&media=' +  encodeURIComponent(share_getImage()) + '&description=' +  encodeURIComponent(share_getText());
	var pw = 780;
	var ph = 600;
	var pl = (screen.width/2) - (pw/2);
	var pt = (screen.height/2) - (ph/2);
	var pwin = window.open(purl, "pinterestshare", "width=" + pw + ",height=" + ph + ",top="+ pt + ",left=" + pl);	
	GAevent('Share', 'PI', url);	
}

function share_EM() {
	var url = share_getURL()
	location = 'mailto:?subject=' + encodeURIComponent('Interesting Fact') + '&body=' + encodeURIComponent(share_getText()) + ' - Read more at: ' + encodeURIComponent(url)
	GAevent('Share', 'EM', url);
}




// ----- Logo menu functions

function logo_showMenu() {
	UTIL_obj("logo_menu").style.display = 'inherit'
}

function logo_hideMenu() {
	UTIL_obj("logo_menu").style.display = 'none'
}

function logo_toggle() {
	if (UTIL_obj("logo_menu").style.display == 'none' ) { logo_showMenu() } else { logo_hideMenu() }
}



// ---- Taboola Ads ----

function loadTaboola() {

	 window._taboola = window._taboola || [];
	_taboola.push({photo:'auto'}); 
	!function (e, f, u) {
	    e.async = 1;
	    e.src = u;
	    f.parentNode.insertBefore(e, f);
	}(document.createElement('script'), document.getElementsByTagName('script')[0], '//cdn.taboola.com/libtrc/oddee-factslides/loader.js');

}


// ---- Google Analytics ----

  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-42260559-1', 'factslides.com');


// add this pageview if is not a test nor local
if (!pISTEST && !pISLOCAL) {
	ga('send', 'pageview');
}

// adds a Google Analytics event
function GAevent(GAcat, GAaction, GAlabel, GAvalue) {
	if (!pISTEST && !pISLOCAL) {
		ga('send', 'event', GAcat, GAaction, GAlabel, GAvalue);
	} else {
		if (GAshowalert) { alert("Cat: " + GAcat + " - Action: " + GAaction + " - Label: " + GAlabel + " - Value: " + GAvalue); }
	}
}

// adds a Google Analytics pageview
function GApageview(pageurl) {
	// do it only if  it's not localhost nor a test 
	if (!pISLOCAL && !pISTEST) {
		ga('send', 'pageview', pageurl);
	} else {
		if (GAshowalert) { alert("Google Analytics Pageview: " + pageurl) }
	}
}



// ---- Util ----

// gets the value of the specified querystring
function UTIL_querystring(paramName) {
	parName = paramName.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
	var pattern = '[\\?&]' + paramName + '=([^&#]*)';
	var regex = new RegExp(pattern);
	var matches = regex.exec(window.location.href);
	if (matches == null) { 
		return '';
	} else { 
		return decodeURIComponent(matches[1].replace(/\+/g, ' '));
	};
}


function UTIL_sWin( p ) {
	window.open(p, 'sWin', 'width=700,height=450,top=100,left=100,menubar=no,titlebar=no,toolbar=no'); 
	return false;
}

function UTIL_obj(n){ return document.getElementById(n) }

function UTIL_browserIsMobile() {
	!function(a){var b=/iPhone/i,c=/iPod/i,d=/iPad/i,e=/(?=.*\bAndroid\b)(?=.*\bMobile\b)/i,f=/Android/i,g=/(?=.*\bAndroid\b)(?=.*\bSD4930UR\b)/i,h=/(?=.*\bAndroid\b)(?=.*\b(?:KFOT|KFTT|KFJWI|KFJWA|KFSOWI|KFTHWI|KFTHWA|KFAPWI|KFAPWA|KFARWI|KFASWI|KFSAWI|KFSAWA)\b)/i,i=/Windows Phone/i,j=/(?=.*\bWindows\b)(?=.*\bARM\b)/i,k=/BlackBerry/i,l=/BB10/i,m=/Opera Mini/i,n=/(CriOS|Chrome)(?=.*\bMobile\b)/i,o=/(?=.*\bFirefox\b)(?=.*\bMobile\b)/i,p=new RegExp("(?:Nexus 7|BNTV250|Kindle Fire|Silk|GT-P1000)","i"),q=function(a,b){return a.test(b)},r=function(a){var r=a||navigator.userAgent,s=r.split("[FBAN");if("undefined"!=typeof s[1]&&(r=s[0]),s=r.split("Twitter"),"undefined"!=typeof s[1]&&(r=s[0]),this.apple={phone:q(b,r),ipod:q(c,r),tablet:!q(b,r)&&q(d,r),device:q(b,r)||q(c,r)||q(d,r)},this.amazon={phone:q(g,r),tablet:!q(g,r)&&q(h,r),device:q(g,r)||q(h,r)},this.android={phone:q(g,r)||q(e,r),tablet:!q(g,r)&&!q(e,r)&&(q(h,r)||q(f,r)),device:q(g,r)||q(h,r)||q(e,r)||q(f,r)},this.windows={phone:q(i,r),tablet:q(j,r),device:q(i,r)||q(j,r)},this.other={blackberry:q(k,r),blackberry10:q(l,r),opera:q(m,r),firefox:q(o,r),chrome:q(n,r),device:q(k,r)||q(l,r)||q(m,r)||q(o,r)||q(n,r)},this.seven_inch=q(p,r),this.any=this.apple.device||this.android.device||this.windows.device||this.other.device||this.seven_inch,this.phone=this.apple.phone||this.android.phone||this.windows.phone,this.tablet=this.apple.tablet||this.android.tablet||this.windows.tablet,"undefined"==typeof window)return this},s=function(){var a=new r;return a.Class=r,a};"undefined"!=typeof module&&module.exports&&"undefined"==typeof window?module.exports=r:"undefined"!=typeof module&&module.exports&&"undefined"!=typeof window?module.exports=s():"function"==typeof define&&define.amd?define("isMobile",[],a.isMobile=s()):a.isMobile=s()}(this);
	return isMobile.any;
}
