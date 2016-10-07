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
    
    colouredIcons = "file-icons.coloured"
    atom.config.onDidChange colouredIcons, ({newValue, oldValue}) =>
      @colour newValue
    @colour atom.config.get colouredIcons
    atom.commands.add 'body', 'file-icons:toggle-colours', (event) ->
      atom.config.set colouredIcons, !(atom.config.get colouredIcons)
    
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
        
        # Fixes tab icons after editor's finished initialising
        fixAfterLoading = () ->
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
        
        
        # New file
        unless openedFile
          onSave = editor.onDidSave (file) ->
            tab = workspace?.querySelector(".tab-bar > .active.tab > .title")
            
            # Patch data-* attributes to fix missing tab-icon
            fixIcon = () ->
              if not tab?.dataset.path
                {path} = file
                tab.dataset.path = path
                tab.dataset.name = basename path
                fixAfterLoading()
            
            # Make sure tab's actually visible
            if tab then fixIcon()
            
            # Tab wasn't found; something weird happened with pending panes
            else
              onTerminate = editor.onDidTerminatePendingState () ->
                setTimeout (->
                  
                  # Try again
                  tab = workspace?.querySelector(".tab-bar > .active.tab > .title")
                  fixIcon()
                  
                ), 10
                onTerminate.dispose()
            
            # Remove the listener
            onSave.dispose()
        
        # Existing file: wait for pane to finish loading before querying the DOM
        else
          fixAfterLoading()
    
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
