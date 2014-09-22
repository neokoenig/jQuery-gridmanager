var gmContentEditSchema = {
	myCustomElement: {
		btnOkLabel: 'Ok',
		fields: [
            {type: 'text', attr: {
                placeholder: 'John',
                validationState: 'success',
                helpblock: 'enter your first name',
                id: 'firstName',
                name: 'firstName',
                label: 'First Name' }
            },

            {type: 'text', attr: {
                placeholder: 'Doe',
                validationState: 'success',
                helpblock: 'please enter last name',
                id: 'lastName',
                name: 'lastName',
                label: 'Last Name'
                }
            },

            {type: 'radio', attr: {
                label: 'select your favorite food.',
                radios: [
                    { id: 'f1', name: 'radios', label: 'pizza' },
                    { id: 'f2', name: 'radios', label: 'tacos' },
                    { id: 'f3', name: 'radios', label: 'wings' }
                ]}
            },

            {type: 'select', attr: {
                helpblock: 'I bet your favorite is Bootstrap 3.',
                name: 'cssframework',
                label: 'What is your CSS Framework?',
                options: [
                    {value: 'BS3', text: 'Bootstrap 3' },
                    {value: 'foundation', text: 'Foundation' },
                    {value: 'other', text: 'Other' } ]
                }
            }
		],
        buttons: [
            {   size: 'lg',
                validationState: 'success',
                id: 'submit',
                text: 'OK'
            },
            {   size: 'lg',
                validationState: 'danger',
                id: 'erase',
                text: 'Cancel'
            }
        ],
        onInit: function(modalDialog) {
            jQuery('input[name=radios]:radio', modalDialog).change(function(e) {
                alert(jQuery(this).parent().text());
            });
        },
        onOkClick: function(modalDialog, values) {
            console.log(values);
            modalDialog.dialog('close');
        },
        onCancelClick: function(modalDialog, values) {
            modalDialog.dialog('close');
        }
	} // end of myCustomElement definition
};
