/**
 * Диалоговое окно для работы с
 * информацией о страховом случае
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/sniff",
    "dojo/aspect",
    "dojo/_base/json",
    "ecm/model/Request",
    "ecm/model/Comment",
    "ecm/model/EntryTemplate",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/dialog/YesNoCancelDialog",
    "esbd/editor/ObjectList",
    "dojo/text!./templates/LookupObjectDialog.html"
], function(
    declare,
    lang,
    has,
    aspect,
    json,
    Request,
    Comment,
    EntryTemplate,
    BaseDialog,
    YesNoCancelDialog,
    ObjectList,
    template)
{

	return declare("esbd.editor.LookupObjectDialog", [
		BaseDialog
	], {

		contentString: template,
		widgetsInTemplate: true,
		selectButton: null,
		repository: null,
		searchTemplatesPath: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

            this.selectButton = this.addButton("Выбрать", "_onSelect", true, true, "SELECT");

            this.set("title", "Поиск физического лица");

            this.setIntroText("Поиск физического лица");

            if (!this.repository) {

                this.repository = ecm.model.desktop.repositories[0];

            }

            this.objectList = new ObjectList({

                searchTemplatesPath: this.searchTemplatesPath,

                addTemplateId: "",

                onSelectionChange: dojo.hitch(this, function(selectedItems){

                    var hasSelection = selectedItems && selectedItems.length && selectedItems.length > 0 ;

                    this.selectButton.set("disabled", !hasSelection);

                })

            });

            this.contentPane.addChild(this.objectList);

		},

		_onSelect: function() {

		    var selectedItems = this.objectList.getSelectedItems();

		    if (selectedItems && selectedItems.length && selectedItems.length > 0) {

		        this.onSelect(selectedItems[0]);

		    } else {

		        console.log("Отобразить ошибку о невозможности выбора объекта");

		    }

		},

		onSelect: function(contentItem) {

		    console.log("[LookupObjectDialog] onSelect, contentItem: ", contentItem);

		}

	});

});