

/* main
----------------------------------------------- */

const wheelevent	= "onwheel" in document ? "wheel":"onmousewheel" in document ? "mousewheel":"DOMMouseScroll";
const useragent		= window.navigator.userAgent;
const is_touch		= (useragent.match(/(iPhone|iPod|iPad|Android)/i) || "ontouchend" in document) ? true:false;
const is_oldie		= (useragent.match(/(MSIE 6|MSIE 7|MSIE 8|MSIE 9|MSIE 10)/i)) ? true:false;
const is_ie11			= (useragent.match(/(rv:11)/i)) ? true:false;
const is_edge			= (useragent.match(/(Edge)/i)) ? true:false;
const breakpoint	= 1000;

jsbody = document.getElementsByTagName("body")[0];
jsloading = document.getElementsByClassName("js-loading")[0];
jsheader = document.getElementsByClassName("js-header")[0];
jsmenu = document.getElementsByClassName("js-menu")[0];
jsnav = document.getElementsByClassName("js-nav")[0];


/* wheel
----------------------------------------------- */

var wheel = {
	ready:function() {

		wheel.params = new Array();
		wheel.flag = false;
		wheel.delta = 0;

		window.addEventListener(wheelevent, wheel.start, false);

		document.body.addEventListener("touchmove", wheel.start, { passive:false });

	},
	start:function(event) {

		wheel.delta = event.deltaY ? -(event.deltaY) : event.wheelDelta ? event.wheelDelta : -(event.detail);

		if (wheel.flag) {

			if (event.preventDefault) {

				event.preventDefault();

			}

			event.returnValue = false;

		}
		else {
			$("html,body").stop();
		}
		
		for (let i in wheel.params) {
			wheel.params[i]();
		}

	}
};


/* scroll
----------------------------------------------- */

var scroll = {
	ready:function() {

		scroll.params = new Array();
		scroll.flag = true;
		scroll.top = 0;

		window.addEventListener("scroll", scroll.start, { passive:true });

		scroll.start();

	},
	start:function() {

		if (scroll.flag) {
			requestAnimationFrame(scroll.end);
		}

		scroll.flag = false;

	},
	end:function() {

		scroll.top = document.documentElement.scrollTop || document.body.scrollTop;

		for (let i in scroll.params) {
			scroll.params[i]();
		}

		scroll.flag = true;

		// hover action

		clearTimeout(scroll.timeout);

		if (!jsbody.classList.contains("jsbody--disable")) {

			jsbody.classList.add("jsbody--disable");

		}

		scroll.timeout = setTimeout(function() {

			jsbody.classList.remove("jsbody--disable");

		}, 250);

	}
};


/* resize
----------------------------------------------- */

var resize = {
	ready:function() {

		resize.params = new Array();
		resize.flag = true;
		resize.body = document.body.clientHeight;
		resize.width = window.innerWidth;
		resize.height = window.innerHeight;

		window.addEventListener("resize", resize.start, false);
		window.addEventListener("orientationchange", resize.orientation, false);

	},
	start:function(event) {

		clearInterval(resize.interval);
		
		resize.interval = setInterval(resize.end, 50);

	},
	end:function(event) {

		clearInterval(resize.interval);

		if ((is_touch && resize.width != window.innerWidth) || !is_touch) {

			resize.body = document.body.clientHeight;
			resize.width = window.innerWidth;
			resize.height = window.innerHeight;

			for (let i in resize.params) {
				resize.params[i]();
			}

		}

	},
	orientation:function() {

		console.log("resize orientation");

		setTimeout(function() {

			resize.body = document.body.clientHeight;
			resize.width = window.innerWidth;
			resize.height = window.innerHeight;

			for (let i in resize.params) {
				resize.params[i]();
			}

		}, 250);

	}
}


/* srcswap
----------------------------------------------- */

var srcswap = {
	ready:function() {

		srcswap.params = new Array();

		let elements = document.getElementsByClassName("js-srcswap");
		let elements_length = elements.length;

		for (let i = 0; i < elements_length; i++) {
			srcswap.params.push(elements[i]);
		}

		resize.params.srcswap = srcswap.resize;

		srcswap.resize();

	},
	resize:function() {

		for (let i in srcswap.params) {

			let elem = srcswap.params[i];
			let src = elem.src;
			let srcset = elem.getAttribute("srcset");

			if (window.innerWidth >= breakpoint) {

				src = src.replace(/_sp/g, "_pc");

				if (srcset) srcset = srcset.replace(/_sp/g, "_pc");

			}
			else {

				src = src.replace(/_pc/g, "_sp");

				if (srcset) srcset = srcset.replace(/_pc/g, "_sp");

			}

			elem.src = src;

			if (srcset) elem.setAttribute("srcset", srcset);

		}

	}
};


/* indicate
----------------------------------------------- */

var indicate = {
	ready:function() {

		let elements = document.getElementsByClassName("js-indicate");

		indicate.pramas = new Array();
		indicate.total = elements.length;
		indicate.count = 0;

		for (let i = 0; i < indicate.total; i++) {

			let elem = elements[i];

			elem.classList.add("js-indicate-ready");

			indicate.pramas.push({ flag:true, elem:elem });

		}

	},
	start:function() {

		if (indicate.total > 0) {

			resize.params.indicate = indicate.resize;
			scroll.params.indicate = indicate.scroll;

			indicate.resize();
			indicate.scroll();

		}

	},
	resize:function() {

		let pagetop = window.pageYOffset || document.documentElement.scrollTop;

		for (let i in indicate.pramas) {

			let elem = indicate.pramas[i].elem;
			let rect = elem.getBoundingClientRect();
			let offset = rect.top + pagetop;
			let height = elem.clientHeight;
			let margin = Math.min(100, height);

			indicate.pramas[i].offset = offset;
			indicate.pramas[i].height = height;
			indicate.pramas[i].margin = margin;

		}

	},
	scroll:function() {

		let scrolltop = scroll.top + window.innerHeight;
		let margin = window.innerHeight / 4;

		for (let i in indicate.pramas) {

			let flag = indicate.pramas[i].flag;
			let elem = indicate.pramas[i].elem;
			let offset = indicate.pramas[i].offset;
			let height = indicate.pramas[i].height;
			let margin = indicate.pramas[i].margin;

			if (flag && scrolltop >= offset + margin) {

				elem.style.willChange = "opacity, transform";

				elem.classList.add("js-indicate-start");

				setTimeout(function() {

					elem.classList.add("js-indicate-end");

					setTimeout(function() {

						elem.classList.add("js-indicate-complete");
						
						setTimeout(function() {

							elem.style.willChange = "unset";

						}, 500);

					}, 500);

				}, 500);

				indicate.pramas[i].flag = false;

				// 巻き戻し停止

				indicate.count++;

				if (indicate.count >= indicate.total) {
					delete resize.params.indicate;
					delete scroll.params.indicate;
				}

			}

		}

	}
}


/* parallax
----------------------------------------------- */

var parallax = {
	ready:function() {

		let elements = document.getElementsByClassName("js-parallax");

		parallax.pramas = new Array();
		parallax.total = elements.length;
		parallax.count = 0;

		for (let i = 0; i < parallax.total; i++) {

			let elem = elements[i];

			elem.style.opacity = 0;
			elem.style.transform = "translateZ(0)";
			elem.style.transition = "opacity 0.25s";
			elem.firstElementChild.style.willChange = "transform";

			parallax.pramas.push({ elem:elem });

		}

	},
	start:function() {

		if (parallax.total > 0) {

			resize.params.parallax = parallax.resize;
			scroll.params.parallax = parallax.scroll;

			parallax.resize();
			parallax.scroll();

		}

	},
	resize:function() {

		let pagetop = window.pageYOffset || document.documentElement.scrollTop;

		for (let i in parallax.pramas) {

			let elem = parallax.pramas[i].elem;
			let rect = elem.getBoundingClientRect();
			let offset = rect.top + pagetop;
			let height = elem.clientHeight;
			let move = height / 5;

			parallax.pramas[i].offset = offset;
			parallax.pramas[i].height = height;
			parallax.pramas[i].move = move;

			elem.style.opacity = 1;

		}

		parallax.scroll();

	},
	scroll:function() {

		let scrolltop = scroll.top + window.innerHeight;

		for (let i in parallax.pramas) {

			let elem = parallax.pramas[i].elem;
			let offset = parallax.pramas[i].offset;
			let height = parallax.pramas[i].height;
			let move = parallax.pramas[i].move;

			let percent = (scrolltop - offset) / (height + window.innerHeight) * 100;
			let position = move / 100 * percent;

			if (percent > -50 && percent < 150) {
				elem.firstElementChild.style.transform = "translateY(" + (position - (move / 2)) + "px)";
			}

		}

	}
}


/* bodyfix
----------------------------------------------- */

var bodyfix = {
	ready:function() {

	},
	lock:function() {

		bodyfix.offset = document.documentElement.scrollTop || document.body.scrollTop;

		jsbody.willChange = "top";
		jsbody.style.position = "fixed";
		jsbody.style.top = -bodyfix.offset + "px";
		jsbody.style.left = 0;
		jsbody.style.width = "100%";

	},
	unlock:function() {

		jsbody.style.position = "static";
		jsbody.style.top = 0 + "px";
		
		if (bodyfix.offset) {
			window.scrollTo(0, bodyfix.offset);
		}

	}
}


/* pageup
----------------------------------------------- */

var pageup = {
	ready:function() {

		jspageup = document.getElementsByClassName("js-pageup")[0];

		if (jspageup) {
			jspageup.addEventListener("click", pageup.start, false);
		}

	},
	start:function() {

		$("html,body").stop().animate({ scrollTop:0 }, 1000, "easeInOutCubic");

	}
};


/* anchor
----------------------------------------------- */

var anchor = {
	ready:function() {

		let elements = document.getElementsByClassName("js-anchor");
		let elements_length = elements.length;

		for (let i = 0; i < elements_length; i++) {
			elements[i].addEventListener("click", anchor.start, false);
		}

	},
	start:function(event) {

		let hash = this.getAttribute("href");

		if (hash) {

			let posi = $(hash).offset().top;
			let margin = jsheader.clientHeight + 25;

			posi -= margin;
			
			$("html,body").stop().animate({ scrollTop:posi }, 1000, "easeInOutCubic");

		}

		event.preventDefault();

	}
};


/* menu
----------------------------------------------- */

var menu = {
	ready:function() {

		jsheader.classList.add("js-header-ready");
		jsmenu.classList.add("js-menu-ready");
		jsnav.classList.add("js-nav-ready");

		jsmenu.addEventListener("click", menu.open, false);
		jsnav.querySelector(".nav__list").addEventListener("click", menu.link, false);

	},
	open:function() {

		jsmenu.classList.add("js-menu-open");
		jsnav.classList.add("js-nav-open");

		jsmenu.removeEventListener("click", menu.open, false);
		jsnav.querySelector(".nav__close").addEventListener("click", menu.close, false);

	},
	close:function() {

		jsmenu.classList.remove("js-menu-open");
		jsnav.classList.remove("js-nav-open");

		jsmenu.addEventListener("click", menu.open, false);
		jsnav.querySelector(".nav__close").removeEventListener("click", menu.close, false);

	},
	link:function() {
		
		setTimeout(menu.close, 1000);

	}
};


/* intro
----------------------------------------------- */

var intro = {
	ready:function() {

		jsintro = document.getElementsByClassName("js-intro")[0];

		jsintro.flag = true;
		jsintro.total = jsintro.getElementsByClassName("intro__image").length;
		jsintro.current = 0;

		jsintro.classList.add("js-intro-ready");

		// shuffle

		let total = jsintro.getElementsByClassName("intro__image").length;
		let rand = Math.floor(Math.random() * total);

		$(jsintro).find(".intro__images").append($(jsintro).find(".intro__image").eq(rand));

		// resize

		resize.params.intro = intro.resize;
		
		intro.resize();

		// scroll

		scroll.params.intro = intro.scroll;
		
		intro.scroll();

		// callback

		loading.callback = intro.start;

	},
	resize:function() {

		jsintro.style.height = window.innerHeight + "px";
		jsintro.querySelector(".intro__images").style.transform = "translate3d(0, 0, 0)";

		if (window.innerHeight > window.innerWidth) {
			jsintro.classList.add("js-intro-wide");
		}
		else {
			jsintro.classList.remove("js-intro-wide");
		}

		indicate.resize();
		parallax.resize();

	},
	scroll:function() {

		// nav

		if (scroll.top >= resize.height) {
			jsheader.classList.add("js-header-down");
			jsmenu.classList.add("js-menu-down");
			jsnav.classList.add("js-nav-down");
		}
		else {
			jsheader.classList.remove("js-header-down");
			jsmenu.classList.remove("js-menu-down");
			jsnav.classList.remove("js-nav-down");
		}

		// parallax

		let percent = scroll.top / resize.height * 100;
		let posi = (resize.height / 2) / 100 * percent;
		let opacity = 1 / 100 * percent;

		if (percent >= 0 && percent <= 110) {
			jsintro.querySelector(".intro__fade").style.opacity = opacity;
		}

		if (jsintro.flag && percent > 10) {
			jsintro.flag = false;
		}
		else if (!jsintro.flag && percent <= 10) {
			jsintro.flag = true;
		}

	},
	start:function() {

		jsintro.classList.add("js-intro-start");

		setTimeout(function() {

			jsintro.classList.remove("js-intro-ready");
			jsintro.classList.remove("js-intro-start");

			$(jsintro).find(".intro__image").clearQueue().stop().animate({ opacity:1 }, 0);

			intro.slide();

		}, 5000);

	},
	slide:function() {
		
		if (jsintro.flag) {
	
			$(jsintro).find(".intro__images").append($(jsintro).find(".intro__image").eq(0));
	
			let start = $(jsintro).find(".intro__image").eq(jsintro.current - 1).data("start");
	
			switch (start) {
				case "top":
					posi = "0%, -4%";
				break;
				case "bottom":
					posi = "0%, 4%";
				break;
				case "left":
					posi = "-4%, 0%";
				break;
				case "right":
					posi = "4%, 0%";
				break;
			}
	
			$(jsintro).find(".intro__image").eq(jsintro.current - 1).clearQueue().stop().animate({ opacity:0, transform:"rotate(0.09deg) scale(1.1) translate(" + posi + ")" }, 0).animate({ opacity:1, transform:"rotate(0deg) scale(1.05) translate(0)" }, 5000, "easeInOutQuart");

		}

		setTimeout(intro.slide, 6500);

	}
};


/* checkit
----------------------------------------------- */

var checkit = {
	ready:function() {

		checkit.params = new Array();
		checkit.total = 0;
		checkit.count = 0;

		let elements = document.getElementsByClassName("js-checkit");
		let elements_length = elements.length;

		for (let i = 0; i < elements_length; i++) {

			let elem = elements[i];
			let slider = elem.getElementsByClassName("checkit__lists")[0];
			let type = (elem.className.indexOf("small") > -1) ? true:false;
			let show = (type) ? 4:2;

			let slickelem = $(slider).slick({
				infinite: true,
				autoplay: true,
				autoplaySpeed: 5000,
				speed: 850,
				fade: false,
				cssEase: "cubic-bezier(0.77, 0, 0.175, 1)",
				centerMode: false,
				variableWidth: true,
				arrows: false,
				dots: false,
				slidesToShow: show,
				responsive: [
					{
						breakpoint: 1000,
						settings: {
							infinite: false,
							autoplay: false,
							slidesToShow: show / 2,
						}
					},
				]
			});

			slickelem.slick("slickPause");

			let prev = elem.getElementsByClassName("checkit__arrow--prev")[0];
			let next = elem.getElementsByClassName("checkit__arrow--next")[0];

			prev.slickelem = slickelem;
			next.slickelem = slickelem;

			prev.addEventListener("click", checkit.prev, false);
			next.addEventListener("click", checkit.next, false);

			checkit.params.push({ flag:true, slickelem:slickelem, offset:$(elem).offset().top });

			checkit.total++;

		}

		scroll.params.checkit = checkit.scroll;
		
		checkit.scroll();

	},
	prev:function() {

		$(this.slickelem).slick("slickPrev");

	},
	next:function() {

		$(this.slickelem).slick("slickNext");

	},
	resize:function() {

		for (let i in checkit.params) {

			let slickelem = checkit.params[i].slickelem;
			
			if (resize.width >= breakpoint) {
					slickelem.slick("slickPlay");
			}
			else {
				slickelem.slick("slickPause");
			}

		}

	},
	scroll:function() {

		let scrolltop = scroll.top + resize.height;

		for (let i in checkit.params) {

			let flag = checkit.params[i].flag;
			let slickelem = checkit.params[i].slickelem;
			let offset = checkit.params[i].offset;

			if (flag && scrolltop >= offset) {

				resize.params.checkit = checkit.resize;

				if (resize.width >= breakpoint) {
					slickelem.slick("slickPlay");
				}

				checkit.params[i].flag = false;

				checkit.count++;
				
				if (checkit.count >= checkit.total) {
					delete scroll.params.checkit;
				}

			}
		}

	}
};


/* staffreport
----------------------------------------------- */

var staffreport = {
	ready:function() {

		jsstaffreport = document.getElementsByClassName("js-staffreport")[0];

		var jqxhr = $.ajax({ type:"get", dataType:"jsonp", timeout:5000, url:"./assets/api/rss.php", jsonp:"callback", jsonpCallback:"blogCallback" });
		
		jqxhr.done(staffreport.done);
		jqxhr.fail(staffreport.fail);

	},
	done:function(data) {

		if (!data) return false;

		let htmls = new Array();
		let html;

		for (let i in data.entry) {
			
			if (i > 3) break;
			//if (i < 4 || i > 7) continue;

			let link = data.entry[i].link;
			let title = data.entry[i].title;
			let description = data.entry[i].description;
			let pubDate = data.entry[i].pubDate;
			let subject = data.entry[i].subject;

			let date = new Date(pubDate);
			let yyyy = date.getFullYear();
			let mm = date.getMonth() + 1;
			let dd = date.getDate();
			let img = $(description).find("img").eq(0);
			let src = ($(img).attr("src")) ? $(img).attr("src"):"./assets/img/common/noimage.png";

			mm = ("0" + mm).slice(-2);
			dd = ("0" + dd).slice(-2);

			htmls.push('<div class="staffreport__list js-indicate js-indicate-btin">');
			htmls.push('	<a href="' + link + '" target="_blank">');
			htmls.push('		<figure class="staffreport__image">');
			htmls.push('			<img src="' + src + '" alt="">');
			htmls.push('		</figure>');
			htmls.push('		<time datetime="' + yyyy + '-' + mm + '-' + dd + '" class="staffreport__date">');
			htmls.push('			' + yyyy + '.' + mm + '.' + dd);
			htmls.push('		</time>');
			htmls.push('		<p class="staffreport__label">');
			htmls.push('			' + title);
			htmls.push('		</p>');
			htmls.push('	</a>');
			htmls.push('</div>');

		}

		html = htmls.join("");

		jsstaffreport.querySelector(".staffreport__lists").innerHTML = html;

		let slider = jsstaffreport.querySelector(".staffreport__lists");

		$(slider).slick({
			infinite: true,
			autoplay: true,
			autoplaySpeed: 3000,
			speed: 850,
			fade: false,
			cssEase: "cubic-bezier(0.77, 0, 0.175, 1)",
			centerMode: false,
			variableWidth: true,
			arrows: false,
			dots: false,
			slidesToShow: 4,
			responsive: [
				{
					breakpoint: 1000,
					settings: {
						infinite: false,
						autoplay: false,
						slidesToShow: 1,
					}
				},
			]
		});

		indicate.ready();
		indicate.start();

		resize.params.staffreport = staffreport.resize;
		
		staffreport.resize();

	},
	fail:function(jqXHR, textStatus, errorThrown) {

		console.log(jqXHR, textStatus, errorThrown);

	},
	resize:function() {

		let elements = jsstaffreport.getElementsByClassName("staffreport__list");
		let elements_length = elements.length;
		let size = jsstaffreport.querySelector(".staffreport__list").querySelector("a").clientWidth;

		for (let i = 0; i < elements_length; i++) {

			let elem = elements[i];
			let img = elem.querySelector("img");
			let image = new Image();
			
			image.src = img.src;
			image.addEventListener("load", function() {

				let set_width = size;
				let set_height = this.height / this.width * size;
				
				if (set_height < size) {
					set_width = this.width / this.height * size;
					set_height = size;
				}

				let margin_left = size / 2 - set_width / 2;

				img.style.width = set_width + "px";
				img.style.height = set_height + "px";
				img.style.marginLeft = margin_left + "px";

			});

		}

	}
};


/* collections
----------------------------------------------- */

var collections = {
	ready:function() {

		jscollections = document.getElementsByClassName("js-collections")[0];

		let lists = jscollections.getElementsByClassName("collections__lists")[0];
		let clone = lists.cloneNode(true);

		jscollections.appendChild(clone);

		collections.offset = $(jscollections).offset().top;
		collections.total = jscollections.getElementsByClassName("collections__list").length;
		collections.count = 0;

		scroll.params.collections = collections.scroll;
		
		collections.scroll();

	},
	scroll:function() {
		
		let scrolltop = scroll.top + resize.height;

		if (scrolltop >= collections.offset) {

			delete scroll.params.collections;

			jscollections.classList.add("js-collections-start");

			collections.slider();
			collections.load();

		}

	},
	slider:function() {

		$(jscollections).find(".collections__lists").animate({ transform:"translateX(0)" }, 0).animate({ transform:"translateX(-100%)" }, 45000, "linear", collections.slider);

	},
	load:function() {

		let list = jscollections.getElementsByClassName("collections__list")[collections.count];
		let img = list.querySelector("img");
		let src = img.dataset.src;

		img.src = src;
		img.addEventListener("load", function() {

			list.classList.add("collections__list--loaded");

			collections.count++;
			
			if (collections.count < collections.total) {
				collections.load();
			}

		}, false);

	}
};


/* pagetitle
----------------------------------------------- */

var pagetitle = {
	ready:function() {

		jspagetitle = document.getElementsByClassName("js-pagetitle")[0];

		if (window.location.search == "?skip") {

			pagetitle.skip();

			return false;

		}

		jspagetitle.classList.add("js-pagetitle-ready");

		// resize

		resize.params.pagetitle = pagetitle.resize;
		
		pagetitle.resize();

		// callback

		loading.callback = pagetitle.start;

	},
	resize:function() {

		jspagetitle.style.height = window.innerHeight + "px";

		let image = jspagetitle.querySelector("img");
		let src = image.getAttribute("src");
		let img = new Image();

		img.src = src;

		img.addEventListener("load", function() {

			let get_width = this.width;
			let get_height = this.height;
			let set_width = window.innerWidth;
			let set_height = get_height / get_width * set_width;
	
			if (set_height < window.innerHeight) {
				set_height = window.innerHeight;
				set_width = get_width / get_height * set_height;
			}
	
			let margin_top = window.innerHeight / 2 - set_height / 2;
			let margin_left = window.innerWidth / 2 - set_width / 2;
	
			image.style.width = set_width + "px";
			image.style.height = set_height + "px";
			image.style.marginTop = margin_top + "px";
			image.style.marginLeft = margin_left + "px";

		}, false);

	},
	start:function() {

		delete resize.params.pagetitle;

		jspagetitle.classList.add("js-pagetitle-start");

		setTimeout(pagetitle.end, 2500);

	},
	end:function() {

		jspagetitle.classList.add("js-pagetitle-end");

		$(jspagetitle).find(".pagetitle__label").animate({ transform:"translateY(-110vh)" }, 2000, "easeInOutExpo");
		$(jspagetitle).find(".pagetitle__image").animate({ transform:"translateY(-110vh)" }, 2000, "easeInOutExpo");

		$(jspagetitle).find(".pagetitle__label span").animate({ transform:"translateY(110vh)" }, 2000, "easeInOutExpo");
		$(jspagetitle).find(".pagetitle__image img").animate({ transform:"translateY(50vh)" }, 2000, "easeInOutExpo");

		setTimeout(function() {

			jsheader.classList.add("js-header-down");
			jsmenu.classList.add("js-menu-down");
			jsnav.classList.add("js-nav-down");

			setTimeout(function() {
	
				indicate.resize();
				indicate.scroll();

			}, 1000);

		}, 1000);

	},
	skip:function() {

		jspagetitle.classList.add("js-pagetitle-end");

		$(jspagetitle).find(".pagetitle__label").animate({ transform:"translateY(-110vh)" }, 0);
		$(jspagetitle).find(".pagetitle__image").animate({ transform:"translateY(-110vh)" }, 0);

		$(jspagetitle).find(".pagetitle__label span").animate({ transform:"translateY(110vh)" }, 0);
		$(jspagetitle).find(".pagetitle__image img").animate({ transform:"translateY(50vh)" }, 0);

		jsheader.classList.add("js-header-down");
		jsmenu.classList.add("js-menu-down");
		jsnav.classList.add("js-nav-down");

		indicate.resize();
		indicate.scroll();

	}
};


/* information
----------------------------------------------- */

var information = {
	ready:function() {

		jsinformation = document.getElementsByClassName("js-information")[0];

		resize.params.information = information.resize;
		
		information.resize();

	},
	resize:function() {

		if (resize.width >= breakpoint) {
			$(jsinformation).find(".category").show();
		}
		else {
			$(jsinformation).find(".category").hide();
		}

		jsinformation.querySelector(".information__current").classList.remove("information__current--open");
		jsinformation.querySelector(".information__current").addEventListener("click", information.open, false);
		jsinformation.querySelector(".information__current").removeEventListener("click", information.close, false);

	},
	open:function() {

		$(jsinformation).find(".category").clearQueue().stop().slideDown(500, "easeInOutCubic");

		jsinformation.querySelector(".information__current").classList.add("information__current--open");
		jsinformation.querySelector(".information__current").removeEventListener("click", information.open, false);
		jsinformation.querySelector(".information__current").addEventListener("click", information.close, false);

	},
	close:function() {

		$(jsinformation).find(".category").clearQueue().stop().slideUp(500, "easeInOutCubic");

		jsinformation.querySelector(".information__current").classList.remove("information__current--open");
		jsinformation.querySelector(".information__current").addEventListener("click", information.open, false);
		jsinformation.querySelector(".information__current").removeEventListener("click", information.close, false);

	}
};


/* modal
----------------------------------------------- */

var modal = {
	ready:function() {

		jsmodal = document.getElementsByClassName("js-modal")[0];

		let elements = document.getElementsByClassName("js-modalopen");
		let elements_length = elements.length;

		for (let i = 0; i < elements_length; i++) {
			elements[i].addEventListener("click", modal.open, false);
		}

		jsmodal.classList.add("js-modal-ready");

	},
	open:function(event) {
		var newsId = $(this).data('index');

		infoModal(newsId);

		jsmodal.addEventListener("click", modal.close, false);
		jsmodal.querySelector(".modal__content").addEventListener("click", modal.cancel, false);
		jsmodal.querySelector(".modal__close").addEventListener("click", modal.close, false);

		$(jsmodal).find(".modal__outer").animate({ scrollTop:0 }, 0);
		$(jsmodal).find(".modal__outer").on("scroll", modal.scroll);
		$(jsmodal).find(".modal__close--outer").removeClass("modal__close--fixed");

		jsmodal.classList.add("js-modal-open");

		bodyfix.lock();

		event.preventDefault();

	},
	close:function() {

		jsmodal.removeEventListener("click", modal.close, false);
		jsmodal.querySelector(".modal__content").removeEventListener("click", modal.cancel, false);
		jsmodal.querySelector(".modal__close").removeEventListener("click", modal.close, false);

		jsmodal.classList.remove("js-modal-open");

		bodyfix.unlock();

	},
	cancel:function(event) {

		event.stopPropagation();

	},
	scroll:function() {

		let scrolltop = $(jsmodal).find(".modal__outer").scrollTop();
		let margin = parseInt($(jsmodal).find(".modal__content").css("margin-top"));

		if (scrolltop >= margin) {
			$(jsmodal).find(".modal__close--outer").addClass("modal__close--fixed");
		}
		else if (scrolltop < margin) {
			$(jsmodal).find(".modal__close--outer").removeClass("modal__close--fixed");
		}

	}
};


/* transit
----------------------------------------------- */

var transit = {
	ready:function() {
		
		transit.flag = true;

		let elements = document.getElementsByClassName("js-transit");
		let elements_length = elements.length;

		for (let i = 0; i < elements_length; i++) {
			elements[i].addEventListener("click", transit.open, false);
		}

	},
	open:function(event) {

		transit.href = this.getAttribute("href");

		jsloading.classList.add("js-loading-transit");

		setTimeout(transit.close, 25);

		event.preventDefault();

		return false;

	},
	close:function() {

		jsloading.classList.add("js-loading-close");

		setTimeout(transit.link, 1500);

	},
	link:function() {

		window.location.href = transit.href;

		setTimeout(function() {
			jsloading.classList.remove("js-loading-transit");
			jsloading.classList.remove("js-loading-close");
		}, 1000);

	}
};


/* loading
----------------------------------------------- */

var loading = {
	ready:function() {

		jsloading.classList.add("js-loading-ready");

		window.addEventListener("load", loading.loaded, false);

		loading.timeout = setTimeout(loading.loaded, 5000);

		//wheel.flag = true;

	},
	loaded:function() {

		setTimeout(function() {

			setTimeout(function() {

				jsloading.classList.add("js-loading-loaded");

				resize.start();
				parallax.start();

				loading.callback();

				setTimeout(loading.end, 1250);

			}, 25);

		}, 250);

		indicate.ready();
		parallax.ready();
		transit.ready();
		pageup.ready();
		anchor.ready();

		window.removeEventListener("load", loading.loaded, false);

		clearTimeout(loading.timeout);

	},
	end:function() {

		indicate.start();

		//wheel.flag = false;

	},
	callback:function() {
	}
}


/* ready
----------------------------------------------- */

//wheel.ready();
resize.ready();
scroll.ready();
srcswap.ready();
pageup.ready();
menu.ready();
loading.ready();

/* information
----------------------------------------------- */
function infoModal(newsId){
	if(!$('.modal__content').length) return

	var url = 'assets/js/news-'+ newsId +'.json';
	if ($('body').hasClass('current--information'))
	{
		if ($('#category_menu_all').hasClass('category__title--current'))
			url = '../' + url;
		else
			url = '../../' + url;
	}

	$.getJSON(url, function (res) {
		var newsModal = res;

		var html = '<p class="modal__date">\
						<time datetime="'+ newsModal.newsTime +'">'+ newsModal.newsTime +'</time>\
					</p>\
					<p class="modal__title">'+ newsModal.newsTitle +'</p>\
					<figure class="modal__image">\
						<img src="'+ newsModal.newsImg +'" alt="">\
					</figure>'+ newsModal.newsText

		$('.modal__content').html(html);
	});
}
