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

	return declare("esbd.LookupObjectDialog", [
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

		},

		show: function(params) {

		    this.repository = params.repository || this.repository ;

		    this.searchTemplatesPath = params.searchTemplatesPath || this.searchTemplatesPath ;

		    this.onSelect = params.onSelect || this.onSelect ;

		    this.onAdd = params.onAdd || this.onAdd ;

		    if (params.title) {

		        this.set("title", params.title);

		    }

		    if (params.introText) {

		        this.setIntroText(params.introText);

		    }

		    // удаляем предыдущее отображение

		    if (this.objectList) {

		        this.contentPane.removeChild(this.objectList);

		        this.objectList.destroy();

		        delete this.objectList ;

		    }

		    // если определен обработчик на добавление объекта, вставляем кнопку

		    if (this.onAdd) {

		        this.addButton = this.addButton("Добавить", "_onAdd", false, true, "ADD");

		    }

            this.objectList = new ObjectList({

                searchTemplatesPath: this.searchTemplatesPath,

                onSelectionChange: dojo.hitch(this, function(selectedItems){

                    var hasSelection = selectedItems && selectedItems.length && selectedItems.length > 0 ;

                    this.selectButton.set("disabled", !hasSelection);

                })

            });

            this.contentPane.addChild(this.objectList);

            var result = this.inherited("show", []);

            this.resize();

            return result ;

		},

		_onSelect: function() {

		    var selectedItems = this.objectList.getSelectedItems();

		    if (selectedItems && selectedItems[0]) {

		        this.onSelect(selectedItems[0]);

		    } else {

		        console.log("Отобразить ошибку о невозможности выбора объекта");

		    }

		},

		_onAdd: function() {

		    if (this.onAdd) {

		        this.onAdd();

		    }

		},

		onSelect: function(contentItem) {

		}

	});

});