module.exports =
  treeFileSelector: "li.file span"
  activate: (state) ->
    @planUpdate()
    atom.workspaceView.on 'tree-view:directory-modified', =>
      console.log "treeview modified"
      @icons()

  planUpdate: ->
    setTimeout =>
      @icons()
      @planUpdate()
    , 300

  icons: ->
    treeView = document.querySelector(".tree-view")
    return unless treeView
    elements = treeView.querySelectorAll(@treeFileSelector)

    @colorElement(el) for el in elements

  colorElement: (el) ->
    fileName = el.innerHTML

    ext = fileName.split('.').pop()
    className = "file-icon-" + ext
    @clearElement(el)
    el.className = el.className + " " + className;
  clearElement: (el) ->
    el.className = el.className.replace(/\sfile-icon-[\w]+/, '');
