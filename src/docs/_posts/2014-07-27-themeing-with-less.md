---
layout: page
title: "Themeing with LESS"
category: dev
date: 2014-07-27 10:47:20
---

Gridmanager.js comes with three provided themes, a default theme and a light and dark variant. The default theme is the normal ```js/jquery.gridmanger.css``` file. To use the dark theme, simply change this link to ```js/jquery.gridmanager-dark.css```. Each theme includes the full CSS core of gridmanager, so you only need to link to a single file.

### Creating your own theme

There are a few options to styling the look of gridmanager. If you have no experience with LESS css preprocessing (and if you don't, I highly recommend you go and have a play), then you can just override any of the gridmanager css classes in your own style sheet. Whilst this isn't ideal, it will work. However, it makes future updates of the theme more troublesome.

Ideally, you want to leverage the existing LESS files in ```src/less``` : 

+ start by creating your own .less file: let's call it ```custom.less``` and place it in the ```src/themes/``` folder
+ copy and paste the contents of ```default.less``` into your ```custom.less``` file
+ override any variables, such as ```@canvas-color``` inbetween the ```@import``` calls to ```variables.less``` and ```core.less```. 
+ look at ```core/variables.less``` for a list of all the variables you can set.

This is the technique used to create the main gridmanger themes. Just look at ```src/dark.less``` as an example.

Once you've created your ```custom.less``` file, we need to compile it.

There are a couple of options here too - if your project is already compiling LESS (i.e your own custom version of bootstrap) then you can just ```@import``` the less file into your bootstrap.less file. 

Alternatively, use any LESS css processor of your choice to output the resultant .css file.

### LESS variables:

	/* Variables */ 
	@primary: #2fa4e7;
	@danger	: #CC0000;
	@gray	: #999;

	/* Structure */
	@minimum-element-height: 		30px;
	@row-margin-bottom:				5px;  

	/* Canvas */
	@canvas-color:					#fff;

	/* Rows */
	@row-border-color:				@gray;
	@row-background-color:			none;     
	@row-tools-background-color:	none;
	@row-icon-color:				darken(@gray, 20%);
	@row-icon-color-bg: 			none;
	@row-icon-color-hover:			#fff;
	@row-icon-color-bg-hover: 		@primary; 

	/* Cols */
	@col-border-color:				@primary;  
	@col-background-color:			none;  
	@col-tools-background-color:	none;
	@col-icon-color:				darken(@primary, 5%);
	@col-icon-color-bg: 			none;
	@col-icon-color-hover:			#fff;
	@col-icon-color-bg-hover: 		@primary;
	@col-selected-color:			@primary;  

	/* Editable Regions */
	@editable-border-color:			@danger;
	@editable-icon-color:			#fff;

	/* Icons */
	@control-bar-font-size: 		14px;
	@row-icon-font-size: 			15px;
	@col-icon-font-size: 			14px;
	@element-font-size: 			10px;