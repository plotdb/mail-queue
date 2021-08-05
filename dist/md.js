(function(){
  var fs, marked, unescape, option;
  fs = require('fs');
  marked = require('marked');
  unescape = function(text){
    return text.replace(/\&\#[0-9]*;|&amp;/g, function(code){
      if (/amp/.exec(code)) {
        return '&';
      }
      return String.fromCharCode(code.match(/[0-9]+/));
    });
  };
  option = {
    html: {
      breaks: true,
      renderer: new marked.Renderer()
    },
    text: {
      breaks: true,
      renderer: function(){
        var render, x$;
        render = new marked.Renderer();
        x$ = render;
        x$.br = function(){
          return "\r\n";
        };
        x$.link = function(href, title, text){
          return unescape(text);
        };
        x$.paragraph = function(text){
          return unescape(text) + "\r\n\r\n";
        };
        x$.heading = function(text){
          return "=== " + unescape(text) + " ===";
        };
        x$.image = function(href, title, text){
          return "";
        };
        return render;
      }()
    }
  };
  module.exports = {
    toText: function(it){
      marked.setOptions(option.text);
      return marked(it);
    },
    toHtml: function(it){
      marked.setOptions(option.html);
      return marked(it);
    }
  };
}).call(this);
