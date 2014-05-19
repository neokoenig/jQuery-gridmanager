/*! gridmanager - v0.1.1 - 2014-05-19
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
            
            // Create the controls & canvas placeholders 
            gm.createCanvas();
            gm.createControls(); 
            gm.initControls(); 
            gm.initCanvas();  
        };
        
        // Build and append the canvas, making sure existing HTML in the user's div is wrapped
        gm.createCanvas = function(){  
           var html=gm.$el.html();
                gm.$el.html("");
            var c="<div id=" + gm.options.canvas.id + ">" + html + "</div>";
                gm.$el.append(c); 
        };

        // Build and prepend the control panel
        gm.createControls = function(){   
          var string=("<div id=" + gm.options.controls.id + ">" + gm.options.controls.prepend);
          var _class="";
              $.each(gm.options.buttons, function(i, val){ 
                _class=gm.generateButtonClass(val);
                string=string + "<a title='Add Row " + _class + "' class='btn btn-default add" + _class + "'><span class='glyphicon glyphicon-plus-sign'></span> " + _class + "</a>";
              });
              string= string + gm.options.controls.append;
              gm.log("Control Buttons created");
              gm.$el.prepend(string);  
        }; 
                
        // Add click functionality to the buttons        
        gm.initControls = function(){  
 
              $.each(gm.options.buttons, function(i, val){ 
                gm.generateClickHandler(val);
              });
 
            // Utils
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
            gm.$el.on("click", "a.remove-row", function(){  
              $(this).parent().parent().remove();  
            });

            // btn default behaviours
            gm.$el.on("click", "a.remove-row, a.edit-all", function(e){ 
              gm.initCanvas(); 
              e.preventDefault();
            }); 

        };


        // Turns canvas into editing mode - does most of the hard work here
        gm.initCanvas = function(){ 

          var id="#" + gm.options.canvas.id;

          gm.$el.find(id + ' [class*=col-]').attr( "contenteditable", true ).end()
                .find(id + " div.tools").remove().end()
                .find(id + " [class*=col-] img").addClass("img-responsive").end()
                .find(id + " div.row").addClass("editing").prepend(gm.options.row.tools).end()
                .find(id).sortable(
                {axis: "y", cursor: "move", handle: ".handle-row", forcePlaceholderSize: true,   opacity: 0.7,  revert: true, placeholder: "bg-warning"  }
                ); 
          gm.tinymceStart();
           gm.log("InitCanvas Ran"); 
        };
        
        gm.generateClickHandler= function(arr){  
          var string="a.add" + gm.generateButtonClass(arr);
          var id="#" + gm.options.canvas.id;
          var output=gm.options.row.prepend; 

              $.each(arr, function(i, val){ 
                output=output + gm.colmd(val); 
              });

              gm.$el.on("click", string, function(e){
                gm.log("Clicked " + string); 
                gm.$el.find(id).append(output); 
                gm.initCanvas(); 
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
          return "<div class='col-md-" + size + "'></div>";
        };

        // basically reverses initCanvas
        gm.cleanup =  function(){ 
          var id="#" + gm.options.canvas.id;  
          gm.$el.find(id + " div.tools").remove().end()
                .find(id + " div.row").removeAttr("style").removeClass("editing").end() 
                .find(id + " [class*=col-]").removeAttr("spellcheck").removeAttr("id").removeClass("mce-content-body").end()
                .find(id + " img").removeAttr("style").removeAttr("data-mce-src").addClass("img-responsive").end()
                .find(id + " div").removeAttr( "contenteditable" );
          gm.tinymceStop();
          gm.log("Cleanup Ran"); 
        };

        gm.tinymceStart=function(){
           window.tinymce.init(gm.options.tinyMCE);
            gm.log("TinyMCE Started"); 
        };

        gm.tinymceStop=function(){
          window.tinymce.remove();
           gm.log("TinyMCE Removed");
           
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
            append: "</div><div id='gridmanager-util' class='btn-group pull-right'><a title='Turn on editing'  class='btn btn-info edit-all '><span class='glyphicon glyphicon-edit'></span></a><a title='Preview' class='btn btn-success preview-all '><span class='glyphicon glyphicon-eye-open'></span></a><a title='Save' class='btn btn-primary save-all '><span class='glyphicon glyphicon-floppy-disk'><span></a></div></div></div>"
        },
        row: { 
            prepend:  "<div class='row'>",
            append:   "</div>", 
            tools:    "<div class='tools clearfix'><a title='Move row' class='handle-row pull-left btn btn-info btn-xs'><span class='glyphicon glyphicon-move'></span> Move</a><a title='Remove row'  class=' pull-right remove-row btn btn-danger btn-xs'><span class='glyphicon glyphicon-trash'></span> Remove</a></div>"

        },
        tinyMCE: {
            selector: "[contenteditable='true']",
            inline: true,
            plugins: [
            "advlist autolink lists link image charmap print preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table contextmenu paste"
            ],
            toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image"
        }

    };
    
    // Expose as jquery function
    $.fn.gridmanager = function(options){
        return this.each(function(){
            (new $.gridmanager(this, options));
        });
    }; 
    
})(jQuery );