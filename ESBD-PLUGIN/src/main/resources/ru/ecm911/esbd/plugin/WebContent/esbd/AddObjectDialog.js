define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/sniff",
    "dojo/aspect",
    "dojo/_base/json",
    "ecm/model/Request",
    "ecm/model/Comment",
    "ecm/model/EntryTemplate",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/dialog/YesNoCancelDialog",
    "ecm/widget/ContentClassSelector",
    "dojo/text!./templates/AddObjectDialog.html"
], function(
    declare,
    lang,
    has,
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

	return declare("esbd.AddObjectDialog", [
		BaseDialog
	], {

		contentString: template,

		widgetsInTemplate: true,

		submitButton: null,

        // класс, тип ecm.model.ContentClass
        contentClass: null,

        // редактируемый документа, тип ecm.model.ContentItem
        contentItem: null,

        // шаблон ввода
		entryTemplate: null,

        // текущий выбранный репозиторий
		repository: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

            this.submitButton = this.addButton("Добавить", "_onSubmit", false, true, "ADD");

		},

		// отображает диалог, со следующими параметрами
		//   contentClass - класс документа, тип ecm.model.ContentClass
		//   entryTemplate - шаблон ввода документа, тип ecm.model.EntryTemplate
		show: function(params) {

		    this.repository = params.repository || this.repository ;

            this.entryTemplate = params.entryTemplate || this.entryTemplate ;

            this.contentClass = params.contentClass || this.contentClass ;

            this.contentItem = params.contentItem || this.contentItem ;

            this.onSuccess = params.onSuccess || this.onSuccess ;

            if (params.title) {

                this.set("title", params.title);

            }

            if (params.introText) {

                this.setIntroText(params.introText);

            }

            this.submitButton.set("label", this.contentItem ? "Сохранить" : "Добавить");

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

        // отрисовываем форму в соответствии с клаос документа и его шаблоном ввода

        _createRendering: function() {

            if (this.propertiesPane) {

                this.propertiesPane.clearRendering();

                this.propertiesPane.destroy();

                this.propertiesPane = null ;

            }

            var propertiesPaneClass = "ecm/widget/CommonPropertiesPane";

            if (this.entryTemplate && this.entryTemplate.layoutPropertiesPaneClass) {

                propertiesPaneClass = this.entryTemplate.layoutPropertiesPaneClass ;

            }

            require([
                propertiesPaneClass
            ], dojo.hitch(this, function(cls){

                this.propertiesPane = new cls();

                this.propertiesContainer.set("content", this.propertiesPane);

                var privEditProperties = this.contentItem && this.contentItem.hasPrivilege("privEditProperties");

                this.propertiesPane.createRendering(
                    this.contentClass,
                    this.entryTemplate,
                    this.contentItem,
                    this.contentItem ? "editProperties" : "create",
                    this.contentItem && !privEditProperties,
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

		    var properties = this.propertiesPane.getPropertiesJSON(true, true, false);

            if (this.contentItem) {

                // сохраняем сделанные изменения

                this.repository.lockItems([this.contentItem], dojo.hitch(this, function(result){

                    this.contentItem.checkIn(
                        this.contentItem.template,	// class name
                        properties,				    // properties
                        "Item",					    // content source type, "Item" - no content
                        null,					    // mime type
                        null,					    // filename
                        null,					    // content
                        null,					    // childComponentValues
                        null,					    // permissions
                        null,					    // securityPolicyId
                        null,					    // newVersion
                        false,					    // checkInAsMinorVersion
                        false,					    // autoClassify
                        dojo.hitch(this, function(contentItem){

                            this.onSuccess(contentItem);

                        })
                    );

                }));

            } else {

                // создаем новый объект

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

                        this.onSuccess(contentItem);

                    }),
                    false,                          // isBackgroundRequest
                    lang.hitch(this, function(error){
                                                    // error
                    }),
                    false                           // compoundDocument
                );

            }

		},

		onSuccess: function(contentItem) {
		}

	});

});
