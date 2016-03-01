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
    onChanges:
      type: 'boolean'
      default: false
      description: 'Only colour icons when file is modified'
    tabPaneIcon:
      type: 'boolean'
      default: true
      description: 'Show file icons on tab pane'

  activate: (state) ->
    @disableSetiIcons true
    atom.config.onDidChange 'file-icons.coloured', ({newValue, oldValue}) =>
      @colour newValue
    @colour atom.config.get 'file-icons.coloured'

    atom.config.onDidChange 'file-icons.forceShow', ({newValue, oldValue}) =>
      @forceShow newValue
    @forceShow atom.config.get 'file-icons.forceShow'

    atom.config.onDidChange 'file-icons.onChanges', ({newValue, oldValue}) =>
      @onChanges newValue
    @onChanges atom.config.get 'file-icons.onChanges'

    atom.config.onDidChange 'file-icons.tabPaneIcon', ({newValue, oldValue}) =>
      @tabPaneIcon newValue
    @tabPaneIcon atom.config.get 'file-icons.tabPaneIcon'
    # console.log 'activate'

  deactivate: ->
    @disableSetiIcons false
    @forceShow false
    @onChanges false
    @colour true
    @tabPaneIcon false
    # console.log 'deactivate'

  serialize: ->
    # console.log 'serialize'

  colour: (enable) ->
    body = document.querySelector 'body'
    body.classList.toggle 'file-icons-colourless', !enable

  forceShow: (enable) ->
    body = document.querySelector 'body'
    body.classList.toggle 'file-icons-force-show-icons', enable

  onChanges: (enable) ->
    body = document.querySelector 'body'
    body.classList.toggle 'file-icons-on-changes', enable

  tabPaneIcon: (enable) ->
    body = document.querySelector 'body'
    body.classList.toggle 'file-icons-tab-pane-icon', enable

  disableSetiIcons: (disable) ->
    workspaceElement = atom.views.getView(atom.workspace)
    workspaceElement.classList.toggle 'seti-ui-no-icons', disable
