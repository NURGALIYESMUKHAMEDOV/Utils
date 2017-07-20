define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/sniff",
    "dojo/_base/array",
    "dojo/aspect",
    "dojo/_base/json",
    "dojo/store/Memory",
    "ecm/model/Request",
    "ecm/model/Comment",
    "ecm/model/EntryTemplate",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/dialog/YesNoCancelDialog",
    "ecm/widget/ContentClassSelector",
    "dojo/text!./templates/AddDocumentDialog.html"
], function(
    declare,
    lang,
    has,
    array,
    aspect,
    json,
    Store,
    Request,
    Comment,
    EntryTemplate,
    BaseDialog,
    YesNoCancelDialog,
    ContentClassSelector,
    template)
{

	return declare("components.AddDocumentDialog", [
		BaseDialog
	], {

		contentString: template,

		widgetsInTemplate: true,

		// кнопка "Добавить"
		submitButton: null,

		// выбранный репозиторий
		repository: null,

		// параметры в виде json объекта
		// [
		//   {
		//     "className": "наименование класса",
		//     "contentClass": "имя класса",
		//     "title": "заголовок",
		//     "description": "описание",
		//     "entryTemplate": "шаблон ввода"
		//   }
		// ]
		params: null,

		// функция успешного добавления документа
		callback: null,

		// выбранный класс
		selectedItem: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

            this.submitButton = this.addButton("Добавить", "_onSubmit", false, true, "ADD");

		},

		show: function(params, callback) {

		    this.params = params || this.params ;

		    this.callback = callback || this.callback ;

		    if (this.params) {

		        var data = [];

		        array.forEach(this.params.classes, function(element){

		            data.push({
		                id: element.contentClass,
		                name: element.className
		            })

		        }, this);

		        var store = new Store({data: data});

		        this.contentClassSelector.set("store", store);

		        this.contentClassSelector.set("value", params.classes[0].contentClass);

                return this.inherited("show", []);

		    }

		},

        // обработчик выбора компании из списка
        _onClassChange: function(contentClass) {

            var selectedItems = array.filter(this.params.classes, function(element){

                return element.contentClass == contentClass ;

            }, this);

            this.selectedItem = selectedItems[0] ;

		    this.set("title", this.selectedItem.title);

		    this.setIntroText(this.selectedItem.description);

		    if (this.selectedItem.entryTemplate) {

                if (typeof this.selectedItem.entryTemplate === "string") {

                    this.selectedItem.entryTemplate = new EntryTemplate({
                        repository: this.repository,
                        id: this.selectedItem.entryTemplate
                    });

                }

                if (!this.selectedItem.entryTemplate.isRetrieved) {

                    this.selectedItem.entryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                        this.selectedItem.entryTemplate = entryTemplate ;

                        this._createRendering();

                    }));

                } else {

                    this._createRendering();

                }

            } else {

                this._createRendering();

            }

        },

		// отрисовывает панель со свойствами
		_createRendering: function() {

            if (this.propertiesPane) {

                this.propertiesPane.clearRendering();

                this.propertiesPane.destroy();

                this.propertiesPane = null ;

            }

            var propertiesPaneClass = "ecm/widget/CommonPropertiesPane";

            if (this.selectedItem.entryTemplate && this.selectedItem.entryTemplate.layoutPropertiesPaneClass) {

                propertiesPaneClass = this.selectedItem.entryTemplate.layoutPropertiesPaneClass ;

            }

            require([
                propertiesPaneClass
            ], dojo.hitch(this, function(cls){

                this.propertiesPane = new cls();

                this.propertiesContainer.set("content", this.propertiesPane);

                var contentClass = this.selectedItem.entryTemplate.repository.getContentClass(this.selectedItem.entryTemplate.addClassName);

                this.propertiesPane.createRendering(
                    contentClass,
                    this.selectedItem.entryTemplate,
                    null,
                    "create",
                    false,
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

		    var isValid = true ;

		    if (result == "Error") {

		        this.propertiesPane._view.forEachProperty({
		            callback: dojo.hitch(this, function(property){

		                var editor = property.editorWidget ;

		                if (!editor.validate(true)) {

		                    var message = editor.getErrorMessage();

		                    editor.displayMessage(message, true);

		                    isValid = false ;

		                }

		            })
		        });

		        if (!isValid) {

		            return ;

                }

		    }

		    var properties = this.propertiesPane.getPropertiesJSON(true, true, false);

		    var childComponentValues = this.propertiesPane.getChildComponentValues();

            var folder = null ;

            var addClassName = this.selectedItem.contentClass ;

		    var permissions = [];

		    if (this.selectedItem.entryTemplate) {

		        folder = this.selectedItem.entryTemplate.folder ;

		        addClassName = this.selectedItem.entryTemplate.addClassName ;

                array.forEach(this.selectedItem.entryTemplate.permissions, function(permission){

                    permissions.push(permission.json());

                }, this);

            }

            this.repository.addDocumentItem(
                folder,
                this.repository.objectStore,
                addClassName,    //templateName
                properties,
                "Item",                             // contentSourceType
                null,                               // mimetype
                null,                               // filename
                null,                               // content
                childComponentValues,               // childComponentValues
                null,                               // permissions
                null,                               // securityPolicyId
                false,                              // addAsMinorVersion
                false,                              // autoClassify
                true,                               // allowDuplicateFileNames
                false,                              // setSecurityParent
                null,
                lang.hitch(this, function(contentItem){

                    if (this.callback) {

                        this.hide();

                        this.callback(contentItem);

                    }

                }),
                false,
                lang.hitch(this, function(error){
                    console.log("error: ", error);
                }),
                false                               // compoundDocument
            );

		}

	});

});
