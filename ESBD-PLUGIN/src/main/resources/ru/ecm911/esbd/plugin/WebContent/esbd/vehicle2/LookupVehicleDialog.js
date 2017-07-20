/**
 * Диалоговое окно для работы с
 * информацией о клиенте (физическое или юридическое лицо)
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
    "esbd/vehicle2/VehicleList",
    "dojo/text!./templates/LookupVehicleDialog.html"
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
    VehicleList,
    template)
{

	return declare("esbd.vehicle2.LookupVehicleDialog", [
		BaseDialog
	], {

		contentString: template,

		widgetsInTemplate: true,

		selectButton: null,

		repository: null,

        // конфигурация диалогового окна в виде
        // {
        //    "searchTemplatesPath": "/пусть к папке с поисковыми шаблонами",
        //    "contentClass": "класс объекта, типа ecm.model.ContentClass",
        //    "viewEntryTemplate": "объект шаблон ввода для отображения информации, тип ecm.model.EntryTemplate",
        //    "addEntryTemplate": "шаблон ввода для добавления объекта, тип ecm.model.EntryTemplate
        // }
        config: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

            this.selectButton = this.addButton("Выбрать", "_onSelect", true, true, "SELECT");

            this.set("title", "Заголовок");

            this.setIntroText("Описание");

            if (!this.repository) {

                this.repository = ecm.model.desktop.repositories[0];

            }

            this._vehicleList = new VehicleList({

                config: this.config,

                onSelectionChange: dojo.hitch(this, function(selectedItems){

                    if (selectedItems && selectedItems.length && selectedItems.length > 0) {

                        this.selectButton.set("disabled", false);

                    } else {

                        this.selectButton.set("disabled", true);

                    }

                }),

                onSelect: dojo.hitch(this, this.onSelect)

            })

            this.contentPane.set("content", this._vehicleList);

		},

		_onSelect: function() {

		    var selectedItems = this._vehicleList.getSelectedItems();

		    if (selectedItems && selectedItems.length && selectedItems.length > 0) {

		        this.onSelect(selectedItems[0]);

		    } else {

		        console.log("Отобразить ошибку о невозможности выбора объекта");

		    }

		},

		onSelect: function(contentItem) {

		}

	});

});
