require! <[@plotdb/log ./md]>

mail-queue = (opt={}) ->
  @log = opt.logger or (new log name: 'MAIL-QUEUE')
  @list = []
  @transporter = opt.transporter
  @delay = +opt.delay
  if !(opt.delay?) or isNaN(@delay) or @delay < 0 => @delay = 5000
  @

mail-queue = Object.create(Object.prototype) <<< do
  queue: (payload) ->
    new Promise (res, rej) ~>
      @list.push {payload, res, rej}
      @handler!
      return
  handler: ->
    if @handle => return
    @log.info "new job incoming, handling...".cyan
    @handle = setInterval (~>
      if !(@list.length) =>
        @log.info "all job done. idle".green
        clearInterval @handle
        @handle = null
        return
      @log.info "#{@list.length} jobs remain...".cyan
      obj = @list.splice(0, 1).0
      @_send-directly obj.payload
        .then obj.res
        .catch obj.rej
    ), @delay

  # options:
  #   now: default false. send immediately without queueing
  #   payload: sending information
  #   template: template name
  #   map: hash that maps keywords to interpolate
  # payload arguments: (overwrite by template if available in template )
  #   from: sender ( interpolated if necessary )
  #   to: receiver.
  #   subject: mail subject ( interpolated if necessary )
  #   content: content to send ( interpolated if necessary )
  send: (opt = {}) ->
    @log.info "send [from:#{payload.from}][to:#{payload.to}][subsject:#{payload.subject}]".cyan
    if opt.now => @_send-directly opt
    else @queue opt.payload

  # TODO
  _get-template: (name) ->
    new Promise (res, rej) ~>   
    (e, content) <~ fs.read-file @_get-template-path(name), _
    if e => return rej e
    try
      payload = js-yaml.safe-load content
    catch e
      return rej e
    return res payload

  _send-directly: (opt = {}) ->
    Promise.resolve!
      .then ~>
        if !opt.template => return JSON.parse(JSON.stringify(opt.payload))
        @_get-template(opt.template).then (payload) ->
          <[bcc from to]>.map -> if !payload[it] => payload[it] = opt.payload[it]
          payload
      .then (payload) ~>
        content = (payload.content or '')
        if opt.map? and typeof(opt.map) == \object =>
          for k,v of opt.map =>
            re = new RegExp("\#{#k}", "g")
            content = content.replace(re, v)
            payload.from = payload.from.replace(re, v)
            payload.subject = payload.subject.replace(re, v)
        if opt.md =>
          payload.text = md.to-text(content)
          payload.html = md.to-html(content)
        delete payload.content

        # for now we only support transporter from nodemailer
        new Promise (res, rej) ~>
          @transporter.sendMail payload, (e,i) ~>
            if !e => return res!
            @log.error "send failed: ".red, e
            return rej(new Error! <<< {name: \lderror, id: 500})


module.exports = mail-queue
