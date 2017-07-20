define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/sniff",
    "dojo/_base/array",
    "dojo/aspect",
    "dojo/_base/json",
    "dojo/store/Memory",
    "ecm/model/Request",
    "ecm/model/Comment",
    "ecm/model/EntryTemplate",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/dialog/YesNoCancelDialog",
    "ecm/widget/ContentClassSelector",
    "dojo/text!./templates/AdjustEntryTemplateDialog.html"
], function(
    declare,
    lang,
    has,
    array,
    aspect,
    json,
    Store,
    Request,
    Comment,
    EntryTemplate,
    BaseDialog,
    YesNoCancelDialog,
    ContentClassSelector,
    template)
{

	return declare("components.AdjustEntryTemplateDialog", [
		BaseDialog
	], {

		contentString: template,

		widgetsInTemplate: true,

		// кнопка "Добавить"
		submitButton: null,

		// выбранный репозиторий
		repository: null,

        // шаблон ввода
        contentItem: null,

		// функция успешного обновления шаблона ввода
		callback: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

			this.set("title", "Исправление шаблона ввода");

			this.setIntroText("Данная функция выполняет замену всех вхождений идентификатора объектного хранилища");

            this.submitButton = this.addButton("Исправить", "_onSubmit", false, true, "ADD");

		},

		show: function(contentItem, callback) {

		    this.contentItem = contentItem || this.contentItem ;

		    this.callback = callback || this.callback ;

		    var result = this.inherited("show", []);

		    this.resize();

		    return result ;

		},

		_onSubmit: function() {

		    var values = {
		        oval: this.repositoryOldValueField.get("value"),
		        nval: this.repositoryNewValueField.get("value")
		    }

		    if (this.callback) {

		        this.callback(values);

		        this.hide();

		    }

		}

	});

});
