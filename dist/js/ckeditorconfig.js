// Example CKEDITOR config 
window.CKEDITOR.editorConfig = function( config ) { 
    config.uiColor = '#999999';
	// Toolbar groups configuration.
	config.toolbarGroups = [
		{ name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
		{ name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
		{ name: 'editing', groups: [ 'find', 'selection', 'spellchecker' ] },
		{ name: 'forms' },
		 
		{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
		'/',
		{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },

		{ name: 'links' },
		{ name: 'insert' },
		 
		{ name: 'styles' },
		{ name: 'colors' },
		{ name: 'tools' },
		{ name: 'others' } 
	];
};
