# file-icons

Adds file specific icons to atom for improved visual grepping

![Screenshot](https://github.com/DanBrooker/file-icons/blob/master/file-icons.png)

# Customisation

CSS classes can be used to customise the file icon or the filename

    # This is the ruby default css
    # Sets the icon to octicon-ruby and colours it red
    .filetype-icon-rb:before
    {
      content: "\f047";
      color: red;
    }

Classes are generated based on file extension or file name in absence of extension.
e.g.
* .rb      -> file-icon-rb
* .erb     -> file-icon-erb
* .html    -> file-icon-html
* Procfile -> file-icon-Procfile


    # You could also colour the entire filename and icon if you so desired
    # Sets the icon to octicon-ruby and colours both the icon and filename text
    .filetype-icon-rb
    {
      color: red;
    }
    .filetype-icon-rb:before
    {
      content: "\f047";
    }
