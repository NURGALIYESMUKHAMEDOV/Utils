define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "dijit/form/Button",
    "ecm/widget/TitlePane",
    "ecm/widget/ValidationTextBox",
    "ecm/widget/DatePicker",
    "ecm/widget/listView/ContentList",
    "ecm/widget/listView/gridModules/RowContextMenu",
    "ecm/model/SearchQuery",
    "ecm/widget/layout/_LaunchBarPane",
    "dojo/text!./templates/RegistryList.html"
],function(
    declare,
    lang,
    ContentPane,
    Button,
    TitlePane,
    ValidationTextBox,
    DatePicker,
    ContentList,
    RowContextMenu,
    SearchQuery,
    _LaunchBarPane,
    template
) {

    return declare("docs.registry.RegistryList", [
        _LaunchBarPane
    ], {

        templateString: template,
        widgetsInTemplate: true,
        searchCriteria: null,
        rendered: false,

        postCreate: function() {

            console.log("RegistryList.postCreate");

            this.list.setGridExtensionModules(this._getContentListGridModules());

                /**

            this.list.onRowDblClick = dojo.hitch(this, function(item, evt){

                console.log(item);

                item.retrieveStepParameters(dojo.hitch(this, function(result){

                    console.log("retrieved!!");

                    console.log(result.getWorkClass());

                    var inboxItemPane = new InboxItemPane();

                    console.log("create inbox item pane!!");

                    inboxItemPane.setItem(result);

                    console.log("set item done!!");

                    var tab = new ContentPane({
                        title: result.name,
                        closable: true
                    });

                    tab.set("content", inboxItemPane);

                    console.log("create tab done");

                    console.log("append content done !!");

                    this.tabs.addChild(tab);

                    this.tabs.selectChild(tab);

                }));

            });

                */

                /*

            var repository = ecm.model.desktop.repositories[0];

            if (repository.connected) {

                repository.retrieveWorklistContainers(dojo.hitch(this,function(applicationSpaces){

                    var applicationSpace = applicationSpaces[0];

                    applicationSpace.retrieveWorklists(dojo.hitch(this,function(roles){

                        var role = roles[0];

                        role.retrieveWorklists(dojo.hitch(this, function(inbaskets){

                            var inbasket = inbaskets[0];

                            inbasket.retrieveWorkItems(dojo.hitch(this,function(resultSet){

                                this.inbox.setResultSet(resultSet);

                            }));

                        }), true);

                    }), false, "write", false, function(error){

                        console.log(error);

                    });

                }), false);

            }

                */

        },

        setSearchCriteria: function(searchCriteria) {

            this.searchCriteria = searchCriteria ;

        },

        render: function() {

            this.logEntry("render");

            if (this.searchCriteria && !this.rendered) {

                // retrieve items

                this.rendered = true;

            }

            this.logExit("render");

        },

        onSearchSubmit: function(evt) {

            console.log("-> onSearchSubmit()");

            var repository = ecm.model.desktop.repositories[0];

            console.log("  repository: ", repository);

            if (repository.connected) {

                var searchQuery = new SearchQuery({
                    query : "SELECT [This], [FolderName], [DmFolderCode], [DmRetentionPeriod], [DmRetentionClause], [ClassDescription] FROM [DmFolder] WHERE [This] INSUBFOLDER '/Номенклатура дел/2015' ORDER BY [DmFolderCode]",
                    resultsDisplay: {
                        columns: ["{NAME}", "DmFolderCode", "DmRetentionPeriod", "DmRetentionClause"]
                    },
                    repository: repository
                });

                console.log("  searchQuery: ", searchQuery);

                searchQuery.search(lang.hitch(this, function(resultSet){

                    var cells = [
                        {
                            width: "5em",
                            sortable: false,
                            field: "DmFolderCode",
                            name: "Индекс"
                        },
                        {
                            width: "auto",
                            sortable: false,
                            field: "{NAME}",
                            name: "Заголовок"
                        },
                        {
                            width: "10em",
                            sortable: false,
                            field: "DmRetentionPeriod",
                            name: "Срок хранения"
                        },
                        {
                            width: "10em",
                            sortable: false,
                            field: "DmRetentionClause",
                            name: "Статья хранения"
                        }
                    ];

                    var columns = {
                        cells: [cells]
                    };

                    // console.log("  columns: ", resultSet.getColumns());

                    // console.log("  new columns: ", columns);

                    resultSet.setColumns(columns);

                    // resultSet.refresh();

                    // console.log("  new resultSet: ", resultSet);

                    this.list.setResultSet(resultSet);

                }));

            }

            var criteria = {
                code: this.code.getValue(),
                unit: this.unit.getValue()
            };

        },

        onSearchReset: function(evt) {

            console.log("-> onSearchReset()");

            this.code.setValue(null);

            this.unit.setValue(null);

        },

        onRecord: function(evt) {

            console.log("onRecord!!!!");

        },

        _getContentListGridModules: function() {

            var modules = [];

            modules.push({
                moduleClass: RowContextMenu,
                performDefaultActionForItem: lang.hitch(this, this._performDefaultActionForItem)
            });

            return modules;

        },

        _performDefaultActionForItem: function() {

            console.log("default action!");

        }

    });

});