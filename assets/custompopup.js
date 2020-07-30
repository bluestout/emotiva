$(document).ready(function(){0
  $(".overlaydiv, .closeimage").click(function(){
    $("body").removeClass("em-pg-blur-sec");
    $(".overlaydiv, .popupdiv").fadeOut();
  })
  $(".em-res-video-block-vid-play").click(function(){
    var LinkGet = $(this).attr("data-link");
    $(".VideoLink iframe").attr("src",LinkGet);
    setTimeout(function(){ 
    $("body").addClass("em-pg-blur-sec");
    $(".overlaydiv, .popupdiv").fadeIn();
      }, 1000);
    
  })
})