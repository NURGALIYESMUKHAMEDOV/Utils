define([
    "dojo/_base/declare",
    "dojo/_base/lang",
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
    "dojo/text!./templates/VehicleBox.html"
],function(
    declare,
    lang,
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

    return declare("esbd.vehicle.VehicleBox", [
        _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,
        widgetsInTemplate: true,
        value: null,
        readOnly: false,
        isDirty: false,         // указывает на то, что данные формы были изменены
        _brands: null,          // список брендов и моделей
        loaded: false,          // указывает на то, что данные загружены

        postCreate: function() {

            this.ESBD_VIN.set("validator", dojo.hitch(this, function(value){

                if (value && typeof value === "string" && value.length > 0) {

                    var re = new RegExp("^[A-HJ-NPR-Z\\d]{8}[\\dX][A-HJ-NPR-Z\\d]{2}\\d{6}$");

                    return value.match(re);

                }

            }));


        },

        _retrieveBrands: function(callback) {

            var repository = ecm.model.desktop.repositories[0];

            Request.invokePluginService("ESBDPlugin", "DictionaryPluginService", {
                requestParams: {
                    name: "Модель транспортного средства",
                    repositoryId: repository.id
                },
                requestCompleteCallback: dojo.hitch(this, function(response){

                    if (response && response.data) {

                        this._brands = response.data ;

                        this._setBrands();

                        this._setModels();

                        if (callback) {

                            callback();

                        }

                    }

                })

            });

        },

        _retrieveVehicleTypes: function(callback) {

            this.ESBD_VehicleType.removeOption(this.ESBD_VehicleType.getOptions());

            var repository = ecm.model.desktop.repositories[0];

            Request.invokePluginService("ESBDPlugin", "DictionaryPluginService", {
                requestParams: {
                    name: "Тип транспортного средства",
                    repositoryId: repository.id
                },
                requestCompleteCallback: dojo.hitch(this, function(response){

                    if (response && response.data) {

                        var values = response.data ;

                        this.ESBD_VehicleType.addOption(values);

                        if (callback) {

                            callback();

                        }

                    }

                })

            });

        },

        _retrieveAll: function(callback) {

            var calls = [];

            calls.push(dojo.hitch(this, this._retrieveBrands));

            calls.push(dojo.hitch(this, this._retrieveVehicleTypes));

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

        _onBrandChange: function() {

            this._onDirty();

            this._setModels();

        },

        _setBrands: function() {

            this.ESBD_VehicleBrand.removeOption(this.ESBD_VehicleBrand.getOptions());

            for (var i = 0; i < this._brands.length; i++) {

                var brand = this._brands[i];

                this.ESBD_VehicleBrand.addOption({
                    label: brand.label,
                    value: brand.label
                })

            }

            if (this._brands.length > 0) {

                this.ESBD_VehicleBrand.set("value", this._brands[0].label, false);

            }

        },

        _setModels: function() {

            this.ESBD_VehicleModel.removeOption(this.ESBD_VehicleModel.getOptions());

            var value = this.ESBD_VehicleBrand.get("value");

            for (var index = 0; index < this._brands.length; index++) {

                var brand = this._brands[index];

                if (brand.label == value) {

                    var models = brand.values ;

                    for (var y = 0; y < models.length; y++) {

                        var model = models[y];

                        this.ESBD_VehicleModel.addOption({
                            label: model.label,
                            value: model.value
                        });

                    }

                    break ;

                }

            }

        },

        getValue: function() {

            this._getLocalValue();

            return this.value;

        },

        _getLocalValue: function() {

            if (this.value) {

                for (var index = 0; index < this._attachPoints.length; index++) {

                    var attachPoint = this._attachPoints[index];

                    if (this.value.hasAttribute(attachPoint)) {

                        this.value.setValue(attachPoint, this[attachPoint].get("value"))

                    }

                }

            }

/*
            var value = [];

            var attachPoints = this._attachPoints ;

            for (var index = 0; index < attachPoints.length; index++) {

                var attachPoint = attachPoints[index];

                value.push({
                    name: attachPoint,
                    value: this[attachPoint].get("value")
                })

            }

            var name = this.ESBD_VehicleBrand.get("value") + " " + this.ESBD_VehicleModel.get("value") + " " + this.ESBD_VIN.get("value");

            value.push({
                name: "DocumentTitle",
                value: name
            });

            this.value = value ;
*/

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

            if (this.value) {

                for (var i = 0; i < this._attachPoints.length; i++) {

                    var attachPoint = this._attachPoints[i];

                    if (this.value.hasAttribute(attachPoint)) {

                        this[attachPoint].set("value", this.value.getValue(attachPoint), null);

                    }

                }

            }

            for (var i = 0; i < this._attachPoints.length; i++) {

                var attachPoint = this._attachPoints[i];

                if (this[attachPoint].set) {

                    this[attachPoint].set("disabled", this.readOnly);

                }

            }

            this.isDirty = false ;

            /*

            if (!this.loaded) {

                this._retrieveAll(dojo.hitch(this, function(){

                    this.loaded = true ;

                    this._setLocalValue();

                }));

                return ;

            }

            if (this.value) {

                for (var index = 0; index < this.value.length; index++) {

                    var item = this.value[index];

                    if (this[item.name]) {

                        this[item.name].set("value", item.value, false);

                        if (item.name == "ESBD_VehicleBrand") {

                            this._setModels();

                        }

                    }

                }

            } else {

                for (var i = 0; i < this._attachPoints.length; i++) {

                    var attachPoint = this._attachPoints[i];

                    this[attachPoint].set("value", null, false);

                }

                this._setBrands();

                this._setModels();

            }

            this.isDirty = false ;

            */

        },

        _onDirty: function() {

            this.isDirty = true ;

        }

    });

});