define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "ecm/widget/TitlePane",
    "ecm/widget/dialog/BaseDialog",
    "dojo/text!./templates/SelectRegistryDialog.html"
], function(
    declare,
    lang,
    ContentPane,
    TitlePane,
    BaseDialog,
    template)
{

	return declare("docs.registry.SelectRegistryDialog", [
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
            this.registryList.list.onRowSelectionChange = function(selectedItems) {
                console.log("onRowSelectionChange: ", selectedItems);
            }
		},

		show: function() {
            var d = this.inherited(arguments);

            return d;
		},

		onSelect: function() {

			console.log("onSelect()");

		},

		onCancel: function() {

			this.inherited(arguments);

		}

	});

});
