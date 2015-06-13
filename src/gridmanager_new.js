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

        gm.init = function(){
          gm.options = $.extend({},$.gridmanager.defaultOptions, options);
          gm.do("start");
        };

        // Main entry point. Wraps each function call with before and after handlers and does logging if requested.
        gm.do = function(eventName, options){
          gm._executeCallback(gm.options.events['before' + eventName]);
            gm.log("--" + eventName + "--");
            var d= gm[eventName](options);
          gm._executeCallback(gm.options.events['after' + eventName]);
          return d;
        };

        // If event is valid, execute it.
        gm._executeCallback=function(callBack){
          if($.isFunction(callBack)){
            callBack();
          }
        };

        // Runs on start up
        gm.start = function(){
            gm.utils.addCSS(gm.options.cssInclude);
            gm.grid._setupCanvas();
            gm.grid._setupResponsiveness();
            gm.grid._setupDefaultEditableRegions();
            gm.grid._setupControls();
            gm.grid._initControls();
            gm.grid._initDefaultButtons();
            gm.grid._initCanvas();
            gm.markup.activate(gm.$el.find(gm.options.colSelector));

        };
        // Destroy the container and reproduce content in original div
        gm.destroy = function(){
          gm.grid._deinitCanvas();
          var html=gm.getRaw();
          var parentitem=gm.$el.parent();
          var elid=$(el).attr("id");
          var temp=$("<div>").attr({"id": elid }).html(html);
          gm.el.remove();
          $(parentitem).append(temp);
        };
        // Clears the grid contents
        gm.delete= function(){
            gm.getCanvas().html("");
            gm.reset();
        };
        // Delete selected column(s)
        gm.deleteSelected= function(){
            gm.getSelected().remove();
        };
        // Reinit's all the grids handlers etc
        gm.reset= function(){
          gm.grid._deinitCanvas();
          gm.grid._initCanvas();
        };
        // Save contents
        gm.save=   function(){
          gm.grid._deinitCanvas();
          gm.grid._saveremote();
          gm.grid._initCanvas();
        };
        // Get Cleaned contents
        gm.get=    function(){
          gm.grid._deinitCanvas();
          var temp=gm.getRaw();
          gm.grid._initCanvas();
          return temp;
        };
        // Get Raw contents (with GM markup)
        gm.getRaw=function(){
          return gm.getCanvas().html();
        };
        // Get the Canvas
        gm.getCanvas=function(){
          return gm.$el.find("#" + gm.options.canvasId);
        };
        // Get Selected Cols
        gm.getSelected=function(){
          return gm.getCanvas().find("." + gm.options.gmEditClassSelected);
        };
        // Generic logging function
        gm.log = function(logvar){
          if(gm.options.debug){if ((window['console'] !== undefined)) {window.console.log(logvar);}}
        };
        // Switch to desktop mode
        gm.desktop= function(){
          gm.grid._switchLayoutMode();
        };
        // Switch to tablet mode
        gm.tablet= function(){
          gm.grid._switchLayoutMode("tablet");
        };
        // Switch to phone mode
        gm.phone= function(){
          gm.grid._switchLayoutMode("phone");
        };
        // Switch to codeview
        gm.codeview= function(){
          gm.grid._switchMode();
        };
        // Switch to preview
        gm.preview= function(){
          gm.grid._switchPreview();
        };

       // Create a row
       gm.rowCreate= function(colWidths){
          var widths = colWidths || [12];
          var canvas=gm.getCanvas();
          var row= $("<div/>", {"class": gm.options.rowClass + " " + gm.options.gmEditClass});
           $.each(widths, function(i, val){
              row.append(gm.col.create(val));
            });
           gm.rowActivate(row);
           if (gm.options.addRowPosition === 'bottom') {
                canvas.append(row);
            } else {
                canvas.prepend(row);
            }
            gm.reset();
        };
        gm.rowDelete= function(position){
           if (typeof position === "undefined" || position === null) {
              position = 0;
            }
          var rows=gm.rowGetAll();
          gm.row._remove(rows[position]);
        };
        // Get All Rows
        gm.rowGetAll= function(){
          return gm.getCanvas().find("." + gm.options.rowClass);
        };
        // Get a specific row
        gm.rowGet=    function(position){
         if (typeof position === "undefined" || position === null) {
            position = 0;
          }
          var rows=gm.rowGetAll();
          return $(rows[position]);
        };
        // Activate Rows
        gm.rowActivate= function(rows){
         rows.addClass(gm.options.gmEditClass)
             .prepend(gm.utils.toolFactory(gm.options.rowButtonsPrepend))
             .append(gm.utils.toolFactory(gm.options.rowButtonsAppend));
        };
        // Deactivate Rows
        gm.rowDeactivate= function(rows){
          rows.removeClass(gm.options.gmEditClass)
             .removeClass("ui-sortable")
             .removeAttr("style");
        };

        //------------------------------GRID----------------------------
        gm.grid   ={
          _saveremote: function(){
            var canvas=gm.getCanvas();
            $.ajax({
              type: "POST",
              url:  gm.options.remoteURL,
              data: {content: canvas.html()}
            });
          },

          _setupCanvas: function(){
            var html=gm.$el.html();
                gm.$el.html("");
                $('<div/>', {'id': gm.options.canvasId, 'html':html }).appendTo(gm.$el);
          },

          _setupControls: function(){
            if(gm.options.useControlBar){
                    var buttons=[];
                // Dynamically generated row template buttons
                $.each(gm.options.controlButtons, function(i, val){
                  var _class=gm.utils.generateButtonClass(val);
                  buttons.push("<a title='Add Row " + _class + "' class='" + gm.options.controlButtonClass + " add" + _class + "'><span class='" + gm.options.controlButtonSpanClass + "'></span> " + _class + "</a>");
                  gm.utils.generateClickHandler(val);
                });

             gm.$el.prepend(
              $('<div/>',
                  {'id': gm.options.controlId, 'class': gm.options.gmClearClass }
              ).prepend(
                    $('<div/>', {"class": gm.options.rowClass}).html(
                       $('<div/>', {"class": gm.options.colDesktopClass + gm.options.colMax}).addClass(gm.options.colAdditionalClass).html(
                          $('<div/>', {'id': 'gm-addnew'})
                          .addClass(gm.options.gmBtnGroup)
                          .addClass(gm.options.gmFloatLeft).html(
                            buttons.join("")
                          )
                        ).append(gm.options.controlAppend)
                     )
                  )
              );
            }
          },

          _removeControls: function(){
            $("#" + gm.options.controlId).remove();
          },

          _initControls: function(){

            //var canvas=gm.$el.find("#" + gm.options.canvasId);

           // Turn editing on or off
           gm.$el.on("click", ".gm-preview", function(){
              gm.do("preview");

            // Switch Layout Mode
            }).on("click", ".gm-layout-mode a", function() {
              gm.grid._switchLayoutMode($(this).data('width'));

            // Switch editing mode
            }).on("click", ".gm-edit-mode", function(){
              gm.do("codeview");

            // Make region editable
            }).on("click", "." + gm.options.gmEditRegion + ' .'+gm.options.gmContentRegion, function(){
              //gm.log("clicked editable");
                if(!$(this).attr("contenteditable")){
                    $(this).attr("contenteditable", true);
                    //gm.rteControl("attach", $(this) );
                }

            // Save Function
            }).on("click", "a.gm-save", function(){
                gm.do("save");

            /* Row settings */
            }).on("click", "a.gm-rowSettings", function(){
                 var row=$(this).closest(gm.options.rowSelector);
                 var drawer=row.find(".gm-rowSettingsDrawer");
                  if(drawer.length > 0){
                    drawer.remove();
                  } else {
                    row.prepend(gm.row._addSettings(row));
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

             /* Col settings */
            }).on("click", "a.gm-colSettings", function(){
                 var col=$(this).closest(gm.options.colSelector);
                 var drawer=col.find(".gm-colSettingsDrawer");
                    if(drawer.length > 0){
                      drawer.remove();
                    } else {
                      col.prepend(gm.col._addSettings(col));
                    }

              // Change Col ID via colsettings
            }).on("blur", "input.gm-colSettingsID", function(){
                 var col=$(this).closest(gm.options.colSelector);
                    col.attr("id", $(this).val());

            // Remove a class from a row via rowsettings
            }).on("click", ".gm-togglecolClass", function(){
                 var col=$(this).closest(gm.options.colSelector);
                var theClass=$(this).text().trim();
                    col.toggleClass(theClass);
                    if(col.hasClass(theClass)){
                        $(this).addClass(gm.options.gmDangerClass);
                    } else {
                        $(this).removeClass(gm.options.gmDangerClass);
                    }

            // Add new column to existing row
            }).on("click", "a.gm-addColumn", function(){
                $(this).parent().after(gm.col.create(2));
                gm.grid._switchLayoutMode(gm.options.layoutDefaultMode);
                gm.reset();

            // Add a nested row
            }).on("click", "a.gm-addRow", function(){

               $(this).closest("." +gm.options.gmEditClass).append(
                  $("<div>").addClass(gm.options.rowClass)
                            .html(gm.col.create(6))
                            .append(gm.col.create(6)));
               gm.reset();

            // Decrease Column Size
            }).on("click", "a.gm-colDecrease", function(){
              var col = $(this).closest("." +gm.options.gmEditClass);
              var t=gm.utils.getColClass(col);
                   if(t.colWidth > parseInt(gm.options.colResizeStep, 10)){
                       t.colWidth=(parseInt(t.colWidth, 10) - parseInt(gm.options.colResizeStep, 10));
                       col.switchClass(t.colClass, gm.options.currentClassMode + t.colWidth, 200);
                   }

            // Increase Column Size
            }).on("click", "a.gm-colIncrease", function(){
               var col = $(this).closest("." +gm.options.gmEditClass);
               var t=gm.utils.getColClass(col);
                if(t.colWidth < gm.options.colMax){
                    t.colWidth=(parseInt(t.colWidth, 10) + parseInt(gm.options.colResizeStep, 10));
                    col.switchClass(t.colClass, gm.options.currentClassMode + t.colWidth, 200);
                }

            // Delete all teh things
            }).on("click", "a.gm-deletegrid", function(){
              gm.do("delete");

            // Remove a col or row
            }).on("click", "a.gm-removeCol", function(){
               $(this).closest("." +gm.options.gmEditClass).animate({opacity: 'hide', width: 'hide', height: 'hide'}, 400, function(){$(this).remove();});

            }).on("click", "a.gm-removeRow", function(){
               $(this).closest("." +gm.options.gmEditClass).animate({opacity: 'hide', height: 'hide'}, 400, function(){
                  $(this).remove();
                });
            });
            // For all the above, prevent default.
            // TODO
            //}).on("click", "a.gm-deletegrid, a.gm-remove, a.gm-removeRow, a.gm-save, button.gm-preview, a.gm-viewsource, a.gm-addColumn, a.gm-colDecrease, a.gm-colIncrease", function(e){
            //   //e.preventDefault();
            //
          },

          _initDefaultButtons : function(){
          /* Bit of hack to make sure this is only run once */
          gm.options.customControls.global_col=[];
          if(gm.options.colSelectEnabled) {
            gm.options.customControls.global_col.push({callback: gm.col._selectColClick, loc: 'top', iconClass: 'fa fa-square-o', title: 'Select Column'});
          }
          if(gm.options.editableRegionEnabled) {
            gm.options.customControls.global_col.push({callback: gm.grid._addEditableAreaClick, loc: 'top', iconClass: 'fa fa-edit', title: 'Add Editable Region'});
          }
        },

         _addEditableAreaClick : function(container, btn, html) {
          var cTagOpen = '<!--'+gm.options.gmEditRegion+'-->',
              cTagClose = '<!--\/'+gm.options.gmEditRegion+'-->',
              elem = null;
              html = html || gm.options.gmContentPlaceholder;
              btn = null;
          $(('.'+gm.options.gmToolClass+':last'),container)
          .before(elem = $('<div>').addClass(gm.options.gmEditRegion+' '+gm.options.contentDraggableClass)
            .append(gm.options.controlContentElem+'<div class="'+gm.options.gmContentRegion+'">'+ html +'</div>')).before(cTagClose).prev().before(cTagOpen);
          gm.grid._initNewContentElem(elem);
        },

          _setupResponsiveness: function(){
            if(gm.options.addResponsiveClasses) {
              var html=gm.getCanvas();
              if(html === '') { return; }
              var desktopRegex = gm.options.colDesktopClass+'(\\d+)',
                  tabletRegex = gm.options.colTabletClass+'(\\d+)',
                  phoneRegex = gm.options.colPhoneClass+'(\\d+)',
                  desktopRegexObj = new RegExp(desktopRegex,'i'),
                  tabletRegexObj = new RegExp(tabletRegex, 'i'),
                  phoneRegexObj = new RegExp(phoneRegex, 'i');
                  //new_html = '';
              return $(html).find(':regex(class,'+desktopRegex+'|'+tabletRegex+'|'+phoneRegex+')').each(function() {
                var elClasses = $(this).attr('class'), colNum = 2;
                var hasDesktop = desktopRegexObj.test(elClasses), hasPhone = phoneRegexObj.test(elClasses), hasTablet = tabletRegexObj.test(elClasses);

                colNum = (colNum = desktopRegexObj.exec(elClasses))? colNum[1] : ( (colNum = tabletRegexObj.exec(elClasses))? colNum[1] : phoneRegexObj.exec(elClasses)[1] );

                if(!hasDesktop) {
                  $(this).addClass(gm.options.colDesktopClass+colNum);
                }
                if(!hasPhone) {
                  $(this).addClass(gm.options.colPhoneClass+colNum);
                }
                if(!hasTablet) {
                  $(this).addClass(gm.options.colTabletClass+colNum);
                }
                // Adds default column classes - probably shouldn't go here, but since we're doing an expensive search to add the responsive classes, it'll do for now.
                if(gm.options.addDefaultColumnClass){
                  if(!$(this).hasClass(gm.options.colClass)){
                    $(this).addClass(gm.options.colClass);
                  }
                }
              });
            }
          },

          _setupDefaultEditableRegions: function(){
              if(gm.options.autoEdit){
                 var cols= gm.getCanvas()
                         .find("."+gm.options.colClass)
                         .not("."+gm.options.rowClass);
                   gm.markup.activate(cols);
                }
          },



         _switchLayoutMode: function(mode) {
            var canvas=gm.getCanvas(),
                temp_html = canvas.html(),
                regex1 = '',
                regex2 = '',
                uimode = '';
            // Reset previous changes
            temp_html = gm.utils.cleanSubstring(gm.options.classRenameSuffix, temp_html, '');
            // TODO: this is affecting all instances of GM on a page: perhaps only limit to current instance?
            uimode = $('div.gm-layout-mode > button > span');
            // Do replacements
            switch (mode) {
              case "tablet":
                regex1 = '(' + gm.options.colDesktopClass  + '\\d+)';
                regex2 = '(' + gm.options.colPhoneClass + '\\d+)';
                gm.options.currentClassMode = gm.options.colTabletClass;
                gm.options.colSelector = gm.options.colTabletSelector;
                $(uimode).attr('class', 'fa fa-tablet').attr('title', 'Tablet');
                break;
              case "phone":
                regex1 = '(' + gm.options.colDesktopClass  + '\\d+)';
                regex2 = '(' + gm.options.colTabletClass + '\\d+)';
                gm.options.currentClassMode = gm.options.colPhoneClass;
                gm.options.colSelector = gm.options.colPhoneSelector;
                $(uimode).attr('class', 'fa fa-mobile-phone').attr('title', 'Phone');
                break;
              default:
                regex1 = '(' + gm.options.colPhoneClass  + '\\d+)';
                regex2 = '(' + gm.options.colTabletClass + '\\d+)';
                gm.options.currentClassMode = gm.options.colDesktopClass;
                gm.options.colSelector = gm.options.colDesktopSelector;
                $(uimode).attr('class', 'fa fa-desktop').attr('title', 'Desktop');
            }
            gm.options.layoutDefaultMode = mode;
            temp_html = temp_html.replace(new RegExp((regex1+'(?=[^"]*">)'), 'gm'), '$1'+gm.options.classRenameSuffix);
            temp_html = temp_html.replace(new RegExp((regex2+'(?=[^"]*">)'), 'gm'), '$1'+gm.options.classRenameSuffix);
            canvas.html(temp_html);
        },

        _switchMode: function(){
          var canvas=gm.getCanvas();
          if(gm.mode === "visual"){
                 gm.grid._deinitCanvas();
                 canvas.html($('<textarea/>').attr("cols", 130).attr("rows", 25).val(canvas.html()));
                 gm.mode="html";
                 $(this).parent().find(".gm-preview, .gm-layout-mode > button").prop('disabled', true);
              } else {
                var editedSource=canvas.find("textarea").val();
                 canvas.html(editedSource);
                 gm.grid._initCanvas();
                 gm.mode="visual";
                 $(this).parent().find(".gm-preview, .gm-layout-mode > button").prop('disabled', false);
              }
              $(this).toggleClass(gm.options.gmDangerClass);
        },

        /* Turns local preview on or off */
        _switchPreview: function(){
           if(gm.status){
                gm.grid._deinitCanvas();
                 $(this).parent().find(".gm-edit-mode").prop('disabled', true);
              } else {
                gm.grid._initCanvas();
                 $(this).parent().find(".gm-edit-mode").prop('disabled', false);
              }
              $(this).toggleClass(gm.options.gmDangerClass);
        },


        _initCanvas: function(){
          var canvas=gm.getCanvas();
          gm.grid._switchLayoutMode(gm.options.layoutDefaultMode);
          var cols=canvas.find(gm.options.colSelector);
          var rows=canvas.find(gm.options.rowSelector);
              // Show the template controls
              gm.$el.find("#gm-addnew").show();
              // Sort Rows First
              gm.rowActivate(rows);
              // Now Columns
              gm.col.activate(cols);
              // Run custom init callback filter
              //gm.runFilter(canvas, true);
               if(gm.options.editableRegionEnabled) {
                gm.markup._editregions(canvas, true);
              }

              // Get cols & rows again after filter execution
              //cols=canvas.find(gm.options.colSelector);
              rows=canvas.find(gm.options.rowSelector);
              // Make Rows sortable
              canvas.sortable({
                items: rows,
                axis: 'y',
                placeholder: gm.options.rowSortingClass,
                handle: ".gm-moveRow",
                forcePlaceholderSize: true,   opacity: 0.7,  revert: true,
                tolerance: "pointer",
                cursor: "move"
               });
              $.each(rows, function(i, row){
                  $(row).sortable({
                  items: $(row).find(gm.options.colSelector),
                  axis: 'x',
                  handle: ".gm-moveCol",
                  forcePlaceholderSize: true,   opacity: 0.7,  revert: true,
                  tolerance: "pointer",
                  containment: $(row),
                  cursor: "move"
                });
              });
            gm.status=true;
            gm.mode="visual";
            gm.grid._initCustomControls();
            gm.grid._initGlobalCustomControls();
            gm.grid._initNewContentElem();
        },

        _initCustomControls:function(){
          var canvas=gm.getCanvas(),
              callbackParams = '',
              callbackScp = '',
              callbackFunc = '',
              btnLoc = '',
              btnObj = {},
              iconClass = '',
              btnLabel = '';

          $( ('.'+gm.options.colClass+':data,'+' .'+gm.options.rowClass+':data'), canvas).each(function(){
            var prop = '';
            for(prop in $(this).data()) {
              if(prop.indexOf('gmButton') === 0) {
                callbackFunc = prop.replace('gmButton','');
                callbackParams = $(this).data()[prop].split('|');
                // Cannot accept 0 params or empty callback function name
                if(callbackParams.length === 0 || callbackFunc === '') { break; }

                btnLoc =    (typeof callbackParams[3] !== 'undefined')? callbackParams[3] : 'top';
                iconClass = (typeof callbackParams[2] !== 'undefined')? callbackParams[2] : 'fa fa-file-code-o';
                btnLabel =  (typeof callbackParams[1] !== 'undefined')? callbackParams[1] : '';
                callbackScp = callbackParams[0];
                btnObj = {
                  element: 'a',
                  btnClass: ('gm-'+callbackFunc),
                  iconClass:  iconClass,
                  btnLabel: btnLabel
                };
                gm.grid._setupCustomBtn(this, btnLoc, callbackScp, callbackFunc, btnObj);
                break;
              }
            }
          });
        },

     _initGlobalCustomControls:function(){
          var canvas=gm.getCanvas(),
              elems=[],
              btnClass = '',
              btnObj = null;

          $.each(['row','col'], function(i, control_type) {
            if(typeof gm.options.customControls['global_'+control_type] !== 'undefined') {
              elems=canvas.find(gm.options[control_type+'Selector']);
              $.each(gm.options.customControls['global_'+control_type], function(i, curr_control) {
                // controls with no valid callbacks set are skipped
                if(typeof curr_control.callback === 'undefined') { return; }

                if(typeof curr_control.loc === 'undefined') {
                  curr_control.loc = 'top';
                }
                if(typeof curr_control.iconClass === 'undefined') {
                  curr_control.iconClass = 'fa fa-file-code-o';
                }
                if(typeof curr_control.btnLabel === 'undefined') {
                  curr_control.btnLabel = '';
                }
                if(typeof curr_control.title === 'undefined') {
                  curr_control.title = '';
                }

                btnClass = (typeof curr_control.callback === 'function')? (i+'_btn') : (curr_control.callback);

                btnObj = {
                  element: 'a',
                  btnClass: 'gm-'+btnClass,
                  iconClass: curr_control.iconClass,
                  btnLabel: curr_control.btnLabel,
                  title: curr_control.title
                };

                $.each(elems, function(i, current_elem) {
                  gm.grid._setupCustomBtn(current_elem, curr_control.loc, 'window', curr_control.callback, btnObj);
                });
              });
            }
          });
        },

        _setupCustomBtn:function(container, btnLoc, callbackScp, callbackFunc, btnObj) {
          var callback = null;

          // Ensure we have a valid callback, if not skip
          if(typeof callbackFunc === 'string') {
            callback = gm.isValidCallback(callbackScp, callbackFunc.toLowerCase());
          } else if(typeof callbackFunc === 'function') {
            callback = callbackFunc;
          } else {
            return false;
          }
          // Set default button location to the top toolbar
          btnLoc = (btnLoc === 'bottom')? ':last' : ':first';

          // Add the button to the selected toolbar
          $( ('.'+gm.options.gmToolClass+btnLoc), container).append(gm.utils.buttonFactory([btnObj])).find(':last').on('click', function(e) {
            callback(container, this);
            e.preventDefault();
          });
          return true;
        },

       _initNewContentElem:function(newElem) {
          var parentCols = null;

          if(typeof newElem === 'undefined') {
            parentCols = gm.$el.find('.'+gm.options.colClass);
          } else {
            parentCols = newElem.closest('.'+gm.options.colClass);
          }

          $.each(parentCols, function(i, col) {
            $(col).on('click', '.gm-delete', function(e) {
              $(this).closest('.'+gm.options.contentDraggableClass).remove();
              gm.markup._resetCommentTags(col);
              e.preventDefault();
            });
            // If the content element has an edit option add callback
            $('.'+gm.options.controlEdit, col).off().on('click', function() {
              gm.editContentElement($(this).closest('.'+gm.options.contentDraggableClass), this);
              return false;
            });
            $(col).sortable({
              items: '.'+gm.options.contentDraggableClass,
              axis: 'y',
              placeholder: gm.options.rowSortingClass,
              handle: "."+gm.options.controlMove,
              forcePlaceholderSize: true, opacity: 0.7, revert: true,
              tolerance: "pointer",
              cursor: "move",
              stop: function(e, ui) {
                gm.markup._resetCommentTags($(ui.item).parent());
              }
             });
          });

        },

        _deinitCanvas: function(){
          var canvas=gm.getCanvas();
          var cols=canvas.find(gm.options.colSelector);
          var rows=canvas.find(gm.options.rowSelector);

              // Hide template control
              gm.$el.find("#gm-addnew").hide();
              // Sort Rows First
              gm.rowDeactivate(rows);
              // Now Columns
              gm.col.deactivate(cols);
              // Clean markup
              gm.markup.cleanup();
              gm.markup._editregions(canvas, false);
              //gm.runFilter(canvas, false);
              gm.status=false;
        },



        };
        //------------------------------MARKUP-------------------------
        gm.markup={
            activate: function(cols){
              var cTagOpen = '<!--'+gm.options.gmEditRegion+'-->',
              cTagClose = '<!--\/'+gm.options.gmEditRegion+'-->';

               // Loop over each column
               $.each(cols, function(i, col){
                    var hasGmComment = false,
                        hasNested = $(col).children().hasClass(gm.options.rowClass);

                      // Search for comments within column contents
                      // NB, at the moment this is just finding "any" comment for testing, but should search for <!--gm-*
                      $.each($(col).contents(), function(x, node){
                        if($(node)[0].nodeType === 8){
                            hasGmComment = true;
                        }
                      });

                    // Apply default commenting markup
                    if(!hasGmComment){
                        if(hasNested){
                           // Apply nested wrap
                           $.each($(col).contents(), function(i, val){
                             if($(val).hasClass(gm.options.rowClass)){
                                var prev=Array.prototype.reverse.call($(val).prevUntil("."+gm.options.rowClass)),
                                    after=$(val).nextUntil("."+gm.options.rowClass);

                                if(!$(prev).hasClass(gm.options.gmEditRegion)){
                                    $(prev).first().before(cTagOpen).end()
                                           .last().after(cTagClose);
                                }
                                if(!$(after).hasClass(gm.options.gmEditRegion)){
                                    $(after).first().before(cTagOpen).end()
                                            .last().after(cTagClose);
                                }
                             }
                           });

                        }
                        else {
                           // Is there anything to wrap?
                            if($(col).contents().length !== 0){
                              // Apply default comment wrap
                              $(col).html(cTagOpen+$(col).html()+cTagClose);
                            }
                        }
                      }
                  });
            },

          cleanup: function(){

            var canvas,
                content;

                //gm.rteControl("stop");

                // cache canvas
                canvas = gm.getCanvas();

                /**
                 * Determine the current edit mode and get the content based upon the resultant
                 * context to prevent content in source mode from being lost on save, as such:
                 *
                 * edit mode (source): canvas.find('textarea').val()
                 * edit mode (visual): canvas.html()
                 */
                content = gm.mode !== "visual" ? canvas.find('textarea').val() : canvas.html();

                // Clean any temp class strings
                canvas.html(gm.utils.cleanSubstring(gm.options.classRenameSuffix, content, ''));

                // Remove Gridmanager Tools
                canvas.find("." + gm.options.gmToolClass).remove();

                // Clean column markup
                $.each(canvas.find(gm.options.colSelector), function(i, col){
                    gm.markup._strip(col);
                });
                // Destroy any RTEs
          },

          _editregions : function(canvasElem, isInit) {
          if(isInit) {
            var cTagOpen = '<!--'+gm.options.gmEditRegion+'-->',
                cTagClose = '<!--\/'+gm.options.gmEditRegion+'-->',
                regex = new RegExp('(?:'+cTagOpen+')\\s*([\\s\\S]+?)\\s*(?:'+cTagClose+')', 'g'),
                html = $(canvasElem).html(),
                rep = cTagOpen+'<div class="'+gm.options.gmEditRegion+' '+gm.options.contentDraggableClass+'">'+gm.options.controlContentElem +'<div class="'+gm.options.gmContentRegion+'">$1</div></div>'+cTagClose;

            html = html.replace(regex, rep);
            $(canvasElem).html(html);
          } else {
            $('.'+gm.options.controlNestedEditable, canvasElem).remove();
            $('.'+gm.options.gmContentRegion).contents().unwrap();
          }
        },

        _resetCommentTags : function(elem) {
          var cTagOpen = '<!--'+gm.options.gmEditRegion+'-->',
              cTagClose = '<!--\/'+gm.options.gmEditRegion+'-->';
          // First remove all existing comments
          gm.markup._clearComments(elem);
          // Now replace these comment tags
          $('.'+gm.options.gmEditRegion, elem).before(cTagOpen).after(cTagClose);
        },

        _clearComments : function(elem) {
          $(elem, '#'+gm.options.canvasId).contents().filter(function() {
            return this.nodeType === 8;
          }).remove();
        },



          _strip: function(markup){
            var newMarkup=markup;
            newMarkup=gm.utils.cleanSubstring(gm.options.classRenameSuffix, $(newMarkup).html(), '');
            $(newMarkup).removeClass(gm.options.removeColClass)
                          .removeAttr(gm.options.removeColAttr)
                          .addClass(gm.options.addColClass)
                          .find("img")
                          .removeClass(gm.options.removeImgClass)
                          .removeAttr(gm.options.removeImgAttr)
                          .addClass(gm.options.addImgClass).end()
                          .find("a")
                          .removeClass(gm.options.removeAClass)
                          .removeAttr(gm.options.removeAAttr)
                          .addClass(gm.options.addAClass).end()
                          .find(gm.options.removeDivsByID).remove();
            return newMarkup;
          }
        };

        //------------------------------ROW----------------------------
        gm.row    ={


          _remove: function(row){
              $(row).animate({opacity: 'hide', height: 'hide'}, 400, function(){
                  $(row).remove();
              });
          },

          _addSettings: function(row){
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
          }

        };

        //------------------------------COL----------------------------
        gm.col    ={
          create: function(size){
             var col= $("<div/>")
            .addClass(gm.options.colClass)
            .addClass(gm.options.colDesktopClass + size)
            .addClass(gm.options.colTabletClass + size)
            .addClass(gm.options.colPhoneClass + size)
            .addClass(gm.options.gmEditClass)
            .addClass(gm.options.colAdditionalClass)
            .prepend(gm.utils.toolFactory(gm.options.colButtonsPrepend))
            .append(gm.utils.toolFactory(gm.options.colButtonsAppend));
            return col;
          },
          delete: function(){
          },
          get:    function(){
          },
          insert: function(){
          },
          activate: function(cols){
          cols.addClass(gm.options.gmEditClass);
            // For each column,
            $.each(cols, function(i, column){
              $(column).prepend(gm.utils.toolFactory(gm.options.colButtonsPrepend));
              $(column).append(gm.utils.toolFactory(gm.options.colButtonsAppend));
            });
          },
          deactivate: function(cols){
               cols.removeClass(gm.options.gmEditClass)
                 .removeClass(gm.options.gmEditClassSelected)
                 .removeClass("ui-sortable");
             $.each(cols.children(), function(i, val){
              $(val).find("." + gm.options.controlNestedEditable).remove();
              // Grab contents of editable regions and unwrap
              if($(val).hasClass(gm.options.gmEditRegion)){
                if($(val).html() !== ''){
                  $(val).contents().unwrap();
                } else {
                  // Deals with empty editable regions
                  $(val).remove();
                }
              }
             });
          },

         _selectColClick : function(container, btn) {
          $(btn).toggleClass('fa fa-square-o fa fa-check-square-o');
          if($(btn).hasClass('fa-check-square-o')) {
            $(container).addClass(gm.options.gmEditClassSelected);
          } else {
            $(container).removeClass(gm.options.gmEditClassSelected);
          }
        },

          _addSettings: function(col){
            // Col class toggle buttons
          var classBtns=[];
              $.each(gm.options.colCustomClasses, function(i, val){
                  var btn=$("<button/>")
                  .addClass("gm-togglecolClass")
                  .addClass(gm.options.controlButtonClass)
                  .append(
                    $("<span/>")
                    .addClass(gm.options.controlButtonSpanClass)
                  ).append(" " + val);
                   if(col.hasClass(val)){
                       btn.addClass(gm.options.gmDangerClass);
                    }
                   classBtns.push(btn[0].outerHTML);
             });
          // col settings drawer
          var html=$("<div/>")
              .addClass("gm-colSettingsDrawer")
              .addClass(gm.options.gmToolClass)
              .addClass(gm.options.gmClearClass)
              .prepend($("<div />")
                .addClass(gm.options.gmBtnGroup)
                .addClass(gm.options.gmFloatLeft)
                .html(classBtns.join("")))
              .append($("<div />").addClass("pull-right").html(
                $("<label />").html("col ID ").append(
                $("<input>")
                  .addClass("gm-colSettingsID")
                  .attr({type: 'text', placeholder: 'col ID', value: col.attr("id")})
                )
              ));

          return html[0].outerHTML;
          }


        };

        //------------------------------UTILS----------------------------
        gm.utils  ={

                  /**
         * Returns an editing div with appropriate btns as passed in
         * @method toolFactory
         * @param {array} btns - Array of buttons (see options)
         * @return MemberExpression
         */
        toolFactory: function(btns){
           var tools=$("<div/>")
              .addClass(gm.options.gmToolClass)
              .addClass(gm.options.gmClearClass)
              .html(gm.utils.buttonFactory(btns));
           return tools[0].outerHTML;
        },

        /**
         * Returns html string of buttons
         * @method buttonFactory
         * @param {array} btns - Array of button configurations (see options)
         * @return CallExpression
         */
        buttonFactory: function(btns){
          var buttons=[];
          $.each(btns, function(i, val){
            val.btnLabel = (typeof val.btnLabel === 'undefined')? '' : val.btnLabel;
            val.title = (typeof val.title === 'undefined')? '' : val.title;
            buttons.push("<" + val.element +" title='" + val.title + "' class='" + val.btnClass + "'><span class='"+val.iconClass+"'></span>&nbsp;" + val.btnLabel + "</" + val.element + "> ");
          });
          return buttons.join("");
        },

        getColClass:function(col){
            var colClass=$.grep(col.attr("class").split(" "), function(v){
                return v.indexOf(gm.options.currentClassMode) === 0;
                }).join();
            var colWidth=colClass.replace(gm.options.currentClassMode, "");
                return {colClass:colClass, colWidth:colWidth};
        },

          cleanSubstring: function(regex, source, replacement) {
            return source.replace(new RegExp(regex, 'g'), replacement);
          },

         generateClickHandler: function(colWidths){
          var string="a.add" + gm.utils.generateButtonClass(colWidths);
          var canvas=gm.getCanvas();
              gm.$el.on("click", string, function(e){
                if (gm.options.addRowPosition === 'bottom') {
                  canvas.append(gm.rowCreate(colWidths));
                } else {
                  canvas.prepend(gm.rowCreate(colWidths));
                }
                gm.reset();
                e.preventDefault();
            });
          },

           generateButtonClass: function(arr){
            var string="";
              $.each(arr, function( i , val ) {
                    string=string + "-" + val;
              });
              return string;
          },

          // Add External CSS reference
          addCSS : function(stylesheet) {
            if(stylesheet !== '') {$('<link rel="stylesheet" href="'+stylesheet+'">').appendTo("head");}
          },


          // Test
          test: function(){}
        };


        // Initialize
        gm.init();
    };


    //------------------------------OPTIONS----------------------------
    $.gridmanager.defaultOptions = {
        debug: 1,

        // Use default control bar; you can turn this off if you want to control gm from custom controls
        useControlBar: true,

        // Are your columns selectable?
        colSelectEnabled: true,

        // Can add editable regions?
        editableRegionEnabled: true,

        // Should we try and automatically create editable regions?
        autoEdit: true,

        // URL to save to
        remoteURL: "/replace-with-your-url",

        // Custom CSS to load
        cssInclude: "//maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css",

        // Filter callback. Callback receives two params: the template grid element and whether is called from the init or deinit method
        filterCallback: null,

  /* Events */
      events: {
        /* Examples:*/
        //beforestart: function(){
        //  alert("beforestart!");
        //},
        //afterstart: function(){
        //  alert("afterstart!");
        //},

      },
  /*
     Cleanup---------------
    */
        // Remove column, img , a elements classes and attributes:
        // most of the time this is to strip out data attributes left by Rich Text Editors: anything with mce = tinyMCE

        // Cols-------------
        removeColClass: "mce-content-body",
        // Attributes need to be space seperated
        removeColAttr: "style spellcheck data-mce-href",
        // Add a class to each column
        addColClass: "",

        // Images-------------
        // Ditto for Images
        removeImgClass: "",
        // Attributes need to be space seperated
        removeImgAttr: "style data-cke-saved-src data-mce-src data-mce-href data-mce-selected",
        // Add this class to every img
        addImgClass: "img-responsive",

        // Links-------------
        // Ditto for Links
        removeAClass: "",
        // Attributes need to be space seperated
        removeAAttr: "data-mce-href data-mce-selected",
        // Add this class to every anchor
        addAClass: "",

        // Misc--------------
        // Force remove divs by id: tinymce putting in tonnes of handles etc
        removeDivsByID: "#mceResizeHandlen,#mceResizeHandlee,#mceResizeHandles,#mceResizeHandlew,#mceResizeHandlenw,#mceResizeHandlene,#mceResizeHandlese,#mceResizeHandlesw",

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

        // Move handle class
        controlMove: 'gm-move',

        // Content item edit control
        controlEdit: 'gm-edit',

        // Content item edit schema
        contentEditSchema: null,

        // Editable element toolbar class
        controlNestedEditable: 'gm-controls-element',

        // Array of buttons for row templates
        controlButtons: [[12], [6,6], [4,4,4], [3,3,3,3], [2,2,2,2,2,2], [2,8,2], [4,8], [8,4]],

        // Custom Global Controls for rows & cols - available props: global_row, global_col
        customControls: { global_row: [], global_col: [] },

        // Default control button class
        controlButtonClass: "btn  btn-xs  btn-primary",

        // Default control button icon
        controlButtonSpanClass: "fa fa-plus-circle",

        // Control bar RH dropdown markup
        controlAppend: "<div class='btn-group pull-right'><button title='Edit Source Code' type='button' class='btn btn-xs btn-primary gm-edit-mode'><span class='fa fa-code'></span></button><button title='Preview' type='button' class='btn btn-xs btn-primary gm-preview'><span class='fa fa-eye'></span></button>     <div class='dropdown pull-left gm-layout-mode'><button type='button' class='btn btn-xs btn-primary dropdown-toggle' data-toggle='dropdown'><span class='caret'></span></button> <ul class='dropdown-menu' role='menu'><li><a data-width='auto' title='Desktop'><span class='fa fa-desktop'></span> Desktop</a></li><li><a title='Tablet' data-width='tablet'><span class='fa fa-tablet'></span> Tablet</a></li><li><a title='Phone' data-width='phone'><span class='fa fa-mobile-phone'></span> Phone</a></li></ul></div>    <button type='button' class='btn  btn-xs  btn-primary dropdown-toggle' data-toggle='dropdown'><span class='caret'></span><span class='sr-only'>Toggle Dropdown</span></button><ul class='dropdown-menu' role='menu'><li><a title='Save'  href='#' class='gm-save'><span class='fa fa-save'></span> Save</a></li><li><a title='Delete Contents' href='#' class='gm-deletegrid'><span class='fa fa-trash-o'></span> Delete</a></li></ul></div>",

        // Controls for content elements
        controlContentElem: '<div class="gm-controls-element"> <a class="gm-move fa fa-arrows" href="#" title="Move"></a> <a class="gm-delete fa fa-times" href="#" title="Delete"></a> </div>',
   /*
     General editing classes---------------
  */
        // Standard edit class, applied to active elements
        gmEditClass: "gm-editing",

        // Applied to the currently selected element
        gmEditClassSelected: "gm-editing-selected",

        // Editable region class
        gmEditRegion: "gm-editable-region",

        // Editable container class
        gmContentRegion: "gm-content",

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
        rowSortingClass: "alert-warning",

        // Buttons at the top of each row
        rowButtonsPrepend: [
                {
                 title:"Move",
                 element: "a",
                 btnClass: "gm-moveRow pull-left",
                 iconClass: "fa fa-arrows "
              },
                {
                   title:"New Column",
                   element: "a",
                   btnClass: "gm-addColumn pull-left  ",
                   iconClass: "fa fa-plus"
                },
                 {
                   title:"Row Settings",
                   element: "a",
                   btnClass: "pull-right gm-rowSettings",
                   iconClass: "fa fa-cog"
                }

            ],

        // Buttons at the bottom of each row
        rowButtonsAppend: [
                {
                 title:"Remove row",
                 element: "a",
                 btnClass: "pull-right gm-removeRow",
                 iconClass: "fa fa-trash-o"
                }
            ],


        // CUstom row classes - add your own to make them available in the row settings
        rowCustomClasses: ["example-class","test-class"],

        // Where to add new rows for canvas
        addRowPosition: 'top', // bottom or top

  /*
     Columns--------------
  */
        // Column Class
        colClass: "column",

        // Class to allow content to be draggable
        contentDraggableClass: 'gm-content-draggable',

        // Adds any missing classes in columns for muti-device support.
        addResponsiveClasses: true,

        // Adds "colClass" to columns if missing: addResponsiveClasses must be true for this to activate
        addDefaultColumnClass: true,

       // Generic desktop size layout class
        colDesktopClass: "col-md-",

        // Generic tablet size layout class
        colTabletClass: "col-sm-",

        // Generic phone size layout class
        colPhoneClass: "col-xs-",

        // Wild card column desktop selector
        colDesktopSelector: "div[class*=col-md-]",

        // Wildcard column tablet selector
        colTabletSelector: "div[class*=col-sm-]",

        // Wildcard column phone selector
        colPhoneSelector: "div[class*=col-xs-]",

        // String used to temporarily rename column classes not in use
        classRenameSuffix: "-clsstmp",

        // Default layout mode loaded after init
        layoutDefaultMode: "auto",

        // Current layout column mode
        currentClassMode: "",

        // Additional column class to add (foundation needs columns, bs3 doesn't)
        colAdditionalClass: "",

        // Buttons to prepend to each column
        colButtonsPrepend: [
              {
                 title:"Move",
                 element: "a",
                 btnClass: "gm-moveCol pull-left",
                 iconClass: "fa fa-arrows "
              },
              {
                   title:"Column Settings",
                   element: "a",
                   btnClass: "pull-right gm-colSettings",
                   iconClass: "fa fa-cog"
                },
               {
                 title:"Make Column Narrower",
                 element: "a",
                 btnClass: "gm-colDecrease pull-left",
                 iconClass: "fa fa-minus"
              },
              {
               title:"Make Column Wider",
               element: "a",
               btnClass: "gm-colIncrease pull-left",
               iconClass: "fa fa-plus"
              }
            ],

        // Buttons to append to each column
        colButtonsAppend: [
                {
                 title:"Add Nested Row",
                 element: "a",
                 btnClass: "pull-left gm-addRow",
                 iconClass: "fa fa-plus-square"
                },
                {
                 title:"Remove Column",
                 element: "a",
                 btnClass: "pull-right gm-removeCol",
                 iconClass: "fa fa-trash-o"
                }
            ],

        // CUstom col classes - add your own to make them available in the col settings
        colCustomClasses: ["example-col-class","test-class"],

        // Maximum column span value: if you've got a 24 column grid via customised bootstrap, you could set this to 24.
        colMax: 12,

        // Column resizing +- value: this is also the colMin value, as columns won't be able to go smaller than this number (otherwise you hit zero and all hell breaks loose)
        colResizeStep: 1,

        // Default content placeholder
        gmContentPlaceholder: "<p>New Content</p>",

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

   $.expr[':'].regex = function(elem, index, match) {
      var matchParams = match[3].split(','),
        validLabels = /^(data|css):/,
        attr = {
            method: matchParams[0].match(validLabels) ?
                        matchParams[0].split(':')[0] : 'attr',
            property: matchParams.shift().replace(validLabels,'')
        },
        regexFlags = 'ig',
        regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
        return regex.test(jQuery(elem)[attr.method](attr.property));
    };

    //------------------------------EXPOSE----------------------------
    $.fn.gridmanager = function(options){
        return this.each(function(){
          var element = $(this);
          var gridmanager = new $.gridmanager(this, options);
          element.data('gridmanager', gridmanager);
        });
    };

})(jQuery );