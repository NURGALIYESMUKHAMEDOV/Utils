define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "ecm/widget/TitlePane",
    "ecm/widget/dialog/BaseDialog",
    "dojo/text!./templates/ChooseInOutDocsEntryDialog.html"
], function(
    declare,
    lang,
    ContentPane,
    TitlePane,
    BaseDialog,
    template)
{

	return declare("docs.directory.ChooseInOutDocsEntryDialog", [
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

			this.set("title", "Список входящих документ");

            this.setIntroText("Выберите соответствущий входящий документ для привязки его к текущему документу");

            this._selectButton = this.addButton("Выбрать", "_onSelect", true, true, "SELECT");

            this.InOutDocsEntryList.onSelect = dojo.hitch(this, function(data) {

                this.selection = data;

                this._selectButton.set("disabled", false);

            });

            console.log("InOutDocsEntryList: ", this.InOutDocsEntryList);

		},

		show: function(callback) {

            var d = this.inherited(arguments);

            this.callback = callback;

            this.InOutDocsEntryList.startup();

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

		    //this.directoryEntryList.retrieveData({
		    //    code: this.directoryEntryCode.value,
		    //    name: this.directoryEntryName.value
		    //});

		},

		onSearchReset: function() {

		    this.inoutdocsEntryCode.set("value", null);
            this.inoutdocsEntryName.set("value", null);

		}

	});

});
