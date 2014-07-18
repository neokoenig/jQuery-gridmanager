---
layout: page
title: "Using Foundation"
category: tut
date: 2014-07-06 10:47:20
---

Whilst gridmanager.js is primarily intended for use in Bootstrap 3.x, it has been deliberately put together so that you can integrate any CSS framework which has a similar grid concept.

The only real pre-requisites are the concept of a 'row' which has it's own class, and a column class (such as col-md-6, span6, large6 etc) which has a numerical reference at the end. As such, you can actually make gridmanager work in Bootstrap 2.x & Foundation 5.x by just changing the various classes in the options to suit your needs.

Since version 0.2.3 we went for fontawesome as a default meaning it's a lot easier to use another framework, as you don't have to constantly worry about icons.

### Foundation 5.x ###

	<script> 
	$(document).ready(function(){  
		$("#mycanvas").gridmanager({
	    
        // Default control button class
        controlButtonClass: "tiny button", 
        gmFloatLeft: "left",
        gmFloatRight: "right",
        gmBtnGroup:  "button-group", 
        gmDangerClass: "alert",
         // Control bar RH dropdown markup
        controlAppend: "<div class='button-group right'><button title='Edit Source Code' type='button' class='button tiny gm-edit-mode'><span class='fa fa-code'></span></button><button title='Preview' type='button' class='button tiny gm-preview'><span class='fa fa-eye'></span></button><div class='button-group right gm-layout-mode'><a class='button tiny' data-width='auto' title='Desktop'><span class='fa fa-desktop'></span></a><a class='button tiny'  title='Tablet' data-width='768'><span class='fa fa-tablet'></span></a><a title='Phone' class='button tiny' data-width='640'><span class='fa fa-mobile-phone'></span></a></div><a  class='gm-save button tiny'  title='Save'  href='#'><span class='fa fa-save'></span></a><a  class='button tiny gm-resetgrid'  title='Reset Grid' href='#'><span class='fa fa-trash-o'></span></a>", 
        rowSortingClass: "panel callout radius", 
        rowButtonsPrepend: [
                {
                   title:"New Column", 
                   element: "a", 
                   btnClass: "gm-addColumn left  ",
                   iconClass: "fa fa-plus"
                }, 
                 {
                   title:"Row Settings", 
                   element: "a", 
                   btnClass: "right gm-rowSettings",
                   iconClass: "fa fa-cog"
                }
                
            ], 
         rowButtonsAppend: [ 
                {
                 title:"Remove row", 
                 element: "a", 
                 btnClass: "right gm-removeRow",
                 iconClass: "fa fa-trash-o"
                }
            ],
         rowCustomClasses: ["panel","callout","radius"], 
        // Additional column class to add (foundation needs columns, bs3 doesn't)
        colAdditionalClass: "column", 
        colDesktopClass: "large-",
        colTabletClass: "medium-",
		colPhoneClass: "small-", 
		colDesktopSelector: "div[class*=large]",
		colTabletSelector: "div[class*=medium]",
		colPhoneSelector: "div[class*=small]",
        colButtonsPrepend: [                
               {
                 title:"Make Column Narrower", 
                 element: "a", 
                 btnClass: "gm-colDecrease left",
                 iconClass: "fa fa-minus"
              },
              {
               title:"Make Column Wider", 
               element: "a", 
               btnClass: "gm-colIncrease left",
               iconClass: "fa fa-plus"
              },
              {
                   title:"Column Settings", 
                   element: "a", 
                   btnClass: "right gm-colSettings",
                   iconClass: "fa fa-cog"
                }
            ],
        // Buttons to append to each column
        colButtonsAppend: [ 
                {
                 title:"Add Nested Row", 
                 element: "a", 
                 btnClass: "left gm-addRow",
                 iconClass: "fa fa-plus-square"
                },
                {
                 title:"Remove Column", 
                 element: "a", 
                 btnClass: "right gm-removeCol",
                 iconClass: "fa fa-trash-o"
                }
            ]
    	}); 
	});
	</script> 

