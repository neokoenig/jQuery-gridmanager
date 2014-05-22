/*
 * GridManager
 * 
 *
 * Copyright (c) 2014 Tom King
 * Licensed under the MIT license.
 */
 

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
            
            // Check for RTE initialisation
            gm.rteControl("init");
            // Create the controls & canvas placeholders 
            gm.createCanvas();
            gm.createControls(); 
            gm.initControls(); 
            gm.initCanvas();  
        };

/*------------------------------------------ Canvas & Controls ---------------------------------------*/ 
        
        // Build and append the canvas, making sure existing HTML in the user's div is wrapped
        gm.createCanvas = function(){   
          gm.log("+ Create Canvas"); 
           var html=gm.$el.html();
                gm.$el.html("");
            var c="<div id=" + gm.options.canvas.id + ">" + html + "</div>";
                gm.$el.append(c); 
        };

        // Build and prepend the control panel
        gm.createControls = function(){  
        gm.log("+ Create Controls");  
          var string="";
          var prependstring=("<div id=" + gm.options.controls.id + ">" + gm.options.controls.prepend);
          var buttons=[];
              // Prepend dynamically generated buttons
              $.each(gm.options.buttons, function(i, val){ 
                var _class=gm.generateButtonClass(val);
                buttons.push("<a title='Add Row " + _class + "' class='btn  btn-xs  btn-info add" + _class + "'><span class='glyphicon glyphicon-plus-sign'></span> " + _class + "</a>");
                gm.generateClickHandler(val);
              }); 

              string= prependstring + buttons.join("") + gm.options.controls.append; 
              gm.$el.prepend(string);  
        }; 
                
        // Add click functionality to the buttons        
        gm.initControls = function(){ 
          var canvas=gm.$el.find("#" + gm.options.canvas.id);
           gm.log("+ InitControls Running");   
           // Turn editing on or off 
           gm.$el.on("click", "button.gm-switch", function(){ 
               if(gm.status){ 
                gm.deinitCanvas();
                  $(this).text("Editor ON"); 
              } else { 
                gm.initCanvas(); 
                  $(this).text("Editor OFF"); 
              }
            // Save Function
            }).on("click", "a.gm-save", function(){ 
                gm.deinitCanvas();
                gm.saveremote(); 
            // View Source in Alert Dialog
            }).on("click", "a.gm-viewsource", function(){  
                gm.deinitCanvas(); 
                window.alert(canvas.html());
            // Default Add Child Row with max col width
            }).on("click", "a.gm-addchildrow", function(){   
                gm.log("Clicked New Row"); 
                canvas.prepend(gm.createRow([gm.options.row.max]));   
                gm.reset();  
            // Reset all teh things
            }).on("click", "a.gm-resetgrid", function(){   
                canvas.html("");
                //canvas.animate({opacity: 'hide'}, 'slow', function(){$(this).html("");});  
            // Remove a col or row
            }).on("click", "a.gm-remove", function(){  
               $(this).closest("div.gm-editing").animate({opacity: 'hide', height: 'hide', width: 'hide'}, 'slow', function(){this.remove();});  
            // For all the above, prevent default.
            }).on("click", "a.gm-remove, a.gm-save, button.gm-switch, a.gm-viewsource, gm-addchildrow", function(e){  
               e.preventDefault();
            }); 

        };


        // Turns canvas into gm-editing mode - does most of the hard work here
        gm.initCanvas = function(){    
          // cache canvas
          var canvas=gm.$el.find("#" + gm.options.canvas.id);
          var cols=canvas.find(gm.options.col.selector);
          var rows=canvas.find(gm.options.row.selector); 
           gm.log("+ InitCanvas Running");  
              // Show the template controls
              gm.$el.find("#gm-addnew").show();
              // Sort Rows First
              gm.activateRows(rows); 
              // Now Columns
              gm.activateCols(cols);  
              // Make Rows sortable
              canvas.sortable({
                items: gm.options.row.selector + ".gm-editing", 
                axis: 'y',
                placeholder: 'bg-warning',
                handle: ".handle-row",
                forcePlaceholderSize: true,   opacity: 0.7,  revert: true,
               });
              // Make columns sortable
              rows.sortable({
                    items: gm.options.col.selector, 
                    axis: 'x',
                    handle: ".handle-col" ,
                    forcePlaceholderSize: true,
                     opacity: 0.7,  revert: true
              }); 
            // Start RTE
            gm.rteControl("start");
            gm.status=true;
        };

        gm.deinitCanvas = function(){ 
          // cache canvas
          var canvas=gm.$el.find("#" + gm.options.canvas.id);
          var cols=canvas.find(gm.options.col.selector);
          var rows=canvas.find(gm.options.row.selector);

           gm.log("- deInitCanvas Running");
              // Hide template control
              gm.$el.find("#gm-addnew").hide();  
              // Sort Rows First
              gm.deactivateRows(rows); 
              // Now Columns
              gm.deactivateCols(cols);
              // Clean markup
              gm.cleanup(); 
              // Stop RTE
              gm.rteControl("stop"); 
              gm.status=false; 
        };  

        // Push cleaned div content somewhere to save it
        gm.saveremote =  function(){  
        var canvas=gm.$el.find("#" + gm.options.canvas.id); 
            $.ajax({
              type: "POST",
              url:  gm.options.remoteURL,
              data: canvas.html() 
            });
            gm.log("Save Function Called"); 
        }; 

/*------------------------------------------ ROWS ---------------------------------------*/
        gm.activateRows = function(rows){
           gm.log("++ Activate Rows Ran"); 
           rows.addClass("gm-editing");
           $.each(rows, function(i, val){ 
               //gm.generateEmptyRowHolder($(val)); 
               $(val).prepend(gm.options.row.tools); 
           });
           
        };
 
        gm.deactivateRows = function(rows){
             gm.log("-- DeActivate Rows"); 
             rows.removeClass("gm-editing").removeClass("ui-sortable").removeAttr("style");  
             
          };

        // Creates a row, accepting an array of column widths to create child cols
        gm.createRow = function(colWidths){
          var rowHTML= gm.options.row.prepend + gm.options.row.tools;
          $.each(colWidths, function(i, val){
              rowHTML=rowHTML + gm.createCol(val);
          });
          return rowHTML;
        };

/*------------------------------------------ COLS ---------------------------------------*/
        gm.activateCols = function(cols){ 
           cols.addClass("gm-editing");  
           $.each(cols, function(i, val){ 
            var temp=$(val).html();
               $(val).html(gm.options.col.tools + "<div class='gm-editholder' contenteditable=true>" + temp + "</div>");
           }); 
           gm.log("++ Activate Cols Ran"); 
        };

        gm.deactivateCols = function(cols){ 
           cols.removeClass("gm-editing");  
           $.each(cols, function(i, val){ 
              var temp=$(val).find(".gm-editholder").html();
              $(val).html(temp);
           }); 
           gm.log("-- deActivate Cols Ran");  
        };

        // Lazy function to return column markup
         gm.createCol =  function(size){
          return "<div class='col-md-" + size + " gm-editing'>" + gm.options.col.tools + "<div class='gm-editholder' contenteditable=true> Content here </div></div>";
        };


/*------------------------------------------ BTNs ---------------------------------------*/ 
 
        // Basically just turns [2,4,6] into 2-4-6
        gm.generateButtonClass=function(arr){
            var string="";
              $.each(arr, function( i , val ) {
                    string=string + "-" + val;  
              }); 
              return string;
        };

        // click handlers for dynamic row template buttons
        gm.generateClickHandler= function(arr){  
          var string="a.add" + gm.generateButtonClass(arr);
          var canvas=gm.$el.find("#" + gm.options.canvas.id); 
          var output=gm.options.row.prepend + gm.options.row.tools; 

              $.each(arr, function(i, val){ 
                output=output +  gm.createCol(val); 
              });

              gm.$el.on("click", string, function(e){ 
                gm.log("Clicked " + string); 
                canvas.prepend(output);   
                gm.reset();
                e.preventDefault();  
            }); 
        };


/*------------------------------------------ RTEs ---------------------------------------*/
        gm.rteControl=function(action){
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
            case 'start':  
                switch (gm.options.rte) {
                    case 'tinymce': 
                      window.tinymce.init(gm.options.tinymce.config);
                    break;

                    case 'ckeditor': 
                      $( 'div.gm-editholder' ).ckeditor(gm.options.ckeditor);
                      gm.log(gm.options.ckeditor);
                    break; 
                    default:
                        gm.log("No RTE specified for start");
                }
                break; //end start 
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
        
        // Reset
        gm.reset=function(){ 
            gm.log("~~RESET~~");
            gm.deinitCanvas();  
            gm.initCanvas();  
        };

        gm.cleanup =  function(){  
          // cache canvas
          var canvas=gm.$el.find("#" + gm.options.canvas.id);
              // Clean column markup
              canvas.find(gm.options.col.selector)
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
                  .find("div.gm-tools").remove(); 
              gm.log("~~Cleanup Ran~~");
        };

        // Generic logging function
        gm.log = function(logvar){
          if(gm.options.debug){
            if ((window['console'] !== undefined)) {
              window.console.log(logvar);
              }
            }
        };



      
        // Run initializer
        gm.init(); 
    };

    

    // Options which can be overridden by the .gridmanager() call on the requesting page
    $.gridmanager.defaultOptions = {
        debug: 0,
        remoteURL: "/replace-with-your-url",
        canvas:    {
            id: "gm-canvas"
        },
        buttons: [[6,6], [4,4,4], [3,3,3,3], [2,2,2,2,2,2], [2,8,2], [4,8], [8,4]],
        controls: {
            id:  "gm-controls",
            prepend: "<div class='row'><div class='col-md-12'><div id='gm-addnew' class='btn-group'> <a title='Append New Row' class='gm-addchildrow btn btn-xs btn-primary'><span class='glyphicon glyphicon-plus-sign'></span></a>", 
            append: "</div><div class='btn-group pull-right'><button type='button' class='btn btn-xs btn-primary gm-switch'>Editor OFF</button><button type='button' class='btn  btn-xs  btn-primary dropdown-toggle' data-toggle='dropdown'><span class='caret'></span><span class='sr-only'>Toggle Dropdown</span></button><ul class='dropdown-menu' role='menu'><li><a title='Save'  href='#' class='gm-save'><span class='glyphicon glyphicon-ok'></span> Save</a></li><li><a title='View Source' href='#' class='gm-viewsource'><span class='glyphicon glyphicon-zoom-in'></span> View Source</a></li><li><a title='Reset Grid' href='#' class='gm-resetgrid'><span class='glyphicon glyphicon-trash'></span> Reset</a></li></ul></div>"
        },
        row: { 
            selector: "div.row",
            prepend:  "<div class='row gm-editing'>",
            append:   "</div>", 
            tools:    "<div class='gm-tools clearfix'><div class='btn-group'><a title='Move' class='handle-row pull-left btn btn-info btn-xs'><span class='glyphicon glyphicon-move'></span></a></div><a title='Remove row'  class=' pull-right gm-remove btn btn-danger btn-xs'><span class='glyphicon glyphicon-trash'></span></a></div>" 

        },
        col: {  
            selector: "div[class*=col-]",
            tools:    "<div class='gm-tools clearfix'><a title='Move' class='handle-col pull-left btn btn-info btn-xs'><span class='glyphicon glyphicon-move'></span></a><a title='Remove column'  class=' pull-right gm-remove btn btn-danger btn-xs'><span class='glyphicon glyphicon-trash'></span></a></div>",
            max: 12
        },
       
        tinymce: {
            config: { 
              selector: "[contenteditable='true']",
              inline: true,
              plugins: [
              "advlist autolink lists link image charmap print preview anchor",
              "searchreplace visualblocks code fullscreen",
              "insertdatetime media table contextmenu paste"
              ],
              toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image"
            }
        },
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