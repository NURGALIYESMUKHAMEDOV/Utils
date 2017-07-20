/**
 * Диалоговое окно для работы с
 * информацией о клиенте
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/sniff",
    "dojo/_base/array",
    "dojo/aspect",
    "dojo/_base/json",
    "ecm/model/Request",
    "ecm/model/Comment",
    "ecm/model/EntryTemplate",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/dialog/YesNoCancelDialog",
    "ecm/widget/ContentClassSelector",
    "dojo/text!./templates/AddVehicleDialog.html"
], function(
    declare,
    lang,
    has,
    array,
    aspect,
    json,
    Request,
    Comment,
    EntryTemplate,
    BaseDialog,
    YesNoCancelDialog,
    ContentClassSelector,
    template)
{

	return declare("esbd.vehicle2.AddVehicleDialog", [
		BaseDialog
	], {

		contentString: template,

		widgetsInTemplate: true,

		submitButton: null,

        // конфигурация диалогового окна в виде
        // {
        //    "searchTemplatesPath": "/пусть к папке с поисковыми шаблонами",
        //    "contentClass": "класс объекта, типа ecm.model.ContentClass",
        //    "viewEntryTemplate": "объект шаблон ввода для отображения информации, тип ecm.model.EntryTemplate",
        //    "addEntryTemplate": "шаблон ввода для добавления объекта, тип ecm.model.EntryTemplate
        // }
        config: null,

		repository: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

            this.submitButton = this.addButton("Добавить", "_onSubmit", false, true, "ADD");

            this.set("Новый объект");

            this.setIntroText("Новый объект");

            if (!this.repository) {

                this.repository = ecm.model.desktop.repositories[0];

            }

            this._createRendering()

		},

        // отрисовываем форму в соответствии с клаос документа и его шаблоном ввода

        _createRendering: function() {

            if (this.propertiesPane) {

                this.propertiesPane.clearRendering();

                this.propertiesPane.destroy();

                this.propertiesPane = null ;

            }

            var renderAttributes = dojo.hitch(this, function() {

                var propertiesPaneClass = "ecm/widget/CommonPropertiesPane";

                if (this.config.addEntryTemplate && this.config.addEntryTemplate.layoutPropertiesPaneClass) {

                    propertiesPaneClass = this.config.addEntryTemplate.layoutPropertiesPaneClass ;

                }

                require([
                    propertiesPaneClass
                ], dojo.hitch(this, function(cls){

                    this.propertiesPane = new cls();

                    this.propertiesContainer.set("content", this.propertiesPane);

                    this.propertiesPane.createRendering(
                        this.config.contentClass,
                        this.config.addEntryTemplate,
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

            });

            if (this.config.addEntryTemplate.isRetrieved) {

                renderAttributes();

            } else {

                this.config.addEntryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                    this.config.addEntryTemplate = entryTemplate ;

                    renderAttributes();

                }), false, true);

            }

        },

        // Сохраняем документ

		_onSubmit: function() {

		    var result = this.propertiesPane.validateAll(false, true);

		    if (result) {

		        return ;

		    }

            if (this._addingDocument) {

                return;

            }

            this._addingDocument = true;

            var request ;

            var completedHandler = aspect.after(ecm.model.desktop, "onRequestCompleted", dojo.hitch(this, function(completedRequest) {

                if (!request || !request.isSameRequestAs(completedRequest)) {

                    return;

                }


                delete this._addingDocument;

                completedHandler.remove();

            }), true);

		    var parentFolder = this.config.addEntryTemplate.folder ;

		    var properties = this.propertiesPane.getPropertiesJSON(true, true, false);

		    var permissions = this.config.addEntryTemplate.permissions;

		    permissions = array.map(permissions, function(permission){

		        return permission.json();

		    }, this);

            request = this.repository.addDocumentItem(
                parentFolder,
                this.repository.objectStore,
                this.config.contentClass.id,    // имя класса
                properties,                     // свойства
                "Item",                         // contentSourceType
                null,                           // mimetype
                null,                           // filename
                null,                           // content
                [],                             // childComponentValues (CM only)
                permissions,
                null,                           // securityPolicyId
                false,                          // addAsMinorVersion
                false,                          // autoClassify
                false,                          // allowDuplicateFileNames
                false,                          // setSecurityParent
                null,                           // teamspaceId
                lang.hitch(this, function(contentItem){

                    this.onAdd(contentItem);

                }),
                false,                          // isBackgroundRequest
                lang.hitch(this, function(error){
                                                // error
                }),
                false                           // compoundDocument
            );

            if (!request) {

                if (completedHandler) {

                    completedHandler.remove();
                }

                delete this._addingDocument;
            }

		},

        onAdd: function(contentItem) {
        }

	});

});
