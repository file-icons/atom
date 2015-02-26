module.exports =
  config:
    coloured:
      type: 'boolean'
      default: true
      description: 'Untick this for colourless icons'
    forceShow:
      type: 'boolean'
      default: false
      description: 'Force show icons - for themes that hide icons'
  activate: (state) ->
    self = @
    atom.config.onDidChange 'file-icons.coloured', ({newValue, oldValue}) ->
      self.colour(newValue)
    @colour(atom.config.get('file-icons.coloured'))

    atom.config.onDidChange 'file-icons.forceShow', ({newValue, oldValue}) ->
      self.forceShow(newValue)
    @forceShow(atom.config.get('file-icons.forceShow'))
    # console.log 'activate'
  deactivate: ->
    # console.log 'deactivate'
  serialize: ->
    # console.log 'serialize'
  colour: (enable) ->
    body = document.querySelector('body')
    if enable
      body.className = body.className.replace(/\sfile-icons-colourless/, '')
    else
      body.className = body.className + " " + 'file-icons-colourless'
  forceShow: (enable) ->
    body = document.querySelector('body')
    className = body.className
    if enable
      body.className = className + " " + 'file-icons-force-show-icons'
    else
      body.className = className.replace /\sfile-icons-force-show-icons/, ''
