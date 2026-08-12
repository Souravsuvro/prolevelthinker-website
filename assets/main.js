/* ProLevelThinker loader */
(function(){
  function srcBase(){
    var scripts=document.getElementsByTagName("script");
    for(var i=0;i<scripts.length;i++){
      if(scripts[i].src&&scripts[i].src.indexOf("main.js")!==-1){
        return scripts[i].src.replace(/main\.js(\?.*)?$/,"");
      }
    }
    return "/assets/";
  }
  function load(src,cb){
    var s=document.createElement("script");
    s.src=src; s.onload=cb; s.onerror=cb;
    document.head.appendChild(s);
  }
  var base=srcBase();
  function start(){
    load(base+"conversion.js",function(){});
  }
  if(window.PLT_CONFIG) start();
  else load(base+"config.js", start);
})();
