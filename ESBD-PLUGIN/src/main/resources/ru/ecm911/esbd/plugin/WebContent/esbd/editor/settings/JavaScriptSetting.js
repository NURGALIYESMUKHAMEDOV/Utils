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
	"idx/form/Textarea"
], function(
    declare,
    has,
    aspect,
    _IntermediateChangesSetting,
    Textarea
) {

	return declare("esbd.editor.settings.JavaScriptSetting", _IntermediateChangesSetting, {

		_createWidget: function(editorNode) {

		    var widget = new Textarea({
				required: this.required,
				disabled: this.disabled,
				value: this.value,
				cols: "",
				rows: 5,
				intermediateChanges: this.intermediateChanges,
				textDir: has("text-direction")
			}, editorNode);

            aspect.after(widget, "onChange", dojo.hitch(this, function(){

                var value = widget.get("value");

                try {

                    var f = new Function("payload", value);

                    console.log("SUCCESS!!");

                } catch (e) {

                    console.log("ERROR!!");

                }

            }));

            return widget ;

		}

	});

});
