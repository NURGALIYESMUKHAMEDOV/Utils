define([
	"dojo/_base/declare",
	"dojo/has",
	"dojo/aspect",
	"pvd/widget/designer/settings/_IntermediateChangesSetting",
	"idx/form/Textarea",
	"idx/form/Link",
	"components/JSONDialog"
], function(
    declare,
    has,
    aspect,
    _IntermediateChangesSetting,
    Textarea,
    Link,
    JSONDialog
) {

	return declare("components.editors.settings.JSONSetting", _IntermediateChangesSetting, {

		_createWidget: function(editorNode) {

		    var widget = new Link({

		        label: "JSON",

		        value: this.get("value"),

		        validate: function() {

		            return true;

		        },

		        isValid: function() {

		            return true;

		        },

		        onChange: function(value) {
		        },

		        onClick: dojo.hitch(this, function(event) {

		            var dialog = new JSONDialog();

		            dialog.show({

		                value: this.get("value"),

		                callback: dojo.hitch(this, function(value){

		                    dialog.hide();

		                    this.set("value", value);

		                    widget.onChange(value);

		                })

		            });

		        })

		    }, editorNode);

            return widget ;

		}

	});

});