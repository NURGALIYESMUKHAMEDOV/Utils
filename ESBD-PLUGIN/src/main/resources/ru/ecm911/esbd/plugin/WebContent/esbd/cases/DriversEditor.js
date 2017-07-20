define([
	"dojo/_base/declare",
	"dojo/dom-class",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/form/Button",
	"ecm/widget/ValidationTextBox",
	"dojo/text!./templates/DriversEditor.html"
],
function(declare, domClass, _WidgetsInTemplateMixin, Button, ValidationTextBox, template) {

	return declare("esbd.cases.DriversEditor", [
	   ValidationTextBox,
	   _WidgetsInTemplateMixin
	], {

		templateString: template,
		widgetsInTemplate: true,

		postCreate: function() {

			this.inherited(arguments);

			this.set("readOnly", true);

			domClass.remove(this.domNode, this.baseClass);

			domClass.add(this.domNode, "samplePropertyEditor");

		},

		_buttonClick: function(evt) {
			this.set("value", "user1");
		}

	});
});