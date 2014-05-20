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
                string=string + "<a title='Add Row " + _class + "' class='btn btn-default add" + _class + "'><span class='glyphicon glyphicon-plus-sign'></span> " + _class + "</a>";
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

            gm.$el.on("click", "a.gm-switch", function(e){ 
              if(gm.status){ 
                gm.deinitCanvas(); 
              } else { 
                gm.initCanvas(); 
              }
            }); 

            gm.$el.on("click", "a.preview-all", function(e){ 
               
              gm.cleanup();
              e.preventDefault();
            });

            gm.$el.on("click", "a.save-all", function(e){ 
              gm.cleanup();
              gm.saveremote();
              e.preventDefault();
            });
            
            // Remove Row
            gm.$el.on("click", "a.remove", function(){  
              $(this).parent().parent().remove();  
            });

            // btn default behaviours
            gm.$el.on("click", "a.remove, a.edit-all", function(e){ 
              gm.initCanvas(); 
              e.preventDefault();
            }); 

        };


        // Turns canvas into editing mode - does most of the hard work here
        gm.initCanvas = function(){   
         
          // cache canvas
          var canvas=gm.$el.find("#" + gm.options.canvas.id);
          var cols=canvas.find("[class*=col-]");
          var rows=canvas.find("div.row");

           gm.log("---InitCanvas Running"); 
          
              // Sort Rows First
              gm.activateRows(rows); 
              // Now Columns
              gm.activateCols(cols);  

               // Remove all tools just in case
              //c.find("div.tools").remove().end() 
               // Make all cols content editable attr( "contenteditable", true )
               //.find("[class*=col-]").addClass("editing").prepend(gm.options.col.tools + "<div class='editholder'>").append("</div>").end()
               // Make all images responsive
               //.find("[class*=col-] img").addClass("img-responsive").end() 
               // Add Row Tools
               //.find("div.row").addClass("editing").prepend(gm.options.row.tools).sortable(
              //    {items: "> [class*=col-]",   cursor: "move", handle: ".handle-col", forcePlaceholderSize: true,   opacity: 0.7,  revert: true, placeholder: "bg-warning"  }
               // ).end() 
               //  Make Rows Sortable
              // .sortable(
               //   {items: "> div.row.editing", axis: "y", cursor: "move", handle: ".handle-row", forcePlaceholderSize: true,   opacity: 0.7,  revert: true, placeholder: "bg-warning"  }
                //); 
            // Start RTE
            gm.rteControl("start");
            gm.status=true;
        };

        gm.deinitCanvas = function(){ 
          // cache canvas
          var canvas=gm.$el.find("#" + gm.options.canvas.id);
          var cols=canvas.find("[class*=col-]");
          var rows=canvas.find("div.row");

           gm.log("---deInitCanvas Running");  
              // Sort Rows First
              gm.deactivateRows(rows); 
              // Now Columns
              gm.deactivateCols(cols); 
              // Remove Tools
              canvas.find("div.tools").remove();
              // Stop RTE
              gm.rteControl("stop"); 
              gm.status=false; 
        };  

        gm.activateRows = function(rows){
           rows.addClass("editing").end()
              .sortable({ 
                  items: "> div.row.editing", 
                  cursor: "move", 
                  handle: ".handle-row", 
                  forcePlaceholderSize: true,   
                  opacity: 0.7,  
                  revert: true, 
                  placeholder: "bg-warning"
              });

           $.each(rows, function(i, val){ 
               $(val).prepend(gm.options.row.tools);
           });
           gm.log("Activate Rows Ran"); 
        };

        gm.deactivateRows = function(rows){
             rows.removeClass("editing").end(); 
             $.each(rows, function(i, val){ 
                 //$(val).remove(".tools");
             });
             gm.log("DeActivate Rows Ran"); 
          };

        gm.activateCols = function(cols){ 
           cols.addClass("editing");  
           $.each(cols, function(i, val){ 
            var temp=$(val).html();
               $(val).html(gm.options.col.tools + "<div class='editholder' contenteditable=true>" + temp + "</div>");
           }); 
           gm.log("Activate Cols Ran"); 

        };

        gm.deactivateCols = function(cols){ 
           cols.removeClass("editing");  
           $.each(cols, function(i, val){ 
              var temp=$(val).find(".editholder").html();
              $(val).html(temp);
           }); 
           gm.log("deActivate Cols Ran");  
        };

        
        gm.generateClickHandler= function(arr){  
          var string="a.add" + gm.generateButtonClass(arr);
          var id="#" + gm.options.canvas.id;
          var output=gm.options.row.prepend + gm.options.row.tools; 

              $.each(arr, function(i, val){ 
                output=output + gm.colmd(val); 
              });

              gm.$el.on("click", string, function(e){ 
                gm.log("Clicked " + string); 
                gm.$el.find(id).append(output); 
                //gm.initCanvas(); 
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
        gm.colmd =  function(size){
          return "<div class='col-md-" + size + " editing'>" + gm.options.col.tools + "<div class='editholder' contenteditable=true> Content here </div></div>";
        };

        // basically reverses initCanvas
        gm.cleanup =  function(){ 
           
          // cache canvas
          var canvas=gm.$el.find(id="#" + gm.options.canvas.id);
              canvas.find("div.row").removeAttr("style").end()
                    .find("[class*=col-]").removeAttr("style").removeAttr("spellcheck").removeAttr("id").removeClass("mce-content-body").end()
                    .find("img").removeAttr("style").removeAttr("data-mce-src").addClass("img-responsive").end();

          /*
          var cols=c.find("[class*=col-]");
              // Remove tools
               c.find("div.tools").remove().end()
                .find("div.row").removeAttr("style").end() 
                .find("[class*=col-]").removeAttr("style").removeAttr("spellcheck").removeAttr("id").removeClass("mce-content-body").end()
                .find("img").removeAttr("style").removeAttr("data-mce-src").addClass("img-responsive").end()
                .find("div").removeAttr( "contenteditable" ).removeClass("editing").removeClass("ui-sortable");
          //gm.rteControl("stop");
           $.each(cols, function(i, val){
                var temp=$(val > ".editholder").html(); 
                $(val).html(temp);
              });
          gm.log("Cleanup Ran"); 
          */
        };

        // Rich Text Editor controller
        gm.rteControl=function(action){
          gm.log("-- RTE ---" + gm.options.rte + ' ' +action);
          switch (action) { 
            case 'init':
                if(typeof window.CKEDITOR !== 'undefined'){
                    gm.options.rte='ckeditor';
                    gm.log("CKEDITOR Found");   
              }
                if(typeof window.tinymce !== 'undefined'){
                    gm.options.rte='tinymce';
                    gm.log("TINYMCE Found"); 
                }
                break;
            case 'start':  
                switch (gm.options.rte) {
                    case 'tinymce': 
                      // initialise TinyMCE
                      window.tinymce.init(gm.options.tinymceConfig);
                    break;

                    case 'ckeditor':
                    // ckeditor likes to start by itself, irrespective of what I ask it to do.
                    // So this is only needed when you destroy and then init();
                    window.CKEDITOR.inlineAll(); 
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
            id: "gridmanager-canvas"
        },
        buttons: [[12], [6,6], [4,4,4], [3,3,3,3], [2,2,2,2,2,2], [2,8,2], [4,8], [8,4]],
        controls: {
            id:  "gridmanager-controls",
            prepend: "<div class='row'><div class='col-md-12'><div id='gridmanager-addnew' class='btn-group'>", 
            append: "</div><div id='gridmanager-util' class='pull-right'><a title='Turn on editing'  class='btn btn-info gm-switch  '><span class='glyphicon glyphicon-edit'></span> Switch</a><a title='Preview' class='btn btn-success preview-all '><span class='glyphicon glyphicon-eye-open'></span> Preview</a><a title='Save' class='btn btn-primary save-all '><span class='glyphicon glyphicon-floppy-disk'><span> Save</a></div></div></div>"
        },
        row: { 
            prepend:  "<div class='row editing'>",
            append:   "</div>", 
            tools:    "<div class='tools clearfix'><a title='Move' class='handle-row pull-left btn btn-info btn-xs'><span class='glyphicon glyphicon-resize-vertical'></span></a><a title='Remove row'  class=' pull-right remove btn btn-danger btn-xs'><span class='glyphicon glyphicon-trash'></span></a></div>"

        },
        col: {  
            tools:    "<div class='tools clearfix'><a title='Move' class='handle-col pull-left btn btn-info btn-xs'><span class='glyphicon glyphicon-resize-horizontal'></span></a><a title='Remove row'  class=' pull-right remove btn btn-danger btn-xs'><span class='glyphicon glyphicon-trash'></span></a></div>"

        },
       
        tinymceConfig: {
            selector: "[contenteditable='true']",
            inline: true,
            plugins: [
            "advlist autolink lists link image charmap print preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table contextmenu paste"
            ],
            toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image"
        },
        ckeditorConfig: {}

    };
    
    // Expose as jquery function
    $.fn.gridmanager = function(options){
        return this.each(function(){
            (new $.gridmanager(this, options));
        });
    }; 
    
})(jQuery );