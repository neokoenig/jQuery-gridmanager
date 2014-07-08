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

#### Available functions:

<table class="table"> 
	<thead>
	<tr>
		<th>
			Function
		</th>
		<th>
			Params
		</th>
		<th>
			Returns
		</th>
		<th>
			Description
		</th>
	</tr>
	</thead>
		 
	<tbody> 
{% for function in site.data.functions %}
	{% if function.ispublic == 1 %}
		<tr>
			<td><code>{{ function.name }}</code></td>
			<td>{{ function.params}}</td>
			<td><code>{{ function.returns }}</code></td>
			<td>{{ function.desc }}</td>   
		</tr>
	{% endif %} 
{% endfor %}  
 

	</tbody>
</table> 