---
layout: page
title: "Options Reference"
category: dev
date: 2014-07-06 10:49:57
---  
<table class="table"> 
	<thead>
	<tr>
		<th>
			Option Name
		</th>
		<th>
			Requires
		</th>
		<th width=350>
			Default
		</th>
		<th>
			Description
		</th>
	</tr>
	</thead>
		 
	<tbody>
<tr><td colspan="4"><h3>General<h3></td></tr>
{% for option in site.data.options %}
	{% if option.category contains 'general'%}
		<tr>
			<td><code>{{ option.name }}</code></td>
			<td>{{ option.requires }}</td>
			<td><code>{{ option.default }}</code></td>
			<td>{{ option.desc }}</td>   
		</tr>
	{% endif %} 
{% endfor %}  

	<tr><td colspan="4"><h3>Rows</h3></td></tr>
{% for option in site.data.options %}
	{% if option.category contains 'row'%}
		<tr>
			<td><code>{{ option.name }}</code></td>
			<td>{{ option.requires }}</td>
			<td><code>{{ option.default }}</code></td>
			<td>{{ option.desc }}</td>   
		</tr>
	{% endif %} 
{% endfor %}  

	<tr><td colspan="4"><h3>Columns</h3></td></tr>
{% for option in site.data.options %}
	{% if option.category contains 'col'%}
		<tr>
			<td><code>{{ option.name }}</code></td>
			<td>{{ option.requires }}</td>
			<td><code>{{ option.default }}</code></td>
			<td>{{ option.desc }}</td>   
		</tr>
	{% endif %} 
{% endfor %}  

	<tr><td colspan="4"><h3>Rich Text Editors</h3></td></tr>
{% for option in site.data.options %}
	{% if option.category contains 'rte'%}
		<tr>
			<td><code>{{ option.name }}</code></td>
			<td>{{ option.requires }}</td>
			<td><code>{{ option.default }}</code></td>
			<td>{{ option.desc }}</td>   
		</tr>
	{% endif %} 
{% endfor %}  
	<tr><td colspan="4"><h3>Button Objects</h3> <p>Passed into row and column areas</p>
<pre>  rowButtonsAppend: [ 
                {
                 title:"Remove row", 
                 element: "a", 
                 btnClass: "pull-right gm-removeRow",
                 iconClass: "fa fa-trash-o"
                }
       ],</pre></td></tr>
{% for option in site.data.options %}
	{% if option.category contains 'btnObject'%}
		<tr>
			<td><code>{{ option.name }}</code></td>
			<td>{{ option.requires }}</td>
			<td><code>{{ option.default }}</code></td>
			<td>{{ option.desc }}</td>   
		</tr>
	{% endif %} 
{% endfor %} 
	<tr><td colspan="4"><h3>Custom Control Objects</h3> <p>Passed into custom controls <code>global_row</code> and <code>global_col</code>.
		<pre>customControls: {
            global_row: [{ callback: 'test_callback', loc: 'bottom' }],
            global_col: [{ callback: 'test_callback', loc: 'top' }]
        }</pre></td></tr>
{% for option in site.data.options %}
	{% if option.category contains 'customControls'%}
		<tr>
			<td><code>{{ option.name }}</code></td>
			<td>{{ option.requires }}</td>
			<td><code>{{ option.default }}</code></td>
			<td>{{ option.desc }}</td>   
		</tr>
	{% endif %} 
{% endfor %} 

	</tbody>
</table>
 
