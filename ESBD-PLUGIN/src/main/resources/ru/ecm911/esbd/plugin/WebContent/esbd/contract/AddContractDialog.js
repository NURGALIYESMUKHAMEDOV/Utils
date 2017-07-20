/**
 * Диалоговое окно для работы с
 * информацией о страховом случае
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
    "dojo/text!./templates/AddContractDialog.html"
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

	return declare("esbd.contract.AddContractDialog", [
		BaseDialog
	], {

		contentString: template,

		widgetsInTemplate: true,

		// текущая выбранная компания
		company: null,

        // конфигурационные данные приложения
		configuration: null,

        // шаблоны ввода
		entryTemplatesCache: {},

        // текущий выбранный репозиторий
		repository: null,

        // корневой класс
        rootClass: null,

		// выбранный класс создаваемого документа
		contentClass: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

            this.addButton("Добавить", "_onSubmit", false, true, "ADD");

            this.set("title", "Новый договор");

            this.setIntroText("Укажите информацию о новом договоре");

            this.contentClassSelector.set("onContentClassSelected", dojo.hitch(this, this.selectContentClass));

		},

		show: function(params) {

		    this.company = params.company || this.company ;

		    this.repository = params.repository || this.repository ;

		    this.configuration = params.configuration || this.configuration ;

		    var contentClass = params.contentClass || this.contentClass ;

		    this.rootClass = params.rootClass || this.rootClass ;

            this.contentClassSelector.setObjectStore(this.repository.objectStore);

            this.contentClassSelector.setRepository(this.repository);

		    this.contentClassSelector.setRootClassId(this.rootClass.id);

		    this.contentClassSelector.setLabel(this.rootClass.name);

		    this.contentClassSelector.setSelected(contentClass);

		    return this.inherited(arguments);

		},

        selectContentClass: function(contentClass) {

            if (!this.contentClass || this.contentClass.id != contentClass.id) {

                this.contentClass = contentClass;

                if (this.entryTemplatesCache[this.contentClass.id]) {

                    // шаблон ввода найден в кеше

                    var entryTemplate = this.entryTemplatesCache[this.contentClass.id];

                    this.createRendering(this.contentClass, entryTemplate);

                } else {

                    if (this.configuration && this.configuration.entryTemplates && this.configuration.entryTemplates.create && this.configuration.entryTemplates.create[this.contentClass.id]) {

                        var entryTemplate = new EntryTemplate({
                            repository: this.repository,
                            id: this.configuration.entryTemplates.create[this.contentClass.id]
                        });

                        entryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                            this.configuration.entryTemplates.create[this.contentClass.id] = entryTemplate ;

                            this.entryTemplatesCache[this.contentClass.id] = entryTemplate ;

                            this.createRendering(this.contentClass, entryTemplate);

                        }));

                    } else {

                        this.createRendering(this.contentClass);

                    }

                }

            }

        },

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

		    var properties = this.propertiesPane.getPropertiesJSON(true, true, false);

		    var entryTemplate = this.configuration.entryTemplates.create[this.contentClass.id];

            this.repository.addDocumentItem(
                entryTemplate ? entryTemplate.folder : null,
                this.repository.objectStore,
                this.contentClass.id,           // templateName
                properties,
                "Item",                         // contentSourceType
                null,                           // mimetype
                null,                           // filename
                null,                           // content
                null,                           // childComponentValues
                null,                           // permissions
                null,                           // securityPolicyId
                false,                          // addAsMinorVersion
                false,                          // autoClassify
                true,                           // allowDuplicateFileNames
                false,                          // setSecurityParent
                null,
                lang.hitch(this, function(contentItem){

                    this.onSuccess(contentItem);

                }),
                false,
                lang.hitch(this, function(error){

                    console.log("error: ", error);

                }),
                false                           // compoundDocument
            );

		},

        onSuccess: function(contentItem) {
        }

	});

});
