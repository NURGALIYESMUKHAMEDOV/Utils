define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/json",
	"dojo/dom-class",
	"dojo/dom-style",
	"dijit/_base/wai",
	"dijit/MenuItem",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"idx/html",
	"idx/form/_CompositeMixin",
	"idx/form/_CssStateMixin",
	"dijit/form/_FormWidget",
	"dijit/form/Button",
	"ecm/model/Request",
	"ecm/model/EntryTemplate",
	"ecm/widget/TitlePane",
	"ecm/widget/ValidationTextBox",
	"ecm/widget/dialog/YesNoCancelDialog",
	"pvr/widget/editors/mixins/_EditorMixin",
	"pvr/widget/editors/mixins/_TextMixin",
	"idx/widget/HoverHelpTooltip",
	"pvr/controller/value/Value",
	"components/SelectDocumentDialog",
	"components/AddDocumentDialog",
	"components/EditDocumentDialog",
	"dojo/text!./templates/DocumentBoxEditor.html",
	"dojo/i18n!pvr/nls/common"
],
function(
    declare,
    lang,
    array,
    json,
    domClass,
    domStyle,
    wai,
    MenuItem,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    html,
    _CompositeMixin,
    _CssStateMixin,
    _FormWidget,
    Button,
    Request,
    EntryTemplate,
    TitlePane,
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

	return declare("components.editors.DocumentBoxEditor", [
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
		value: null,

        // ошибка
        error: null,

        // требуется заполнение или нет?
		required: false,

        // редактируемое поли или нет
        readOnly: false,

        // css класс редактора
		editorClass: "pvrDocumentBoxEditor",

        // базовый css класс редактора
		baseClass: "pvrDocumentBoxEditor",

        // css класс виджета
		oneuiBaseClass: "",

		// конфигурация редактора в виде строки JSON
		configuration: null,

		// конфигурация редактора в виде объекта
		configurationObj: null,

		postCreate: function() {

			this.inherited(arguments);

		},

		_setValueAttr: function(value) {

			this.value = value;

			this.validate();

			this.formatValue();

		},

		_setErrorAttr: function(error) {

			this.error = error;

			this.validate();

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

		_getDisplayedValueAttr: function() {

			return this.formattedValue;

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

		    var property = this.property ;

            // удаляем старые значения из выпадающего списка

            var children = this.dropDownMenu.getChildren();

            if (children) {

                array.forEach(children, function(child){

                    this.dropDownMenu.removeChild(child);

                    child.destroy();

                }, this);

            }

		    if (this.value) {

		        this.contentNode.set("label", "загрузка...");

		        var repository = this.property.controller.model.repository ;

		        repository.retrieveItem(this.value, dojo.hitch(this, function(contentItem){

		            var params = this.getConfig(contentItem.template);

		            this.formattedValue = contentItem.getValue("{NAME}") || contentItem.getValue("DocumentTitle") || (params && params.config && params.config.preview && params.config.preview.title) || "Действия";

		            this.contentNode.set("label", this.formattedValue);

                    this.dropDownMenu.addChild(new MenuItem({
                        label: "Открыть",
                        onClick: dojo.hitch(this, function(){ this._onOpen(); })
                    }));

                    if (!this.readOnly) {

                        this.dropDownMenu.addChild(new MenuItem({
                            label: "Удалить",
                            onClick: dojo.hitch(this, function(){ this._onRemove(); })
                        }));

                    }

                    this._createPreview(contentItem);

		        }));

		    } else {

		        if (this.readOnly) {

		            this.contentNode.set("label", "");

		        } else {

                    this.contentNode.set("label", "Выбрать");

                    var classes = this.getClasses();

                    array.forEach(classes, function(cls){

                        this.dropDownMenu.addChild(new MenuItem({
                            label: cls.displayName,
                            onClick: dojo.hitch(this, function(){ this._onSelect(cls.className); })
                        }));

                    }, this);

                }

		        this._createPreview();

		    }

		},

		_createPreview: function(contentItem) {

            // удаляем старые данные

            if (this.previewPane) {

                this.previewPane.clearRendering();

                this.previewPane.destroy();

                this.previewPane = null ;

            }

            // если выбранный объект пустой, ничего не отображаем

            if (!contentItem) {

                domStyle.set(this.previewNode.domNode, "display", "none");

                return ;

            }

            var params = this.getConfig(contentItem.template);

            if (params.config.preview && params.config.preview.entryTemplate) {

                // указан шаблон вывода для предпросмотра

                var _renderPreview = dojo.hitch(this, function(contentItem, entryTemplate){

                    var previewPaneClass = "ecm/widget/CommonPropertiesPane";

                    if (entryTemplate && entryTemplate.layoutPropertiesPaneClass) {

                        previewPaneClass = entryTemplate.layoutPropertiesPaneClass ;

                    }

                    var repository = this.property.controller.model.repository;

                    var contentClass = repository.getContentClass(contentItem.template);

                    require([
                        previewPaneClass
                    ], dojo.hitch(this, function(cls){

                        this.previewPane = new cls();

                        this.previewPane.createRendering(
                            contentClass,
                            entryTemplate,
                            contentItem,
                            "viewProperties",
                            true,
                            false,
                            dojo.hitch(this, function(callback){

                            }),
                            dojo.hitch(this, function(error){

                            })
                        );

                        this.previewNode.set("content", this.previewPane);

                        domStyle.set(this.previewNode.domNode, "display", "");

                    }));

                });

                var entryTemplate = params.config.preview.entryTemplate ;

                if (entryTemplate.isRetrieved) {

                    _renderPreview(contentItem, entryTemplate);

                } else {

                    entryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                        _renderPreview(contentItem, entryTemplate);

                    }), false, true);

                }

            }

		},

		_isEmpty: function() {

			return (/^$/).test(this.get("value"));

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

			return !!this.error;

		},

		validate: function(isFocused) {

			var isValid = this.disabled || this.isValid(isFocused);

			var isEmpty = this._isEmpty(this.textbox.value);

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

		_onFocus: function() {

			this.validate(true);

			this.inherited(arguments);

		},

		resize: function() {

		    this.previewNode.resize();

		},

		_onSelect: function(className) {

		    var params = this.getConfig(className);

		    if (params && params.config && params.config.list) {

                var dialog = new SelectDocumentDialog();

                dialog.show({

                    repository: this.property.controller.model.repository,

                    params: params.config,

                    onSelect: dojo.hitch(this, function(contentItems) {

                        var contentItem = contentItems[0];

                        this.value = contentItem.id.split(",")[2];

                        this.emit("change", {});

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

                    this.value = contentItem.id.split(",")[2];

                    this.emit("change", {});

                }));

		    }

		},

		_onOpen: function() {

            var repository = this.property.controller.model.repository ;

            var value = this.retrieveNormalizedValue();

            repository.retrieveItem(value, dojo.hitch(this, function(contentItem){

                var params = this.getConfig(contentItem.template);

                var dialog = new EditDocumentDialog();

                dialog.show(contentItem, params.config.modify, dojo.hitch(this, function(contentItem){

                    this.value = contentItem.id.split(",")[2];

                    this.emit("change", {});

                }));

            }));

		},

		_onRemove: function() {

            this.value = null ;

            this.emit("change", {});

		},

		adjustWidth: function(widthSettings) {

		    this.inherited(arguments);

		    var contentNodeHeight = this.contentNode.domNode.clientHeight ;

		    var previewNodeHeight = this.previewNode.domNode.clientHeight ;

            domStyle.set(this.oneuiBaseNode.domNode, "height", contentNodeHeight + previewNodeHeight + 20 + "px");

		    domStyle.set(this.previewNode.domNode, "height", height + "px");

		    this.contentNode.resize();

		    this.previewNode.resize();

		},

	});

});