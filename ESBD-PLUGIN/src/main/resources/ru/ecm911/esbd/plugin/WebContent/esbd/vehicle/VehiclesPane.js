/**
 * Компонент реализует работу со списком страховых компаний
 * включая функцию добавления и изменения информации
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/form/Button",
    "esbd/vehicle/VehicleList",
    "esbd/vehicle/VehicleDialog"
],function(
    declare,
    lang,
    ContentPane,
    BorderContainer,
    Button,
    VehicleList,
    VehicleDialog
) {

    return declare("esbd.vehicle.VehiclesPane", [
        BorderContainer
    ], {

        postCreate: function() {

            this.inherited(arguments);

            var buttons = new ContentPane({
                region: "top",
                style: "padding: 8px"
            });

            var button = new Button({
                label: "Добавить",
                onClick: dojo.hitch(this, function(){
                    this._onAdd();
                })
            });

            buttons.addChild(button);

            this.addChild(buttons);

            var container = new ContentPane({
                region: "center",
                style: "overflow: auto"
            });

            this.addChild(container);

            this.vehicleList = new VehicleList({
                onSelect: dojo.hitch(this, function(item){
                    this.onSelect(item);
                })
            });

            container.addChild(this.vehicleList);

        },

        _onAdd: function(evt) {

            var dialog = new VehicleDialog({
                onSelect: dojo.hitch(this, function(contentItem){
                    dialog.hide();
                })
            });

            dialog.setValue(null);

            dialog.show();

        },

        onSelect: function(item) {

            var dialog = new VehicleDialog({
                onSelect: dojo.hitch(this, function(contentItem){
                    dialog.hide();
                })
            });

            dialog.setValue(item);

            dialog.show();

        }

    });

});