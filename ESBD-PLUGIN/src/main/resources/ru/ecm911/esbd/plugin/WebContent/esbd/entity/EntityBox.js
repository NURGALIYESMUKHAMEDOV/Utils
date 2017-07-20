/**
 * Компонент реализующий функции работы с
 * атрибутами/свойствами объекта "Юридическое лицо"
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "ecm/model/Request",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/EntityBox.html"
],function(
    declare,
    lang,
    Request,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template
) {

    return declare("esbd.entity.EntityBox", [
        _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,
        widgetsInTemplate: true,
        value: null,
        isDirty: false,
        loaded: false,

        postCreate: function() {

            this.ESBD_BIN.set("validator", dojo.hitch(this, function(value){

                if (!isNaN(value)) {

                    // это номер

                    if (value.length == 12) {

                        var digits = value.split('');

                        var result = ( digits[0] * 1 + digits[1] * 2 + digits[2] * 3 + digits[3] * 4 + digits[4] * 5 + digits[5] * 6 + digits[6] * 7 + digits[7] * 8 + digits[8] * 9 + digits[9] * 10 + digits[10] * 11 ) % 11 ;

                        if (result == 10) {

                            result = ( digits[0] * 3 + digits[1] * 4 + digits[2] * 5 + digits[3] * 6 + digits[4] * 7 + digits[5] * 8 + digits[6] * 9 + digits[7] * 10 + digits[8] * 11 + digits[9] * 1 + digits[10] * 2 ) % 11 ;

                            if (result == 10) {

                                return false ;

                            } else if (result == digits[11]) {

                                return true ;

                            }

                        } else if (result == digits[11]){

                            return true ;

                        }

                    }

                }

                return false ;

            }));

        },

        _retrieveCountries: function(callback) {

            this.ESBD_ResidencyCountry.removeOption(this.ESBD_ResidencyCountry.getOptions());

            var repository = ecm.model.desktop.repositories[0];

            ecm.model.Request.invokePluginService("ESBDPlugin", "DictionaryPluginService", {
                requestParams: {
                    name: "Страна",
                    repositoryId: repository.id
                },
                requestCompleteCallback: dojo.hitch(this, function(response){

                    if (response && response.data) {

                        var values = response.data ;

                        this.ESBD_ResidencyCountry.addOption(values);

                        if (callback) {

                            callback();

                        }

                    }

                })

            });

        },

        _retrieveIndustries: function(callback) {

            this.ESBD_Industry.removeOption(this.ESBD_Industry.getOptions());

            var repository = ecm.model.desktop.repositories[0];

            Request.invokePluginService("ESBDPlugin", "DictionaryPluginService", {
                requestParams: {
                    name: "Сектор экономики",
                    repositoryId: repository.id
                },
                requestCompleteCallback: dojo.hitch(this, function(response){

                    if (response && response.data) {

                        var values = response.data ;

                        this.ESBD_Industry.addOption(values);

                        if (callback) {

                            callback();

                        }

                    }

                })

            });

        },

        _retrieveBusinessTypes: function(callback) {

            this.ESBD_BusinessType.removeOption(this.ESBD_BusinessType.getOptions());

            var repository = ecm.model.desktop.repositories[0];

            Request.invokePluginService("ESBDPlugin", "DictionaryPluginService", {
                requestParams: {
                    name: "Вид экономической деятельности",
                    repositoryId: repository.id
                },
                requestCompleteCallback: dojo.hitch(this, function(response){

                    if (response && response.data) {

                        var values = response.data ;

                        this.ESBD_BusinessType.addOption(values);

                        if (callback) {

                            callback();

                        }

                    }

                })

            });

        },

        _retrieveEconomicBranches: function(callback) {

            this.ESBD_EconomicBranch.removeOption(this.ESBD_EconomicBranch.getOptions());

            var repository = ecm.model.desktop.repositories[0];

            Request.invokePluginService("ESBDPlugin", "DictionaryPluginService", {
                requestParams: {
                    name: "Отрасль",
                    repositoryId: repository.id
                },
                requestCompleteCallback: dojo.hitch(this, function(response){

                    if (response && response.data) {

                        var values = response.data ;

                        this.ESBD_EconomicBranch.addOption(values);

                        if (values && values.length > 0) {

                            this.ESBD_EconomicBranch.set("value", values[0].value, false);

                        }

                        if (callback) {

                            callback();

                        }

                    }

                })

            });

        },

        _retrieveAll: function(callback) {

            var calls = [];

            calls.push(dojo.hitch(this, this._retrieveCountries));

            calls.push(dojo.hitch(this, this._retrieveIndustries));

            calls.push(dojo.hitch(this, this._retrieveBusinessTypes));

            calls.push(dojo.hitch(this, this._retrieveEconomicBranches));

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

        setValue: function(value) {

            this.value = value ;

            this._setLocalValue();

        },

        getValue: function() {

            this._getLocalValue();

            return this.value;

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

                        if (attachPoint == "ESBD_KZResidency") {

                            var value = this.value.getValue(attachPoint) ? "true" : "false" ;

                            this[attachPoint].set("value", value, false);

                        } else {

                            this[attachPoint].set("value", this.value.getValue(attachPoint), false);

                        }

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

        },

        _getLocalValue: function() {

            if (this.value) {

                for (var index = 0; index < this._attachPoints.length; index++) {

                    var attachPoint = this._attachPoints[index];

                    if (this.value.hasAttribute(attachPoint)) {

                        if (attachPoint == "ESBD_KZResidency") {

                            var value = this[attachPoint].get("value") == "true" ;

                            this.value.setValue(attachPoint, value);

                        } else {

                            this.value.setValue(attachPoint, this[attachPoint].get("value"));

                        }

                    }

                }

            }

        },

        _onDirty: function() {

            this.isDirty = true ;

        },

        isValid: function() {

            var isValid = true ;

            var attachPoints = this._attachPoints ;

            for (var index = 0; index < attachPoints.length; index++) {

                var attachPoint = attachPoints[index];

                if (this[attachPoint] && this[attachPoint].validate) {

                    this[attachPoint].focus();

                    var result = this[attachPoint].validate();

                    isValid = isValid & result;

                }

            }

            return isValid ;

        }

    });

});