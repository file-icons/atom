module.exports =
  activate: (state) ->
    @timeout(100)
    atom.workspaceView.on 'tree-view:directory-modified', =>
      console.log "treeview modified"
      @icons()
  timeout: (interval) ->
    self = this
    setTimeout( ->
      self.icons()
      self.timeout(2000) # I would prefer not to do this, but until there's more filetree events it's hard to get notified
    , interval)
  icons: ->
    treeView = document.querySelector(".tree-view")
    return unless treeView
    elements = treeView.querySelectorAll("li.file span")

    for el in elements
      @colorElement(el)
  colorElement: (el) ->
    fileName = el.innerHTML

    ext = fileName.split('.').pop()
    className = "file-icon-" + ext
    @clearElement(el)
    el.className = el.className + " " + className;
  clearElement: (el) ->
    el.className = el.className.replace(/\sfile-icon-[\S]+/, '');
