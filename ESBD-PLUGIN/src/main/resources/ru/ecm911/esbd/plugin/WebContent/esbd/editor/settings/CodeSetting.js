/**
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2013, 2014
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/has",
	"dojo/aspect",
	"pvd/widget/designer/settings/_IntermediateChangesSetting",
	"idx/form/Textarea",
	"idx/form/Link",
	"./CodeDialog"
], function(
    declare,
    has,
    aspect,
    _IntermediateChangesSetting,
    Textarea,
    Link,
    CodeDialog
) {

	return declare("esbd.editor.settings.CodeSetting", _IntermediateChangesSetting, {

		_createWidget: function(editorNode) {

		    var widget = new Link({

		        label: "Скрипт",

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

		            var dialog = new CodeDialog();

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
