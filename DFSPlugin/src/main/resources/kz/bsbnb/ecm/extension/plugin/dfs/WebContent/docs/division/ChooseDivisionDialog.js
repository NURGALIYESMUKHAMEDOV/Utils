define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "ecm/widget/TitlePane",
    "ecm/widget/dialog/BaseDialog",
    "dojo/text!./templates/ChooseDivisionDialog.html"
], function(
    declare,
    lang,
    ContentPane,
    TitlePane,
    BaseDialog,
    template)
{

	return declare("docs.division.ChooseDivisionDialog", [
		BaseDialog
	], {

		contentString: template,
		widgetsInTemplate: true,
        _selectButton: null,
        callback: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

			this.set("title", "Структурное подразделение");

            this.setIntroText("Структурная единица, которая расположена на любом уровне оргструктуры компании, состоящая из Начальника Структурного подразделения, Заместителя Структурного подразделения и сотрудников, входящих в состав данной единицы. (Например, Управление, Отдел, Группа).");

            this._selectButton = this.addButton("Выбрать", "_onSelect", true, true, "SELECT");

            this.divisionList.onSelect = dojo.hitch(this, function(data) {

                this.selectedObject = data;

                this._selectButton.set("disabled", false);

            });

		},

		show: function(callback) {

		    this.callback = callback ;

            var d = this.inherited(arguments);

            this.divisionList.startup();

            return d;

		},

		_onSelect: function() {

		    if (this.selectedObject) {

		        this.callback(this.selectedObject);

		    }

		},

		onCancel: function() {

			this.inherited(arguments);

		},

		onSearchSubmit: function() {

		    this.divisionList.retrieveData({
		        code: this.code.get("value"),
		        name: this.name.get("value")
		    });

		},

		onSearchReset: function() {
		    this.code.set("value", null);
            this.name.set("value", null);
		}

	});

});
