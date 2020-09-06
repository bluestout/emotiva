// ======================================================================

$(document).ready(function(){
  $(".plusquantity.qntyadjst").click(function(){
    var newQty = +($(this).siblings("input").val()) + 1;
    $(this).siblings("input").val(newQty);
  });

  $(".minusquantity.qntyadjst").click(function(){
    var newQty = +($(this).siblings("input").val()) - 1;
    if(newQty < 0)newQty = 0;
    $(this).siblings("input").val(newQty);
  });




  $(".overlayimg").click(function(){
    $(".main-image").fadeOut();
    $(".overlayimg").fadeOut();
  });

  $(".crossdiv").click(function(){
    $(".main-image").fadeOut();
    $(".overlayimg").fadeOut();
  });


})

// Set the currency to a default based on a landing page
$(window).load(function(){

  $('body').on('click', '.em-nav-top-cart', function(e){
var getpath = window.location.pathname;
    if(getpath=="/cart")
    {}else{
    e.preventDefault();
    $("#overlay").addClass("is-active");
    $(".inline-cart").addClass("is-active");
    }
  })

  $('body').on('click', '.close-cart-img', function(e){
    e.preventDefault();
    $("#overlay").removeClass("is-active");
    $(".inline-cart").removeClass("is-active");
  })

  $('body').on('click', '.continueshopping', function(e){
    e.preventDefault();
    $("#overlay").removeClass("is-active");
    $(".inline-cart").removeClass("is-active");
  })

  $('body').on('click', '#overlay', function(){
    $("#overlay").removeClass("is-active");
    $(".inline-cart").removeClass("is-active");
  })

})

$(document).ready(function(){
  $('body').on('change', '.changequantity', function(){
    var getline = $(this).attr("data-line-item-index");
    var getval = $(this).val();


    $.ajax({
      type: 'POST',
      url: '/cart/change.js',
      data:  'quantity=' + getval + '&line=' + getline,
      dataType: 'json',

      success: function(data) 
      {
        if(data.item_count > 0){
          $('.site-header__cart #CartCount').html(data.item_count);          

        } else {
          $('.site-header__cart #CartCount').html(data.item_count) ;         
        }

        $.ajax({
          type: "GET",
          url: "/cart",
          dataType: 'html',

          success: function(data) 
          {
            console.log("syncCart");
            // console.log(data);
            var minicartdata=$(data).filter('#slidingcartmain').html();
            // console.log(minicartdata);
            $('#slidingcartmain').html(minicartdata);
            $("#overlay").addClass("is-active");
            $(".inline-cart").addClass("is-active");
          }
        })
      }
    })

  })


})
function remove(line, quantity){
  $.ajax({
    type: 'POST',
    url: '/cart/change',
    data: 'quantity='+quantity+'&line='+line,
    dataType: 'json',
    success: function(response){
      $.ajax({
        type: 'GET',
        url: '/cart.js',
        dataType: 'json',
        success: function(cartdata){
          $('.site-header__cart #CartCount').html(cartdata.item_count);
          $.ajax({
            type: "GET",
            url: "/cart",
            dataType: 'html',

            success: function(data) 
            {
              var minicartdata=$(data).filter('#slidingcartmain').html();
              $('#slidingcartmain').html(minicartdata);
              var countnumb=$(data).find('.countget').html();
                
                $('.countget').html(countnumb);
                $('.MobileCart').html(countnumb);
                $('.fixedCart').html(countnumb);

            }
          });
        }
      });
    }
  });
}
$(document).ready(function(){
  $("img.closebar").click(function(){
    $(this).hide();
    $(this).siblings(".promotionaltext.lightboxdisplay").hide();
    $(".home-slideshow.content-width").addClass("pickup");
  })

  $(".product-form button.btn.product-form__cart-submit").click(function(e){
    e.preventDefault();
    $.ajax({
      type: 'POST',
      url: '/cart/add.js',
      data:$(".product-single__meta .product-form").serialize(),
      dataType: 'json',
      success: function(response){
        $.ajax({
          type: 'GET',
          url: '/cart.js',
          dataType: 'json',
          success: function(cartdata){
            $('.site-header__cart #CartCount').html(cartdata.item_count);
            $.ajax({
              type: "GET",
              url: "/cart",
              dataType: 'html',

              success: function(data) 
              {
                
                var minicartdata=$(data).filter('#slidingcartmain').html();
                var countnumb=$(data).find('.countget').html();
                $('#slidingcartmain').html(minicartdata);
                
                $('.countget').html(countnumb);
                $('.MobileCart').html(countnumb);
                $('.fixedCart').html(countnumb);
                $("#overlay").addClass("is-active");
                $(".inline-cart").addClass("is-active");
              }
            });
          }

        });
      },
      error: function(resp) 
      {
        var getres = JSON.stringify(resp);

        alert(resp.responseJSON.description);



      }
    });
  })
})
