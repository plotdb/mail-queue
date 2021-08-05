(function(){
  var log, md, mailQueue;
  log = require('@plotdb/log');
  md = require('./md');
  mailQueue = function(opt){
    opt == null && (opt = {});
    this.log = opt.logger || new log({
      name: 'MAIL-QUEUE'
    });
    this.list = [];
    this.transporter = opt.transporter;
    this.delay = +opt.delay;
    if (!(opt.delay != null) || isNaN(this.delay) || this.delay < 0) {
      this.delay = 5000;
    }
    return this;
  };
  mailQueue = import$(Object.create(Object.prototype), {
    queue: function(payload){
      var this$ = this;
      return new Promise(function(res, rej){
        this$.list.push({
          payload: payload,
          res: res,
          rej: rej
        });
        this$.handler();
      });
    },
    handler: function(){
      var this$ = this;
      if (this.handle) {
        return;
      }
      this.log.info("new job incoming, handling...".cyan);
      return this.handle = setInterval(function(){
        var obj;
        if (!this$.list.length) {
          this$.log.info("all job done. idle".green);
          clearInterval(this$.handle);
          this$.handle = null;
          return;
        }
        this$.log.info((this$.list.length + " jobs remain...").cyan);
        obj = this$.list.splice(0, 1)[0];
        return this$._sendDirectly(obj.payload).then(obj.res)['catch'](obj.rej);
      }, this.delay);
    },
    send: function(opt){
      opt == null && (opt = {});
      this.log.info(("send [from:" + payload.from + "][to:" + payload.to + "][subsject:" + payload.subject + "]").cyan);
      if (opt.now) {
        return this._sendDirectly(opt);
      } else {
        return this.queue(opt.payload);
      }
    },
    _getTemplate: function(name){
      new Promise(function(res, rej){});
      return fs.readFile(this._getTemplatePath(name), function(e, content){
        var payload;
        if (e) {
          return rej(e);
        }
        try {
          payload = jsYaml.safeLoad(content);
        } catch (e$) {
          e = e$;
          return rej(e);
        }
        return res(payload);
      });
    },
    _sendDirectly: function(opt){
      var this$ = this;
      opt == null && (opt = {});
      return Promise.resolve().then(function(){
        if (!opt.template) {
          return JSON.parse(JSON.stringify(opt.payload));
        }
        return this$._getTemplate(opt.template).then(function(payload){
          ['bcc', 'from', 'to'].map(function(it){
            if (!payload[it]) {
              return payload[it] = opt.payload[it];
            }
          });
          return payload;
        });
      }).then(function(payload){
        var content, k, ref$, v, re;
        content = payload.content || '';
        if (opt.map != null && typeof opt.map === 'object') {
          for (k in ref$ = opt.map) {
            v = ref$[k];
            re = new RegExp("#{" + k + "}", "g");
            content = content.replace(re, v);
            payload.from = payload.from.replace(re, v);
            payload.subject = payload.subject.replace(re, v);
          }
        }
        if (opt.md) {
          payload.text = md.toText(content);
          payload.html = md.toHtml(content);
        }
        delete payload.content;
        return new Promise(function(res, rej){
          return this$.transporter.sendMail(payload, function(e, i){
            var ref$;
            if (!e) {
              return res();
            }
            this$.log.error("send failed: ".red, e);
            return rej((ref$ = new Error(), ref$.name = 'lderror', ref$.id = 500, ref$));
          });
        });
      });
    }
  });
  module.exports = mailQueue;
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
