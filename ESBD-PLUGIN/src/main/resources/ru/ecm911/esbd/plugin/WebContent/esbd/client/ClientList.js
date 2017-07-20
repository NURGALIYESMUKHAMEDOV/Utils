/**
 * Компонент обеспечивает поиск и выбор
 * физических или юридических лиц
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/date/locale",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "esbd/client/ClientListSearchPane",
    "esbd/client/AddClientDialog",
    "ecm/widget/listView/ContentList",
    "ecm/widget/listView/gridModules/RowContextMenu",
    "ecm/model/SearchQuery",
    "ecm/model/SearchTemplateTreeModel",
    "ecm/model/ResultSet",
    "ecm/widget/search/SearchForm",
    "ecm/widget/search/SearchSelector",
    "ecm/widget/TitlePane"
],function(
    declare,
    lang,
    domStyle,
    locale,
    ContentPane,
    BorderContainer,
    ClientListSearchPane,
    AddClientDialog,
    ContentList,
    RowContextMenu,
    SearchQuery,
    SearchTemplateTreeModel,
    ResultSet,
    SearchForm,
    SearchSelector,
    TitlePane
) {

    return declare("esbd.client.ClientList", [
        BorderContainer
    ], {

        repository: null,

        // конфигурация диалогового окна в виде
        // {
        //    "searchTemplatesPath": "/пусть к папке с поисковыми шаблонами",
        //    "contentClass": "класс объекта, типа ecm.model.ContentClass",
        //    "viewEntryTemplate": "объект шаблон ввода для отображения информации, тип ecm.model.EntryTemplate",
        //    "addEntryTemplate": "шаблон ввода для добавления объекта, тип ecm.model.EntryTemplate
        // }
        config: null,

        postCreate: function() {

            this.inherited(arguments);

            domStyle.set(this.domNode, "height", "100%");

            if (!this.repository) {

                this.repository = ecm.model.desktop.repositories[0];

            }

            this.searchFormPane = new TitlePane({
                title: "Параметры поиска",
                region: "top",
                resizeDuration: 0
            });

            dojo.connect(this.searchFormPane._wipeIn, "onEnd", this, "onResize");

            dojo.connect(this.searchFormPane._wipeOut, "onEnd", this, "onResize");

            var searchPane = new ClientListSearchPane({

                searchTemplatesPath: this.config.searchTemplatesPath,

                onSearchCriteriaLoad: dojo.hitch(this, function(){

                    this.resize();

                }),

                onSearchCompleted: dojo.hitch(this, function(resultSet){

                    resultSet.toolbarDef = "ESBD_ClientListMenuType" ;

                    resultSet.onAdd = dojo.hitch(this, this._onAdd);

                    this.contentList.setResultSet(resultSet);

                    this.searchFormPane.toggle();

                })

            });

            this.searchFormPane.addChild(searchPane);

            this.addChild(this.searchFormPane);

            this.searchResultsPane = new TitlePane({
                title: "Результаты поиска",
                region: "center"
            });

            dojo.connect(this.searchResultsPane._wipeIn, "onEnd", this, "resize");

            dojo.connect(this.searchResultsPane._wipeOut, "onEnd", this, "resize");

            this.contentList = this._createContentList();

            this.searchResultsPane.addChild(this.contentList);

            domStyle.set(this.contentList.domNode, "height", "300px");

            this.addChild(this.searchResultsPane);

        },

        onResize: function() {

            this.resize();

            var height = this.searchResultsPane.domNode.clientHeight ;

            domStyle.set(this.contentList.domNode, "height", height + "px");

            this.resize();

        },

        onSearchTemplateSelected: function(searchTemplate) {

            this.searchForm.setSearchTemplate(searchTemplate);

        },

        onSearchCompleted: function(resultSet) {


        },

        _createContentList: function() {

            var contentList = new ContentList({
                multiSelect: false,
                onRowDblClick: dojo.hitch(this, function(item, evt){
                    this.onOpen(item);
                }),
                onRowSelectionChange: dojo.hitch(this, function(selectedItems){
                    this.onSelectionChange(selectedItems);
                })
            });

            contentList.setContentListModules(this._getContentListModules());

            var resultSet = new ResultSet({

                toolbarDef: "ESBD_ClientListMenuType",

                repository: this.repository,

                onAdd: dojo.hitch(this, this._onAdd)

            });

            contentList.setResultSet(resultSet);

            return contentList ;

        },

        _getContentListModules: function() {

            var array = [];

            require([
                "ecm/widget/listView/modules/Breadcrumb",
                "ecm/widget/listView/modules/Toolbar2",
                "ecm/widget/listView/modules/DocInfo",
                "ecm/widget/listView/modules/Bar",
                "ecm/widget/listView/modules/ViewDetail",
                "ecm/widget/listView/modules/ViewMagazine",
                "ecm/widget/listView/modules/ViewFilmStrip",
            ], dojo.hitch(this, function(
                Breadcrumb,
                Toolbar,
                DocInfo,
                Bar,
                ViewDetail,
                ViewMagazine,
                ViewFilmStrip
            ){

                var viewModules = [];

                viewModules.push(ViewDetail);

                viewModules.push(ViewMagazine);

                array.push({
                    moduleClass: Bar,
                    top: [
                        [
                            [
                                {
                                    moduleClass: Toolbar,
                                    "showActionsButton": false
                                },
                                {
                                    moduleClasses: viewModules,
                                    "className": "BarViewModules"
                                }
                            ]
                        ],
                    ]
                });

                array.push({
                    moduleClass: DocInfo,
                    selectAutoOpen: true,
                    showSystemProps: false
                });

            }));

            return array ;

        },

        onOpen: function(contentItem) {

            console.log("[PersonList] onOpen, contentItem: ", contentItem);

        },

        onSelectionChange: function(selectedItems) {

            // вызывается при изменении выбора объекта в списке

        },

        _onAdd: function() {

            var dialog = new AddClientDialog({

                config: this.config,

                onAdd: dojo.hitch(this, function(contentItem) {

                    console.log("onAdd, contentItem: ", contentItem);

                    dialog.hide();

                    this.onSelect(contentItem);

                })

            });

            dialog.show();

        },

        getSelectedItems: function() {

            return this.contentList.getSelectedItems();

        },

        onSelect: function(contentItem) {
        }

    });

});