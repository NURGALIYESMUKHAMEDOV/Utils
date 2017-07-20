define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-style",
    "dojo/date/locale",
    "dijit/MenuItem",
    "dijit/layout/ContentPane",
    "ecm/model/SearchQuery",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/CompanyBox.html"
],function(
    declare,
    lang,
    array,
    domStyle,
    locale,
    MenuItem,
    ContentPane,
    SearchQuery,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template
) {

    return declare("esbd.CompanyBox", [
        _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,

        widgetsInTemplate: true,

        repository: null,

        // компонент инициализирован?
        _initialized: false,

        // выбранный департамент
        selectedItem: null,

        // массив элементов @ecm.model.ContentItem
        items: null,

        // инициализирует компонент
        initialize: function(repository) {

            this.repository = repository ;

            this._clearCompanies();

            this._retrieveCompanies();

        },

        _clearCompanies: function() {

            var children = this._companyOptions.getChildren();

            array.forEach(children, function(child){

                this._companyOptions.removeChild(child);

            }, this);

            delete this.items ;

            delete this.selectedItem ;

        },

        // получает список доступных пользователю отделов
        _retrieveCompanies: function() {

            var query = "SELECT [This], [FolderName], [ESBD_CompanyName], [ESBD_CompanyCode], [Id], [ClassDescription] FROM [ESBD_Company]" ;

            var searchQuery = new SearchQuery({
                query : query,
                resultsDisplay: {
                    columns: ["ESBD_CompanyName", "ESBD_CompanyCode", "Id"]
                },
                repository: this.repository
            });

            searchQuery.search(dojo.hitch(this, function(resultSet){

                if (resultSet && resultSet.items) {

                    this._initialized = true ;

                    this.items = resultSet.items ;

                    array.forEach(this.items, function(item){

                        var menuItem = new MenuItem({
                            label: item.getValue("ESBD_CompanyName"),
                            onClick: dojo.hitch(this, function(){
                                this.onChange(item);
                            })
                        })

                        this._companyOptions.addChild(menuItem);

                    }, this);

                    if (this.items.length > 0) {

                        this.selectedItem = this.items[0];

                        this.onChange(this.selectedItem);

                    }

                }

            }));

        },

        getSelectedItem: function() {

            return this.selectedItem ;

        },

        // вызывается при выборе компании из списка
        onChange: function(selectedItem) {

            this._companyNode.set("label", selectedItem.getValue("ESBD_CompanyName"));

            this._companyNode.closeDropDown();

        }

    });

});