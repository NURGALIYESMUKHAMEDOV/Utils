/**
 * Поисковая форма для работы со списоком
 * страховых компаний. Значение для поисковой
 * формы, объект со следующей структурой:
 * {
 *   name: '<Наименование>'
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
    "dojo/text!./templates/CompanyListSearchPane.html"
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

    return declare("esbd.company.CompanyListSearchPane", [
        _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,
        widgetsInTemplate: true,

        postCreate: function() {

            this.inherited(arguments);

        },

        _onSearch: function() {

            var payload = {
                name: this.name.get("value")
            };

            this.onSearch(payload);

        },

        onSearch: function(payload) {
        },

        onReset: function() {
            this.name.set("value", null);
        },

    });

});