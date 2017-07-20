define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dijit/layout/ContentPane",
    "dijit/form/Button",
    "ecm/widget/ValidationTextBox",
    "ecm/widget/DatePicker",
    "ecm/widget/CheckBox",
    "ecm/widget/Select",
    "ecm/model/Request",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/InsuredVehicleBox.html"
],function(
    declare,
    lang,
    domStyle,
    ContentPane,
    Button,
    ValidationTextBox,
    DatePicker,
    CheckBox,
    Select,
    Request,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template
) {

    return declare("esbd.contract.insurance.InsuredVehicleBox", [
        _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,
        widgetsInTemplate: true,
        value: null,
        loaded: false,
        readOnly: false,
        _regions: null, // список регионов и городов

        _retrieveRegions: function(callback) {

            var repository = ecm.model.desktop.repositories[0];

            Request.invokePluginService("ESBDPlugin", "DictionaryPluginService", {
                requestParams: {
                    name: "Город регистрации транспортного средства",
                    repositoryId: repository.id
                },
                requestCompleteCallback: dojo.hitch(this, function(response){

                    if (response && response.data) {

                        this._regions = response.data ;

                        this._setRegions();

                        this._setCities();

                        if (callback) {

                            callback();

                        }

                    }

                })

            });

        },

        _retrieveAll: function(callback) {

            var calls = [];

            calls.push(dojo.hitch(this, this._retrieveRegions));

            var count = 0;

            var myCallback = function() {

                count++ ;

                if (count == calls.length) {

                    callback();

                }

            }

            for (var i = 0; i < calls.length; i++) {

                calls[i](myCallback);

            }

        },

        _onRegionChange: function() {

            this._setCities();

        },

        _setRegions: function() {

            this.ESBD_VehicleRegistrationRegion.removeOption(this.ESBD_VehicleRegistrationRegion.getOptions());

            for (var i = 0; i < this._regions.length; i++) {

                var region = this._regions[i];

                this.ESBD_VehicleRegistrationRegion.addOption({
                    label: region.label,
                    value: region.label
                })

            }

            if (this._regions.length > 0) {

                this.ESBD_VehicleRegistrationRegion.set("value", this._regions[0].label, false);

            }

        },

        _setCities: function() {

            this.ESBD_VehicleRegistrationCity.removeOption(this.ESBD_VehicleRegistrationCity.getOptions());

            this.ESBD_VehicleRegistrationCity.addOption({
                label: "Нет",
                value: "Нет"
            });

            var value = this.ESBD_VehicleRegistrationRegion.get("value");

            var hasCities = false ;

            for (var index = 0; index < this._regions.length; index++) {

                var region = this._regions[index];

                if (region.label == value) {

                    var cities = region.values ;

                    for (var y = 0; y < cities.length; y++) {

                        hasCities = true ;

                        var city = cities[y];

                        this.ESBD_VehicleRegistrationCity.addOption({
                            label: city.label,
                            value: city.value
                        });

                    }

                    break ;

                }

            }

            this.ESBD_VehicleRegistrationCity.set("value", "Нет", false);

            // находим наименование поля

            var label = null ;

            var labels = document.getElementsByTagName('label');

            for( var i = 0; i < labels.length; i++ ) {

                if (labels[i].htmlFor == this.ESBD_VehicleRegistrationCity.id) {

                    label = labels[i];

                    break ;

                }

            }

            if (!hasCities) {

                this.ESBD_VehicleRegistrationCity.domNode.style.visibility = "hidden";

                if (label) {

                    domStyle.set(label, "visibility", "hidden");

                }

            } else {

                this.ESBD_VehicleRegistrationCity.domNode.style.visibility = "visible" ;

                if (label) {

                    domStyle.set(label, "visibility", "visible");

                }

            }

        },

        getValue: function() {

            this._getLocalValue();

            return this.value;

        },

        _getLocalValue: function() {

            if (this.value) {

                this.value.registrationRegion = this.ESBD_VehicleRegistrationRegion.get("value");

                this.value.registrationCity = this.ESBD_VehicleRegistrationCity.get("value");

                if (this.value.registrationCity == "Нет") {

                    this.value.registrationCity = null ;

                }

                this.value.VRN = this.ESBD_VRN.get("value");

                this.value.certificateNumber = this.ESBD_VehicleCertificateNumber.get("value");

                this.value.certificateIssueDate = this.ESBD_VehicleCertificateIssueDate.get("value");

            }

        },

        setValue: function(value) {

            this.value = value ;

            this._setLocalValue();

        },

        _setLocalValue: function() {

            if (!this.loaded) {

                this._retrieveAll(dojo.hitch(this, function(){

                    this.loaded = true ;

                    this._setLocalValue();

                }));

                return ;

            }

            if (!this.value) return ;

            var vehicle = this.value.vehicle ;

            if (!vehicle) {

            } else if (typeof vehicle === "string" || vehicle instanceof String) {

                this._retrieveVehicle(vehicle);

            } else {

                this.ESBD_VehicleBrand.set("value", vehicle.getValue("ESBD_VehicleBrand"));

                this.ESBD_VehicleModel.set("value", vehicle.getValue("ESBD_VehicleModel"));

                this.ESBD_VIN.set("value", vehicle.getValue("ESBD_VIN"));

                this.ESBD_VehicleIssueYear.set("value", vehicle.getValue("ESBD_VehicleIssueYear"));

            }

            this.ESBD_VehicleRegistrationRegion.set("value", this.value.registrationRegion);

            if (this.value.registrationCity) {

                this.ESBD_VehicleRegistrationCity.set("value", this.value.registrationCity);

            } else {

                this.ESBD_VehicleRegistrationCity.set("value", "Нет");

            }

            this.ESBD_VRN.set("value", this.value.VRN);

            this.ESBD_VehicleCertificateNumber.set("value", this.value.certificateNumber);

            this.ESBD_VehicleCertificateIssueDate.set("value", this.value.certificateIssueDate);

            // set readOnly

            this.ESBD_VehicleRegistrationRegion.set("disabled", this.readOnly);

            this.ESBD_VehicleRegistrationCity.set("disabled", this.readOnly);

            this.ESBD_VRN.set("disabled", this.readOnly);

            this.ESBD_VehicleCertificateNumber.set("disabled", this.readOnly);

            this.ESBD_VehicleCertificateIssueDate.set("disabled", this.readOnly);

        },

        _retrieveVehicle: function(id) {

            var repository = ecm.model.desktop.repositories[0];

            repository.retrieveItem(id, dojo.hitch(this, function(item){

                this.value.vehicle = item ;

                this._setLocalValue();

            }));

        }

    });

});