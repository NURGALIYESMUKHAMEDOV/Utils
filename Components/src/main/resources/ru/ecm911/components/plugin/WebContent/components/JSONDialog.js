define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/json",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/dialog/MessageDialog",
    "dojo/text!./templates/JSONDialog.html"
], function(
    declare,
    lang,
    json,
    BaseDialog,
    MessageDialog,
    template)
{

	return declare("components.JSONDialog", [
		BaseDialog
	], {

		contentString: template,

		widgetsInTemplate: true,

		// обработчик
		callback: null,

		// кнопка сохранения (выполнения) действия над объектом
		_submitButton: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(false);

			this.setResizable(true);

			this.setSize(700, 500);

			this.set("title", "JSON");

			this.setIntroText("");

            this.submitButton = this.addButton("Сохранить", "_onSubmit", false, true, "SUBMIT");

		},

		show: function(params) {

            this.textarea.set("value", params.value);

            this.callback = params.callback || this.callback ;

            var result = this.inherited("show", []);

            this.resize();

            return result ;

		},

		_onSubmit: function() {

		    var value = this.textarea.get("value");

		    try {

		        var result = json.parse(value);

                if (this.callback) {

                    this.callback(value);

                    this.hide();

                }

		    } catch (e) {

                var messageDialog = new MessageDialog({
                    text: "Ошибка в JSON"
                });

                messageDialog.show();

		    }

		},

	});

});