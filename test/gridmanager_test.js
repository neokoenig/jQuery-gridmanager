
var gm;

//-------------- Test Content-------------------

// A single row/col12 before any actions
var rawContent='<div class="row"><div class="col-md-12"><p>New Content</p><p>New Content</p></div></div>';
// A single row/col12 with a saved editable region
var rawContentWithEditable='<div class="row"><div class="col-md-12"><!--gm-editable-region--><p>New Content</p><!--/gm-editable-region--></div></div>';
// With GM Markup
var pollutedContent='<div class="row gm-editing ui-sortable"><div class="gm-tools clearfix"><a title="Move" class="gm-moveRow pull-left"><span class="fa fa-arrows "></span>&nbsp;</a> <a title="New Column" class="gm-addColumn pull-left  "><span class="fa fa-plus"></span>&nbsp;</a> <a title="Row Settings" class="pull-right gm-rowSettings"><span class="fa fa-cog"></span>&nbsp;</a> </div><div class="column col-md-12 col-sm-12-clsstmp col-xs-12-clsstmp gm-editing ui-sortable"><div class="gm-tools clearfix"><a title="Move" class="gm-moveCol pull-left"><span class="fa fa-arrows "></span>&nbsp;</a> <a title="Column Settings" class="pull-right gm-colSettings"><span class="fa fa-cog"></span>&nbsp;</a> <a title="Make Column Narrower" class="gm-colDecrease pull-left"><span class="fa fa-minus"></span>&nbsp;</a> <a title="Make Column Wider" class="gm-colIncrease pull-left"><span class="fa fa-plus"></span>&nbsp;</a> <a title="Select Column" class="gm-0_btn"><span class="fa fa-square-o"></span>&nbsp;</a> <a title="Add Editable Region" class="gm-1_btn"><span class="fa fa-edit"></span>&nbsp;</a> </div><!--gm-editable-region--><div class="gm-editable-region gm-content-draggable"><div class="gm-controls-element"> <a class="gm-move fa fa-arrows" href="#" title="Move"></a> <a class="gm-delete fa fa-times" href="#" title="Delete"></a> </div><div class="gm-content"><p>New Content</p></div></div><!--/gm-editable-region--><div class="gm-tools clearfix"><a title="Add Nested Row" class="pull-left gm-addRow"><span class="fa fa-plus-square"></span>&nbsp;</a> <a title="Remove Column" class="pull-right gm-removeCol"><span class="fa fa-trash-o"></span>&nbsp;</a> </div></div><div class="gm-tools clearfix"><a title="Remove row" class="pull-right gm-removeRow"><span class="fa fa-trash-o"></span>&nbsp;</a> </div></div>';
// Expected content after GM cleanup
var cleanedContent='<div class="row"><div class="column col-md-12 col-sm-12 col-xs-12"><!--gm-editable-region--><p>New Content</p><!--/gm-editable-region--></div></div>';

QUnit.module("1", {
	setup: function() {
	jQuery("#qunit-fixture").append(jQuery("<div/>").attr({"id": "mycanvas"}));
	gm = jQuery("#mycanvas").gridmanager().data('gridmanager');

  },
  teardown: function() {
    // clean up after each test
    //window.jQuery.gridmanager.remove;
  }
});

QUnit.test( "Simple canvas checks", function() {
	equal(gm.$el.children().length, 2, "Two Children found");
	equal(gm.$el.find("#gm-controls").length, 1, "Controls found");
	equal(gm.$el.find("#gm-controls").hasClass("ui-sortable"), false, "Controls don't have ui-sortable");
	equal(gm.$el.find("#gm-canvas").length, 1, "Canvas found");
	ok(gm.$el.find("#gm-canvas").hasClass("ui-sortable"), "Canvas has ui-sortable");
});

QUnit.test( "Create Row", function() {
	var newrow=gm.createRow([6,6]);
		equal(newrow.length, 1, "New Row Should return one object");
		equal(newrow.hasClass("gm-editing"), true, "New Row Should have editing class");
		equal(newrow.children().length, 2, "New Row Should have two children of span6");
		equal(newrow.find(":nth-child(1)").hasClass("gm-tools"), true, "Single Row Col 1st child should have editing tools class");
		equal(newrow.find(":nth-child(2)").hasClass("gm-tools"), true, "Single Row Col 2nd child should have editing tools class");
});

QUnit.test( "Create Column", function() {
	var newcol=gm.createCol(6);
		equal(newcol.length, 1, "New Col Should return one object");
		equal(newcol[0].classList, "column col-md-6 col-sm-6 col-xs-6 gm-editing", "New Col has required classes");
		equal(newcol.children().length, 2, "New column should have two children");
		equal(newcol.find(":nth-child(1)").hasClass("gm-tools"), true, "Single Col 1st child should have editing tools class");
		equal(newcol.find(":nth-child(2)").hasClass("gm-tools"), true, "Single Col 1st child should have editing tools class");
		equal(newcol.children().length, 2, "New column should have two children");
});

QUnit.test( "Activate Row", function() {
	var row=gm.createRow([12]);
		gm.activateRows(row);
		equal(row.children().length, 3, "Single Col Activated Row should have 3 Children");
		equal(row.find(":first-child").hasClass("gm-tools"), true, "Single Col 1st child should have editing tools class");
		equal(row.find(":nth-child(2)").hasClass("gm-editing"), true, "Single Col 2nd child should have editing  class");
		equal(row.find(":last-child").hasClass("gm-tools"), true, "Single Col 3rd child should have editing tools class");
});

QUnit.test( "Activate Column", function() {
	var col=jQuery("<div/>").addClass("col-md-12");
		gm.activateCols(col);
		equal(col.children().length, 2, "Single Empty Col Activated  should have 2 Children");
		equal(col.find(":first-child").hasClass("gm-tools"), true, "Each Child should be gm-tools");
		equal(col.find(":last-child").hasClass("gm-tools"), true, "Each Child should be gm-tools");
	var colNotEmpty=jQuery("<div/>").addClass("col-md-12").html("<p>I am Content</p>");
		gm.activateCols(colNotEmpty);
		equal(colNotEmpty.children().length, 3, "Single Col with Content Activated  should have 3 Children");
		equal(col.find(":first-child").hasClass("gm-tools"), true, "1st Child should be gm-tools");
		equal(col.find(":last-child").hasClass("gm-tools"), true, "Last Child should be gm-tools");
});

/*
	Test should load in some gm polluted markup, and strip out all GM bits, leaving the stuff we want to save.
*/
QUnit.test( "Cleanup", function() {
	gm.$el.find("#" + gm.options.canvasId).html(pollutedContent);
	gm.deinitCanvas();
	gm.cleanup();
	equal(gm.$el.find("#" + gm.options.canvasId).html(), cleanedContent,  "Markup removed");
});
