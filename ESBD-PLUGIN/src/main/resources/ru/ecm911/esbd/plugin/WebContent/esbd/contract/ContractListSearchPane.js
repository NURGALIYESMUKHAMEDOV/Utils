define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/date/locale",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/form/Button",
    "ecm/widget/ValidationTextBox",
    "ecm/widget/DatePicker",
    "ecm/model/SearchTemplateTreeModel",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/ContractListSearchPane.html"
],function(
    declare,
    lang,
    locale,
    BorderContainer,
    ContentPane,
    Button,
    ValidationTextBox,
    DatePicker,
    SearchTemplateTreeModel,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template
) {

    return declare("esbd.contract.ContractListSearchPane", [
        _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,
        widgetsInTemplate: true,
        repository: null,
        searchTemplates: null,

        postCreate: function() {

            this.inherited(arguments);

            if (!this.repository) {

                this.repository = ecm.model.desktop.repositories[0];

            }

            this._retrieveSearchTemplates();

        },

        _retrieveSearchTemplates: function() {

            this.repository.retrieveItem(
                "/Конфигурация/Поиск/Страховые договора",
                dojo.hitch(this, function(item){

                    item.retrieveFolderContents(
                        false,
                        dojo.hitch(this, function(resultSet){

                            var isSelected = false ;

                            this.searchTemplates = [];

                            this.searchSelector.removeOption(this.searchSelector.getOptions());

                            for (var i in resultSet.items) {

                                var item = resultSet.items[i];

                                this.searchSelector.addOption({
                                    label: item.getValue("{NAME}"),
                                    value: item.id
                                });

                                if (!isSelected) {

                                    this.onSelect(item.id);

                                    isSelected = true ;

                                }

                            }

                        })

                    )

                })

            );

        },

        onSelect: function(value) {

            console.log("onSelect, value: ", value);

            if (this.searchTemplates[value]) {

                this.searchForm.setSearchTemplate(this.searchTemplates[value]);

            } else {

                this.repository.retrieveSearchTemplate(
                    value,
                    null,
                    "released",
                     dojo.hitch(this, function(searchTemplate){

                        this.searchTemplates[value] = searchTemplate ;

                        this.searchForm.setSearchTemplate(this.searchTemplates[value]);

                     })

                );

            }

        },

    });

});