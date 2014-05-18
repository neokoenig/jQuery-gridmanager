# jQuery GridManager

A way of building rows and grids with built in editable regions; requires jQuery, jQueryUI, Bootstrap 3.x, TinyMCE

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/neokeonig/jquery-gridmanager/master/dist/jquery.gridmanager.min.js
[max]: https://raw.github.com/neokeonig/jquery-gridmanager/master/dist/jquery.gridmanager.js

In your web page:

```html
<script src="/path/to/jquery.js"></script>
<script src="/path/to/jquery-ui.js"></script>
<script src="/path/to/bootstrap.js"></script>
<script src="/path/to/tinymce.js"></script>
<script src="/path/to/tinymce.query.js"></script>
<script src="dist/gridmanager.min.js"></script>

<div class="container">  
	<div id="myeditableregion"></div>
</div>

<script> 
$(document).ready(function(){ 
   $("#mycanvas").gridmanager();  
});
</script>

```

## Documentation
See [GitHub Pages][ghp]

[ghp]: http://neokoenig.github.io/jQuery-gridmanager/

### Why does this exist?

I was becoming annoyed with the lack of layout tools which you could use with a Rich Text Editor.
Specifically, users would get bewildered by divs everywhere with Bootstrap. Let's face it, if you're not a coder, adding a row or clearfix class, then specifying divs with col-md-6 etc isn't exactly straight forward.

This is designed to work in conjuction with TinyMCE (and others to follow hopefully); it uses HTML5's contentEditable attribute to hook in -inline- instances of TinyMCE.

It identifies all your col-md-* divs - so anything with class="col-md-6" (or any other number), changes the contentEditable to true, which in turn loads in TinyMCE. When you're done manipulating the DOM, previewing strips out and destroys all the TinyMCE instances, removes any additional markup, strips out inline styles on columns and lets you see the markup you've just created in the page, as actually will be!

Saving posts the contents of the main div to a URL via ajax as specified by you in the configuration.

Useful tip, set debug=1 to see console.log action.

```html
$(document).ready(function(){ 
   $("#mycanvas").gridmanager({
	   remoteURL: "/save.php",
	   debug: 1   
   });  
});
```

### Don't like the column presets?

You replace with your own. Simply do

```html
$(document).ready(function(){ 
   $("#mycanvas").gridmanager({
	   remoteURL: "/save.php",
	   buttons: [[12], [6,6], [4,4,4], [3,3,3,3], [2,2,2,2,2,2], [2,8,2], [4,8], [8,4]]"   
   });  
});
```

### Want your own TinyMCE config?

Pass it in:

```html
$(document).ready(function(){ 
   $("#mycanvas").gridmanager({
   remoteURL: "/save.php",
   tinyMCE: {
            selector: "[contenteditable='true']",
            inline: true,
            plugins: [
            "advlist autolink lists link image charmap print preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table contextmenu paste"
            ],
            toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image"
        } 
   });  
});
```

Remember, you'll need to download the dependencies via bower/npm to run the source.

### Does it need Additional CSS?

Almost everything is done from bootstrap classes. You might want to add the following though:
```css
<style> 
  #gridmanager-canvas {min-height: 100px; }
  #gridmanager-canvas .row.editing {padding:5px; border:3px dotted #222; min-height: 20px; margin-bottom:10px; } 
  #gridmanager-canvas [class*=col-][contenteditable="true"] {padding:5px; border:3px dotted #999; min-height: 30px;}
</style>
```

## Examples
_(Coming soon)_

## Release History

0.1.0 - initial alpha test.
