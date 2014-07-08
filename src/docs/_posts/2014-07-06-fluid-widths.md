---
layout: page
title: "Fluid Widths"
category: tut
date: 2014-07-06 10:47:05
---

To use a fluid layout (this assumes you're using Boostrap 3.x), simply change the options classes to incorporate bootstrap's ```row-fluid``` class

	<script> 
	$(document).ready(function(){   
	   $("#mycanvas").gridmanager({ 
	        controlPrepend: "<div class='row-fluid'><div class='col-md-12'><div id='gm-addnew' class='btn-group '>", 
	        rowClass:    "row-fluid",
	        rowSelector: "div.row-fluid",
	        rowPrepend:  "<div class='row-fluid gm-editing'>"
	    }  
	  ); 
	});
	</script> 
