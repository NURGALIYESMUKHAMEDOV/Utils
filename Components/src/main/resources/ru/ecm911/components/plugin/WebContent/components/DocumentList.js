define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-style",
    "dojo/date/locale",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/form/Button",
    "ecm/widget/listView/ContentList",
    "ecm/widget/listView/gridModules/RowContextMenu",
    "ecm/model/SearchQuery",
    "ecm/model/SearchTemplateTreeModel",
    "ecm/model/ResultSet",
    "ecm/widget/search/SearchForm",
    "ecm/widget/search/SearchSelector",
    "ecm/widget/TitlePane",
    "./DocumentListSearchPane"
],function(
    declare,
    lang,
    array,
    domStyle,
    locale,
    ContentPane,
    BorderContainer,
    Button,
    ContentList,
    RowContextMenu,
    SearchQuery,
    SearchTemplateTreeModel,
    ResultSet,
    SearchForm,
    SearchSelector,
    TitlePane,
    DocumentListSearchPane
) {

    return declare("components.DocumentList", [
        BorderContainer
    ], {

        // выбранный репозиторий
        repository: null,

        // путь к папке с поисковыми запросами (фильтрами)
        searchTemplatesPath: null,

        // наименование панели инструментов
        toolbarDef: "ComponentsPlugin_DocumentListMenuType",

        // флаг указывает требуется ли сворачивать форму поиска при поиске?
        toggleSearchForm: false,

        // конфигурационные параметры в виде JSON объекта в формате
        // {
        //   "list" : {
        //     "toolbarDef": "панель инструментов",
        //     "searchTemplatesPath": "папка с шаблонами поиска"
        //   },
        //   "add" : {
        //     "title": "Заголовок при создании документа",
        //     "description": "Описание при создании документа",
        //     "entryTemplate": "Шаблон ввода при создании документа"
        //   },
        //   "modify": {
        //     "title": "Заголовок при измении документа",
        //     "description": "Описание при изменении документа",
        //     "entryTemplate": "Шаблон ввода при изменении документа"
        //   }
        // }
        params: null,

        postCreate: function() {

            this.inherited(arguments);

            domStyle.set(this.domNode, "height", "100%");

            this.searchFormPane = new TitlePane({
                title: "Параметры поиска",
                region: "top",
                resizeDuration: 0
            });

            dojo.connect(this.searchFormPane._wipeIn, "onEnd", this, "onResize");

            dojo.connect(this.searchFormPane._wipeOut, "onEnd", this, "onResize");

            var searchPane = new DocumentListSearchPane({

                repository: this.repository,

                searchTemplatesPath: this.params.list.searchTemplatesPath,

                onSearchCriteriaLoad: dojo.hitch(this, function(){

                    this.onResize();

                }),

                onSearchCompleted: dojo.hitch(this, function(resultSet){

                    resultSet.toolbarDef = this.params.list.toolbarDef || this.toolbarDef ;

                    this.contentList.setResultSet(resultSet);

                    if (this.toggleSearchForm) {

                        this.searchFormPane.toggle();

                    }

                    this.onResize();

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

                multiSelect: this.params.list.multiSelect || false,

                onRowDblClick: dojo.hitch(this, function(item, evt){

                    if (this.onOpen) {

                        this.onOpen(item, this.params.modify);

                    }

                }),

                onRowSelectionChange: dojo.hitch(this, function(selectedItems){

                    this.onSelectionChange(selectedItems);

                })

            });

            contentList.setContentListModules(this._getContentListModules());

            var resultSet = new ResultSet({

                toolbarDef: this.params.list.toolbarDef || this.toolbarDef,

                repository: this.repository

            });

            contentList.setResultSet(resultSet);

            return contentList ;

        },

        _getContentListModules: function() {

            var modules = [];

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

                var self = this ;

                modules.push({
                    moduleClass: Bar,
                    top: [
                        [
                            [
                                {
                                    moduleClass: Toolbar,
                                    showActionsButton: false,
                                    createToolbar: function() {

                                        var t = this ;

                                        var cl = t.contentList ;

                                        var resultSet = cl.getResultSet();

                                        t.toolbar.toolbarName = resultSet.getToolbarDef();

                                        t.toolbar.createToolbar({
                                            contentList: cl,
                                            resultSet: resultSet,
                                            callbackMap: function() {
                                                self.onActionPerformed.apply(self, arguments);
                                            },
                                            parameterMap: {
                                                widget: self
                                            }
                                        });

                                    },
                                    onToolbarButtonsCreated: function(toolbarButtons){

                                        /*

                                        array.forEach(toolbarButtons, function(toolbarButton){

                                            if (toolbarButton.params && toolbarButton.params.parameterMap) {

                                                var parameterMap = toolbarButton.params.parameterMap ;

                                                parameterMap.widget = self ;

                                            }

                                        }, this);

                                        */

                                    }

                                },
                                {
                                    moduleClasses: viewModules,
                                    className: "BarViewModules"
                                }
                            ]
                        ],
                    ]
                });

                modules.push({
                    moduleClass: DocInfo,
                    selectAutoOpen: true,
                    showSystemProps: false
                });

            }));

            return modules ;

        },

        onSelectionChange: function(selectedItems) {

            // вызывается при изменении выбора объекта в списке

        },

        getSelectedItems: function() {

            return this.contentList.getSelectedItems();

        },

        onActionPerformed: function(action) {


        }



    });

});