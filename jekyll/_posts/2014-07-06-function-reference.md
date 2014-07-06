---
layout: page
title: "Function Reference"
category: dev
date: 2014-07-06 10:49:26
---

#### Using gridmanager functions

Sometimes you may want to use gridmanager's internal functions; examples where you might want to do this could include:

Building your own control bar for elsewhere in the page to trigger resets, saving, layout mode switches etc.

More advanced CMS integration where you might need to stop certain processes from firing, such as the preview and cleanup modes.

	<script>
		$(document).ready(function(){ 
			var gm = jQuery("#mycanvas").gridmanager().data('gridmanager');
			
			$(".myexternalcontrol").on("click", function(e){
				// Example use of internal gridmanager function:
				gm.appendHTMLSelectedCols('<p>my content to append to all my selected cols</p>');
			});
		});
	</script> 

#### Useful functions:

Coming soon