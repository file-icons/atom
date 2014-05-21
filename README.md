# file-icons

Adds file specific icons to atom for improved visual grepping

![Screenshot](https://raw.githubusercontent.com/DanBrooker/file-icons/master/file-icons.png)

# Customisation

CSS classes can be used to customise the file icon or the filename

    // This is the ruby default css
    // Sets the icon to octicon-ruby and colours it red
    .file-icon-rb:before
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

```
// You could also colour the entire filename and icon if you so desired
// Sets the icon to octicon-ruby and colours both the icon and filename text
.file-icon-rb
{
  color: red;
}
.file-icon-rb:before
{
  content: "\f047";
}
```

# Acknowledgments
Wouldn't have even tried to make this if it weren't for [sommerper/filetype-color](https://github.com/sommerper/filetype-color)
