define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/dialog/YesNoCancelDialog",
    "esbd/Utils",
    "dojo/text!./templates/VehicleDialog.html"
], function(
    declare,
    lang,
    BaseDialog,
    YesNoCancelDialog,
    Utils,
    template)
{

	return declare("esbd.vehicle.VehicleDialog", [
		BaseDialog
	], {

		contentString: template,
		widgetsInTemplate: true,
		contentItem: null,
		submitButton: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

            this.submitButton = this.addButton("Добавить", "_onSubmit", false, true, "ADD");

		},

        setValue: function(contentItem) {

            this.contentItem = contentItem ;

            this._setLocalValue();

        },

        _setLocalValue: function() {

            this.vehicleBox.setValue(this.contentItem);

            if (this.contentItem.getValue("Id")) {

                this.set("title", "Транспортное средство");

                this.setIntroText("При необходимости обновите информацию о транспортном средстве");

                this.submitButton.set("label", "Далее");

            } else {

                this.set("title", "Новое транспортное средство");

                this.setIntroText("Укажите параметры нового транспортного средства");

                this.submitButton.set("label", "Сохранить");

            }

        },

		_onSubmit: function() {

		    if (this.contentItem.getValue("Id")) {

		        // изменение информации о транспортном средстве

		        var isDirty = this.vehicleBox.isDirty ;

		        if (isDirty) {

                    var dialog = new YesNoCancelDialog({

                        title: "Вопрос",

                        text: "Информация о транспортном средстве была изменена. Сохранить?",

                        onYes: dojo.hitch(this, function() {

                            dialog.hide();

                            // сохранить сделанные изменения

                            this._update();

                        }),

                        onNo: dojo.hitch(this, function() {

                            dialog.hide();

                            // изменения не требуют сохранения идем далее

                            this.onSelect(this.contentItem);

                        })

		            });

		            dialog.show();

                } else {

                    // ничего не было изменено, идем далее

                    this.onSelect(this.contentItem);

                }

            } else {

                // добавление нового транспортного средства

                this._update();

            }

		},

        // создает объект или сохраняет изменения
        // в хранилище
        _update: function() {

            var value = this.vehicleBox.getValue();

            var name = value.getValue("ESBD_VehicleBrand") + " " + value.getValue("ESBD_VehicleModel") + " " + value.getValue("ESBD_VIN");

            value.setValue("DocumentTitle", name.trim());

            var repository = ecm.model.desktop.repositories[0];

            if (value.getValue("Id")) {

                // обновление информации о транспортном средстве

                repository.retrieveItem(this.contentItem.id, dojo.hitch(this, function(item){

                    repository.lockItems([item], dojo.hitch(this, function(result){

                        item.checkIn(
                            item.template,	            // class name
                            Utils.getCriterias(value),	// properties
                            "Item",					    // content source type, "Item" - no content
                            null,					    // mime type
                            null,					    // filename
                            null,					    // content
                            null,					    // childComponentValues
                            null,					    // permissions
                            null,					    // securityPolicyId
                            null,					    // newVersion
                            false,					    // checkInAsMinorVersion
                            false,					    // autoClassify
                            dojo.hitch(this, function(item){
                                this.contentItem = item;
                                this.onSelect(this.contentItem);
                            })
                        );

                    }));

                }));

            } else {

                // создание транспортного средства

                repository.retrieveItem("/Транспортные средства", dojo.hitch(this, function(folder){

                    repository.addDocumentItem(
                        folder,
                        repository.objectStoreName,
                        "ESBD_Vehicle",
                        Utils.getCriterias(value),
                        "Item",
                        null, // mimeType
                        null, // filename
                        null, // content
                        null, // childComponentValues
                        null, // permissions
                        null, // securityPolicyId
                        false, // addAsMinorVersion
                        false, // autoClassify
                        true, // allowDuplicateFileNames
                        true, // setSecurityParent
                        null, // teamspaceId
                        dojo.hitch(this, function (item){
                            this.contentItem = item;
                            this.onSelect(this.contentItem);
                        })
                    );

                }));

            }

        },

		onSelect: function(item) {
		}

	});

});
