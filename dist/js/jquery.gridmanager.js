/*! gridmanager - v0.2.2 - 2014-06-18
* http://neokoenig.github.io/jQuery-gridmanager/
* Copyright (c) 2014 Tom King; Licensed MIT */
(function($  ){

    $.gridmanager = function(el, options){ 
        var gm = this;  
        gm.$el = $(el);
        gm.el = el; 
        gm.$el.data("gridmanager", gm);
       
        
/*------------------------------------------ INIT ---------------------------------------*/
        gm.init = function(){
            gm.options = $.extend({},$.gridmanager.defaultOptions, options); 
            gm.log("INIT");  
            gm.rteControl("init"); 
            gm.createCanvas();
            gm.createControls(); 
            gm.initControls(); 
            gm.initCanvas(); 
            gm.log("FINISHED"); 
        };

/*------------------------------------------ Canvas & Controls ---------------------------------------*/ 
        
        /*
         Build and append the canvas, making sure existing HTML in the user's div is wrapped
         */
        gm.createCanvas = function(){   
          gm.log("+ Create Canvas"); 
           var html=gm.$el.html();
                gm.$el.html("");
                $('<div/>', {'id': gm.options.canvasId, 'html':html }).appendTo(gm.$el); 
        };

        /*
         Build and prepend the control panel
        */
        gm.createControls = function(){  
          gm.log("+ Create Controls");    
            var buttons=[];  
            // Dynamically generated row template buttons
            $.each(gm.options.controlButtons, function(i, val){ 
              var _class=gm.generateButtonClass(val);
              buttons.push("<a title='Add Row " + _class + "' class='" + gm.options.controlButtonClass + " add" + _class + "'><span class='" + gm.options.controlButtonSpanClass + "'></span> " + _class + "</a>");
              gm.generateClickHandler(val);
            });  

         /*
          Generate the control bar markup 
        */
         gm.$el.prepend(
              $('<div/>', 
                  {'id': gm.options.controlId, 'class': gm.options.gmClearClass }
              ).prepend( 
                    $('<div/>', {"class": gm.options.rowClass}).html(
                       $('<div/>', {"class": gm.options.colClass + 12}).addClass(gm.options.colAdditionalClass).html(
                          $('<div/>', {'id': 'gm-addnew'})
                          .addClass(gm.options.gmBtnGroup)
                          .addClass(gm.options.gmFloatLeft).html(
                            buttons.join("")
                          ) 
                        ).append(gm.options.controlAppend)
                     )
                  )
              );
            }; 
                
        /*
         Add click functionality to the buttons        
        */
        gm.initControls = function(){ 
          var canvas=gm.$el.find("#" + gm.options.canvasId);
           gm.log("+ InitControls Running");    

           // Turn editing on or off 
           gm.$el.on("click", ".gm-preview", function(){ 
               if(gm.status){ 
                gm.deinitCanvas();
                 $(this).parent().find(".gm-mode").prop('disabled', true);
              } else { 
                gm.initCanvas();   
                 $(this).parent().find(".gm-mode").prop('disabled', false);
              }
              $(this).toggleClass(gm.options.gmDangerClass);

          // Switch editing mode
            }).on("click", ".gm-mode", function(){ 
              if(gm.mode === "visual"){ 
                 gm.deinitCanvas(); 
                 canvas.html($('<textarea/>').attr("cols", 130).attr("rows", 25).val(canvas.html()));
                 gm.mode="html";
                 $(this).parent().find(".gm-preview").prop('disabled', true); 
              } else {  
                var editedSource=canvas.find("textarea").val();
                 canvas.html(editedSource);
                 gm.initCanvas();
                 gm.mode="visual"; 
                 $(this).parent().find(".gm-preview").prop('disabled', false);
              } 
              $(this).toggleClass(gm.options.gmDangerClass);

            // Make region editable
            }).on("click", ".gm-editholder", function(){ 
                var rteRegion=$(this); 
                if(!rteRegion.attr("contenteditable")){ 
                    rteRegion.attr("contenteditable", true); 
                    gm.rteControl("attach", rteRegion ); 
                } 

            // Save Function
            }).on("click", "a.gm-save", function(){ 
                gm.deinitCanvas();
                gm.saveremote();  
                    
            /* Row settings */
            }).on("click", "a.gm-rowSettings", function(){ 
                 var row=$(this).closest(gm.options.rowSelector); 
                 var drawer=row.find(".gm-rowSettingsDrawer");
                    if(drawer.length > 0){
                      drawer.remove(); 
                    } else {
                      row.prepend(gm.generateRowSettings(row));
                    } 

            // Change Row ID via rowsettings
            }).on("blur", "input.gm-rowSettingsID", function(){
                var row=$(this).closest(gm.options.rowSelector);
                    row.attr("id", $(this).val());
            // Remove a class from a row via rowsettings
            }).on("click", ".gm-toggleRowClass", function(){
                var row=$(this).closest(gm.options.rowSelector);
                var theClass=$(this).text().trim();
                    row.toggleClass(theClass);
                    if(row.hasClass(theClass)){
                        $(this).addClass(gm.options.gmDangerClass);
                    } else { 
                        $(this).removeClass(gm.options.gmDangerClass);
                    }
                     
            // Add new column to existing row    
            }).on("click", "a.gm-addColumn", function(){   
                $(this).parent().after(gm.createCol(2)); 

            // Decrease Column Size 
            }).on("click", "a.gm-colDecrease", function(){  
              var col = $(this).closest("." +gm.options.gmEditClass);   
              var t=gm.getColClass(col); 
                   if(t.colWidth > parseInt(gm.options.colResizeStep, 10)){ 
                       t.colWidth=(parseInt(t.colWidth, 10) - parseInt(gm.options.colResizeStep, 10)); 
                       col.switchClass(t.colClass, gm.options.colClass + t.colWidth, 200); 
                   }  

            // Increase Column Size 
            }).on("click", "a.gm-colIncrease", function(){ 
               var col = $(this).closest("." +gm.options.gmEditClass);  
               var t=gm.getColClass(col); 
                if(t.colWidth < gm.options.colMax){                    
                    t.colWidth=(parseInt(t.colWidth, 10) + parseInt(gm.options.colResizeStep, 10)); 
                    col.switchClass(t.colClass, gm.options.colClass + t.colWidth, 200); 
                }    

            // Reset all teh things
            }).on("click", "a.gm-resetgrid", function(){   
                canvas.html("");
                gm.reset(); 

            // Remove a col or row
            }).on("click", "a.gm-removeCol", function(){  
               $(this).closest("." +gm.options.gmEditClass).animate({opacity: 'hide', width: 'hide', height: 'hide'}, 400, function(){this.remove();}); 
            }).on("click", "a.gm-removeRow", function(){  
               $(this).closest("." +gm.options.gmEditClass).animate({opacity: 'hide', height: 'hide'}, 400, function(){this.remove();});  

            // For all the above, prevent default.
            }).on("click", "a.gm-resetgrid, a.gm-remove, a.gm-save, button.gm-preview, a.gm-viewsource, a.gm-addColumn, a.gm-colDecrease, a.gm-colIncrease", function(e){ 
               gm.log("Clicked: "   + $.grep((this).className.split(" "), function(v){
                 return v.indexOf('gm-') === 0;
             }).join()); 
               e.preventDefault();
            }); 

        };

        /*
        Get the col-md-6 class, returning 6 as well from column
          @col - column to look at
          
          returns colClass: the full col-md-6 class 
                  colWidth: just the last integer of classname
        */ 
        gm.getColClass=function(col){ 
            var colClass=$.grep(col.attr("class").split(" "), function(v){
                return v.indexOf(gm.options.colClass) === 0;
                }).join(); 
            var colWidth=colClass.replace(gm.options.colClass, "");
                return {colClass:colClass, colWidth:colWidth}; 
        };
  
        /*
        Turns canvas into gm-editing mode - does most of the hard work here
        */
        gm.initCanvas = function(){    
          // cache canvas
          var canvas=gm.$el.find("#" + gm.options.canvasId);
          var cols=canvas.find(gm.options.colSelector);
          var rows=canvas.find(gm.options.rowSelector); 
           gm.log("+ InitCanvas Running");  
              // Show the template controls
              gm.$el.find("#gm-addnew").show();
              // Sort Rows First
              gm.activateRows(rows); 
              // Now Columns
              gm.activateCols(cols);  
              // Make Rows sortable
              canvas.sortable({
                items: gm.options.rowSelector, 
                axis: 'y',
                placeholder: gm.options.rowSortingClass,
                handle: "." + gm.options.gmToolClass,
                forcePlaceholderSize: true,   opacity: 0.7,  revert: true,
                tolerance: "pointer",
                cursor: "move"  
               });
              // Make columns sortable
              rows.sortable({
                items: gm.options.colSelector, 
                axis: 'x',
                handle: "." + gm.options.gmToolClass,
                forcePlaceholderSize: true,
                opacity: 0.7,  revert: true,
                tolerance: "pointer",
                cursor: "move"
              });  
            gm.status=true;
            gm.mode="visual"; 
        };

        /*
        Removes canvas editing mode
        */
        gm.deinitCanvas = function(){ 
          // cache canvas
          var canvas=gm.$el.find("#" + gm.options.canvasId);
          var cols=canvas.find(gm.options.colSelector);
          var rows=canvas.find(gm.options.rowSelector);

           gm.log("- deInitCanvas Running");
              // Hide template control
              gm.$el.find("#gm-addnew").hide();  
              // Sort Rows First
              gm.deactivateRows(rows); 
              // Now Columns
              gm.deactivateCols(cols);
              // Clean markup
              gm.cleanup();  
              gm.status=false; 
        };  

        /*
         Push cleaned div content somewhere to save it
        */
        gm.saveremote =  function(){  
        var canvas=gm.$el.find("#" + gm.options.canvasId); 
            $.ajax({
              type: "POST",
              url:  gm.options.remoteURL,
              data: canvas.html() 
            });
            gm.log("Save Function Called"); 
        }; 

/*------------------------------------------ ROWS ---------------------------------------*/
        /* 
        Look for pre-existing rows and add editing tools as appropriate
          @rows: elements to act on
        */
        gm.activateRows = function(rows){
           gm.log("++ Activate Rows"); 
           rows.addClass(gm.options.gmEditClass).prepend(
              gm.toolFactory(gm.options.rowButtonsPrepend)
              ).append(
              gm.toolFactory(gm.options.rowButtonsAppend)
           );  
        };

         /* 
        Look for pre-existing rows and remove editing classes as appropriate
          @rows: elements to act on
        */        
        gm.deactivateRows = function(rows){
           gm.log("-- DeActivate Rows"); 
           rows.removeClass(gm.options.gmEditClass).removeClass("ui-sortable").removeAttr("style");  
        };

        /* 
        Create a single row with appropriate editing tools & nested columns
          @colWidths : array of css class integers, i.e [2,4,5]
        */
        gm.createRow = function(colWidths){ 
          var row= $("<div/>", {"class": gm.options.rowClass + " " + gm.options.gmEditClass});
             $.each(colWidths, function(i, val){
                row.append(gm.createCol(val));
              });
             row.prepend(gm.toolFactory(gm.options.rowButtonsPrepend))
                .append(gm.toolFactory(gm.options.rowButtonsPrepend));
                gm.log("++ Created Row"); 
          return row;
        };

        /*
        Create the row specific settings box
        */
        gm.generateRowSettings = function(row){
         // Row class toggle buttons
          var classBtns=[];
              $.each(gm.options.rowCustomClasses, function(i, val){
                  var btn=$("<button/>")
                  .addClass("gm-toggleRowClass")
                  .addClass(gm.options.controlButtonClass)
                  .append(
                    $("<span/>")
                    .addClass(gm.options.controlButtonSpanClass) 
                  ).append(" " + val);
 
                   if(row.hasClass(val)){ 
                       btn.addClass(gm.options.gmDangerClass);  
                    } 
                   classBtns.push(btn[0].outerHTML);
             });
          // Row settings drawer
          var html=$("<div/>")
              .addClass("gm-rowSettingsDrawer")
              .addClass(gm.options.gmToolClass)
              .addClass(gm.options.gmClearClass)
              .prepend($("<div />")
                .addClass(gm.options.gmBtnGroup)
                .addClass(gm.options.gmFloatLeft)
                .html(classBtns.join("")))
              .append($("<div />").addClass("pull-right").html(
                $("<label />").html("Row ID ").append(
                $("<input>").addClass("gm-rowSettingsID").attr({type: 'text', placeholder: 'Row ID', value: row.attr("id")})
                )
              ));
  
          return html[0].outerHTML; 
        };

/*------------------------------------------ COLS ---------------------------------------*/
        /* 
        Look for pre-existing columns and add editing tools as appropriate
          @rows: elements to act on
        */
        gm.activateCols = function(cols){ 
           cols.addClass(gm.options.gmEditClass); 

           $.each(cols, function(i, val){
            var prepend=gm.toolFactory(gm.options.colButtonsPrepend) + "<div class='gm-editholder'>";
            var append="</div>" + gm.toolFactory(gm.options.colButtonsAppend);
            var tempHTML=$(val).html(); 
            var colClass = $.grep((val).className.split(" "), function(v){
                 return v.indexOf(gm.options.colClass) === 0;
             }).join();  
               $(val).html( prepend + tempHTML + append)
                     .find(".gm-handle-col").attr("title", "Move " +  colClass); 
           }); 
           gm.log("++ Activate Cols Ran"); 
        };

        /* 
        Look for pre-existing columns and removeediting tools as appropriate
          @rows: elements to act on
        */
        gm.deactivateCols = function(cols){ 
           cols.removeClass(gm.options.gmEditClass);  
           $.each(cols, function(i, val){ 
              var temp=$(val).find(".gm-editholder").html();
              $(val).html(temp);
           }); 
           gm.log("-- deActivate Cols Ran");  
        };

        /* 
        Create a single column with appropriate editing tools
        */
         gm.createCol =  function(size){  
         var col= $("<div/>").addClass(gm.options.colClass + size)
             .addClass(gm.options.gmEditClass)
             .addClass(gm.options.colAdditionalClass) 
            .html(gm.toolFactory(gm.options.colButtonsPrepend)).append(
                  $("<div/>", {"class": "gm-editholder"}).html("<p>Awaiting Content</p>").append(gm.toolFactory(gm.options.colButtonsAppend)) 
            );  
            gm.log("++ Created Column " + size);  
            return col;
        };
 

/*------------------------------------------ BTNs ---------------------------------------*/ 
        /*
         Returns an editing div with appropriate btns as passed in
         @btns Array of buttons (see options)
        */
        gm.toolFactory=function(btns){
           var tools=$("<div/>")
              .addClass(gm.options.gmToolClass)
              .addClass(gm.options.gmClearClass)
              .html(gm.buttonFactory(btns)); 
           return tools[0].outerHTML;
        };

        /*
         Returns html string of buttons 
         @btns Array of button configurations (see options)
        */
        gm.buttonFactory=function(btns){  
          var buttons=[];
          $.each(btns, function(i, val){  
            buttons.push("<" + val.element +" title='" + val.title + "' class='" + val.btnClass + "'><span class='"+val.iconClass+"'></span>&nbsp;" + "</" + val.element + "> ");
          }); 
          return buttons.join("");
        };
 
        /*
         Basically just turns [2,4,6] into 2-4-6
        */
        gm.generateButtonClass=function(arr){
            var string="";
              $.each(arr, function( i , val ) {
                    string=string + "-" + val;  
              }); 
              return string;
        };

        /*
         click handlers for dynamic row template buttons
         @colWidths - array of column widths, i.e [2,3,2]
        */
        gm.generateClickHandler= function(colWidths){  
          var string="a.add" + gm.generateButtonClass(colWidths);
          var canvas=gm.$el.find("#" + gm.options.canvasId);
              gm.$el.on("click", string, function(e){ 
                gm.log("Clicked " + string); 
                canvas.prepend(gm.createRow(colWidths));   
                gm.reset();
                e.preventDefault();  
            }); 
        };


/*------------------------------------------ RTEs ---------------------------------------*/
        /*
         Starts, stops, looks for and  attaches RTEs
         @action - one of init|attach|stop
         @element object to attach to
        */
        gm.rteControl=function(action, element){
          gm.log("RTE " + gm.options.rte + ' ' +action);
        
          switch (action) { 
            case 'init':
                if(typeof window.CKEDITOR !== 'undefined'){
                    gm.options.rte='ckeditor';
                    gm.log("++ CKEDITOR Found");  
                    window.CKEDITOR.disableAutoInline = true; 
               }
                if(typeof window.tinymce !== 'undefined'){
                    gm.options.rte='tinymce';
                    gm.log("++ TINYMCE Found"); 
                }
                break;
             case 'attach':  
                switch (gm.options.rte) {
                    case 'tinymce': 
                    if(!(element).hasClass("mce-content-body")){
                      element.tinymce(gm.options.tinymce.config);
                    }
                    break;

                    case 'ckeditor': 
                      $(element).ckeditor(gm.options.ckeditor);
                    
                    break; 
                    default:
                        gm.log("No RTE specified for attach");
                }
                break; //end Attach 
            case 'stop':    
                switch (gm.options.rte) {
                    case 'tinymce': 
                      // destroy TinyMCE
                      window.tinymce.remove();
                         gm.log("-- TinyMCE destroyed");
                    break;

                    case 'ckeditor':
                      // destroy ckeditor
                         for(var name in window.CKEDITOR.instances)
                        {
                          window.CKEDITOR.instances[name].destroy();
                        }
                         gm.log("-- CKEDITOR destroyed");
                    break;

                    default:
                        gm.log("No RTE specified for stop");
                }
              break; //end stop
             
              default:
                  gm.log("No RTE Action specified");
            }
        };

 
/*------------------------------------------ Useful functions ---------------------------------------*/
        
        /*
         Quick reset
        */
        gm.reset=function(){ 
            gm.log("~~RESET~~");
            gm.deinitCanvas();  
            gm.initCanvas();  
        };

        /*
        Remove all extraneous markup
        */
        gm.cleanup =  function(){  
          // cache canvas
          var canvas=gm.$el.find("#" + gm.options.canvasId);
              // Clean column markup
              canvas.find(gm.options.colSelector)
                  .removeAttr("style")
                  .removeAttr("spellcheck")
                  .removeAttr("id")
                  .removeClass("mce-content-body").end()
              // Clean img markup
                  .find("img")
                  .removeAttr("style")
                  .addClass("img-responsive")
                  .removeAttr("data-cke-saved-src")
                  .removeAttr("data-mce-src").end()
              // Remove Tools
                  .find("." + gm.options.gmToolClass).remove();
              // Destroy any RTEs
                  gm.rteControl("stop"); 
              gm.log("~~Cleanup Ran~~");
        };

        /*
         Generic logging function
        */
        gm.log = function(logvar){
          if(gm.options.debug){
            if ((window['console'] !== undefined)) {
              window.console.log(logvar);
              }
            }
        };

        /*
        Wrap data in <pre>
        @value - code to wrap
        */
        gm.htmlEncode=function(value){
          if (value) {
            return jQuery('<pre />').text(value).html();
              } else {
            return '';
          }
        }; 

        // Run initializer
        gm.init(); 
    };

    

    /*
     Options which can be overridden by the .gridmanager() call on the requesting page------------------------------------------------------
    */
    $.gridmanager.defaultOptions = {
     /*
     General Options---------------
    */
        // Debug to console
        debug: 0,

        // URL to save to
        remoteURL: "/replace-with-your-url",
  /*
     Canvas---------------
    */
        // Canvas ID
        canvasId: "gm-canvas",

  /*
     Control Bar---------------
  */
        // Top Control Row ID
        controlId:  "gm-controls",

        // Array of buttons for row templates
        controlButtons: [[12], [6,6], [4,4,4], [3,3,3,3], [2,2,2,2,2,2], [2,8,2], [4,8], [8,4]],

        // Default control button class
        controlButtonClass: "btn  btn-xs  btn-primary",

        // Default control button icon
        controlButtonSpanClass: "glyphicon glyphicon-plus-sign",

        // Control bar RH dropdown markup
        controlAppend: "<div class='btn-group pull-right'><button title='Edit Source Code' type='button' class='btn btn-xs btn-primary gm-mode'><span class='glyphicon glyphicon-chevron-left'></span><span class='glyphicon glyphicon-chevron-right'></span></button><button title='Preview' type='button' class='btn btn-xs btn-primary gm-preview'><span class='glyphicon glyphicon-eye-open'></span></button><button type='button' class='btn  btn-xs  btn-primary dropdown-toggle' data-toggle='dropdown'><span class='caret'></span><span class='sr-only'>Toggle Dropdown</span></button><ul class='dropdown-menu' role='menu'><li><a title='Save'  href='#' class='gm-save'><span class='glyphicon glyphicon-ok'></span> Save</a></li><li><a title='Reset Grid' href='#' class='gm-resetgrid'><span class='glyphicon glyphicon-trash'></span> Reset</a></li></ul></div>",
   /*
     General editing classes---------------
  */      
        // Standard edit class, applied to active elements
        gmEditClass: "gm-editing",

        // Tool bar class which are inserted dynamically
        gmToolClass: "gm-tools",

        // Clearing class, used on most toolbars
        gmClearClass: "clearfix",

        // generic float left and right
        gmFloatLeft: "pull-left",
        gmFloatRight: "pull-right",
        gmBtnGroup:  "btn-group",
        gmDangerClass: "btn-danger",


  /*
     Rows---------------
  */
        // Generic row class. change to row--fluid for fluid width in Bootstrap
        rowClass:    "row",

        // Used to find rows - change to div.row-fluid for fluid width
        rowSelector: "div.row",     

        // class of background element when sorting rows
        rowSortingClass: "bg-warning",   

        // Buttons at the top of each row
        rowButtonsPrepend: [
                {
                   title:"New Column", 
                   element: "a", 
                   btnClass: "gm-addColumn pull-left  ",
                   iconClass: "glyphicon glyphicon-plus"
                }, 
                 {
                   title:"Row Settings", 
                   element: "a", 
                   btnClass: "pull-right gm-rowSettings",
                   iconClass: "glyphicon glyphicon-cog"
                }
                
            ],

        // Buttons at the bottom of each row
        rowButtonsAppend: [ 
                {
                 title:"Remove row", 
                 element: "a", 
                 btnClass: "pull-right gm-removeRow",
                 iconClass: "glyphicon glyphicon-trash"
                }
            ],

        // Not sure about this one yet
        rowSettingControls: "Reserved for future use",

        // CUstom row classes - add your own to make them available in the row settings
        rowCustomClasses: ["example-class","test-class"],

  /*
     Columns--------------
  */    
        // Generic row prefix: this should be the general span class, i.e span6 in BS2, col-md-6 (or you could change the whole thing to col-lg- etc)
        colClass: "col-md-",

        // Wild card column selector - this means we can find all columns irrespective of col-md or col-lg etc.
        colSelector: "div[class*=col-]",

        // Additional column class to add (foundation needs columns, bs3 doesn't)
        colAdditionalClass: "",

        // Buttons to prepend to each column
        colButtonsPrepend: [                
               {
                 title:"Make Column Narrower", 
                 element: "a", 
                 btnClass: "gm-colDecrease pull-left",
                 iconClass: "glyphicon glyphicon-minus-sign"
              },
              {
               title:"Make Column Wider", 
               element: "a", 
               btnClass: "gm-colIncrease pull-left",
               iconClass: "glyphicon glyphicon-plus-sign"
              }
            ],

        // Buttons to append to each column
        colButtonsAppend: [ 
                {
                 title:"Remove Column", 
                 element: "a", 
                 btnClass: "pull-right gm-removeCol",
                 iconClass: "glyphicon glyphicon-trash"
                }
            ], 

        
        // Maximum column span value: if you've got a 24 column grid via customised bootstrap, you could set this to 24.
        colMax: 12,

        // Column resizing +- value: this is also the colMin value, as columns won't be able to go smaller than this number (otherwise you hit zero and all hell breaks loose)
        colResizeStep: 1,

  /*
     Rich Text Editors---------------
  */
        tinymce: {
            config: {  
              inline: true,
              plugins: [
              "advlist autolink lists link image charmap print preview anchor",
              "searchreplace visualblocks code fullscreen",
              "insertdatetime media table contextmenu paste"
              ],
              toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image"
            }
        },

        // Path to CK custom comfiguration
        ckeditor: { 
              customConfig: ""
        }
    };
    
    // Expose as jquery function
    $.fn.gridmanager = function(options){
        return this.each(function(){
            (new $.gridmanager(this, options));
        });
    }; 
    
})(jQuery );