/**
 * Поисковая форма для работы со списоком
 * ОГПО. Значение для поисковой
 * формы, объект со следующей структурой:
 * {
 *   insuranceNumber: '<Номер страхового полиса>',
 *   submitDateFrom: <дата заключения страхового полиса>
 *   submitDateTo: <дата заключения страхового полиса>
 * }
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/date/locale",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/form/Button",
    "ecm/widget/ValidationTextBox",
    "ecm/widget/DatePicker",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/InsuranceListSearchPane.html"
],function(
    declare,
    lang,
    locale,
    BorderContainer,
    ContentPane,
    Button,
    ValidationTextBox,
    DatePicker,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template
) {

    return declare("esbd.contract.insurance.InsuranceListSearchPane", [
        _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,
        widgetsInTemplate: true,
        value: null,

        postCreate: function() {

            this.inherited(arguments);

        },

        setValue: function(value) {

            this.value = value ;

            this._setLocalValue();

        },

        getValue: function() {

            this._getLocalValue();

            return this.value ;

        },

        _setLocalValue: function() {

            if (this.value) {
                this.insuranceNumber.set("value", this.value.insuranceNumber);
                this.submitDateFrom.set("value", this.value.submitDateFrom);
                this.submitDateTo.set("value", this.value.submitDateTo);
            }

        },

        _getLocalValue: function() {

            this.value = {
                insuranceNumber : this.insuranceNumber.get("value"),
                submitDateFrom: this.submitDateFrom.get("value"),
                submitDateTo: this.submitDateTo.get("value")
            };

        },

        _onSearch: function() {

            this.onSearch(this.getValue());

        },

        onSearch: function(payload) {
        },

        onReset: function() {
            this.insuranceNumber.set("value", null);
            this.submitDateFrom.set("value", null);
            this.submitDateTo.set("value", null);
        },

    });

});