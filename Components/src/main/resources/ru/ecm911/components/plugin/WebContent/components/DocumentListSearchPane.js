define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/date/locale",
    "dojo/dom-style",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/form/Button",
    "ecm/widget/ValidationTextBox",
    "ecm/widget/DatePicker",
    "ecm/model/SearchTemplateTreeModel",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/DocumentListSearchPane.html"
],function(
    declare,
    lang,
    locale,
    domStyle,
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

    return declare("components.DocumentListSearchPane", [
        _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,

        widgetsInTemplate: true,

        // выбранный репозиторий
        repository: null,

        // список поисковых шаблонов (кеш)
        searchTemplatesCache: null,

        // путь к папке с поисковыми шаблонами
        searchTemplatesPath: null,

        postCreate: function() {

            this.inherited(arguments);

            this._retrieveSearchTemplates();

        },

        _retrieveSearchTemplates: function() {

            if (this.repository) {

                this.repository.retrieveItem(

                    this.searchTemplatesPath,

                    dojo.hitch(this, function(folder){

                        folder.retrieveFolderContents(

                            false,

                            dojo.hitch(this, function(resultSet){

                                this.searchTemplatesCache = [];

                                this.searchSelector.removeOption(this.searchSelector.getOptions());

                                var selected = false ;

                                for (var i in resultSet.items) {

                                    var item = resultSet.items[i];

                                    this.searchSelector.addOption({
                                        label: item.getValue("{NAME}"),
                                        value: item.id
                                    });

                                    if (!selected) {

                                        selected = true;

                                        this.onSelect(item.id);

                                    }

                                }

                            })

                        )

                    })
                );

            }

        },

        search: function() {

            this.searchForm._search();

        },

        onSelect: function(value) {

            if (this.searchTemplatesCache[value]) {

                this.searchForm.setSearchTemplate(this.searchTemplatesCache[value]);

                this.searchForm._search();

            } else {

                this.repository.retrieveSearchTemplate(
                    value,
                    null,
                    "released",
                     dojo.hitch(this, function(searchTemplate){

                        this.searchTemplatesCache[value] = searchTemplate ;

                        this.searchForm.setSearchTemplate(this.searchTemplatesCache[value]);

                        this.searchForm._search();

                     })

                );

            }

        },

    });

});