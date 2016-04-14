{basename} = require "path"

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
    @observe true

    atom.config.onDidChange 'file-icons.forceShow', ({newValue, oldValue}) =>
      @forceShow newValue
    @forceShow atom.config.get 'file-icons.forceShow'

    atom.config.onDidChange 'file-icons.onChanges', ({newValue, oldValue}) =>
      @onChanges newValue
    @onChanges atom.config.get 'file-icons.onChanges'

    atom.config.onDidChange 'file-icons.tabPaneIcon', ({newValue, oldValue}) =>
      @tabPaneIcon newValue
    @tabPaneIcon atom.config.get 'file-icons.tabPaneIcon'


  deactivate: ->
    @disableSetiIcons false
    @forceShow false
    @onChanges false
    @colour true
    @tabPaneIcon false
    @observe false


  observe: (enabled) ->
    
    # Setting up observers
    if enabled
      @observer = atom.workspace.observeTextEditors (editor) ->
        workspace = atom.views.getView(atom.workspace)
        openedFile = editor.getPath()
        
        # New file
        unless openedFile
          onSave = editor.onDidSave (file) ->
            tab = workspace?.querySelector(".tab-bar > .active.tab > .title")
            
            # Patch data-* attributes to fix missing tab-icon
            if not tab?.dataset.path
              {path} = file
              tab.dataset.path = path
              tab.dataset.name = basename path
            
            # Remove the listener
            onSave.dispose()
        
        # Existing file: wait for pane to finish loading before querying the DOM
        else
          onDone = editor.onDidStopChanging () ->
            tabs = workspace?.querySelectorAll(".pane > .tab-bar > .tab")
            fileTabs = [].filter.call tabs, (tab) -> tab?.item is editor
            
            # When a file's been renamed, patch the dataset of each tab that has it open
            editor.onDidChangePath (path) =>
              for tab in fileTabs
                title = tab.itemTitle
                title.dataset.path = path
                title.dataset.name = basename path
            
            # Drop the registration listener
            onDone.dispose()
    
    # Disable observers if deactivating package
    else if @observer?
      @observer.dispose()


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
