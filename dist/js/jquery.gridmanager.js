/*! gridmanager - v0.2.0 - 2014-05-21
* http://neokoenig.github.io/jQuery-gridmanager/
* Copyright (c) 2014 Tom King; Licensed MIT */
(function($  ){

    $.gridmanager = function(el, options){ 
        var gm = this;  
        gm.$el = $(el);
        gm.el = el; 
        gm.$el.data("gridmanager", gm);
       
        
        // The main function 
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

        // Reset
        gm.reset=function(){ 
            gm.deinitCanvas();  
            gm.initCanvas();  
        };
        
        // Build and append the canvas, making sure existing HTML in the user's div is wrapped
        gm.createCanvas = function(){   
          gm.log("-Create Canvas"); 
           var html=gm.$el.html();
                gm.$el.html("");
            var c="<div id=" + gm.options.canvas.id + ">" + html + "</div>";
                gm.$el.append(c); 
        };

        // Build and prepend the control panel
        gm.createControls = function(){  
        gm.log("-Create Controls");  
          var string=("<div id=" + gm.options.controls.id + ">" + gm.options.controls.prepend);
          var _class="";
              $.each(gm.options.buttons, function(i, val){ 
                _class=gm.generateButtonClass(val);
                string=string + "<a title='Add Row " + _class + "' class='btn  btn-xs  btn-info add" + _class + "'><span class='glyphicon glyphicon-plus-sign'></span> " + _class + "</a>";
              });
              string= string + gm.options.controls.append; 
              gm.$el.prepend(string);  
        }; 
                
        // Add click functionality to the buttons        
        gm.initControls = function(){  
           gm.log("---InitControls Running"); 
              $.each(gm.options.buttons, function(i, val){ 
                gm.generateClickHandler(val);
              });
 
            // Utils 
            gm.$el.on("click", "button.gm-switch", function(){ 
               if(gm.status){ 
                gm.deinitCanvas();
                $(this).text("Editor ON"); 
              } else { 
                gm.initCanvas(); 
                $(this).text("Editor OFF"); 
            }
            }); 
  
            gm.$el.on("click", "a.gm-save", function(){ 
              gm.deinitCanvas();
              gm.saveremote(); 
            });

            gm.$el.on("click", "a.gm-viewsource", function(){  
            var id="#" + gm.options.canvas.id; 
                gm.deinitCanvas(); 
                window.alert(gm.$el.find(id).html());
            });

            gm.$el.on("click", "a.gm-resetgrid", function(){  
            var id="#" + gm.options.canvas.id; 
                gm.$el.find(id).html("");  
            }); 
            
            // Remove Row or col
            gm.$el.on("click", "a.gm-remove", function(){  
              $(this).closest("div.gm-editing").remove();  
            });

            // btn default behaviours
            gm.$el.on("click", "a.gm-remove, a.gm-save, button.gm-switch, a.gm-viewsource", function(e){  
              e.preventDefault();
            }); 

        };


        // Turns canvas into gm-editing mode - does most of the hard work here
        gm.initCanvas = function(){    
          // cache canvas
          var canvas=gm.$el.find("#" + gm.options.canvas.id);
          var cols=canvas.find(gm.options.col.selector);
          var rows=canvas.find(gm.options.row.selector); 
           gm.log("---InitCanvas Running");  
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

           gm.log("---deInitCanvas Running");  
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
 
        gm.activateRows = function(rows){
           rows.addClass("gm-editing");
           $.each(rows, function(i, val){ 
               $(val).prepend(gm.options.row.tools);
           });
           gm.log("Activate Rows Ran"); 
        };

        gm.deactivateRows = function(rows){
             rows.removeClass("gm-editing").removeClass("ui-sortable").removeAttr("style");  
             gm.log("DeActivate Rows Ran"); 
          };

        gm.activateCols = function(cols){ 
           cols.addClass("gm-editing");  
           $.each(cols, function(i, val){ 
            var temp=$(val).html();
               $(val).html(gm.options.col.tools + "<div class='gm-editholder' contenteditable=true>" + temp + "</div>");
           }); 
           gm.log("Activate Cols Ran"); 

        };

        gm.deactivateCols = function(cols){ 
           cols.removeClass("gm-editing");  
           $.each(cols, function(i, val){ 
              var temp=$(val).find(".gm-editholder").html();
              $(val).html(temp);
           }); 
           gm.log("deActivate Cols Ran");  
        };

        
        gm.generateClickHandler= function(arr){  
          var string="a.add" + gm.generateButtonClass(arr);
          var canvas=gm.$el.find("#" + gm.options.canvas.id);
          //var cols=canvas.find(gm.options.col.selector); 
          var output=gm.options.row.prepend + gm.options.row.tools; 

              $.each(arr, function(i, val){ 
                output=output +  gm.generateColumn(val); 
              });

              gm.$el.on("click", string, function(e){ 
                gm.log("Clicked " + string); 
                canvas.append(output);   
                gm.reset();
                e.preventDefault();  
            }); 
        };

        // Basically just turns [2,4,6] into 2-4-6
        gm.generateButtonClass=function(arr){
            var string="";
              $.each(arr, function( i , val ) {
                    string=string + "-" + val;  
              }); 
              return string;
        };

        // Lazy function to return column markup
         gm.generateColumn =  function(size){
          return "<div class='col-md-" + size + " gm-editing'>" + gm.options.col.tools + "<div class='gm-editholder' contenteditable=true> Content here </div></div>";
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
        };

        // Rich Text Editor controller
        gm.rteControl=function(action){
          gm.log("-- RTE ---" + gm.options.rte + ' ' +action);
        
          switch (action) { 
            case 'init':
                if(typeof window.CKEDITOR !== 'undefined'){
                    gm.options.rte='ckeditor';
                    gm.log("CKEDITOR Found");  
                    window.CKEDITOR.disableAutoInline = true; 
               }
                if(typeof window.tinymce !== 'undefined'){
                    gm.options.rte='tinymce';
                    gm.log("TINYMCE Found"); 
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
                    break;

                    case 'ckeditor':
                      // destroy ckeditor
                         for(var name in window.CKEDITOR.instances)
                        {
                          window.CKEDITOR.instances[name].destroy();
                        }
                        
                    break;

                    default:
                        gm.log("No RTE specified for stop");
                }
              break; //end stop
              default:
                  gm.log("No RTE Action specified");
            }
        };

       
        // Push cleaned div content somewhere to save it
        gm.saveremote =  function(){  
        var id="#" + gm.options.canvas.id;
        var data=gm.log(gm.$el.find(id).html()); 
       
            $.ajax({
              type: "POST",
              url:  gm.options.remoteURL,
              data: data 
            });
            gm.log("Save Function Called"); 
        }; 

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
        buttons: [[12], [6,6], [4,4,4], [3,3,3,3], [2,2,2,2,2,2], [2,8,2], [4,8], [8,4]],
        controls: {
            id:  "gm-controls",
            prepend: "<div class='row'><div class='col-md-12'><div id='gridmanager-addnew' class='btn-group'>", 
            append: "</div><div class='btn-group pull-right'><button type='button' class='btn btn-xs btn-primary gm-switch'>Editor</button><button type='button' class='btn  btn-xs  btn-primary dropdown-toggle' data-toggle='dropdown'><span class='caret'></span><span class='sr-only'>Toggle Dropdown</span></button><ul class='dropdown-menu' role='menu'><li><a title='Save'  href='#' class='gm-save'><span class='glyphicon glyphicon-ok'></span> Save</a></li><li><a title='View Source' href='#' class='gm-viewsource'><span class='glyphicon glyphicon-zoom-in'></span> View Source</a></li><li><a title='Reset Grid' href='#' class='gm-resetgrid'><span class='glyphicon glyphicon-trash'></span> Reset</a></li></ul></div>"
        },
        row: { 
            selector: "div.row",
            prepend:  "<div class='row gm-editing'>",
            append:   "</div>", 
            tools:    "<div class='gm-tools clearfix'><a title='Move' class='handle-row pull-left btn btn-info btn-xs'><span class='glyphicon glyphicon-resize-vertical'></span></a><a title='Remove row'  class=' pull-right gm-remove btn btn-danger btn-xs'><span class='glyphicon glyphicon-trash'></span></a></div>"

        },
        col: {  
            selector: "div[class*=col-]",
            tools:    "<div class='gm-tools clearfix'><a title='Move' class='handle-col pull-left btn btn-info btn-xs'><span class='glyphicon glyphicon-resize-horizontal'></span></a><a title='Remove column'  class=' pull-right gm-remove btn btn-danger btn-xs'><span class='glyphicon glyphicon-trash'></span></a></div>"

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