define([
	"dojo/_base/declare",
	"esbd/SimpleStringPropertyController",
	"dojo/i18n!pvr/nls/common"
], function(declare, SimpleStringPropertyController, resources) {

	return {
		types: {
			"string": {
				label: "Simple String",
				controllerClass: SimpleStringPropertyController
			}
		}
	};

});
