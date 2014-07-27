---
layout: default
title: "Gridmanager.js Documentation"
---

## gridmanager.js

### What is it?

Gridmanager allows you to create, reorder, update & delete rows and columns in grid layouts used by frameworks such as Bootstrap 3.x or Foundation 5.x. It is *not* another Rich Text Editor (although it can use them), and is designed to work more as a structural / page building device for use in web applications, custom CMS system etc.

#### You can:

- Drag and drop columns & rows
- Resize, delete and add columns on the fly
- Apply custom column and row classes
- Nest rows within columns
- Quickly edit the source code directly
- Add row templates for common column width layouts
- Add/Alter the ID of a column or row directly
- Add, Edit, Delete, Sort editable regions to change column/row text
- Tie in Rich Text Editors such as TinyMCE & CKEditor to those editable regions
- Change layout modes for easy editing & previewing of responsive classes
- Use fluid rows if you want
- Create your own custom controls for easily extending functionality

#### Changelog

+ 0.3.1
  - New style of editable regions which are stackable/editable/deletable
  - Added: default editable region button
  - Added: Theming using LESS 
  - Default, light & dark themes now available
  - Large visual cleanup
  - Fixed: remoteURL now posts as proper key/value pair
  - Added: initMarkup() to autowrap non commented markup
  - Added: editableRegionEnabled & autoEdit options
  - Added: additional filterCallback option which runs on init();
+ 0.3.0 
  - Nested row & column support & new add nested row button
  - Added ability to add custom controls on rows & columns (with your own callbacks) 
  - Added Custom column classes in addition to row classes
  - RTE's are now attached to their own editable regions within columns
  - Responsive class support added
  - Responsive class layout mode added
  - Font Awesome now the icon default
  - Documentation now available at http://neokoenig.github.io/jQuery-gridmanager/docs
+ 0.2.2
  - Modal removed; 
  - Source code editing now available directly. 
  - Basic (very basic) foundation support with correct config. 
  - Editable Custom row classes. 
  - Editable Custom Row IDs
+ 0.2.1 
  - Fluid rows now supported. 
  - Columns are now resizable. 
  - Column moving improved. 
  - Source code alert now modal
+ 0.2.0 
  - TinyMCE, CKEditor now supported. 
  - Columns now moveable. 
  - Added reset, alert features, redid CSS and most of the plugin
+ 0.1.1 
  - CSS moved to it's own file. 
  - Slight visual tweaks.
+ 0.1.0 
  - initial alpha test.

#### Licence

Released under the MIT licence. Go wild.

#### Contributors

+ [Tom King](https://github.com/neokoenig/)
+ [Percy D Brea](https://github.com/pbreah/) 

#### Blog Posts
+ http://www.oxalto.co.uk/2014/07/gridmanager-js-0-3-0-released/
+ http://www.oxalto.co.uk/2014/05/gridmanager-js-0-2-1-released/
+ http://www.oxalto.co.uk/2014/05/gridmanager-js-0-2-0-released/
+ http://www.oxalto.co.uk/2014/05/introducing-gridmanager-js/