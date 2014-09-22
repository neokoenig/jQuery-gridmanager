(function($) {

$.fn.bootstrapForm = function( defaults ) {

    var settings = $.extend({

        formInputs: [],
        buttons: [],
        align: 'block'

        }, defaults ),

    addNameAndID = function( formElement ) {

        //for radio buttons, if a ID doesnt exist it will replace it with a random value,
        //if a name doesnt exist, it will replace all of the grouped buttons with the same
        //random value

        if ( formElement.type === 'radio' ) {

            var nameExists = doesKeyExist( formElement.attr.radios[0], 'name'),
                IDexists =  doesKeyExist( formElement.attr.radios[0], 'id'),
                radioName = 'radio' + getRandomNumber();

            if (!nameExists) {

                formElement.attr.forEach( function( radio ) {

                    radio.name = radioName;

                });

            }

            else if (!IDexists) {

                formElement.attr.forEach( function( radio ) {

                    var newID = 'radio' + getRandomNumber();

                    radio.id = newID;

                });

            }

        return formElement.attr;

        }

        else {

            //for all other elements, if there was no name given, it will look for an ID
            //if there is an ID, that ID because the elements name; if the name is present, but there is no
            //ID then the name will be used. If neither is present, a single random will be generated for
            //the name/ID

            var nameExists = doesKeyExist( formElement.attr, 'name'),
                IDexists = doesKeyExist( formElement.attr, 'id' );

            if (!nameExists && !IDexists) {

                var newNameAndID = formElement.type + getRandomNumber();

                //assigning a random name to each element if a name is not given
                formElement.attr.name = newNameAndID;
                formElement.attr.id = newNameAndID;

            }

            else if (!nameExists) {

                formElement.attr.name = formElement.attr.id;
            }

            else if (!IDexists) {

                formElement.attr.id = formElement.attr.name;
            }

        }

        return formElement.attr;

    },

    getRandomNumber = function() {

        return Math.floor( Math.random() * 99 );

    },

    compileHTMLinsert = function() {

        var HTMLinsert = "";

        settings.formInputs.forEach( function( formElement, index ) {

            var adjustedFormElement = addNameAndID( formElement );

            switch ( formElement.type ) {

                case 'radio':
                    HTMLinsert+= getRadioButtons( adjustedFormElement );
                    break;

                case 'select':
                    HTMLinsert+= getSelect( adjustedFormElement, 'select' );
                    break;

                case 'multiple':
                    HTMLinsert+= getSelect( adjustedFormElement );
                    break;

                case 'checkbox':
                    HTMLinsert+= getCheckBoxes( adjustedFormElement );
                    break;

                case 'file':
                    HTMLinsert+= getFileInput( adjustedFormElement );
                    break;

                case 'textarea':
                    HTMLinsert+= getTextArea( adjustedFormElement );
                    break;

                default:
                    HTMLinsert+= getTextInput( adjustedFormElement, formElement.type );
            }

        });

        return HTMLinsert;

    },

    getButtons = function( buttonAttr ) {

        var buttonHTML = '<div class="row">',
            endTag = "</div>"

        buttonAttr.forEach( function( button ) {

            var validationState = ( doesKeyExist( button, 'validationState' ) ) ? button.validationState : 'success',
                buttonID = ( doesKeyExist( button, 'id') ) ? button.id : 'button' + getRandomNumber();
                buttonText = ( doesKeyExist( button, 'text' ) ) ? button.text : 'Submit';

            buttonHTML += '<button id="' + buttonID + '"class="btn btn-' + validationState + ' btn-' + ( button.size || 'lg' ) + '">' + buttonText + '</button>';

            if (button.onSubmit) {

                $(document).on('click', '#' + buttonID,  function(e) {
                    e.preventDefault();

                    var formValues = $('#' + e.target.id ).closest('form').serializeArray();

                    button.onSubmit( formValues )

                });
            }

        });

        return buttonHTML + endTag;

    },

    getPlaceHolder = function( attr ) {

        return ( doesKeyExist( attr, 'placeholder' ) ) ? ' placeholder="' + attr.placeholder : '';

    },

    doesKeyExist = function( object, key ){

        return Object.keys( object ).indexOf(key) !== -1;

    },

    getBootStrapValidationState = function( attr ) {

        return ( doesKeyExist( attr, 'validationState' ) ) ? ' has-' + attr.validationState : '';

    },

    getHelpBlock = function( attr ) {

        return ( doesKeyExist( attr, 'helpblock') ) ? '<p class="help-block">' + attr.helpblock + "</p>" : "";

    },

    getTextInput = function( attr, type ) {

        attr = attr || {};

        var formGroup = '<div class="form-group ' + getBootStrapValidationState( attr ) +  '">',
            label = '<label>' + attr.label + '</label>',
            textInput = '<input name="' + attr.name + '" type=' + type + ' class="form-control"' + getPlaceHolder( attr ) + '" id="' + attr.id + '" />',
            endTag = getHelpBlock( attr) + '</div>',
            completedElement = ( attr.label ) ? formGroup + label + textInput + endTag : formGroup + textInput + endTag;

        return completedElement;

    },

    getRadioButtons = function( attr ) {

        var radioHTML = (attr.label) ? '<label>' + attr.label +'</label>': '',
            helpblock = getHelpBlock( attr ),
            endTag = helpblock + '</div>'

        attr.radios.forEach( function( radio ) {

            radioHTML+= '<div class="radio"><label><input type="radio" id="' + radio.id + '" name="' + radio.name + '">'+ radio.label + '</label></div>';

        });


        return radioHTML + endTag;

    },

    getCheckBoxes = function( attr ) {

        var checkHTML = (attr.label) ? '<label>' + attr.label +'</label>': '',
                helpblock = getHelpBlock( attr ),
                endTag = helpblock + '</div>'

        attr.checkboxes.forEach( function( checkbox ) {

            checkHTML+= '<div class="checkbox"><label><input name="' + checkbox.name + '" type="checkbox" id="' + checkbox.id + '" name="' + checkbox.name + '">'+ checkbox.label + '</label>';

        });

        return checkHTML + endTag;

    },

    createOptions = function( attr ) {

        var HTMLoptions = '';

        attr.options.forEach( function( option ) {

            HTMLoptions+= '<option>' +  option.text +'</option>';

        });

        return HTMLoptions;

    },

    getSelect = function( attr, type ) {

        var inputType = ( type ) ? "select" : "select multiple",
            formGroup = '<div class="form-group">',
            label = '<label>' + attr.label + '</label>',
            selectInput = '<' + inputType + ' name="' + attr.name + '" class="form-control"' + getPlaceHolder( attr ) + '" id="' + attr.id + '">',
            options = createOptions( attr ),
            endTag = options + '</select>' + getHelpBlock( attr) + '</div>',
            completedElement = ( attr.label ) ? formGroup + label + selectInput + endTag : formGroup + selectInput + endTag;

        return completedElement;

    },

    getFileInput = function( attr ) {

        var formGroup = '<div class="form-group">',
            label = '<label>' + attr.label + '</label>',
            fileInput = '<input name="' + attr.name + '"type="file" class="form-control" id="' + attr.id + '" />',
            endTag = getHelpBlock( attr) + '</div>',
            completedElement = ( attr.label ) ? formGroup + label + fileInput + endTag : formGroup + fileInput + endTag;

        return completedElement;


    },

    getTextArea = function( attr ) {

        var formGroup = '<div class="form-group">',
            label = '<label>' + attr.label + '</label>',
            rows = ( doesKeyExist( attr, 'rows') ) ? attr.rows : '3',
            textInput = '<textarea name="' + attr.name + '"class="form-control" id="' + attr.id + '" rows="' + rows + '">',
            endTag = '</textarea>' + getHelpBlock( attr ) + '</div>',
            completedElement = ( attr.label ) ? formGroup + label + textInput + endTag : formGroup + textInput + endTag;

        return completedElement;

    };

    return this.each( function() {

        var $this = $(this),
            HTMLstart = ( settings.align !== 'inline') ? '<form role="form">' : '<form role="form" class="form-inline">',
            HTMLend = '</form>',
            buttons = getButtons( settings.buttons ),
            HTMLinsert = compileHTMLinsert() + buttons;

        $this.append( HTMLstart + HTMLinsert + HTMLend);

    });


};

})(jQuery);