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
    "dojo/text!./templates/PropertiesBox.html"
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

    return declare("esbd.contract.insurance.PropertiesBox", [
        _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,
        widgetsInTemplate: true,
        value: null,
        source: null,    // предок
        successor: null, // потомок
        loaded: false,
        readOnly: false,
        readOnlyItems: ["ESBD_DocumentNumber", "ESBD_CalculatedPremium", "ESBD_TerminateDate", "ESBD_TerminateReason", "ESBD_ReturnOfPremium", "ESBD_Status"],

        _retrieveBranches: function(callback) {

            this.ESBD_Branch.removeOption(this.ESBD_Branch.getOptions());

            var repository = ecm.model.desktop.repositories[0];

            ecm.model.Request.invokePluginService("ESBDPlugin", "DictionaryPluginService", {
                requestParams: {
                    name: "Филиал",
                    repositoryId: repository.id
                },
                requestCompleteCallback: dojo.hitch(this, function(response){

                    if (response && response.data) {

                        var values = response.data ;

                        this.ESBD_Branch.addOption(values);

                        if (callback) {

                            callback();

                        }

                    }

                })

            });

        },

        _retrievePaymentTypes: function(callback) {

            this.ESBD_PaymentType.removeOption(this.ESBD_PaymentType.getOptions());

            var repository = ecm.model.desktop.repositories[0];

            ecm.model.Request.invokePluginService("ESBDPlugin", "DictionaryPluginService", {
                requestParams: {
                    name: "Порядок оплаты",
                    repositoryId: repository.id
                },
                requestCompleteCallback: dojo.hitch(this, function(response){

                    if (response && response.data) {

                        var values = response.data ;

                        this.ESBD_PaymentType.addOption(values);

                        if (callback) {

                            callback();

                        }

                    }

                })

            });

        },

        _retrieveSource: function(callback) {

            var sourceId = this.value.getValue("ESBD_Source");

            if (sourceId) {

                var repository = ecm.model.desktop.repositories[0];

                repository.retrieveItem(sourceId, dojo.hitch(this, function(contentItem){

                    this.source = contentItem ;

                    var submitDate = contentItem.getDisplayValue("ESBD_SubmitDate");

                    this.sourceBox.innerHTML = contentItem.getValue("ESBD_InsuranceCertificateNumber") + " от " + submitDate;

                    this.sourceRow.style.display = "" ;

                    if (callback) {

                        callback();

                    }

                }));

            } else {

                this.source = null ;

                this.sourceRow.style.display = "none" ;

                if (callback) {

                    callback();

                }

            }

        },

        _retrieveSuccessor: function(callback) {

            var successorId = this.value.getValue("ESBD_Successor");

            if (successorId) {

                var repository = ecm.model.desktop.repositories[0];

                repository.retrieveItem(successorId, dojo.hitch(this, function(contentItem){

                    this.successor = contentItem ;

                    var submitDate = contentItem.getDisplayValue("ESBD_SubmitDate");

                    this.successorBox.innerHTML = contentItem.getValue("ESBD_InsuranceCertificateNumber") + " от " + submitDate;

                    this.successorRow.style.display = "" ;

                    if (callback) {

                        callback();

                    }

                }));

            } else {

                this.successor = null ;

                this.successorRow.style.display = "none" ;

                if (callback) {

                    callback();

                }

            }

        },

        _retrieveAll: function(callback) {

            var calls = [];

            calls.push(
                dojo.hitch(this, this._retrieveBranches),
                dojo.hitch(this, this._retrievePaymentTypes),
                dojo.hitch(this, this._retrieveSource),
                dojo.hitch(this, this._retrieveSuccessor)
            );

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

            this.loaded = false ;

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

                        this[attachPoint].set("value", this.value.getValue(attachPoint), null);

                    }

                }

            }

            if (!this.value.getValue("Id")) {

                // новый объект

                // выставляем текущую дату

                this.ESBD_SubmitDate.set("value", new Date());

                // выставляем дату начала

                var current = new Date();

                var startDate = new Date(current.getTime() + 86400000);

                this.ESBD_StartDate.set("value", startDate, false);

                // выставляем дату окончания

                var endDate = new Date(startDate.getTime());

                endDate.setFullYear(endDate.getFullYear() + 1);

                this.ESBD_EndDate.set("value", endDate, false);

                // скрываем часть свойств

                this.terminateDateRow.style.display = "none" ;

                this.terminateReasonRow.style.display = "none" ;

                this.returnOfPremiumRow.style.display = "none" ;

                this.statusRow.style.display = "none" ;

            } else {

                // показываем часть свойств

                this.terminateDateRow.style.display = "" ;

                this.terminateReasonRow.style.display = "" ;

                this.returnOfPremiumRow.style.display = "" ;

                this.statusRow.style.display = "" ;

            }

            for (var i = 0; i < this._attachPoints.length; i++) {

                var attachPoint = this._attachPoints[i];

                var disabled = this.readOnlyItems.indexOf(attachPoint) > -1 ? true : this.readOnly ;

                if (this[attachPoint].set) {

                    this[attachPoint].set("disabled", disabled);

                }

            }

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

        },

        _onStartDateChanged: function() {

            var startDate = this.ESBD_StartDate.get("value");

            var endDate = new Date(startDate.getTime());

            endDate.setFullYear(endDate.getFullYear() + 1);

            this.ESBD_EndDate.set("value", endDate, false);

        },

        _onSource: function() {

            if (this.source && this.source.hasAttribute("Id")) {

                var repository = ecm.model.desktop.repositories[0];

                repository.retrieveItem(this.source.getValue("Id"), dojo.hitch(this, function(contentItem){

                    this.onOpen(contentItem);

                }));

            }

        },

        _onSuccessor: function() {

            if (this.successor && this.successor.hasAttribute("Id")) {

                var repository = ecm.model.desktop.repositories[0];

                repository.retrieveItem(this.successor.getValue("Id"), dojo.hitch(this, function(contentItem){

                    this.onOpen(contentItem);

                }));

            }

        },

        onOpen: function(contentItem) {
        },

        _onCalculate: function() {

            this.onCalculate(dojo.hitch(this, function(callback){

                if (callback && callback.premium) {

                    this.ESBD_CalculatedPremium.set("value", callback.premium);

                    this.ESBD_Premium.set("value", callback.premium);

                    console.log("Расчет: ", callback.message);

                }

            }));

        },

        onCalculate: function(callback) {
        }

    });

});