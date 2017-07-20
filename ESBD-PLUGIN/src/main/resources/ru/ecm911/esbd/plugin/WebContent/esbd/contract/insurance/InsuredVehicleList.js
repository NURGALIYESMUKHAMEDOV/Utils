define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/form/Button",
    "ecm/widget/ValidationTextBox",
    "ecm/widget/DatePicker",
    "ecm/widget/CheckBox",
    "ecm/widget/Select",
    "ecm/widget/TitlePane",
    "ecm/widget/dialog/MessageDialog",
    "esbd/contract/insurance/InsuredVehicleBox",
    "esbd/vehicle/SelectVehicleDialog"
],function(
    declare,
    lang,
    ContentPane,
    BorderContainer,
    Button,
    ValidationTextBox,
    DatePicker,
    CheckBox,
    Select,
    TitlePane,
    MessageDialog,
    InsuredVehicleBox,
    SelectVehicleDialog
) {

    return declare("esbd.contract.insurance.InsuredVehicleList", [
        BorderContainer
    ], {

        value: null,
        readOnly: false,
        widgets: [],
        items: [],      // список компонентов для отображения застрахованных ТС
        dialog: null,

        postCreate: function() {

            this.inherited(arguments);

            this.set("design", "sidebar");

            var buttonsPane = new ContentPane({
                region: "top"
            });

            var button = new Button({
                label: "Добавить",
                onClick: dojo.hitch(this, function(){
                    this._onAdd();
                })
            });

            buttonsPane.addChild(button);

            if (this.readOnly) {

                buttonsPane.domNode.style.display = "none" ;

            }

            this.addChild(buttonsPane);

            var container = new ContentPane({
                region: "center",
                style: "overflow: auto"
            });

            this.addChild(container);

            // убираем функцию установки размера, так как
            // в противном случае панель будет во весь экран
            this.list = new ContentPane({
                style: "overflow: auto",
                resize: function(){}
            });

            container.addChild(this.list);

        },

        getValue: function() {

            this._getLocalValue();

            return this.value ;

        },

        _getLocalValue: function() {

            var value = [];

            for (var i = 0; i < this.items.length; i++) {

                var item = this.items[i];

                value.push(item.getValue());

            }

            this.value = value ;

        },

        setValue: function(value) {

            this.value = value;

            this._setLocalValue();

        },

        _setLocalValue: function() {

            console.log("[InsuredVehicleList] value: ", this.value, ", items: ", this.items, ", widgets: ", this.widgets);

            // удалить все компоненты

            for (var i = 0; i < this.widgets.length; i++) {

                var widget = this.widgets[i];

                this.list.removeChild(widget);

            }

            // обнуляем массив
            this.widgets = [];

            this.items = [];

            // для каждого застрахованного создаем блок

            for (var i = 0; i < this.value.length; i++) {

                var vehicle = this.value[i];

                var widget = new TitlePane({
                    title: "Транспортное средство",
                    closable: !this.readOnly,
                    onClose: dojo.hitch(this, function(){
                        this._removeItem(widget);
                    })
                });

                var insuredVehicleBox = new InsuredVehicleBox({
                    readOnly: this.readOnly
                });

                insuredVehicleBox.setValue(vehicle);

                widget.addChild(insuredVehicleBox);

                this.list.addChild(widget);

                this.widgets.push(widget);

                this.items.push(insuredVehicleBox);

            }

            console.log("[InsuredVehicleList] items: ", this.items);

        },

        addItem: function(item) {

            if (!this.value) {
                this.value = [] ;
            }

            this.value.push({
                item
            });

            var widget = new TitlePane({
                title: "Транспортное средство",
                closable: !this.readOnly,
                onClose: dojo.hitch(this, function(){
                    this._removeItem(widget);
                })
            });

            var insuredVehicleBox = new InsuredVehicleBox({
                readOnly: this.readOnly
            });

            insuredVehicleBox.setValue(item);

            widget.addChild(insuredVehicleBox);

            this.list.addChild(widget);

            this.widgets.push(widget);

            this.items.push(insuredVehicleBox);

            console.log("[addItem] value: ", this.value, ", items: ", this.items, ", widgets: ", this.widgets);

        },

        _onAdd: function() {

            if (!this.dialog) {

                this.dialog = new SelectVehicleDialog({

                    onSelect: dojo.hitch(this, function(vehicle){

                        // проверяем что указанное транспортное средство не
                        // находится в списке застрахованных ТС

                        for (var i = 0; i < this.value.length; i++) {

                            var item = this.value[i].item;

                            if (item.vehicle.getValue("ESBD_VIN") == vehicle.getValue("ESBD_VIN")) {

                                var messageDialog = new MessageDialog({
                                    text: "Транспортное средства с таким VIN уже находится в списке застрахованных ТС"
                                });

                                messageDialog.show();

                                return ;

                            }

                        }

                        this.dialog.hide();

                        var item = {
                            vehicle: vehicle,
                            registrationRegion: null,
                            registrationCity: null,
                            VRN: null,
                            certificateNumber: null,
                            certificateIssueDate: null,
                            certificateValidTo: null
                        }

                        this.addItem(item);

                    })

                });

            }

            this.dialog.show();

        },

        _removeItem: function(widget) {

            var indexOf = this.widgets.indexOf(widget);

            this.value.splice(indexOf, 1);

            this.widgets.splice(indexOf, 1);

            this.items.splice(indexOf, 1);

        }

    });

});