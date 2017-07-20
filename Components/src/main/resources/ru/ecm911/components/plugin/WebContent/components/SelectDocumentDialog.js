define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/sniff",
    "dojo/aspect",
    "dojo/json",
    "ecm/model/Request",
    "ecm/model/Comment",
    "ecm/model/EntryTemplate",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/dialog/YesNoCancelDialog",
    "./DocumentList",
    "dojo/text!./templates/SelectDocumentDialog.html"
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
    DocumentList,
    template)
{

	return declare("components.SelectDocumentDialog", [
		BaseDialog
	], {

		contentString: template,

		widgetsInTemplate: true,

		selectButton: null,

		repository: null,

		params: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

            this.selectButton = this.addButton("Выбрать", "_onSelect", true, true, "SELECT");

		},

		show: function(params) {

		    this.repository = params.repository || this.repository ;

		    this.params = params.params || this.params ;

		    this.onSelect = params.onSelect || this.onSelect ;

		    this.set("title", (this.list && this.params.list.title) || "");

		    this.setIntroText((this.list && this.list.description) || "");

		    // удаляем предыдущее отображение

		    if (this.documentList) {

		        this.contentPane.removeChild(this.documentList);

		        this.documentList.destroy();

		        delete this.documentList ;

		    }

		    // если определен обработчик на добавление объекта, вставляем кнопку

            this.documentList = new DocumentList({

                repository: this.repository,

                params: this.params,

                onSelectionChange: dojo.hitch(this, function(selectedItems){

                    var hasSelection = selectedItems && selectedItems.length && selectedItems.length > 0 ;

                    this.selectButton.set("disabled", !hasSelection);

                }),

                onActionPerformed: dojo.hitch(this, function(action, contentItem) {

                    if (contentItem) {

                        this.onSelect([contentItem]);

                        this.hide();

                    }

                })

            });

            this.contentPane.addChild(this.documentList);

            var result = this.inherited("show", []);

            this.resize();

            return result ;

		},

		_onSelect: function() {

		    var selectedItems = this.documentList.getSelectedItems();

		    if (selectedItems && selectedItems.length > 0) {

                this.onSelect(selectedItems);

                this.hide();

            }

		},

		_onAdd: function() {

		    if (this.onAdd) {

		        this.onAdd();

		    }

		},

		onSelect: function(contentItems) {

		}

	});

});