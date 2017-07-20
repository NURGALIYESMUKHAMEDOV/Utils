/**
 * Компонент обеспечивает поиск и выбор
 * страховых случаем
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/date/locale",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "esbd/cases/CaseListSearchPane",
    "ecm/widget/listView/ContentList",
    "ecm/widget/listView/gridModules/RowContextMenu",
    "ecm/model/SearchQuery",
    "ecm/model/SearchTemplateTreeModel",
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
    CaseListSearchPane,
    ContentList,
    RowContextMenu,
    SearchQuery,
    SearchTemplateTreeModel,
    SearchForm,
    SearchSelector,
    TitlePane
) {

    return declare("esbd.cases.CaseList", [
        BorderContainer
    ], {

        repository: null,

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

            var caseListSearchPane = new CaseListSearchPane({

                onSearchCriteriaLoad: dojo.hitch(this, function(){

                    this.resize();

                }),

                onSearchCompleted: dojo.hitch(this, function(resultSet){

                    console.log("[CaseList] resultSet: ", resultSet);

                    resultSet.toolbarDef = "ESBD_CaseListMenuType" ;

                    this.contentList.setResultSet(resultSet);

                    this.searchFormPane.toggle();

                })

            });

            this.searchFormPane.addChild(caseListSearchPane);

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
                })
            });

            contentList.setContentListModules(this._getContentListModules());

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

                viewModules.push(ViewFilmStrip);

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

            console.log("[CaseList] onOpen, contentItem: ", contentItem);

        },

        _onAdd: function() {

            console.log("Добавить!!");

        }

    });

});