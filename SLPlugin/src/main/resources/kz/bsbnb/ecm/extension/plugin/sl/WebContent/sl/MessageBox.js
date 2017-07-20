define([
  "dojo/_base/declare",
  "dijit/Dialog",
  "dijit/form/Button",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dojo/text!sl/templates/MessageBox.html"
], function(
  declare,
  Dialog,
  Button,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  template
){

  return declare("sl.MessageBox", [Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    widgetsInTemplate: true,
    style: "width:200px",
    setMessage: function(message) {
      this.messageTextArea.value = message;
    }

  });

});