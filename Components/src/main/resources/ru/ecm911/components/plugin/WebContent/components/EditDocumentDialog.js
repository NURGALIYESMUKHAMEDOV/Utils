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
    "dojo/text!./templates/EditDocumentDialog.html"
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

	return declare("components.EditDocumentDialog", [
		BaseDialog
	], {

		contentString: template,

		widgetsInTemplate: true,

		// версионирование
		versioning: true,

		// кнопка "Добавить"
		submitButton: null,

		// документ
		contentItem: null,

		// параметры
		params: null,

		// функция успешного добавления документа
		callback: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

            this.submitButton = this.addButton("Сохранить", "_onSubmit", false, true, "ADD");

		},

		show: function(contentItem, params, callback) {

		    this.contentItem = contentItem || this.contentItem ;

            this.params = params || this.params ;

            this.callback = callback || this.callback ;

            var configs = array.filter(this.params.classes, function(element){

                if (element.entryTemplate && typeof element.entryTemplate === "string") {

                    element.entryTemplate = new EntryTemplate({
                        repository: this.contentItem.repository,
                        id: element.entryTemplate
                    });

                }

                return element.contentClass == this.contentItem.template ;

            }, this);

            var config = configs[0] || {};

            if (!config.entryTemplate && this.contentItem.entryTemplateId) {

                config.entryTemplate = new EntryTemplate({
                    repository: repository,
                    id: this.contentItem.entryTemplateId
                });

            }

            if (!config.entryTemplate.isRetrieved) {

                config.entryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                    config.entryTemplate = entryTemplate ;

                    this._createRendering(config);

                }));

            } else {

                this._createRendering(config);

            }

            var result = this.inherited("show", []);

            this.resize();

            return result ;

		},

		// отрисовывает панель со свойствами
		_createRendering: function(config) {

            this.set("title", config.title);

            this.setIntroText(config.description);

            if (this.propertiesPane) {

                this.propertiesPane.clearRendering();

                this.propertiesPane.destroy();

                this.propertiesPane = null ;

            }

            var propertiesPaneClass = "ecm/widget/CommonPropertiesPane";

            if (config.entryTemplate && config.entryTemplate.layoutPropertiesPaneClass) {

                propertiesPaneClass = config.entryTemplate.layoutPropertiesPaneClass ;

            }

            require([
                propertiesPaneClass
            ], dojo.hitch(this, function(cls){

                this.propertiesPane = new cls();

                this.propertiesContainer.set("content", this.propertiesPane);

                var contentClass = this.contentItem.repository.getContentClass(config.contentClass);

                var privEditProperties = this.contentItem && this.contentItem.hasPrivilege("privEditProperties");

                this.propertiesPane.createRendering(
                    contentClass,
                    config.entryTemplate,
                    this.contentItem,
                    "editProperties",
                    !privEditProperties,
                    false,
                    dojo.hitch(this, function(callback){

                        this.resize();

                    }),
                    dojo.hitch(this, function(error){

                    })
                );

            }));

		},

		_onSubmit: function() {

		    var result = this.propertiesPane.validateAll(true, false);

		    if (result == "Error") {

		        this.propertiesPane._view.forEachProperty({
		            callback: dojo.hitch(this, function(property){

		                var editor = property.editorWidget ;

		                if (!editor.validate(true)) {

		                    var message = editor.getErrorMessage();

		                    editor.displayMessage(message, true);

		                }

		            })
		        });

		        return ;

		    }

		    var repository = this.contentItem.repository ;

            var properties = this.propertiesPane.getPropertiesJSON(true, true, false);

            console.log("properties: ", properties);

            var childComponentValues = this.propertiesPane.getChildComponentValues();

            var permissions = [];

            this.contentItem.retrievePermissions(dojo.hitch(this, function(callback){

                array.forEach(callback, function(permission){

                    permissions.push(permission.json());

                }, this);

                if (this.versioning) {

                    repository.lockItems([this.contentItem], dojo.hitch(this, function(result){

                        if (result) {

                            this.contentItem.checkIn(
                                this.contentItem.template,  // class name
                                properties,                 // properties
                                "Item",                     // content source type, "Item" - no content
                                null,                       // mime type
                                null,                       // filename
                                null,                       // content
                                childComponentValues,       // child component values
                                permissions,                // permissions
                                null,                       // security policy id
                                null,                       // new version
                                false,                      // checkin as minor version
                                false,                      // auto classify
                                dojo.hitch(this, function(contentItem) {

                                    if (this.callback) {

                                        this.callback(contentItem);

                                        this.hide();

                                    }

                                })
                            );

                        }

                    }));

                } else {

                    this.contentItem.saveAttributes(
                        properties,
                        null,                   // newTemplatename
                        childComponentValues,   // childComponentValues
                        permissions,            // permissions
                        false,                  // checkIn
                        dojo.hitch(this, function(result) {

                            if (this.callback) {

                                this.callback(result);

                                this.hide();

                            }

                        }),
                        false,                  // isBackgroundRequest
                        dojo.hitch(this, function(error) {
                        })

                    );

                }

            }));

		}

	});

});
