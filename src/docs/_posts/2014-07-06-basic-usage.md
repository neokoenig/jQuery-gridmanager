---
layout: page
title: "Basic Usage"
category: tut
date: 2014-07-06 10:45:33
---

Assumes you have jQuery, jQueryUI and Bootstrap 3.x already on your page.

Link the gridmanager JS and CSS files:
	
    <link href="dist/css/jquery.gridmanager.css" rel="stylesheet">  
    <script src="dist/js/jquery.gridmanager.min.js"></script> 

Create a ```<div>``` element which gridmanager will attach to:

	<div id="mycanvas"></div>

If you have HTML which needs to be loaded into the editor, simply include it between the ```<div>``` tags:

	<div id="mycanvas">
		<div class="row">
			<div class="col-md-6"><p>Content</p></div>
			<div class="col-md-6"><p>Content</p></div>
		</div>
	</div>

Now tie in the id or class into gridmanger: you can do this two ways:

####Simple implementation####

	<script> 
		$(document).ready(function(){
			$("#mycanvas").gridmanager();
		});
	</script> 

####Extended implementation####

for when you want to use internal gridmanager functions:

	<script>
		$(document).ready(function(){ 
			var gm = jQuery("#mycanvas").gridmanager().data('gridmanager');
			
			$(".myexternalcontrol").on("click", function(e){
				// Example use of internal gridmanager function:
				gm.appendHTMLSelectedCols('<p>my content to append to all my selected cols</p>');
			});
		});
	</script> 



