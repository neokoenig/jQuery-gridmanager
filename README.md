# jQuery GridManager

A way of building rows and grids with built in editable regions; requires jQuery, jQueryUI, Bootstrap 3.x, TinyMCE

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.githubusercontent.com/neokoenig/jQuery-gridmanager/master/dist/jquery.gridmanager.min.js
[max]: https://raw.githubusercontent.com/neokoenig/jQuery-gridmanager/master/dist/jquery.gridmanager.js

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
   $("#myeditableregion").gridmanager();  
});
</script>

```

## Documentation
See [GitHub Pages][ghp] for docs + demo

[ghp]: http://neokoenig.github.io/jQuery-gridmanager/ 

## Release History

0.1.0 - initial alpha test.
