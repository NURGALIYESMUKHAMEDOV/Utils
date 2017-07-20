/**
 * Поисковая форма для работы со списоком
 * физических лиц. Значение для поисковой
 * формы, объект со следующей структурой:
 * {
 *   IIN: '<ИИН>',
 *   lastName: '<Фамилия>',
 *   firstName: '<Имя>',
 *   birthday: <дата рождения>
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
    "dojo/text!./templates/PersonListSearchPane.html"
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

    return declare("esbd.person.PersonListSearchPane", [
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
                this.IIN.set("value", this.value.IIN);
                this.lastName.set("value", this.value.lastName);
                this.firstName.set("value", this.value.firstName);
                this.birthday.set("value", this.value.birthday);
            }

        },

        _getLocalValue: function() {

            this.value = {
                IIN : this.IIN.get("value"),
                lastName: this.lastName.get("value"),
                firstName: this.firstName.get("value"),
                birthday: this.birthday.get("value")
            };

        },

        _onSearch: function() {

            this.onSearch(this.getValue());

        },

        onSearch: function(payload) {
        },

        onReset: function() {
            this.IIN.set("value", null);
            this.lastName.set("value", null);
            this.firstName.set("value", null);
            this.birthday.set("value", null);
        },

    });

});