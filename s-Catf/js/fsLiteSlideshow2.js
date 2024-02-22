
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

// is slide show format already?
isSlideshowFormat = false;

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
	} else if (item > totalItems-1 && (!theEnd && pageN==1)) {

		// --- show theEnd ----

		// set flag for theEnd of the collection
		theEnd = true;
       $("#nextA").hide();
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


	// if the item requested is above the last one... and we have shown theEnd or the current page 1...
	} else if (item > totalItems-1 && (theEnd || pageN > 1)) {

		// --- go to the NEXT button's URL ---
		location = $("#nextA").attr("href");


	// in any other case.. 
	} else {



		// ------ buttons and ads 

		// hide "The End", if PREV was requested
		if (isPrev) { $("#fe").hide() };

		// show / hide the prev button
		if (item > 1 || pageN > 1) { $("#prevA").show() } else { $("#prevA").hide() };
		$("#nextA").show();

		// ------ pre load images (lazy load)
		if (!isPrev) { 
			if (item==2) { loadImgs( item ) }; 
			loadImgs( item + 1 ); 
		}



		// ------ change format to slideshow
		if (!isSlideshowFormat) {
			$("#items1").after( $(".i") );
			$(".i").hide();
			$(".i").css("position", "relative");
			isSlideshowFormat = true;
		}		


		// ------ show this item and hide the others
		$("#i" + (item + (isPrev ? +1 : -1) )).hide();
		var itemobj = $("#i" + item)
		itemobj.css("opacity", "0");
		itemobj.show();
		itemobj.animate({ opacity: "1" }, 300)


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
		iN.find("img[data-src]").each( function( index, element ){
			if ($(this).attr("src")==null) {
   				$(this).attr("src", $(this).attr("data-src"));
				$(this).removeAttr("data-src")
			}
		});
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




/*! lazysizes - v5.2.0-beta1 */
!function(a,b){var c=b(a,a.document);a.lazySizes=c,"object"==typeof module&&module.exports&&(module.exports=c)}("undefined"!=typeof window?window:{},function(a,b){"use strict";var c,d;if(function(){var b,c={lazyClass:"lazyload",loadedClass:"lazyloaded",loadingClass:"lazyloading",preloadClass:"lazypreload",errorClass:"lazyerror",autosizesClass:"lazyautosizes",srcAttr:"data-src",srcsetAttr:"data-srcset",sizesAttr:"data-sizes",minSize:40,customMedia:{},init:!0,expFactor:1.5,hFac:.8,loadMode:2,loadHidden:!0,ricTimeout:0,throttleDelay:125};d=a.lazySizesConfig||a.lazysizesConfig||{};for(b in c)b in d||(d[b]=c[b])}(),!b||!b.getElementsByClassName)return{init:function(){},cfg:d,noSupport:!0};var e=b.documentElement,f=a.Date,g=a.HTMLPictureElement,h="addEventListener",i="getAttribute",j=a[h],k=a.setTimeout,l=a.requestAnimationFrame||k,m=a.requestIdleCallback,n=/^picture$/i,o=["load","error","lazyincluded","_lazyloaded"],p={},q=Array.prototype.forEach,r=function(a,b){return p[b]||(p[b]=new RegExp("(\\s|^)"+b+"(\\s|$)")),p[b].test(a[i]("class")||"")&&p[b]},s=function(a,b){r(a,b)||a.setAttribute("class",(a[i]("class")||"").trim()+" "+b)},t=function(a,b){var c;(c=r(a,b))&&a.setAttribute("class",(a[i]("class")||"").replace(c," "))},u=function(a,b,c){var d=c?h:"removeEventListener";c&&u(a,b),o.forEach(function(c){a[d](c,b)})},v=function(a,d,e,f,g){var h=b.createEvent("Event");return e||(e={}),e.instance=c,h.initEvent(d,!f,!g),h.detail=e,a.dispatchEvent(h),h},w=function(b,c){var e;!g&&(e=a.picturefill||d.pf)?(c&&c.src&&!b[i]("srcset")&&b.setAttribute("srcset",c.src),e({reevaluate:!0,elements:[b]})):c&&c.src&&(b.src=c.src)},x=function(a,b){return(getComputedStyle(a,null)||{})[b]},y=function(a,b,c){for(c=c||a.offsetWidth;c<d.minSize&&b&&!a._lazysizesWidth;)c=b.offsetWidth,b=b.parentNode;return c},z=function(){var a,c,d=[],e=[],f=d,g=function(){var b=f;for(f=d.length?e:d,a=!0,c=!1;b.length;)b.shift()();a=!1},h=function(d,e){a&&!e?d.apply(this,arguments):(f.push(d),c||(c=!0,(b.hidden?k:l)(g)))};return h._lsFlush=g,h}(),A=function(a,b){return b?function(){z(a)}:function(){var b=this,c=arguments;z(function(){a.apply(b,c)})}},B=function(a){var b,c=0,e=d.throttleDelay,g=d.ricTimeout,h=function(){b=!1,c=f.now(),a()},i=m&&g>49?function(){m(h,{timeout:g}),g!==d.ricTimeout&&(g=d.ricTimeout)}:A(function(){k(h)},!0);return function(a){var d;(a=!0===a)&&(g=33),b||(b=!0,d=e-(f.now()-c),d<0&&(d=0),a||d<9?i():k(i,d))}},C=function(a){var b,c,d=99,e=function(){b=null,a()},g=function(){var a=f.now()-c;a<d?k(g,d-a):(m||e)(e)};return function(){c=f.now(),b||(b=k(g,d))}},D=function(){var g,m,o,p,y,D,F,G,H,I,J,K,L=/^img$/i,M=/^iframe$/i,N="onscroll"in a&&!/(gle|ing)bot/.test(navigator.userAgent),O=0,P=0,Q=0,R=-1,S=function(a){Q--,(!a||Q<0||!a.target)&&(Q=0)},T=function(a){return null==K&&(K="hidden"==x(b.body,"visibility")),K||!("hidden"==x(a.parentNode,"visibility")&&"hidden"==x(a,"visibility"))},U=function(a,c){var d,f=a,g=T(a);for(G-=c,J+=c,H-=c,I+=c;g&&(f=f.offsetParent)&&f!=b.body&&f!=e;)(g=(x(f,"opacity")||1)>0)&&"visible"!=x(f,"overflow")&&(d=f.getBoundingClientRect(),g=I>d.left&&H<d.right&&J>d.top-1&&G<d.bottom+1);return g},V=function(){var a,f,h,j,k,l,n,o,q,r,s,t,u=c.elements;if((p=d.loadMode)&&Q<8&&(a=u.length)){for(f=0,R++;f<a;f++)if(u[f]&&!u[f]._lazyRace)if(!N||c.prematureUnveil&&c.prematureUnveil(u[f]))ba(u[f]);else if((o=u[f][i]("data-expand"))&&(l=1*o)||(l=P),r||(r=!d.expand||d.expand<1?e.clientHeight>500&&e.clientWidth>500?500:370:d.expand,c._defEx=r,s=r*d.expFactor,t=d.hFac,K=null,P<s&&Q<1&&R>2&&p>2&&!b.hidden?(P=s,R=0):P=p>1&&R>1&&Q<6?r:O),q!==l&&(D=innerWidth+l*t,F=innerHeight+l,n=-1*l,q=l),h=u[f].getBoundingClientRect(),(J=h.bottom)>=n&&(G=h.top)<=F&&(I=h.right)>=n*t&&(H=h.left)<=D&&(J||I||H||G)&&(d.loadHidden||T(u[f]))&&(m&&Q<3&&!o&&(p<3||R<4)||U(u[f],l))){if(ba(u[f]),k=!0,Q>9)break}else!k&&m&&!j&&Q<4&&R<4&&p>2&&(g[0]||d.preloadAfterLoad)&&(g[0]||!o&&(J||I||H||G||"auto"!=u[f][i](d.sizesAttr)))&&(j=g[0]||u[f]);j&&!k&&ba(j)}},W=B(V),X=function(a){var b=a.target;if(b._lazyCache)return void delete b._lazyCache;S(a),s(b,d.loadedClass),t(b,d.loadingClass),u(b,Z),v(b,"lazyloaded")},Y=A(X),Z=function(a){Y({target:a.target})},$=function(a,b){try{a.contentWindow.location.replace(b)}catch(c){a.src=b}},_=function(a){var b,c=a[i](d.srcsetAttr);(b=d.customMedia[a[i]("data-media")||a[i]("media")])&&a.setAttribute("media",b),c&&a.setAttribute("srcset",c)},aa=A(function(a,b,c,e,f){var g,h,j,l,m,p;(m=v(a,"lazybeforeunveil",b)).defaultPrevented||(e&&(c?s(a,d.autosizesClass):a.setAttribute("sizes",e)),h=a[i](d.srcsetAttr),g=a[i](d.srcAttr),f&&(j=a.parentNode,l=j&&n.test(j.nodeName||"")),p=b.firesLoad||"src"in a&&(h||g||l),m={target:a},s(a,d.loadingClass),p&&(clearTimeout(o),o=k(S,2500),u(a,Z,!0)),l&&q.call(j.getElementsByTagName("source"),_),h?a.setAttribute("srcset",h):g&&!l&&(M.test(a.nodeName)?$(a,g):a.src=g),f&&(h||l)&&w(a,{src:g})),a._lazyRace&&delete a._lazyRace,t(a,d.lazyClass),z(function(){var b=a.complete&&a.naturalWidth>1;p&&!b||(b&&s(a,"ls-is-cached"),X(m),a._lazyCache=!0,k(function(){"_lazyCache"in a&&delete a._lazyCache},9)),"lazy"==a.loading&&Q--},!0)}),ba=function(a){if(!a._lazyRace){var b,c=L.test(a.nodeName),e=c&&(a[i](d.sizesAttr)||a[i]("sizes")),f="auto"==e;(!f&&m||!c||!a[i]("src")&&!a.srcset||a.complete||r(a,d.errorClass)||!r(a,d.lazyClass))&&(b=v(a,"lazyunveilread").detail,f&&E.updateElem(a,!0,a.offsetWidth),a._lazyRace=!0,Q++,aa(a,b,f,e,c))}},ca=C(function(){d.loadMode=3,W()}),da=function(){3==d.loadMode&&(d.loadMode=2),ca()},ea=function(){if(!m){if(f.now()-y<999)return void k(ea,999);m=!0,d.loadMode=3,W(),j("scroll",da,!0)}};return{_:function(){y=f.now(),c.elements=b.getElementsByClassName(d.lazyClass),g=b.getElementsByClassName(d.lazyClass+" "+d.preloadClass),j("scroll",W,!0),j("resize",W,!0),j("pageshow",function(a){if(a.persisted){var c=b.querySelectorAll("."+d.loadingClass);c.length&&c.forEach&&l(function(){c.forEach(function(a){a.complete&&ba(a)})})}}),a.MutationObserver?new MutationObserver(W).observe(e,{childList:!0,subtree:!0,attributes:!0}):(e[h]("DOMNodeInserted",W,!0),e[h]("DOMAttrModified",W,!0),setInterval(W,999)),j("hashchange",W,!0),["focus","mouseover","click","load","transitionend","animationend"].forEach(function(a){b[h](a,W,!0)}),/d$|^c/.test(b.readyState)?ea():(j("load",ea),b[h]("DOMContentLoaded",W),k(ea,2e4)),c.elements.length?(V(),z._lsFlush()):W()},checkElems:W,unveil:ba,_aLSL:da}}(),E=function(){var a,c=A(function(a,b,c,d){var e,f,g;if(a._lazysizesWidth=d,d+="px",a.setAttribute("sizes",d),n.test(b.nodeName||""))for(e=b.getElementsByTagName("source"),f=0,g=e.length;f<g;f++)e[f].setAttribute("sizes",d);c.detail.dataAttr||w(a,c.detail)}),e=function(a,b,d){var e,f=a.parentNode;f&&(d=y(a,f,d),e=v(a,"lazybeforesizes",{width:d,dataAttr:!!b}),e.defaultPrevented||(d=e.detail.width)&&d!==a._lazysizesWidth&&c(a,f,e,d))},f=function(){var b,c=a.length;if(c)for(b=0;b<c;b++)e(a[b])},g=C(f);return{_:function(){a=b.getElementsByClassName(d.autosizesClass),j("resize",g)},checkElems:g,updateElem:e}}(),F=function(){!F.i&&b.getElementsByClassName&&(F.i=!0,E._(),D._())};return k(function(){d.init&&F()}),c={cfg:d,autoSizer:E,loader:D,init:F,uP:w,aC:s,rC:t,hC:r,fire:v,gW:y,rAF:z}});