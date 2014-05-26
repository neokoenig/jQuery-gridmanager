/*! gridmanager - v0.2.1 - 2014-05-25
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
            var c="<div id=" + gm.options.canvasId + ">" + html + "</div>";
                gm.$el.append(c); 
        };

        // Build and prepend the control panel
        gm.createControls = function(){  
        gm.log("+ Create Controls");   
          var prependstring=(gm.options.canvasModal + "<div class='" + gm.options.gmClearClass + "' id=" + gm.options.controlId + ">" + gm.options.controlPrepend);
          var buttons=[];
              // Prepend dynamically generated buttons
              $.each(gm.options.controlButtons, function(i, val){ 
                var _class=gm.generateButtonClass(val);
                buttons.push("<a title='Add Row " + _class + "' class='" + gm.options.controlButtonClass + " add" + _class + "'><span class='" + gm.options.controlButtonSpanClass + "'></span> " + _class + "</a>");
                gm.generateClickHandler(val);
              });  
              gm.$el.prepend(prependstring + buttons.join("") + gm.options.controlAppend);   

        }; 
                
        // Add click functionality to the buttons        
        gm.initControls = function(){ 
          var canvas=gm.$el.find("#" + gm.options.canvasId);
           gm.log("+ InitControls Running");    

           // Turn editing on or off 
           gm.$el.on("click", "button.gm-switch", function(){ 
               if(gm.status){ 
                gm.deinitCanvas();
              } else { 
                gm.initCanvas(); 
              }

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

            // View Source in Alert Dialog
            }).on("click", "a.gm-viewsource", function(){  
                gm.deinitCanvas();  
                var source=gm.htmlEncode(canvas.html()); 
                var modal=$("#canvasModal"); 
                    modal.find(".modal-body").html("<pre class='pre-scrollable'>" + source + "</pre>");
                    modal.modal();  
            
            /* Row settings - coming at some point */
            }).on("click", "a.gm-rowSettings", function(){ 
                 var row=$(this).closest(gm.options.rowSelector); 
                 var drawer=row.find(".gm-rowSettingsDrawer");
                    if(drawer.length > 0){
                      drawer.remove(); 
                    } else {
                      row.prepend(gm.generateModalRowMarkup(row));
                    }
                //var modal=$("#canvasModal");
                /*var row=$(this).closest(gm.options.rowSelector);
                  if($(row).find("gm-rowSettingsDrawer")){

                  } else {
                    row.prepend(gm.generateModalRowMarkup(row));  

                  }             */
                   // modal.find(".modal-body").html(gm.generateModalRowMarkup(row));
                  //  modal.modal(); 
            // Remove a class from a row via rowsettings
            }).on("click", "button.gm-toggleRowClass", function(){
                var row=$(this).closest(gm.options.rowSelector);
                var theClass=$(this).text().trim();
                    row.toggleClass(theClass);
                    if(row.hasClass(theClass)){
                        $(this).addClass("btn-danger");
                    } else { 
                        $(this).removeClass("btn-danger");
                    }
                     
            // Add new column to existing row    
            }).on("click", "a.gm-addColumn", function(){   
                $(this).parent().after(gm.createCol(2)); 

            // Decrease Column Size
            }).on("click", "a.gm-colDecrease", function(){  
              var col = $(this).closest("." +gm.options.gmEditClass);  
              gm.log(col);
              var t=gm.getColClass(col); 
                   if(t.colWidth > gm.options.colMin){ 
                       t.colWidth--; 
                       col.switchClass(t.colClass, gm.options.colClassPrefix + t.colWidth, 200); 
                   }  

            // Increase Column Size 
            }).on("click", "a.gm-colIncrease", function(){ 
               var col = $(this).closest("." +gm.options.gmEditClass);  
               var t=gm.getColClass(col); 
                if(t.colWidth < gm.options.colMax){ 
                  t.colWidth++; 
                  col.switchClass(t.colClass, gm.options.colClassPrefix  + t.colWidth, 200); 
                }    

            // Reset all teh things
            }).on("click", "a.gm-resetgrid", function(){   
                canvas.html(""); 

            // Remove a col or row
            }).on("click", "a.gm-removeCol", function(){  
               $(this).closest("." +gm.options.gmEditClass).animate({opacity: 'hide', width: 'hide', height: 'hide'}, 400, function(){this.remove();}); 
            }).on("click", "a.gm-removeRow", function(){  
               $(this).closest("." +gm.options.gmEditClass).animate({opacity: 'hide', height: 'hide'}, 400, function(){this.remove();});  

            // For all the above, prevent default.
            }).on("click", "a.gm-resetgrid, a.gm-remove, a.gm-save, button.gm-switch, a.gm-viewsource, a.gm-addColumn, a.gm-colDecrease, a.gm-colIncrease", function(e){ 
               gm.log("Clicked: "   + $.grep((this).className.split(" "), function(v){
                 return v.indexOf('gm-') === 0;
             }).join()); 
               e.preventDefault();
            }); 

        };

        // Get the col-md-6 class, returning 6 as well from column
        gm.getColClass=function(col){ 
            var colClass=$.grep(col.attr("class").split(" "), function(v){
                return v.indexOf(gm.options.colClassPrefix) === 0;
                }).join(); 
            var colWidth=colClass.replace(gm.options.colClassPrefix, "");
                return {colClass:colClass, colWidth:colWidth}; 
        };
  
        // Turns canvas into gm-editing mode - does most of the hard work here
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
                placeholder: 'bg-warning',
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
        };

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
              // Stop RTE
              //gm.rteControl("stop"); 
              gm.status=false; 
        };  

        // Push cleaned div content somewhere to save it
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
        gm.activateRows = function(rows){
           gm.log("++ Activate Rows Ran");
           var prepend=gm.toolFactory(gm.options.rowButtonsPrepend); 
           var append=gm.toolFactory(gm.options.rowButtonsAppend); 
           rows.addClass(gm.options.gmEditClass).prepend(prepend).append(append);  
        };
 
        gm.deactivateRows = function(rows){
           gm.log("-- DeActivate Rows"); 
           rows.removeClass(gm.options.gmEditClass).removeClass("ui-sortable").removeAttr("style");  
        };

        // Creates a row, accepting an array of column widths to create child cols
        gm.createRow = function(colWidths){
          var rowHTML= gm.options.rowPrepend + gm.toolFactory(gm.options.rowButtonsPrepend) + gm.options.rowAppend;
            $.each(colWidths, function(i, val){
                rowHTML=rowHTML + gm.createCol(val);
            });
          return rowHTML;
        };

        gm.generateModalRowMarkup = function(row){
            var html="";  
            var classHTML="";
            var toolsPrepend="<div class='gm-rowSettingsDrawer " + gm.options.gmToolClass + " " + gm.options.gmClearClass + "'>";
            var toolsAppend="</div>";
            //gm.log(row);

             $.each(gm.options.rowCustomClasses, function(i, val){
                if(row.hasClass(val)){
                  classHTML=classHTML + "<button class='btn btn-danger btn-xs gm-toggleRowClass'><span class='glyphicon glyphicon-remove-sign'></span> "+  val + "</button>";
                } else {
                  classHTML=classHTML + "<button class='btn btn-xs gm-toggleRowClass'><span class='glyphicon glyphicon-plus-sign'></span> "+  val + "</button>";
                }
             });
              html=toolsPrepend + "<div class='btn-group'>" +  classHTML + "</div>" + toolsAppend;

            return html;
        };

/*------------------------------------------ COLS ---------------------------------------*/
        gm.activateCols = function(cols){ 
           cols.addClass(gm.options.gmEditClass);  
           $.each(cols, function(i, val){
            var prepend=gm.toolFactory(gm.options.colButtonsPrepend) + "<div class='gm-editholder'>";
            var append="</div>" + gm.toolFactory(gm.options.colButtonsAppend);
            var tempHTML=$(val).html(); 
            var colClass = $.grep((val).className.split(" "), function(v){
                 return v.indexOf(gm.options.colClassPrefix) === 0;
             }).join();  
               $(val).html( prepend + tempHTML + append)
                     .find(".gm-handle-col").attr("title", "Move " +  colClass);
           }); 
           gm.log("++ Activate Cols Ran"); 
        };

        gm.deactivateCols = function(cols){ 
           cols.removeClass(gm.options.gmEditClass);  
           $.each(cols, function(i, val){ 
              var temp=$(val).find(".gm-editholder").html();
              $(val).html(temp);
           }); 
           gm.log("-- deActivate Cols Ran");  
        };

        // Lazy function to return column markup
         gm.createCol =  function(size){  
          var prepend="<div class='" + gm.options.colClassPrefix + size + ' ' + gm.options.gmEditClass + "'>" + gm.toolFactory(gm.options.colButtonsPrepend) + "<div class='gm-editholder'><p>Content here</p>";
          var append="</div>" + gm.toolFactory(gm.options.colButtonsAppend) + "</div>";
          var colHTML= prepend + append;
          return colHTML; 
        };
 

/*------------------------------------------ BTNs ---------------------------------------*/ 
        // Create the row and column toolbars
        gm.toolFactory=function(btns){
            var toolsPrepend="<div class='" + gm.options.gmToolClass + " " + gm.options.gmClearClass + "'>";
            var toolsAppend="</div>";
            var string=toolsPrepend + gm.buttonFactory(btns) + toolsAppend;
            return string;
        };

        // Generates buttons to add to toolbars etc
        gm.buttonFactory=function(btns){  
          var buttons=[];
          $.each(btns, function(i, val){  
            buttons.push("<" + val.element +" title='" + val.title + "' class='" + val.btnClass + "'><span class='"+val.iconClass+"'></span>" + "</" + val.element + "> ");
          }); 
          return buttons.join("");
        };
 
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
          var canvas=gm.$el.find("#" + gm.options.canvasId); 
          var output=gm.options.rowPrepend; 

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
                    gm.log(element); 
                    if(!(element).hasClass("mce-content-body")){
                      element.tinymce(gm.options.tinymce.config);
                    }
                    break;

                    case 'ckeditor': 
                      $(element).ckeditor(gm.options.ckeditor);
                      gm.log(this);
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
        
        // Reset
        gm.reset=function(){ 
            gm.log("~~RESET~~");
            gm.deinitCanvas();  
            gm.initCanvas();  
        };

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

        // Generic logging function
        gm.log = function(logvar){
          if(gm.options.debug){
            if ((window['console'] !== undefined)) {
              window.console.log(logvar);
              }
            }
        };

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

    

    // Options which can be overridden by the .gridmanager() call on the requesting page
    $.gridmanager.defaultOptions = {
        // General Options
        debug: 0,
        remoteURL: "/replace-with-your-url",

        // Canvas
        canvasId: "gm-canvas",
        canvasModal: "<div id='canvasModal' class='modal fade' tabindex='-1' role='dialog' aria-labelledby='canvasModal' aria-hidden='true'><div class='modal-dialog modal-lg'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button><h4 class='modal-title' id='myModalLabel'>GridManager</h4></div><div class='modal-body'></div></div></div></div></div>", 
        
        // Top Control Row
        controlId:  "gm-controls",
        controlButtons: [[12], [6,6], [4,4,4], [3,3,3,3], [2,2,2,2,2,2], [2,8,2], [4,8], [8,4]],
        controlButtonClass: "btn  btn-xs  btn-primary",
        controlButtonSpanClass: "glyphicon glyphicon-plus-sign",
        controlPrepend: "<div class='row'><div class='col-md-12'><div id='gm-addnew' class='btn-group '>",
        controlAppend: "</div><div class='btn-group pull-right'><button type='button' class='btn btn-xs btn-primary gm-switch'><span class='glyphicon glyphicon-off'></span> Editor</button><button type='button' class='btn  btn-xs  btn-primary dropdown-toggle' data-toggle='dropdown'><span class='caret'></span><span class='sr-only'>Toggle Dropdown</span></button><ul class='dropdown-menu' role='menu'><li><a title='Save'  href='#' class='gm-save'><span class='glyphicon glyphicon-ok'></span> Save</a></li><li><a title='View Source' href='#' class='gm-viewsource'><span class='glyphicon glyphicon-zoom-in'></span> View Source</a></li><li><a title='Reset Grid' href='#' class='gm-resetgrid'><span class='glyphicon glyphicon-trash'></span> Reset</a></li></ul></div>",
        
        // GM editing classes
        gmEditClass: "gm-editing",
        gmToolClass: "gm-tools",
        gmClearClass: "clearfix",

        // Row Specific
        rowSelector: "div.row",
        rowClass:    "row",
        rowPrepend:  "<div class='row gm-editing'>",
        rowAppend:   "</div>", 
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
        rowButtonsAppend: [ 
                {
                 title:"Remove row", 
                 element: "a", 
                 btnClass: "pull-right gm-removeRow",
                 iconClass: "glyphicon glyphicon-trash"
                }
            ],
        rowSettingControls: "Reserved for future use",
        rowCustomClasses: ["gray","blue","mega-awesome"],

        // Column Specific 
        colSelector: "div[class*=col-]",
        colClassPrefix: "col-md-",
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
        colButtonsAppend: [ 
                {
                 title:"Remove Column", 
                 element: "a", 
                 btnClass: "pull-right gm-removeCol",
                 iconClass: "glyphicon glyphicon-trash"
                }
            ], 
        colMin: 1,
        colMax: 12,

        // RTE configuration 
        tinymce: {
            config: { 
              //selector: "[contenteditable='true']",
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