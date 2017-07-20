define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/json",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/dom-geometry",
	"dijit/_base/wai",
	"dijit/DropDownMenu",
	"dijit/MenuItem",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"idx/html",
	"idx/form/_CompositeMixin",
	"idx/form/_CssStateMixin",
	"dijit/form/_FormWidget",
	"dijit/form/Button",
	"dijit/layout/ContentPane",
	"ecm/model/Request",
	"ecm/model/EntryTemplate",
	"ecm/widget/TitlePane",
	"ecm/widget/DropDownLink",
	"ecm/widget/ValidationTextBox",
	"ecm/widget/dialog/YesNoCancelDialog",
	"pvr/widget/editors/mixins/_EditorMixin",
	"pvr/widget/editors/mixins/_TextMixin",
	"idx/widget/HoverHelpTooltip",
	"pvr/controller/value/Value",
	"components/SelectDocumentDialog",
	"components/AddDocumentDialog",
	"components/EditDocumentDialog",
	"dojo/text!./templates/DocumentsBoxEditor.html",
	"dojo/i18n!pvr/nls/common"
],
function(
    declare,
    lang,
    array,
    json,
    domClass,
    domStyle,
    domGeometry,
    wai,
    DropDownMenu,
    MenuItem,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    html,
    _CompositeMixin,
    _CssStateMixin,
    _FormWidget,
    Button,
    ContentPane,
    Request,
    EntryTemplate,
    TitlePane,
    DropDownLink,
    ValidationTextBox,
    YesNoCancelDialog,
    _EditorMixin,
    _TextMixin,
    HoverHelpTooltip,
    Value,
    SelectDocumentDialog,
    AddDocumentDialog,
    EditDocumentDialog,
    template,
    resources
) {

	return declare("components.editors.DocumentsBoxEditor", [
	   _WidgetBase,
	   _TemplatedMixin,
	   _WidgetsInTemplateMixin,
	   _CompositeMixin,
	   _CssStateMixin,
	   _EditorMixin
	], {

        // шаблон отображения редактора
		templateString: template,

        // значение редактора
		value: [],

		// значения в виде объектов
		contentItems: null,

		// панели отображения объектов
		contentItemPanes: null,

        // ошибка
        internalError: [],

        externalError: [],

        duplicatesError: [],

        // требуется заполнение или нет?
		required: false,

        // редактируемое поли или нет
        readOnly: false,

        // css класс редактора
		editorClass: "pvrDocumentsBoxEditor",

        // базовый css класс редактора
		baseClass: "pvrDocumentsBoxEditor",

        // css класс виджета
		oneuiBaseClass: "",

		// конфигурация редактора в виде строки JSON
		configuration: null,

		// конфигурация редактора в виде объекта
		configurationObj: null,

		// указывает на то, что меню для создания документов было загружено
		_addDocumentMenuLoaded: false,

        // указывает на то, что значение редактора было уже
        // отображено до уведомления
		_valueProcessed: false,

		postCreate: function() {

			this.inherited(arguments);

		},

		_setValueAttr: function(value) {

			this.value = value;

			this.validate();

			this.formatValue();

		},

		_getErrorAttr: function(row) {

			if (lang.isArray(this.externalError)) {

				var error = array.map(this.externalError, function(item, index) {

					return item || this.internalError[index] ;

				}, this);

				return typeof(row) === "number" ? error[row] : error;

			} else {

				return this.externalError || this.internalError ;

			}

		},

		_setErrorAttr: function(error, row) {

			if (this.editorReady) {

				this.externalError = error;

				this._hasBeenBlurred = this._hasBeenBlurred || !!error;

				this.validate(error ? false : this.focused);

			} else {

				this._initialError = error;

			}

		},

		_setRequiredAttr: function(required) {

			this.required = required;

			this.validate();

		},


		_setReadOnlyAttr: function(readOnly) {

			this.readOnly = readOnly;

		},

		_setHintAttr: function(hint) {

			this.hint = hint;

		},

		getClasses: function() {

		    if (!this.configurationObj) {

		        if (this.configuration) {

		            this.configurationObj = json.parse(this.configuration);

		        } else {

		            this.configurationObj = [] ;

		        }

            }

		    return this.configurationObj ;

		},

		getConfig: function(className) {

		    if (!this.configurationObj) {

		        if (this.configuration) {

		            this.configurationObj = json.parse(this.configuration);

		        } else {

		            this.configurationObj = [] ;

		        }

            }

		    var result = array.filter(this.configurationObj, function(config){

		        return config.className == className ;

		    }, this);

		    if (result && result.length > 0) {

		        var item = result[0];

		        if (item.config && item.config.add && item.config.add.entryTemplate) {

		            var entryTemplate = item.config.add.entryTemplate ;

		            if (typeof entryTemplate === "string") {

                        var entryTemplate = new EntryTemplate({
                            repository: this.property.controller.model.repository,
                            id: entryTemplate
                        });

                        item.config.add.entryTemplate = entryTemplate ;

                    }

		        }

		        if (item.config && item.config.modify && item.config.modify.entryTemplate) {

		            var entryTemplate = item.config.modify.entryTemplate ;

		            if (typeof entryTemplate === "string") {

                        var entryTemplate = new EntryTemplate({
                            repository: this.property.controller.model.repository,
                            id: entryTemplate
                        });

                        item.config.modify.entryTemplate = entryTemplate ;

                    }

		        }

		        if (item.config && item.config.preview && item.config.preview.entryTemplate) {

		            var entryTemplate = item.config.preview.entryTemplate ;

		            if (typeof entryTemplate === "string") {

                        var entryTemplate = new EntryTemplate({
                            repository: this.property.controller.model.repository,
                            id: entryTemplate
                        });

                        item.config.preview.entryTemplate = entryTemplate ;

                    }

		        }

		        return item ;

		    } else {

		        return {};

		    }

		},

		formatValue: function() {

		    if (!this._addDocumentMenuLoaded) {

                // удаляем старые значения из выпадающего списка

                var children = this._addDocumentMenu.getChildren();

                if (children) {

                    array.forEach(children, function(child){

                        this._addDocumentMenu.removeChild(child);

                        child.destroy();

                    }, this);

                }

                // добавляем новые согласно конфигурации

                if (this.readOnly) {

                    domStyle.set(this._addDocumentButton.domNode, "display", "none");

                } else {

                    domStyle.set(this._addDocumentButton.domNode, "display", "");

                    var classes = this.getClasses();

                    array.forEach(classes, function(cls){

                        this._addDocumentMenu.addChild(new MenuItem({
                            label: cls.displayName,
                            onClick: dojo.hitch(this, function(){ this._onSelect(cls.className); })
                        }));

                    }, this);

                }

		        // ставим флаг загрузки

		        this._addDocumentMenuLoaded = true ;

            }

            // удаляем все значения из панели контента

            var children = this.contentNode.getChildren();

            if (children) {

                array.forEach(children, function(child){

                    this.contentNode.removeChild(child);

                    child.destroyRecursive();

                }, this);

            }

            this.contentItems = [];

            this.contentItemPanes = [];

            domStyle.set(this.contentNode.domNode, "padding-top", "");

            console.log("[DocumentBoxEditor] formatValue, value: ", this.value);

            if (this.value.length > 0) {

                // отображаем значения в панеле контента

                var repository = this.property.controller.model.repository ;

                delete repository._teamspaceItemsCache;

                repository.retrieveMultiItem(this.value, dojo.hitch(this, function(contentItems){

                    console.log("[DocumentBoxEditor] formatValue, retrieved items: ", contentItems);

                    this.contentItems = contentItems ;

                    this.contentItemPanes = [];

                    array.forEach(this.contentItems, function(contentItem){

                        var contentItemPane = this._createContentItemPane(this.contentNode, contentItem);

                        this.contentItemPanes[contentItem.id] = contentItemPane ;

                        domStyle.set(this.contentNode.domNode, "padding-top", "10px");

                    }, this);

                }));

            }

		},

		_createContentItemPane: function(parentNode, contentItem) {

            var contentPane = new ContentPane();

            parentNode.addChild(contentPane);

            domStyle.set(contentPane.domNode, "padding-top", "5px");

            domStyle.set(contentPane.domNode, "padding-bottom", "5px");

            // domStyle.set(contentPane.domNode, "border-top", "1px solid #008abf");

            // создаем меню для отображения

            var menu = new DropDownMenu();

            menu.addChild(new MenuItem({
                label: "Открыть",
                onClick: dojo.hitch(this, function(){ this._onOpen(contentItem); })
            }));

            if (!this.readOnly) {

                menu.addChild(new MenuItem({
                    label: "Удалить",
                    onClick: dojo.hitch(this, function(){ this._onRemove(contentItem); })
                }));

            }

            var params = this.getConfig(contentItem.template);

            var name = contentItem.getValue("{NAME}") || contentItem.getValue("DocumentTitle") || (params && params.config && params.config.preview && params.config.preview.title) || "Действия";

            var link = new DropDownLink({
                label: name,
                dropDown: menu
            });

            contentPane.addChild(link);

            // создаем отображение, если необходимо

            if (params.config.preview && params.config.preview.entryTemplate) {

                // указан шаблон отображения для предпросмотра

                var _renderPreview = dojo.hitch(this, function(container, contentItem, entryTemplate){

                    var previewPaneClass = "ecm/widget/CommonPropertiesPane";

                    if (entryTemplate && entryTemplate.layoutPropertiesPaneClass) {

                        previewPaneClass = entryTemplate.layoutPropertiesPaneClass ;

                    }

                    var repository = this.property.controller.model.repository;

                    var contentClass = repository.getContentClass(contentItem.template);

                    require([
                        previewPaneClass
                    ], dojo.hitch(this, function(cls){

                        var previewPane = new cls();

                        previewPane.createRendering(
                            contentClass,
                            entryTemplate,
                            contentItem,
                            "viewProperties",
                            true,
                            false,
                            dojo.hitch(this, function(callback){

                                /*

                                setTimeout(dojo.hitch(this, function(){

                                    var view = previewPane._view ;

                                    console.log("view[1]: ", view);

                                    var height = view.domNode.clientHeight ;

                                    console.log("height: ", height);

                                    domStyle.set(container.domNode, "height", height + 60 + "px");

                                }), 300);

                                */

                                // container.resize();

                            }),
                            dojo.hitch(this, function(error){

                            })
                        );

                        container.addChild(previewPane);

                    }));

                });

                var entryTemplate = params.config.preview.entryTemplate ;

                if (entryTemplate.isRetrieved) {

                    _renderPreview(contentPane, contentItem, entryTemplate);

                } else {

                    entryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                        _renderPreview(contentPane, contentItem, entryTemplate);

                    }), false, true);

                }

            }

            return contentPane ;

		},

		_isEmpty: function() {

		    return this.value.length == 0;

		},

		isValid: function(isFocused) {

			return !this._hasError() && this._satisfiesRequiredCondition();

		},

		getErrorMessage: function(isFocused) {

			if (this._hasError()) {

				return this.error;

			}

			if (!this._satisfiesRequiredCondition()) {

				return resources.validationError.required;

			}


			return "";

		},

		_satisfiesRequiredCondition: function() {

			return !this.required || !this._isEmpty();

		},

		_hasError: function() {

			var error = this.get("error");

			if (lang.isArray(error)) {

				return array.some(error, function(item) {

					return !!item;

				});

			} else {

				return !!error;

			}

		},

		validate: function(isFocused) {

			var isValid = this.disabled || this.isValid(isFocused);

			var isEmpty = this._isEmpty();

			this.set("state", isValid ? "" : "Error");

			this.focusNode.setAttribute("aria-invalid", isValid ? "false" : "true");

			wai.setWaiState(this.focusNode, "invalid", !isValid);

			var message = this.state === "Error" ? this.getErrorMessage(isFocused) : "";

			this._set("message", message);

			this.displayMessage(message, isFocused);

			return isValid;

		},

		displayMessage: function(message, force) {

			if (message) {

				if (!this.messageTooltip) {

					this.messageTooltip = new HoverHelpTooltip({
						connectId: [
							this.iconNode
						],
						label: message,
						position: this.tooltipPosition,
						forceFocus: false
					});

				} else {

					this.messageTooltip.set("label", message);

				}

				if (this.focused || force) {

					var node = domStyle.get(this.iconNode, "visibility") == "hidden" ? this.oneuiBaseNode : this.iconNode;

					this.messageTooltip.open(node);

				}

			} else {

				this.messageTooltip && this.messageTooltip.close();

			}

		},

		onEditorChange: function(value) {
		},

		focus: function() {

			this.focusNode && this.focusNode.focus();

		},

		resize: function() {

		    this.inherited(arguments);

		    // this.contentNode.resize();

		},

		_onFocus: function() {

			this.validate(true);

			this.inherited(arguments);

		},

		_onSelect: function(className) {

		    var params = this.getConfig(className);

		    if (params && params.config && params.config.list) {

                var dialog = new SelectDocumentDialog();

                dialog.show({

                    repository: this.property.controller.model.repository,

                    params: params.config,

                    onSelect: dojo.hitch(this, function(contentItems) {

                        console.log("[DocumentBoxEditor] onSelect, contentItems: ", contentItems);

                        var value = this.value.slice(0);

                        console.log("[DocumentBoxEditor] onSelect, sliced value: " + value);

                        array.forEach(contentItems, function(contentItem){

                            this.contentItems.push(contentItem);

                            value.push(contentItem.id.split(",")[2]);

                        }, this);

                        this.value = value ;

                        console.log("[DocumentBoxEditor] onSelect, value: ", this.value);

                        this.emit("change", {});

                        this.resize();

                    })

                });

            } else {

                this._onAdd(className);

            }

		},

		_onAdd: function(className) {

		    var params = this.getConfig(className);

		    if (params && params.config && params.config.add) {

                var dialog = new AddDocumentDialog({
                    repository: this.property.controller.model.repository
                });

                dialog.show(params.config.add, dojo.hitch(this, function(contentItem){

                    // добавить в список документов

                    this.contentItems.push(contentItem);

                    // добавить в список значений

                    var value = this.value.slice(0);

                    value.push(contentItem.id.split(",")[2]);

                    this.value = value ;

                    // отобразить панель

                    // var contentItemPane = this._createContentItemPane(this.contentNode, contentItem);

                    // this.contentNode.addChild(contentItemPane);

                    // domStyle.set(this.contentNode.domNode, "padding-top", "10px");

                    // добавить в список панелей

                    // this.contentItemPanes[contentItem.id] = contentItemPane ;

                    // уведомить об изменении

                    // this._valueProcessed = true;

                    this.emit("change", {});

                    /*

                    if (this.onEditorChange) {

                        this.onEditorChange(value);

                    }

                    if (this.onEditorInput) {

                        this.onEditorInput({
                            value: value,
                            internalError: null,
                            externalError: null,
                            duplicatesError: null
                        });

                    }

                    */

                    this.resize();

                }));

		    }

		},

		_onOpen: function(contentItem) {

            var repository = this.property.controller.model.repository ;

            var params = this.getConfig(contentItem.template);

            var dialog = new EditDocumentDialog();

            dialog.show(contentItem, params.config.modify, dojo.hitch(this, function(contentItem){

                this.resize();

            }));

		},

		_onRemove: function(contentItem) {

            // удалить элемент из значения

            var id = contentItem.id.split(",")[2];

            console.log("[DocumentsBoxEditor] _onRemove, id: ", id);

            var value = this.value.slice(0);

            value = array.filter(value, function(element){

                return element != id ;

            }, this);

            this.value = value ;

            this.emit("change", {});

            // удалить панель из отображения

            // var contentItemPane = this.contentItemPanes[contentItem.id];

            // this.contentNode.removeChild(contentItemPane);

            // delete this.contentItemPanes[contentItem.id];

            // if (this.contentItems.length == 0) {

            //    domStyle.set(this.contentNode.domNode, "padding-top", "");

            // }

            // отчистить панель

            // contentItemPane.destroyRecursive();

            // уведомить об изменениях

            // this._valueProcessed = true ;

            // this.onEditorChange(value);

            // this.resize();

		},

		adjustWidth: function(widthSettings) {

		    for(var key in this.contentItemPanes) {

		        var pane = this.contentItemPanes[key];

		        var height = pane.domNode.clientHeight ;

		    }

		    this.inherited(arguments);

		    domStyle.set(this.contentNode, "width", this.computeAdjustedWidth(widthSettings.computed, widthSettings) + "px");

            /*

		    var height = this.contentNode.domNode.clientHeight + 20;

		    if (height) {

		        domStyle.set(this.oneuiBaseNode, "height", height + "px");

		        domStyle.set(this.contentNode, "height", height + "px");

		    }

		    this.contentNode.resize();

		    */

		},

	});

});