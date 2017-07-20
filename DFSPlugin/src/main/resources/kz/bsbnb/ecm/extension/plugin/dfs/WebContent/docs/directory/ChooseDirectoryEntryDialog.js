define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "ecm/widget/TitlePane",
    "ecm/widget/dialog/BaseDialog",
    "dojo/text!./templates/ChooseDirectoryEntryDialog.html"
], function(
    declare,
    lang,
    ContentPane,
    TitlePane,
    BaseDialog,
    template)
{

	return declare("docs.directory.ChooseDirectoryEntryDialog", [
		BaseDialog
	], {

		contentString: template,

		widgetsInTemplate: true,

        _selectButton: null,

        callback: null,

        selection: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

			this.set("title", "Номенклатура дел");

            this.setIntroText("Номенклатура дел представляет собой составленный по установленной форме перечень заводимых дел в организации с определением сроков их хранения.");

            this._selectButton = this.addButton("Выбрать", "_onSelect", true, true, "SELECT");

            this.directoryEntryList.onSelect = dojo.hitch(this, function(data) {

                this.selection = data;

                this._selectButton.set("disabled", false);

            });

            console.log("directoryEntryList: ", this.directoryEntryList);

		},

		show: function(callback) {

            var d = this.inherited(arguments);

            this.callback = callback;

            this.directoryEntryList.startup();

            return d;

		},

		_onSelect: function() {

			if (this.callback) {

			    this.callback(this.selection)

			}

		},

		onCancel: function() {

			this.inherited(arguments);

		},

		onSearchSubmit: function() {

		    this.directoryEntryList.retrieveData({
		        code: this.directoryEntryCode.value,
		        name: this.directoryEntryName.value
		    });

		},

		onSearchReset: function() {

		    this.directoryEntryCode.set("value", null);
            this.directoryEntryName.set("value", null);

		}

	});

});
