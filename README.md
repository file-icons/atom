# file-icons

Adds file specific icons to atom for improved visual grepping

![Screenshot](https://raw.githubusercontent.com/DanBrooker/file-icons/master/file-icons.png)

# Customisation
## Icons
Icons are located at `./stylesheets/icons.less`. You can create a custom CSS class and express its code through `content: "\fxxx";`. Octicons is the default icon's class.

```css
.ruby-icon { content: "\f047"; }
```

Some custom fonts are already provided, such as [FontAwesome](http://fortawesome.github.io/)(`.fa`) and [FontMfizz](http://mfizz.com/oss/font-mfizz)(`.mf`), you just have to provide its class.

```css
.coffee-icon { .fa; content: "\f0f4"; }
```

## Colors
You can disable icon colors at `./stylesheets/colors.less`.
```css
@colorized-icons: true; // Set it to false to disable colors
```

Colors are used from the [Base16](https://github.com/chriskempson/base16) color palette. CSS classes used to apply color follow its primary 8 (eight) colors and 3 (three) variants:

  * Red, Green, Yellow, Blue, Maroon, Purple, Orange, Cyan
  * Light, Medium, Dark.

Medium is color provided by Base16. Light is medium lightened 15%. Dark is medium darkened 15%. In order to "construct" a CSS class color, you provide its variant followed by a dash (-).

```css
.light-red;
.medium-blue;
.dark-maroon;
```

You can also color the entire filename by removing `:before` from the icon class selector.

```css
.file-icon-rb        { .ruby-icon; .medium-red; } // Colors icon and filename
.file-icon-rb:before { .ruby-icon; .medium-red; } // Colors only icon
.file-icon-rb:before { .ruby-icon;              } // Icon and no color, to disable color for only a specific subset
```

## Full Icon

CSS classes can be used to customise the file icon or the filename

```css
// This is the ruby default css
// Sets the icon to octicon-ruby and colors it Medium Red
.file-icon-rb:before { .ruby-icon; .medium-red; }
```

Classes are generated based on file extension or file name in absence of extension.
e.g.
* `*.rb`      -> file-icon-**rb**
* `*.erb`     -> file-icon-**erb**
* `*.html`    -> file-icon-**html**
* `Procfile` -> file-icon-**Procfile**

Classes for directory must specify its name through a `data-name` attribute.

* `.git/` -> icon-file-directory[data-name="**.git**"]

# Acknowledgments
Wouldn't have even tried to make this if it weren't for [sommerper/filetype-color](https://github.com/sommerper/filetype-color)
