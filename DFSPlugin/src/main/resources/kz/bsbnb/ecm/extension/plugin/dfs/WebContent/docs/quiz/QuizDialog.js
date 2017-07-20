define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "ecm/widget/TitlePane",
    "ecm/widget/dialog/BaseDialog",
    "dojo/text!./templates/QuizDialog.html"
], function(
    declare,
    lang,
    ContentPane,
    TitlePane,
    BaseDialog,
    template)
{

	return declare("docs.quiz.QuizDialog", [
		BaseDialog
	], {

		contentString: template,
		widgetsInTemplate: true,

		postCreate: function() {
			this.inherited(arguments);
			this.setMaximized(true);
			this.setResizable(true);
			this.set("title", "Результаты проверки");
            this.setIntroText("Сведения о результатах проверки дополнительного помещения филиала АО \"Банк\" расположенного по адресу Жамбылская область, г.Тараз, пр.Жамбыла");
		},

		show: function() {
            var d = this.inherited(arguments);

            this.quiz.startup();

            return d;
		},

		onCancel: function() {

			this.inherited(arguments);

		}

	});

});
