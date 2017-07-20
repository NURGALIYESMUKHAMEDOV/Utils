define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "ecm/model/ContentItem",
    "ecm/widget/dialog/BaseDialog",
    "esbd/vehicle/VehicleDialog",
    "dojo/text!./templates/SelectVehicleDialog.html"
], function(
    declare,
    lang,
    ContentItem,
    BaseDialog,
    VehicleDialog,
    template)
{

	return declare("esbd.vehicle.SelectVehicleDialog", [
		BaseDialog
	], {

		contentString: template,
		widgetsInTemplate: true,
		dialog: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

            this.set("title", "Транспортное средство");

            this.setIntroText("Поиск транспортного средства");

            this.addButton("Добавить", "_onAdd", false, true, "ADD");

            this.selectButton = this.addButton("Выбрать", "_onSelect", false, true, "SELECT");

            this.vehicleList.set("onSelectionChange", dojo.hitch(this, function(selectedItems){

                if (selectedItems && selectedItems[0]) {

                    var disabled = !(selectedItems != null && selectedItems[0] != null);

                    this.selectButton.set("disabled", disabled);

                }


            }));

			this.vehicleList.set("onSelect", dojo.hitch(this, function(selectedItem){

				this._onSelect();

			}));

		},

		_getDialog: function() {

		    if (!this.dialog) {

		        this.dialog = new VehicleDialog({

		            onSelect: dojo.hitch(this, function(vehicle){

		                this.dialog.hide();

		                this.onSelect(vehicle);

		            })

		        });

		    }

		    return this.dialog ;

		},

		_onAdd: function() {

            var repository = ecm.model.desktop.repositories[0];

            repository.retrieveContentClassList(dojo.hitch(this, function(contentClasses){

                var contentClass = contentClasses[0];

                contentClass.retrieveAttributeDefinitions(dojo.hitch(this, function(attributeDefinitions){

                    var value = new ContentItem();

                    for (var index = 0; index < attributeDefinitions.length; index++) {

                        var attributeDefinition = attributeDefinitions[index];

                        if (attributeDefinition.system || attributeDefinition.hidden) {

                            continue ;

                        }

                        value.setValue(attributeDefinition.id, null);

                    }

					var dialog = this._getDialog();

					dialog.setValue(value);

					dialog.show();

                }))

            }), ["ESBD_Vehicle"]);

		},

		_onSelect: function() {

		    var selectedItems = this.vehicleList.getSelectedItems();

            if (selectedItems != null && selectedItems.length > 0) {

                var selectedItem = selectedItems[0];

				var repository = ecm.model.desktop.repositories[0];

				repository.retrieveItem(selectedItem.id, dojo.hitch(this, function(item){

					var dialog = this._getDialog();

					dialog.setValue(item);

					dialog.show();

				}));

            }

		},

		onSelect: function(item) {
		}

	});

});
