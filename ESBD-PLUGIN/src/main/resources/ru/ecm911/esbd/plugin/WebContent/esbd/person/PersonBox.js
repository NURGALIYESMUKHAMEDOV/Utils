/**
 * Компонент реализующий функции работы с
 * атрибутами/свойствами объекта "Физическое лицо"
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/date/locale",
    "dijit/layout/ContentPane",
    "dijit/form/Button",
    "ecm/widget/ValidationTextBox",
    "ecm/widget/DatePicker",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/PersonBox.html"
],function(
    declare,
    lang,
    locale,
    ContentPane,
    Button,
    ValidationTextBox,
    DatePicker,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template
) {

    return declare("esbd.person.PersonBox", [
        _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,
        widgetsInTemplate: true,
        value: null,
        loaded: false,
        readOnly: false,
        isDirty: false,

        postCreate: function() {

            this.ESBD_IIN.set("validator", dojo.hitch(this, function(value){

                if (value == null || value.length == 0) {

                    return true ;

                }

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

            this.ESBD_ITN.set("validator", dojo.hitch(this, function(value){

                if (value == null || value.length == 0) {

                    return true ;

                }

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

            this.ESBD_Birthday.set("validator", dojo.hitch(this, function(value){

                var iin = this.ESBD_IIN.get("value");

                if (!iin) {

                    return true ;

                }

                if (value) {

                    var date = locale.parse(value, {datePattern: "dd.MM.yyyy", selector: "date"});

                    var formatted = locale.format(date, {selector: "date", datePattern: "yyMMdd"});

                    if (iin.slice(0, formatted.length) != formatted) {

                        this.ESBD_Birthday.set("invalidMessage", "Дата не соответствует данным указанным в ИИН");

                        return false ;

                    } else {

                        return true ;

                    }

                } else {

                    return true ;

                }

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

        _retrieveMaritalStatuses: function(callback) {

            this.ESBD_MaritalStatus.removeOption(this.ESBD_MaritalStatus.getOptions());

            this.ESBD_MaritalStatus.set("value", null);

            var repository = ecm.model.desktop.repositories[0];

            ecm.model.Request.invokePluginService("ESBDPlugin", "DictionaryPluginService", {
                requestParams: {
                    name: "Семейное положение",
                    repositoryId: repository.id
                },
                requestCompleteCallback: dojo.hitch(this, function(response){

                    if (response && response.data) {

                        var values = response.data ;

                        this.ESBD_MaritalStatus.addOption(values);

                        if (values && values.length > 0) {

                            this.ESBD_MaritalStatus.set("value", values[0].value, false);

                        }

                        if (callback) {

                            callback();

                        }

                    }

                })

            });

        },

        _retrieveProfessions: function(callback) {

            this.ESBD_Profession.removeOption(this.ESBD_Profession.getOptions());

            var repository = ecm.model.desktop.repositories[0];

            ecm.model.Request.invokePluginService("ESBDPlugin", "DictionaryPluginService", {
                requestParams: {
                    name: "Род занятий",
                    repositoryId: repository.id
                },
                requestCompleteCallback: dojo.hitch(this, function(response){

                    if (response && response.data) {

                        var values = response.data ;

                        this.ESBD_Profession.addOption(values);

                        if (values && values.length > 0) {

                            this.ESBD_Profession.set("value", values[0].value, false);

                        }

                        if (callback) {

                            callback();

                        }

                    }

                })

            });

        },

        _retrieveEducations: function(callback) {

            this.ESBD_Education.removeOption(this.ESBD_Education.getOptions());

            var repository = ecm.model.desktop.repositories[0];

            ecm.model.Request.invokePluginService("ESBDPlugin", "DictionaryPluginService", {
                requestParams: {
                    name: "Образование",
                    repositoryId: repository.id
                },
                requestCompleteCallback: dojo.hitch(this, function(response){

                    if (response && response.data) {

                        var values = response.data ;

                        this.ESBD_Education.addOption(values);

                        if (values && values.length > 0) {

                            this.ESBD_Education.set("value", values[0].value, false);

                        }

                        if (callback) {

                            callback();

                        }

                    }

                })

            });

        },

        _retrieveIdentityTypes: function(callback) {

            this.ESBD_IdentityType.removeOption(this.ESBD_IdentityType.getOptions());

            var repository = ecm.model.desktop.repositories[0];

            ecm.model.Request.invokePluginService("ESBDPlugin", "DictionaryPluginService", {
                requestParams: {
                    name: "Вид удостоверяющего документа",
                    repositoryId: repository.id
                },
                requestCompleteCallback: dojo.hitch(this, function(response){

                    if (response && response.data) {

                        var values = response.data ;

                        this.ESBD_IdentityType.addOption(values);

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

            calls.push(dojo.hitch(this, this._retrieveIdentityTypes));

            calls.push(dojo.hitch(this, this._retrieveMaritalStatuses));

            calls.push(dojo.hitch(this, this._retrieveProfessions));

            calls.push(dojo.hitch(this, this._retrieveEducations));

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

                            this.value.setValue(attachPoint, this[attachPoint].get("value"))

                        }

                    }

                }

            }

        },

        _onDirty: function() {

            console.log("[PersonBox] _onDirty: ", this.isDirty);

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