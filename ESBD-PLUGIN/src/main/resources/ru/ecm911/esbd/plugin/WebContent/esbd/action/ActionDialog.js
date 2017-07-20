/**
 * Диалоговое окно для выполнения действия
 * над объектом
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/sniff",
    "dojo/_base/array",
    "dojo/aspect",
    "dojo/_base/json",
    "dojo/json",
    "dojo/dom-geometry",
    "ecm/model/Request",
    "ecm/model/Comment",
    "ecm/model/EntryTemplate",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/dialog/YesNoCancelDialog",
    "ecm/widget/ContentClassSelector",
    "dojo/text!./templates/ActionDialog.html"
], function(
    declare,
    lang,
    has,
    array,
    aspect,
    json,
    dojoJson,
    domGeom,
    Request,
    Comment,
    EntryTemplate,
    BaseDialog,
    YesNoCancelDialog,
    ContentClassSelector,
    template)
{

	return declare("esbd.action.ActionDialog", [
		BaseDialog
	], {

		contentString: template,

		widgetsInTemplate: true,

		// кнопка сохранения (выполнения) действия над объектом
		_submitButton: null,

		// объект над которым выполняется действие
		contentItem: null,

		// определение класса документа действия
		contentClass: null,

		// шаблон ввода документа данных действия
		entryTemplate: null,

		repository: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(false);

			this.setResizable(true);

			this.setSize(600, 400);

            this.submitButton = this.addButton("Выполнить", "_onSubmit", false, true, "SUBMIT");

		},

        show: function(params) {

            this.repository = params.repository || this.repository ;

            this.entryTemplate = params.entryTemplate || this.entryTemplate ;

            this.contentClass = params.contentClass || this.contentClass ;

            this.contentItem = params.contentItem || this.contentItem ;

            this.onSuccess = params.onSuccess || this.onSuccess ;

            if (params.title) {

                this.set("title", params.title);

            }

            if (params.description) {

                this.setIntroText(params.description);

            }

            if (this.entryTemplate.isRetrieved) {

                this._createRendering();

            } else {

                this.entryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                    this.entryTemplate = entryTemplate ;

                    this._createRendering();

                }));

            }

            var result = this.inherited("show", []);

            this.resize();

            return result ;

        },

        _clearRendering: function() {

            if (this.propertiesPane) {

                this.propertiesPane.clearRendering();

                this.propertiesPane.destroy();

                this.propertiesPane = null ;

            }

        },

        _createRendering: function() {

            this._clearRendering();

            var propertiesPaneClass = "ecm/widget/CommonPropertiesPane";

            if (this.entryTemplate && this.entryTemplate.layoutPropertiesPaneClass) {

                propertiesPaneClass = this.entryTemplate.layoutPropertiesPaneClass ;

            }

            require([
                propertiesPaneClass
            ], dojo.hitch(this, function(cls){

                this.propertiesPane = new cls();

                this.contentPane.addChild(this.propertiesPane);

                this.propertiesPane.createRendering(
                    this.contentClass,
                    this.entryTemplate,
                    null,
                    "create",
                    false,
                    false,
                    dojo.hitch(this, function(callback){

                    }),
                    dojo.hitch(this, function(error){

                    })
                );

            }));

        },

        // Сохраняем документ

		_onSubmit: function() {

		    console.log("[ActionDialog] _onSubmit");

		    var result = this.propertiesPane.validateAll(false, false);

		    var properties = this.propertiesPane.getPropertiesJSON(true, true, false);

		    if (this.contentItem) {

                array.forEach(properties, function(property){

                    if (property.name == "ESBD_ObjectId") {

                        property.value = this.contentItem.id.split(",")[2];

                    }

                }, this);

            }

            console.log("[ActionDialog] addDocumentItem");

            this.repository.addDocumentItem(
                null,
                this.repository.objectStore,
                this.contentClass.id,           // имя класса
                properties,                     // свойства
                "Item",                         // contentSourceType
                null,                           // mimetype
                null,                           // filename
                null,                           // content
                [],                             // childComponentValues (CM only)
                null,                           // permissions
                null,                           // securityPolicyId
                false,                          // addAsMinorVersion
                false,                          // autoClassify
                false,                          // allowDuplicateFileNames
                false,                          // setSecurityParent
                null,                           // teamspaceId
                lang.hitch(this, function(contentItem){

                    console.log("[ActionDialog] onSuccess, this: ", this);

                    if (this.onSuccess) {

                        this.onSuccess();

                    }

                }),
                false,                          // isBackgroundRequest
                lang.hitch(this, function(error){
                                                // error
                }),
                false                           // compoundDocument
            );

		},

	});

});
