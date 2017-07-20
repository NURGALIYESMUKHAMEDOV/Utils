/**
 * Диалоговое окно для выполнения действия
 * над объектом
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/dialog/MessageDialog",
    "dojo/text!./templates/CodeDialog.html"
], function(
    declare,
    lang,
    BaseDialog,
    MessageDialog,
    template)
{

	return declare("esbd.editor.settings.CodeDialog", [
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

			this.setSize(600, 400);

			this.set("title", "JavaScript");

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

		        var f = new Function("payload", value);

                if (this.callback) {

                    this.callback(value);

                }

		    } catch (e) {

                var messageDialog = new MessageDialog({
                    text: "Ошибка в JavaScript"
                });

                messageDialog.show();

		    }

		},

	});

});
