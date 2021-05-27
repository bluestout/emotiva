// Override Settings
var bcSfFilterSettings = {
  general: {
      limit: bcSfFilterConfig.custom.products_per_page,
      // Optional
      loadProductFirst: true,
      styleScrollToTop: 'style2',
      defaultDisplay: bcSfFilterConfig.custom.layout,
      showPlaceholderProductList: true,
      numberFilterTree: 2
  },
  template: {
    filterOptionRange: '<div><div class="bc-sf-filter-option-range-amount" id="{{rangeAmountId}}"><span class="bc-sf-filter-option-range-amount-min" aria-label="Min Price">{{minValue}}</span><span> - </span><span class="bc-sf-filter-option-range-amount-max" aria-label="Max Price" type="text">{{maxValue}}</span></div><div class="bc-sf-filter-option-range-slider-container"><div class="bc-sf-filter-option-range-slider {{itemSelected}}" id="{{rangeSliderId}}" data-id="{{itemParentId}}" data-value="{{itemValue}}" data-parent-label="{{itemParentLabel}}"></div></div></div>',
  }
};


BCSfFilter.prototype.buildProductGridItem = function(data) {
  /*** Prepare data ***/
  var images = data.images_info;
  // Displaying price base on the policy of Shopify, have to multiple by 100
  var soldOut = !data.available; // Check a product is out of stock
  var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
  var priceVaries = data.price_min != data.price_max; // Check a product has many prices
  // Get First Variant (selected_or_first_available_variant)
  var firstVariant = data['variants'][0];
  if (getParam('variant') !== null && getParam('variant') != '') {
    var paramVariant = data.variants.filter(function(e) {
      return e.id == getParam('variant');
    });
    if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
  } else {
    for (var i = 0; i < data['variants'].length; i++) {
      if (data['variants'][i].available) {
        firstVariant = data['variants'][i];
        break;
      }
    }
  }
  /*** End Prepare data ***/

  // Get Template
  var itemHtml = bcSfFilterTemplate.productGridItemHtml;

  // Add a specific class for grid item
  var itemGridWidthClass = '';
  var imageSize = '600x600';

  switch (bcSfFilterConfig.custom.products_per_row) {
    case 2:
      itemGridWidthClass = 'medium-up--one-half';
      imageSize = '540x600';
      break;
    case 3:
      itemGridWidthClass = 'small--one-half medium-up--one-third';
      imageSize = '345x550';
      break;
    case 4:
      itemGridWidthClass = 'small--one-half medium-up--one-quarter';
      imageSize = '250x';
      break;
    case 5:
      itemGridWidthClass = 'small--one-half medium-up--one-fifth';
      imageSize = '195x';
      break;
  }
  itemHtml = itemHtml.replace(/{{itemGridWidthClass}}/g, itemGridWidthClass);

  // Add soldOut class
  var itemSoldOutClass = soldOut ? bcSfFilterTemplate.soldOutClass : '';
  itemHtml = itemHtml.replace(/{{itemSoldOutClass}}/g, itemSoldOutClass);

  // Add soldOut label
  var itemSoldOutLabel = soldOut ? bcSfFilterTemplate.soldOutLabelGridHtml : '';
  itemHtml = itemHtml.replace(/{{itemSoldOutLabel}}/g, itemSoldOutLabel);

  var imgId = 'ProductCardImage-' + data.id;
  var wrapperId = 'ProductCardImageWrapper-' + data.id;

  // Build Image style
  var imageStyle = buildImageStyle(data);
  itemHtml = itemHtml.replace(/{{imageStyle}}/g, '');

  // Add Images
  var aspect_ratio = '';
  var thumburl = this.getFeaturedImage(images, '300x300');
  var itemImagesHtml = '<div id="' + wrapperId + '" class="grid-view-item__image-wrapper product-card__image-wrapper js">';

  
  itemImagesHtml += '<span class="fs-cst-product-tag-flag">';
  if(data.tags.includes("best-sellers")){
    itemImagesHtml += 'Best Seller';
  } 
  itemImagesHtml += '</span>';
  itemImagesHtml += '<div style="padding-top:';
  if (images.length > 0) {
    aspect_ratio = images[0]['width'] / images[0]['height'];
    itemImagesHtml += 1 / aspect_ratio * 100;
  } else {
    itemImagesHtml += 100;
  }
  itemImagesHtml += '%;">';
  itemImagesHtml += '<img id="' + imgId + '" ' +
    'class="grid-view-item__image lazyload" ' +
    'src="' + thumburl + '" ' +
    'data-src="' + this.getFeaturedImage(images, '{width}x') + '" ' +
    'data-widths="[180, 360, 540, 720, 900, 1080, 1296, 1512, 1728, 2048]" ' +
    'data-aspectratio="' + aspect_ratio + '" ' +
    'data-sizes="auto" ' +
    'alt="{{itemTitle}}">';
  itemImagesHtml += '</div>';
  itemImagesHtml += '</div>';

  var image_size = bcSfFilterConfig.custom.max_height + 'x' + bcSfFilterConfig.custom.max_height;
  var max_width = images.length > 0 ? bcSfFilterConfig.custom.max_height * aspect_ratio : 0;
  itemImagesHtml += '<noscript><img class="grid-view-item__image" src="' + this.getFeaturedImage(images, image_size + '@2x') + '" alt="{{itemTitle}}" style="max-width: ' + max_width + 'px;"></noscript>';
  itemHtml = itemHtml.replace(/{{itemImages}}/g, itemImagesHtml);

  // Add Vendor
  var itemVendorHtml = bcSfFilterConfig.custom.vendor_enable ? bcSfFilterTemplate.vendorGridHtml : '';
  itemHtml = itemHtml.replace(/{{itemVendor}}/g, itemVendorHtml);

  // Add Price
  var itemPriceHtml = buildPrice(data, onSale, priceVaries);
  itemHtml = itemHtml.replace(/{{itemPrice}}/g, itemPriceHtml);

  // Add data json
  itemHtml = itemHtml.replace(/{{itemJson}}/g, JSON.stringify(data.json));
  
  // Item Metafield
  itemHtml = itemHtml.replace(/{{itemMetafield}}/g, this.getProductMetafield(data, 'global', 'type') || '');
  
  // Build Domain
  itemHtml = itemHtml.replace(/{{itemDomain}}/g, this.escape(bcSfFilterConfig.shop.domain));

  // Build Description
  var itemDescription = data.description;
  itemDescription = itemDescription.substr(0, itemDescription.indexOf('##highlights##'));
  itemHtml = itemHtml.replace(/{{itemDescription}}/g, itemDescription);

  // Build Tags
  itemHtml = itemHtml.replace(/{{itemTags}}/g, this.escape(data.tags.join(';')));
  
  // Build ThumbUrl
  itemHtml = itemHtml.replace(/{{itemThumbUrl}}/g, thumburl);

  // Add main attribute
  itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
  itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
  itemHtml = itemHtml.replace(/{{itemVendorLabel}}/g, data.vendor);
  itemHtml = itemHtml.replace(/{{itemUrl}}/g, this.buildProductItemUrl(data));

  return itemHtml;
}

// Build Image style
function buildImageStyle(data) {
  var images = data.images_info;
  var imgId = 'ProductCardImage-' + data.id;
  var wrapperId = 'ProductCardImageWrapper-' + data.id;
  var imageStyle = '';
  if (images.length > 0) {
    var image = images[0];
    var width = bcSfFilterConfig.custom.max_height;
    var height = bcSfFilterConfig.custom.max_height;
    var aspect_ratio = image.width / image.height;
    var small_style = true;
    var container_aspect_ratio = width * 1.0 / height;

    if (image.aspect_ratio < 1.0) {
      var maximum_width = height * aspect_ratio;
      if (image.height <= height) {
        var maximum_height = image.height;
        maximum_width = image.width;
      } else {
        var maximum_height = height;
      }
    } else if (aspect_ratio < container_aspect_ratio) {
      var maximum_height = height / aspect_ratio;
      if (image.height <= height) {
        var maximum_height = image.height;
        var maximum_width = image.width;
      } else {
        var maximum_height = height;
        var maximum_width = height * aspect_ratio;
      }
    } else {
      var maximum_height = height / aspect_ratio;
      if (image.width <= width) {
        maximum_height = image.height;
        var maximum_width = image.width
      } else {
        var maximum_width = width;
        maximum_height = maximum_width / aspect_ratio;
      }
    }

    imageStyle += '<style>';
    if (small_style) imageStyle += '@media screen and (min-width: 750px) {';
    imageStyle += '#' + imgId + ' {' +
      'max-width: ' + maximum_width + 'px;' +
      'max-height: ' + maximum_height + 'px;' +
      '}' +
      '#' + wrapperId + ' {' +
      'max-width: ' + maximum_width + 'px;' +
      'max-height: ' + maximum_height + 'px;' +
      '}';
    if (small_style) imageStyle += '}';

    if (small_style) {
      if (aspect_ratio < 1) {
        maximum_width = 750 * aspect_ratio;
      } else {
        if (image.width < 750) {
          maximum_width = image.width;
        } else {
          maximum_width = 750;
        }
      }
      imageStyle += '@media screen and (max-width: 749px) {'
      imageStyle += '#' + imgId + ' {' +
        'max-width: ' + maximum_width + 'px;' +
        'max-height: 750px;' +
        '}' +
        '#' + wrapperId + ' {' +
        'max-width: ' + maximum_width + 'px;' +
        '}';
      imageStyle += '}';
    }
    imageStyle += '</style>';
  }
  return imageStyle;
}

BCSfFilter.prototype.buildProductListItem = function(data) {
  /*** Prepare data ***/
  var images = data.images_info;
  // Displaying price base on the policy of Shopify, have to multiple by 100
  var soldOut = !data.available; // Check a product is out of stock
  var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
  var priceVaries = data.price_min != data.price_max; // Check a product has many prices
  // Get First Variant (selected_or_first_available_variant)
  var firstVariant = data['variants'][0];
  if (getParam('variant') !== null && getParam('variant') != '') {
    var paramVariant = data.variants.filter(function(e) {
      return e.id == getParam('variant');
    });
    if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
  } else {
    for (var i = 0; i < data['variants'].length; i++) {
      if (data['variants'][i].available) {
        firstVariant = data['variants'][i];
        break;
      }
    }
  }
  /*** End Prepare data ***/

  // Get Template
  var itemHtml = bcSfFilterTemplate.productListItemHtml;

  // Add onSale label
  var itemSaleLabel = onSale ? bcSfFilterTemplate.saleLabelListHtml : '';
  itemHtml = itemHtml.replace(/{{itemSaleLabel}}/g, itemSaleLabel);

  // Add soldOut label
  var itemSoldOutLabel = soldOut ? bcSfFilterTemplate.soldOutLabelListHtml : '';
  itemHtml = itemHtml.replace(/{{itemSoldOutLabel}}/g, itemSoldOutLabel);

  // Add Thumbnail
  var itemThumbUrl = images.length > 0 ? this.optimizeImage(images[0]['src'], '600x600') : bcSfFilterConfig.general.no_image_url;
  itemHtml = itemHtml.replace(/{{itemThumbUrl}}/g, itemThumbUrl);

  // Add Vendor
  var itemSmallVendorHtml = bcSfFilterConfig.custom.vendor_enable ? bcSfFilterTemplate.vendorSmallListHtml : '';
  itemHtml = itemHtml.replace(/{{itemSmallVendor}}/g, itemSmallVendorHtml);
  var itemMediumVendorHtml = bcSfFilterConfig.custom.vendor_enable ? bcSfFilterTemplate.vendorMediumListHtml : '';
  itemHtml = itemHtml.replace(/{{itemMediumVendor}}/g, itemMediumVendorHtml);

  // Add Price
  var itemPriceHtml = buildPrice(data, onSale, priceVaries);
  itemHtml = itemHtml.replace(/{{itemPrice}}/g, itemPriceHtml);

  // Add main attribute
  itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
  itemHtml = itemHtml.replace(/{{itemVendorLabel}}/g, data.vendor);
  itemHtml = itemHtml.replace(/{{itemUrl}}/g, this.buildProductItemUrl(data));

  return itemHtml;
}

function buildPrice(data, onSale, priceVaries) {
  var priceHtml = '',
    onSaleClass = onSale ? ' price--on-sale' : '';

  priceHtml += '<dl class="price' + onSaleClass + '" data-price>';
  if (bcSfFilterConfig.custom.vendor_enable) {
    priceHtml += '<div class="price__vendor">';
    priceHtml += '<dt>';
    priceHtml += '<span class="visually-hidden">' + bcSfFilterConfig.label.vendor + '</span>';
    priceHtml += '</dt>';
    priceHtml += '<dd>';
    priceHtml += data.vendor;
    priceHtml += '</dd>';
    priceHtml += '</div>';
  }
  priceHtml += '<div class="price__regular">';
  priceHtml += '<dt>';
  priceHtml += '<span class="visually-hidden visually-hidden--inline">' + bcSfFilterConfig.label.regular_price + '</span>';
  priceHtml += '</dt>';
  priceHtml += '<dd>';
  priceHtml += '<span class="price-item price-item--regular" data-regular-price>';
  if (data.available) {
    if (onSale) {
      priceHtml += bcsffilter.formatMoney(data.compare_at_price_min, bcsffilter.moneyFormat);
    } else {
      priceHtml += bcsffilter.formatMoney(data.price_min, bcsffilter.moneyFormat);
    }
  } else {
    priceHtml += bcSfFilterConfig.label.sold_out;
  }
  priceHtml += '</span>';
  priceHtml += '</dd>';
  priceHtml += '</div>';
  priceHtml += '<div class="price__sale">';
  priceHtml += '<dt>';
  priceHtml += '<span class="visually-hidden visually-hidden--inline">' + bcSfFilterConfig.label.sale_price + '</span>';
  priceHtml += '</dt>';
  priceHtml += '<dd>';
  priceHtml += '<span class="price-item price-item--sale" data-sale-price>';
  priceHtml += bcsffilter.formatMoney(data.price_min, bcsffilter.moneyFormat);
  priceHtml += '</span> ';
  priceHtml += '<span class="price-item__label" aria-hidden="true">' + bcSfFilterConfig.label.sale + '</span>';
  priceHtml += '</dd>';
  priceHtml += '</div>';
  priceHtml += '</dl>';

  return priceHtml;
}

// Build Pagination
BCSfFilter.prototype.buildPagination = function(totalProduct) {
  // Get page info
  var currentPage = parseInt(this.queryParams.page);
  var totalPage = Math.ceil(totalProduct / this.queryParams.limit);

  // If it has only one page, clear Pagination
  if (totalPage == 1) {
    jQ(this.selector.pagination).html('');
    return false;
  }

  if (this.getSettingValue('general.paginationType') == 'default') {
    var paginationHtml = bcSfFilterTemplate.paginateHtml;

    // Build Previous
    var previousHtml = (currentPage > 1) ? bcSfFilterTemplate.previousActiveHtml : bcSfFilterTemplate.previousDisabledHtml;
    previousHtml = previousHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage - 1));
    paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);

    // Build Next
    var nextHtml = (currentPage < totalPage) ? bcSfFilterTemplate.nextActiveHtml : bcSfFilterTemplate.nextDisabledHtml;
    nextHtml = nextHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage + 1));
    paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);

    // Build page items
    var currentPage = bcSfFilterConfig.label.current_page.replace(/{{ current }}/g, currentPage).replace(/{{ total }}/g, totalPage);
    paginationHtml = paginationHtml.replace(/{{pageItems}}/g, currentPage);

    paginationHtml = jQ.parseHTML(paginationHtml);
    jQ(this.selector.pagination).html(paginationHtml);
  }
};

// Build Sorting
BCSfFilter.prototype.buildFilterSorting = function() {
  if (bcSfFilterTemplate.hasOwnProperty('sortingHtml')) {
    jQ(this.selector.topSorting).html('');

    var sortingArr = this.getSortingList();
    if (sortingArr) {
      // Build content
      var sortingItemsHtml = '';
      for (var k in sortingArr) {
        sortingItemsHtml += '<option value="' + k + '">' + sortingArr[k] + '</option>';
      }
      var html = bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
      html = jQ.parseHTML(html);
      jQ(this.selector.topSorting).html(html);

      // Set current value
      jQ(this.selector.topSorting + ' select').val(this.queryParams.sort);
    }
  }
};

// Build Display type
BCSfFilter.prototype.buildFilterDisplayType = function() {
  var itemHtml = '<span>View As </span>';
  itemHtml += '<a href="' + this.buildToolbarLink('display', 'list', 'grid') + '" title="Grid view" class="bc-sf-filter-display-item bc-sf-filter-display-grid" data-view="grid"><span class="icon-fallback-text"><span class="fallback-text">Grid view</span></span></a>';
  itemHtml += '<a href="' + this.buildToolbarLink('display', 'grid', 'list') + '" title="List view" class="bc-sf-filter-display-item bc-sf-filter-display-list" data-view="list"><span class="icon-fallback-text"><span class="fallback-text">List view</span></span></a>';
  itemHtml = jQ.parseHTML(itemHtml);
  jQ(this.selector.topDisplayType).html(itemHtml);

  // Active current display type
  jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-list').removeClass('active');
  jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-grid').removeClass('active');
  if (this.queryParams.display == 'list') {
    jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-list').addClass('active');
  } else if (this.queryParams.display == 'grid') {
    jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-grid').addClass('active');
  }
};

// Add additional feature for product list, used commonly in customizing product list
BCSfFilter.prototype.buildExtrasProductList = function(data, eventType) {
    /* start-initialize-bc-al */
    var self = this;
    var alEnable = true;
    if(self.getSettingValue('actionlist.qvEnable') != '' || self.getSettingValue('actionlist.atcEnable') != ''){
      alEnable = self.getSettingValue('actionlist.qvEnable') || self.getSettingValue('actionlist.atcEnable');
    }
    if (alEnable === true && typeof BCActionList !== 'undefined') {
        if (typeof bcActionList === 'undefined') {
            bcActionList = new BCActionList();
        }else{
          if (typeof bcAlParams !== 'undefined' && typeof bcSfFilterParams !== 'undefined') {
              bcActionList.initFlag = false;
              bcActionList.alInit(bcSfFilterParams, bcAlParams);
          } else {
              bcActionList.alInit();
          }
        }
    }
    /* end-initialize-bc-al */
  var productSelector = jQ(this.selector.products);
  if (this.queryParams.display == 'list') {
    if (productSelector.children('.list-view-items').length == 0) {
      productSelector.children().wrapAll('<ul class="list-view-items"></ul>');
    }
    productSelector.removeClass('grid grid--uniform grid--view-items');
  } else {
    if (productSelector.children('.list-view-items').length > 0) {
      productSelector.children('.list-view-items').children().unwrap();
    }
    productSelector.addClass('grid grid--uniform grid--view-items');
  }
  
  if (typeof Yotpo !== 'undefined') {
      var api = new Yotpo.API(yotpo);
      api.refreshWidgets();
  }
};

// Build Additional Elements
BCSfFilter.prototype.buildAdditionalElements = function(data, eventType) {
  var totalProduct = '';
  if (data.total_product == 1) {
    totalProduct = bcSfFilterConfig.label.items_with_count_one.replace(/{{ count }}/g, data.total_product);
  } else {
    totalProduct = bcSfFilterConfig.label.items_with_count_other.replace(/{{ count }}/g, data.total_product);
  }
  totalProduct = jQ.parseHTML(totalProduct);
  jQ('#bc-sf-filter-total-product').html(totalProduct);
  
  var stickyElement = '#bc-sf-filter-container';
  var startElement = '.em-colc-side-list-main';
  if (!this.isMobile()) jQ(stickyElement).stickTo(startElement);    
  else jQ('#bc-sf-filter-toolbar').mobileStickTo(startElement); 
};

jQ.fn.stickTo = function(startElement) {
    /* constants */    
    var _this = this;  
    var showingHeader = true;
    var isSearchPage = bcsffilter.isSearchPage();
    var $headerHeight = isSearchPage ? 0 : 64;
    var $toolbarMargin = 60;
    var $marginTop = 0;        
    var diff = jQ('#bc-sf-filter-products').offset().top - jQ(startElement).offset().top;
    var $window = jQ(window);  
    var $startElement = jQ(startElement);              
    var $toolbarInitial = jQ('#bc-sf-filter-toolbar').offset().top;
    var $sideInitial = _this.offset().top;
            
    
    /* variables */
    var lastScrollTop = $window.scrollTop();  
  
    /* sticky method */
    var setPosition = function() {
        /* declarations */
        var width = jQ(_this).outerWidth();
        var $windowHeight = $window.height();
        var $contentHeight = $startElement.outerHeight(true);  
        var $contentPositionTop = $startElement.position().top;      
        var $contentTop = $startElement.offset().top; 
        var $divTop = jQ('.em-colc-side-list-main').position().top;      
      
        var sidebarHeight = _this.outerHeight();
        var sidebarTop = _this.offset().top;
        var sidebarBottom = sidebarTop + sidebarHeight;
      
        var scrollTop = $window.scrollTop();                        
        var scrollBottom = scrollTop + $windowHeight;  
        var isScrollingDown = (scrollTop > lastScrollTop);
        /* save last scroll position */
		lastScrollTop = $window.scrollTop();
        
        var endPos = $contentTop + $contentHeight;                
      
        
      
        if (sidebarHeight > $contentHeight) {
          _this.removeClass('bc-sf-filter-stick');            
          _this.css({
            position: 'initial',
            width: '100%'
          });
          return;
        }
      
      	if (scrollBottom >= endPos) { /* End Position  */          
            var absolutePos = $contentHeight - sidebarHeight;
            if (absolutePos > 0) {
              _this.removeClass('bc-sf-filter-stick');              
              _this.css({
                  position: 'absolute',
                  top: absolutePos,
                  bottom: 'unset',
                  width: width
              });
            }          
          
          return;
        }
      
      	if (scrollTop <= $sideInitial) { /* Initial Position */
            _this.removeClass('bc-sf-filter-stick');            
            _this.css({
              position: 'initial',
              width: '100%'
            });
          
          jQ('#bc-sf-filter-toolbar').removeAttr('style');
          return;
        } else if (scrollTop > $toolbarInitial) {                    
          jQ('#bc-sf-filter-toolbar').css({
                position: 'absolute',
                top: isSearchPage ? (scrollTop - $contentTop) : (scrollTop - $contentTop + $toolbarMargin),                
                right: 0,
    			width: '100%',
    			background: '#fff',    
    			'z-index': '10'
          });
        }  
      	
      
        
        
            
        /* when scrolling down */  
        if (isScrollingDown) {          
          if (scrollBottom < sidebarBottom) { /* Until reach the sidebar bottom  */
            if (_this.css('position') !== 'relative') {
              _this.removeClass('bc-sf-filter-stick');            
              _this.css({
                position: 'relative',
                top: sidebarTop - $contentTop,
                bottom: 'unset'
              });          
            }
          } else if (scrollBottom >= sidebarBottom && scrollTop > sidebarTop) { /* Sticky sidebar */            
              _this.addClass('bc-sf-filter-stick');                          

              _this.css({
                  position: 'fixed',
                  top: $windowHeight > (sidebarHeight + $headerHeight) ? $headerHeight : 'unset',
                  bottom: $windowHeight > (sidebarHeight + $headerHeight) ? 'unset' : 0,
                  width: width
              });
          }
        } else { /* when scrolling up */          
          if ((scrollTop - $headerHeight) > sidebarTop) {  /* Until reach the sidebar top  */   
            if (_this.css('position') !== 'relative') {
              _this.removeClass('bc-sf-filter-stick');            
              _this.css({
                position: 'relative',
                top: sidebarTop - $contentTop,
                bottom: 'unset'
              });          
            }
          } else if (scrollTop <= (endPos - sidebarHeight)) { /* Sticky sidebar */
            _this.addClass('bc-sf-filter-stick');                        
          
            _this.css({
                position: 'fixed',
                top:  showingHeader ? ($headerHeight + 'px') : '0',
                bottom: 'unset',
                width: width
            });
          }
        }         
        
    };
  
    /* on window resize */
    jQ(window).resize(function() {        
        setPosition();
    });
  
    /* on scroll */
    jQ(window).scroll(setPosition);
    setPosition();
};

jQ.fn.mobileStickTo = function(startElement) {
    /* constants */    
    var $window = jQ(window);  
    var $startElement = jQ(startElement);               
    var _this = this;  
  
    /* sticky method */
    var setPosition = function() {
        /* declarations */        
        var $contentTop = $startElement.offset().top;            
        var scrollTop = $window.scrollTop();                     
      
      	if (scrollTop <= $contentTop) { /* Initial Position */            
          
          _this.removeAttr('style');
          return;
        }  else {
          _this.css({
                position: 'fixed',
    			top: '83px',
                left: 0,                
    			width: '100%',
    			background: '#fff',
    			padding: '0 20px',
    			'z-index': '10'
          });
        }   
    };
  
    /* on window resize */
    jQ(window).resize(function() {        
        setPosition();
    });
  
    /* on scroll */
    jQ(window).scroll(setPosition);
    setPosition();
};

jQ(document).ready(function() {
  jQ('.bc-custom-filter-button').on('click', function(){
    jQ('body').toggleClass('bc-custom-drawer-open');
  });
  jQ('.bc-custom-drawer-close, .bc-custom-drawer-apply button').click(function(){
    jQ('body').removeClass('bc-custom-drawer-open');
  });
  jQ('.bc-custom-drawer-overlay').click(function(){
    jQ('body').removeClass('bc-custom-drawer-open');
  });
})

/* Mobile Overlay */
BCSfFilter.prototype.buildFilterTreeMobileButtonEvent = function() {
    var _this = this;
    var filterSelector = this.getSelector('filterTree');
    var mobileBtnSelector = '#bc-sf-filter-mobile-button';
    jQ(mobileBtnSelector).unbind('click');
    jQ(mobileBtnSelector).on('click', function() {
        
        jQ('body').toggleClass('bc-custom-drawer-open');
        var style = _this.mobileStyle;
        // Full Width style
        if (style == 'style2' || style == 'style3') {
            jQ(filterSelector).toggleClass('bc-sf-filter-tree-mobile-open');
            // Build mobile content
            _this.buildFilterTreeMobile();
            // Remove scrollbar
            _this.removeScrollbar(jQ('.' + _this.class.filterBlockContent));
        }
        // Default style
        else {
            // Change button text when clicking
            if (_this.getSettingValue('general.changeMobileButtonLabel')) {
                var openClass = _this.class.mobileButtonOpen;
                jQ(this).toggleClass(openClass);
                var label = jQ(this).hasClass(openClass) ? _this.getSettingValue('label.refineMobileCollapse') : _this.getSettingValue('label.refineMobile');
                jQ(this).text(label);
            }
            jQ(filterSelector).slideToggle(function () {
                jQ(filterSelector).toggleClass('bc-sf-filter-tree-mobile-open');
                _this.buildFilterOptionBoxStyle(jQ(this));                
                // Re-initialize jscrollpane
                _this.buildFilterScrollbar();
            });
        }
    });
};

BCSfFilter.prototype.buildFilterOptionGeneralRange = function(data, filterTreeId) {
    if (data && data.hasOwnProperty('values') && Object.keys(data.values).length == 2) {
        var fOType = data.filterType,
            fODisplayType = data.displayType,
            fOSelectType = data.selectType,
            fOId = data.filterOptionId,
            fOLabel = data.label,
            fOValues = data.values;
        if (fOValues.hasOwnProperty('min') && fOValues.hasOwnProperty('max') && fOValues.min !== null && fOValues.max !== null) {
            // Get boundary values of range
            var rangeMin = parseFloat(fOValues.min), rangeMax = parseFloat(fOValues.max);
            var rangeValues = this.customizeRangeValue(rangeMin, rangeMax, data.filterType, data);
            var rangeMin = rangeValues[0], rangeMax = rangeValues[1];
            if (this.checkShowFilterOptionRange(rangeMin, rangeMax, data)) {
                // Get Selector
                var filterOptionRangeClass = this.class.filterOptionRange; // bc-sf-filter-option-range
                var sliderId = filterOptionRangeClass + '-slider-' + fOId + filterTreeId; // bc-sf-filter-option-range-slider-pf_p_price
                var amountId = filterOptionRangeClass + '-amount-' + fOId + filterTreeId; // bc-sf-filter-option-amount-slider-pf_p_price
                // Get filter option range when it is selected
                var currentMin = rangeMin, currentMax = rangeMax;
                if (this.queryParams.hasOwnProperty(fOId)) {
                    var selectedArr = this.queryParams[fOId][0].split(':');
                    if (selectedArr && selectedArr.length == 2) {
                        currentMin = selectedArr[0];
                        currentMax = selectedArr[1];
                    }
                }
                // Get Template
                var html = this.getSettingValue('general.rangeStyle') == 'style2' ? this.getTemplate('filterOptionRange2') : this.getTemplate('filterOptionRange');
                // Prepare data
                var displayValue = this.customizeDisplayRangeValue(currentMin, currentMax, data.filterType, data);
                var itemLabel = this.getTemplate('filterOptionRangeLabel').replace('{{minValue}}', displayValue[0]).replace('{{maxValue}}', displayValue[1]);
                var itemValue = currentMin + ':' + currentMax;
                var selected = (currentMin != rangeMin || currentMax != rangeMax) ? 'selected' : '';
                // Build content
                html = html.replace(/{{minValue}}/g, this.formatMoney(parseFloat(currentMin) * 100, undefined, true)).replace(/{{maxValue}}/g, this.formatMoney(parseFloat(currentMax) * 100, undefined, true));
                html = html.replace(/{{itemLabel}}/g, itemLabel).replace(/{{itemParentId}}/g, fOId).replace(/{{itemValue}}/g, itemValue).replace(/{{itemParentLabel}}/g, fOLabel).replace(/{{itemSelected}}/g, selected);
                html = html.replace(/{{rangeAmountId}}/g, amountId).replace(/{{rangeSliderId}}/g, sliderId);
                var element = jQ(html);
                // Append to filter tree
                this.buildFilterOption(jQ(element)[0].outerHTML, data, filterTreeId);
                // Build Slider
                this.buildFilterOptionGeneralRangeSlider(sliderId, amountId, currentMin, currentMax, rangeMin, rangeMax, data);
            }
        }
    }
};

function onInteractWithFilterOptionValue(event, element, filterType, displayType, selectType, keepValuesStatic) {
    var self = bcsffilter;
    var productNumber = jQ(element).data('count');
    var keepValuesStatic = typeof keepValuesStatic !== 'undefined' ? (keepValuesStatic === 'true') : false;
    if (self.isMobile() && self.mobileStyle == 'style2') {
        // Prevent reloading page
        event.preventDefault();
        if (productNumber > 0 || (keepValuesStatic === true && filterType == 'collection')) {
            // This is action of clicking of user, not browser event
            self.internalClick = true;
            if (selectType == 'single') {
                jQ('.bc-sf-filter-option-block-active').find('ul li').children().removeClass('selected');
            }
            // Highlight selected filter options
            jQ(element).toggleClass('selected');
            jQ(element).siblings().toggleClass('selected');
            // Build
            self.buildFilterSelectionMobile();
        }
    } else {
        if (keepValuesStatic === false && displayType != 'sub_category') {
            // Prevent reloading page
            event.preventDefault();
            if (productNumber > 0 || productNumber == undefined) {
                // This is action of clicking of user, not browser event
                self.internalClick = true;
                // Get value of the filter option selected
                var id = jQ(element).attr('data-id');
                var value = decodeURIComponent(jQ(element).attr('data-value'));
                // Set value collectionId for data of collection_scope used in API params
                if (filterType == 'collection') {
                    self.queryParams.collection_scope = self.collectionId = jQ(element).data('collection-scope');
                }
                /**
                 * Build new url
                 * If display type = list, select type = single, filter type = collection or filter type = sub_category
                 * newUrl = href
                 * else: newUrl = buildFilterOptionLink
                 */
                var newUrl = (displayType == 'list' && selectType == 'single' && (filterType == 'collection' || displayType == 'sub_category')) ? jQ(element).attr('href') : self.buildFilterOptionLink(id, value, filterType, displayType, selectType);
                self.onChangeData(newUrl, filterType, value, id);
              
                jQ('body,html').animate({
                  scrollTop: jQ(self.getSelector('products')).offset().top - 200
                }, 600);
            }
        }
    }
}

BCSfFilter.prototype.afterBuildFilterTree = function(data, filterTreeId) {
    // Wrap all filter option blocks for styling
    jQ(this.getSelector('filterTree') + filterTreeId).children().wrapAll('<div id="bc-sf-filter-options-wrapper"></div>');
    // Box Style
    this.buildFilterOptionBoxStyle(null, filterTreeId);
    // Add scroll bar for block has long content, except the filter option which is range
    this.buildFilterShowMore();
    // Collapse all filter options by default
    if (!this.checkIsFullWidthMobile()) this.collapseFilterOption();

    // Hide filter tree and fix the product list style when the filter has no data
    this.buildFilterTreeStyleNoFilterData(data, filterTreeId);
	
    jQ(".bc-sf-filter-option-value").each(function(index){
      var itemText = jQ(this).text();
      var itemTextFormated = itemText.replace(/-/g," ");
      jQ(this).text(itemTextFormated);
    });
  
};

// Build Default layout
BCSfFilter.prototype.buildDefaultElements=function(){var isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream,isSafari=/Safari/.test(navigator.userAgent),isBackButton=window.performance&&window.performance.navigation&&2==window.performance.navigation.type;if(!(isiOS&&isSafari&&isBackButton)){var self=this,url=window.location.href.split("?")[0],searchQuery=self.isSearchPage()&&self.queryParams.hasOwnProperty("q")?"&q="+self.queryParams.q:"";window.location.replace(url+"?view=bc-original"+searchQuery)}};

function customizeJsonProductData(data) {for (var i = 0; i < data.variants.length; i++) {var variant = data.variants[i];var featureImage = data.images.filter(function(e) {return e.src == variant.image;});if (featureImage.length > 0) {variant.featured_image = {"id": featureImage[0]['id'],"product_id": data.id,"position": featureImage[0]['position'],"created_at": "","updated_at": "","alt": null,"width": featureImage[0]['width'], "height": featureImage[0]['height'], "src": featureImage[0]['src'], "variant_ids": [variant.id]}} else {variant.featured_image = '';};};var self = bcsffilter;var itemJson = {"id": data.id,"title": data.title,"handle": data.handle,"vendor": data.vendor,"variants": data.variants,"url": self.buildProductItemUrl(data),"options_with_values": data.options_with_values,"images": data.images,"images_info": data.images_info,"available": data.available,"price_min": data.price_min,"price_max": data.price_max,"compare_at_price_min": data.compare_at_price_min,"compare_at_price_max": data.compare_at_price_max};return itemJson;};
BCSfFilter.prototype.prepareProductData=function(data){var self=this;var countData=data.length;for(var k=0;k<countData;k++){data[k]["images"]=data[k]["images_info"];if(data[k]["images"].length>0){data[k]["featured_image"]=data[k]["images"][0]}else{data[k]["featured_image"]={src:bcSfFilterConfig.general.no_image_url,width:"",height:"",aspect_ratio:0}}data[k]["url"]="/products/"+data[k].handle;var optionsArr=[];var countOptionsWithValues=data[k]["options_with_values"].length;for(var i=0;i<countOptionsWithValues;i++){optionsArr.push(data[k]["options_with_values"][i]["name"])}data[k]["options"]=optionsArr;var firstVariant=data[k]["variants"][0];var isRoundedPrice=true;if(firstVariant.hasOwnProperty("fulfillment_service")&&firstVariant.fulfillment_service=="gift_card"){isRoundedPrice=false}if(typeof self.convertPriceBasedOnActiveCurrency!=="undefined"){data[k].price_min=self.convertPriceBasedOnActiveCurrency(data[k].price_min,isRoundedPrice);data[k].price_max=self.convertPriceBasedOnActiveCurrency(data[k].price_max,isRoundedPrice);data[k].compare_at_price_min=self.convertPriceBasedOnActiveCurrency(data[k].compare_at_price_min,isRoundedPrice);data[k].compare_at_price_max=self.convertPriceBasedOnActiveCurrency(data[k].compare_at_price_max,isRoundedPrice)}data[k]["price_min"]*=100,data[k]["price_max"]*=100;if(data[k]["compare_at_price_min"]!=null){data[k]["compare_at_price_min"]*=100}if(data[k]["compare_at_price_max"]!=null){data[k]["compare_at_price_max"]*=100}data[k]["price"]=data[k]["price_min"];data[k]["compare_at_price"]=data[k]["compare_at_price_min"];data[k]["price_varies"]=data[k]["price_min"]!=data[k]["price_max"];if(getParam("variant")!==null&&getParam("variant")!=""){var paramVariant=data[k]["variants"].filter(function(e){return e.id==getParam("variant")});if(typeof paramVariant[0]!=="undefined")firstVariant=paramVariant[0]}else{var countVariants=data[k]["variants"].length;for(var i=0;i<countVariants;i++){if(data[k]["variants"][i].available){firstVariant=data[k]["variants"][i];break}}}data[k]["selected_or_first_available_variant"]=firstVariant;var countVariants=data[k]["variants"].length;for(var i=0;i<countVariants;i++){var variantOptionArr=[];var count=1;var variant=data[k]["variants"][i];var variantOptions=variant["merged_options"];if(Array.isArray(variantOptions)){var countVariantOptions=variantOptions.length;for(var j=0;j<countVariantOptions;j++){var temp=variantOptions[j].split(":");data[k]["variants"][i]["option"+(parseInt(j)+1)]=temp[1];data[k]["variants"][i]["option_"+temp[0]]=temp[1];variantOptionArr.push(temp[1])}data[k]["variants"][i]["options"]=variantOptionArr}if(data[k]["variants"][i]["compare_at_price"]!=null){var variantCompareAtPrice=parseFloat(data[k]["variants"][i]["compare_at_price"]);if(typeof self.convertPriceBasedOnActiveCurrency!=="undefined"){variantCompareAtPrice=self.convertPriceBasedOnActiveCurrency(variantCompareAtPrice,isRoundedPrice)}data[k]["variants"][i]["compare_at_price"]=variantCompareAtPrice*100}var variantPrice=parseFloat(data[k]["variants"][i]["price"]);if(typeof self.convertPriceBasedOnActiveCurrency!=="undefined"){variantPrice=self.convertPriceBasedOnActiveCurrency(variantPrice,isRoundedPrice)}data[k]["variants"][i]["price"]=variantPrice*100}data[k]["description"]=data[k]["content"]=data[k]["body_html"];if(data[k].hasOwnProperty("original_tags")&&data[k]["original_tags"].length>0){data[k]["tags"]=data[k]["original_tags"].slice(0)}data[k]["json"]=customizeJsonProductData(data[k])}return data};

/* Begin patch boost-010 run 2 */
BCSfFilter.prototype.initFilter=function(){return this.isBadUrl()?void(window.location.href=window.location.pathname):(this.updateApiParams(!1),void this.getFilterData("init"))},BCSfFilter.prototype.isBadUrl=function(){try{var t=decodeURIComponent(window.location.search).split("&"),e=!1;if(t.length>0)for(var i=0;i<t.length;i++){var n=t[i],a=(n.match(/</g)||[]).length,r=(n.match(/>/g)||[]).length,o=(n.match(/alert\(/g)||[]).length,h=(n.match(/execCommand/g)||[]).length;if(a>0&&r>0||a>1||r>1||o||h){e=!0;break}}return e}catch(l){return!0}};
/* End patch boost-010 run 2 */
