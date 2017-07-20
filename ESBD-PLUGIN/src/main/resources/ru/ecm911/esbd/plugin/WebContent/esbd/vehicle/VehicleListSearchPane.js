/**
 * Поисковая форма для работы со списоком
 * транспортных средств. Значение для поисковой
 * формы, объект со следующей структурой:
 * {
 *   VIN: '<VIN>',
 *   VRN: '<Гос номер>'
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
    "dojo/text!./templates/VehicleListSearchPane.html"
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

    return declare("esbd.vehicle.VehicleListSearchPane", [
        _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,
        widgetsInTemplate: true,
        value: null,

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
                this.VIN.set("value", this.value.VIN);
                this.VRN.set("value", this.value.VRN);
            }

        },

        _getLocalValue: function() {

            this.value = {
                VIN: this.VIN.get("value"),
                VRN: this.VRN.get("value")
            };

        },

        _onSearch: function() {

            this.onSearch(this.getValue());

        },

        onSearch: function(payload) {
        },

        onReset: function() {
            this.VIN.set("value", null);
            this.VRN.set("value", null);
        },

    });

});