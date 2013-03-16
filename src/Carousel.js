/*
 * jquery.pgcarousel
 * https://github.com/patrickgunderson/jquery.pgcarousel
 *
 * Copyright (c) 2013 Patrick Gunderson
 * Licensed under the MIT license.
 */

(function($) {
    $.pgCarousel = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        base.numActivePages = 0;
        
        // Add a reverse reference to the DOM object
        base.$el.data("pgCarousel", base);
        
        base.init = function(){
            base.el = el;
            base.options = $.extend(true, {},$.pgCarousel.options, options);
            base.$el = $(this.el);
            base.generate();
            
        };

        base.generate = function(){
            //make $pages mask
            base.options.$pages = base.$el.find(".pages");
            if (!base.options.$pages.length){
                base.options.$pages = $("<div/>").addClass('pages');
                base.$el.append(base.options.$pages);
            }
        };
    
        // ------------------------------------------------
        base.numPages = function() {
            return Math.ceil(base.options.$currentSet.length / base.options.pageLength);
        };
    
        // ------------------------------------------------
        base.page = function(pageNumber, instant) {
            if (arguments.length > 0){
                base.options.currentPageIndex = pageNumber;
                return base.showCarouselPage(instant);
            } else {
                return base.options.currentPageIndex;
            }
        };

        // ------------------------------------------------
        base.nextPage = function(instant) {
            if(base.options.currentPageIndex < base.numPages() - 1) {
                base.options.currentPageIndex++;
                return base.showCarouselPage(instant);
            }
            return base;
        };
    
        // ------------------------------------------------
        base.prevPage = function(instant) {
            if(base.options.currentPageIndex > 0) {
                base.options.currentPageIndex--;
                return base.showCarouselPage(instant);
            }
            return base;
        };
    
        // ------------------------------------------------
        base.findPageWith = function(item) {
            var index = base.options.$currentSet.indexOf(item);
            var pageNumber = (index / base.options.pageLength) >> 0;
            return pageNumber;
        };
    
        // ------------------------------------------------
        base.removeItem = function(items){
            if ( Object.prototype.toString.call( items ) !== '[object Array]' ){
                items = [items];
            }
            $.each(items, function(i, item){
                var index = base.options.$carouselItems.indexOf(item);
                if (index != -1){
                    base.options.$carouselItems.splice(index, 1);
                }
            });
            return base;
        };
    
        // ------------------------------------------------
        base.addItem = function(items, at) {
            at = (typeof(at) !== "undefined") ? at : -1;

            switch(at){
                case -1:
                    base.options.$carouselItems.push(items);
                    break;
                case 0:
                    base.options.$carouselItems.unshift(items);
                    break;
                default:
                    base.options.$carouselItems.splice(at, 0, items);
                break;
            }

            if(!base.options.filterOptions){
                base.options.$currentSet = base.options.$carouselItems;
            } else {
                base.filterSet(base.options.filterOptions);
            }
            return base;
        };
    
        // ------------------------------------------------
        base.filterSet = function(filterOptions) {
            var newSet = [];
            var v_all = base.options.$carouselItems;
            var passed;
            var i = -1;
            var endi = v_all.length;
            while (++i < endi){
                passed = true;
                for (var key in filterOptions){
                    if (v_all[i].model.get(key) != filterOptions[key]){
                        
                        passed = false;
                        continue;
                    }
                }
                if (passed){
                    newSet.push(v_all[i]);
                }
            }
            base.options.$currentSet = newSet;
            return base;
        };

        // ------------------------------------------------
        base.showCarouselPage = function(instant) {
            base.options.$prevPage = base.options.$page;

            var $prevPage = base.options.$prevPage;
            var currentPageIndex = base.options.currentPageIndex;
            var pageLength = base.options.pageLength;
            var $currentSet = base.options.$currentSet;
            var $pages = base.options.$pages;
            var animationTime = base.options.animationTime;
    
            //make new page
            // var $page = base.options.$page = $('<div/>', {
            //     //id: 'carouselPage_' + currentPageIndex
            // }).append($('<div class="items"></div>));

            var $page = base.options.$page = ich.mainCarouselPageTemplate();
            if (currentPageIndex % 2){
                $page.addClass('right');
            }

            $page.addClass('carouselPage').css({
                display: 'none',
                position: 'absolute'
            }).data({
                page: currentPageIndex
            });

            var fromDirection = 0;
            if($prevPage) {
                fromDirection = (currentPageIndex < $prevPage.data('page')) ? -1 : 1;
            }

            //populate new page
            var startItem = currentPageIndex * pageLength;
            var subset = $currentSet.slice(startItem, startItem + pageLength);

            //trace(base.options.currentPageIndex, base.options.pageLength);

            $.each(subset, function(i, $item) {
                $page.find('.items').append($item.$el);
            });

            //add new page to stage
            $pages.append($page);
            
            if (!instant){

                //transition in new page
                $page.css({
                        display: "block",
                        y: (fromDirection * $pages.height())
                    })
                    // .animate({
                    //     top: 0
                    // },
                    // animationTime,
                    // 'swing'
                    .transition({
                        y: 0
                    },
                    animationTime,
                    'snap'
                );
        
                //transition out current page
                if($prevPage) {
                    $prevPage
                        .stop()
                        // .animate({
                        //         top: -(fromDirection * $pages.height())
                        //     },
                        //     animationTime,
                        //     'swing',
                        //     function() {
                        //         //destroy current page
                        //         $(this)
                        //         .detach();
                        //     }
                        // );
                        .transition({
                                y: -(fromDirection * $pages.height())
                            },
                            animationTime,
                            'snap',
                            function() {
                                //destroy current page
                                $(this)
                                .detach();
                            }
                        );
                }
            } else {
               $page.css({
                    display: "block",
                    y: 0
                });
               if ($prevPage){
                $prevPage.detach();
               }
            }

            return base;
        };

        base.areCongreuent = function(a, b){
          var p;
          if (a === b) return true;
          if (!a || !b) return false;

          for(p in b) {
              if(typeof(a[p])=='undefined') {return false;}
          }

          for(p in b) {
              if (b[p]) {
                  switch(typeof(b[p])) {
                      case 'object':
                          if (!b[p].equals(a[p])) { return false; } break;
                      case 'function':
                          if (typeof(a[p])=='undefined' ||
                              (p != 'equals' && b[p].toString() != a[p].toString()))
                              return false;
                          break;
                      default:
                          if (b[p] != a[p]) { return false; }
                  }
              } else {
                  if (a[p])
                      return false;
              }
          }

          for(p in a) {
              if(typeof(b[p])=='undefined') {return false;}
          }

          return true;
        };
        
        // Run initializer
        base.init();
    };
    
    $.pgCarousel.options =  {
        $currentSet: [],
        $carouselItems: [],
        prevPageIndex: -1,
        $prevPage: null,
        currentPageIndex: 0,
        $page: null,
        pageLength: 24,
        filterOptions: null,
        animationTime: 1200,
        animationIndex: 0,
        $pages: null
    };

    // Collection method.
    $.fn.pgCarousel = function(settings) {

        if(settings && typeof settings === "string") {
            var carousel;
            if ((carousel = this[0].pgcarousel)){
                if(settings === "page"){
                    return carousel.page();
                }
                if (settings === "numPages"){
                    return carousel.numPages();
                }
                if (settings === "carouselItems"){
                    return carousel.options.$carouselItems;
                }
            }
        }

        return this.each(function() {
            var options, carousel;
            if(!(carousel = this.pgcarousel)) {
                options = $.extend({}, $.pgCarousel.options, settings);
                this.pgcarousel = carousel = new $.pgCarousel(this, options);
            }
            if(settings && typeof settings === "object") {
                $.extend(carousel.options, settings);
                if(settings.gotoPage) {
                    return carousel.page(settings.gotoPage);
                }
                if(settings.carouselItems) {
                    carousel.options.$carouselItems = settings.carouselItems;
                    return carousel.page(0, true);
                }
                if(settings.add) {
                    carousel.addItem(settings.add, settings.at);
                    return carousel.page(carousel.options.currentPageIndex, true);
                }
                if(settings.remove) {
                    carousel.removeItem(settings.remove);
                    return carousel.page(carousel.options.currentPageIndex, true);
                }
                if (settings.move){
                    var item = settings.move.item;
                    carousel.removeItem(item);
                    carousel.addItem(item, settings.move.to);
                    return carousel.page(carousel.options.currentPageIndex, true);
                }
                if (settings.filter){
                    if(!carousel.areCongreuent(carousel.options.filterOptions, settings.filter)){
                        carousel.options.filterOptions = settings.filter;
                        carousel.filterSet(settings.filter);
                        return carousel.page(0, true);
                    } else {
                        return this;
                    }
                }
                if (settings.show){
                    var page = carousel.findPageWith(settings.show);
                    return carousel.page(page, true);
                }
            } else if(settings && typeof settings === "string") {
                if(settings === "next") {
                    return carousel.nextPage();
                }
                if(settings === "prev") {
                    return carousel.prevPage();
                }
            }
            return this;
        });
    };
})(jQuery);