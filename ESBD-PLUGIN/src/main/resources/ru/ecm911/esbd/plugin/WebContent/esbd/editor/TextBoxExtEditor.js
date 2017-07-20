define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/connect",
	"dojo/aspect",
	"dojo/dom-style",
	"pvr/widget/editors/TextBoxEditor",
], function(
    declare,
    lang,
    connect,
    aspect,
    domStyle,
    TextBoxEditor
) {

	var TextBoxExtEditor = declare("esbd.editor.TextBoxExtEditor", [
		TextBoxEditor
	], {

        visibility: null,

		editorClass: "pvrTextBoxExtEditor",

        postInitializeEditor: function() {

            // регистрируемся на изменения всех свойств

            // this.property.collectionController.getPropertyController("ESBD_Status");

            aspect.after(this.property.collectionController, "onChange", dojo.hitch(this, function(){

                this._calcVisibilityExpression();

            }));

            this._calcVisibilityExpression();

        },

        _calcVisibilityExpression: function() {

            if (this.visibility) {

                var func = new Function("payload", this.visibility);

                var result = func({property: this.property});

                this.property.controller.set("hidden", !result);

            }

        }

	});

	return TextBoxExtEditor;

});
