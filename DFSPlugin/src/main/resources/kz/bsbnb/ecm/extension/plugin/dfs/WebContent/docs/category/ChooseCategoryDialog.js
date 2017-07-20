define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "ecm/widget/TitlePane",
    "ecm/widget/dialog/BaseDialog",
    "dojo/text!./templates/ChooseCategoryDialog.html"
], function(
    declare,
    lang,
    ContentPane,
    TitlePane,
    BaseDialog,
    template)
{

	return declare("docs.category.ChooseCategoryDialog", [
		BaseDialog
	], {

		contentString: template,
		widgetsInTemplate: true,
        _selectButton: null,

		postCreate: function() {
			this.inherited(arguments);
			this.setMaximized(true);
			this.setResizable(true);
			this.set("title", "Номенклатура дел");
            this.setIntroText("Номенклатура дел представляет собой составленный по установленной форме перечень заводимых дел в организации с определением сроков их хранения.");
            this._selectButton = this.addButton("Выбрать", "onSelect", true, true, "SELECT");
            this.categoryList.onSelect = dojo.hitch(this, function(data) {

                console.log("select data: ", data);

                this.selectedObject = data;

                this._selectButton.set("disabled", false);

            });
		},

		show: function() {
            var d = this.inherited(arguments);

            this.categoryList.startup();

            return d;
		},

		onSelect: function() {

			console.log("onSelect !!!");

		},

		onCancel: function() {

			this.inherited(arguments);

		}

	});

});
