define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/json",
    "ecm/model/EntryTemplate",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/dialog/YesNoCancelDialog",
    "ecm/widget/ContentClassSelector",
    "dojo/text!./templates/AddCaseDialog.html"
], function(
    declare,
    lang,
    json,
    EntryTemplate,
    BaseDialog,
    YesNoCancelDialog,
    ContentClassSelector,
    template
) {
	return declare("esbd.cases.AddCaseDialog", [
		BaseDialog
	], {

		contentString: template,

		widgetsInTemplate: true,

        // шаблоны ввода
		entryTemplatesCache: {},

        // текущий выбранный репозиторий
		repository: null,

		// конфигурационные данные приложения
		configuration: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

            this.addButton("Добавить", "_onSubmit", false, true, "ADD");

            this.set("title", "Новый страховой случай");

            this.setIntroText("Укажите информацию о новом страховом случае");

            this.entryTemplatesCache = {};

            this.contentClassSelector.setObjectStore(this.repository.objectStore);

            this.contentClassSelector.setRepository(this.repository);

            this.contentClassSelector.setRootClassId("ESBD_InsuranceCase");

            this.contentClassSelector.setLabel("Страховой случай");

            this.contentClassSelector.set("onContentClassSelected", this.selectContentClass);

            this.selectContentClass(this.repository.getContentClass("ESBD_InsuranceCase"));

		},

        selectContentClass: function(contentClass) {

            if (!this.contentClass || this.contentClass.id != contentClass.id) {

                this.contentClass = contentClass ;

                if (this.entryTemplatesCache[this.contentClass.id]) {

                    // шаблон ввода найден

                    var entryTemplate = this.entryTemplatesCache[this.contentClass.id];

                    this.createRendering(this.contentClass, entryTemplate);

                } else {

                    if (this.configuration && this.configuration.entryTemplates && this.configuration.entryTemplates.create && this.configuration.entryTemplates.create[this.contentClass.id]) {

                        var entryTemplate = new EntryTemplate({
                            repository: this.repository,
                            id: this.configuration.entryTemplates.create[this.contentClass.id]
                        });

                        entryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                            this.entryTemplatesCache[this.contentClass.id] = entryTemplate ;

                            this.createRendering(this.contentClass, entryTemplate);

                        }));

                    } else {

                        this.createRendering(this.contentClass);

                    }

                }

            } else {

                this.createRendering(this.contentClass);

            }

        },

        // отрисовываем форму в соответствии с клаос документа и его шаблоном ввода

        createRendering: function(contentClass, entryTemplate) {

            if (this.propertiesPane) {

                this.propertiesPane.clearRendering();

                this.propertiesPane.destroy();

                this.propertiesPane = null ;

            }

            var propertiesPaneClass = "ecm/widget/CommonPropertiesPane";

            if (entryTemplate && entryTemplate.layoutPropertiesPaneClass) {

                propertiesPaneClass = entryTemplate.layoutPropertiesPaneClass ;

            }

            require([
                propertiesPaneClass
            ], dojo.hitch(this, function(cls){

                this.propertiesPane = new cls();

                this.propertiesContainer.set("content", this.propertiesPane);

                this.propertiesPane.createRendering(
                    contentClass,
                    entryTemplate,
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

		    var entryTemplate = this.entryTemplatesCache[this.contentClass.id] ;

		    var folder = entryTemplate ? entryTemplate.folder : null ;

		    var properties = this.propertiesPane.getPropertiesJSON(true, true, false);

            this.repository.addDocumentItem(
                folder,
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

                    console.log("[AddCaseDialog] _onSubmit, contentItem: ", contentItem);

                    this.onSuccess(contentItem);

                }),
                false,                          // isBackgroundRequest
                lang.hitch(this, function(error){
                                                // error
                }),
                false                           // compoundDocument
            );

		},

		onSuccess: function(contentItem) {
		}

	});

});
