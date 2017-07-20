define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/aspect",
	"dojo/on",
	"dojo/dom-class",
	"dojo/dom-style",
	"dijit/_base/wai",
	"dijit/MenuItem",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/form/Button",
	"idx/form/_CompositeMixin",
	"idx/form/_CssStateMixin",
	"ecm/model/EntryTemplate",
	"ecm/widget/TitlePane",
	"ecm/widget/ValidationTextBox",
	"pvr/widget/editors/mixins/_EditorMixin",
	"pvr/widget/editors/mixins/_TextMixin",
	"idx/widget/HoverHelpTooltip",
	"pvr/controller/value/Value",
	"esbd/LookupObjectDialog",
	"esbd/AddObjectDialog",
	"ecm/widget/dialog/MessageDialog",
	"dojo/text!./templates/ObjectListBoxEditor.html"
],
function(
    declare,
    lang,
    array,
    aspect,
    on,
    domClass,
    domStyle,
    wai,
    MenuItem,
    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    Button,
    _CompositeMixin,
    _CssStateMixin,
    EntryTemplate,
    TitlePane,
    ValidationTextBox,
    _EditorMixin,
    _TextMixin,
    HoverHelpTooltip,
    Value,
    LookupObjectDialog,
    AddObjectDialog,
    MessageDialog,
    template
) {

	return declare("esbd.editor.ObjectListBoxEditor", [
	   _Widget,
	   _TemplatedMixin,
	   _WidgetsInTemplateMixin,
	   _CompositeMixin,
	   _CssStateMixin,
	   _EditorMixin
	], {

		templateString: template,

		repository: null,

		value: [],

        // выбранные объекты ecm.model.ContentItem
		contentItems: [],

		// компоненты, в которых отображаются объекты
		propertiesPanes: {},

		// вкладки
		widgets: {},

		label: "",

		internalError: [],

		externalError: [],

		readOnly: false,

		message: "",

		state: "",

		editorClass: "pvrObjectListBoxEditor",

		baseClass: "pvrObjectListBoxEditor",

		oneuiBaseClass: "",

		// конфигурационные данные в виде идентификатора объекта, содержащего
		// данные в виде json
		config: null,

        // конфигурационные данные по наименованию шаблона/ид класса
		configByTemplate: {},

		postCreate: function() {

			this.inherited(arguments);

            this.repository = this.property.controller.model.repository ;

		},

		validate: function(isFocused) {

			var isValid = this.disabled || this.isValid(isFocused);

			var isEmpty = this._isEmpty();

			this.set("state", isValid ? "" : ((!this._hasBeenBlurred || isFocused) && isEmpty) ? "Incomplete" : "Error");

			this.focusNode.setAttribute("aria-invalid", isValid ? "false" : "true");

			wai.setWaiState(this.focusNode, "invalid", !isValid);

			var message = this.state === "Error" ? this.getErrorMessage(isFocused) : "";

			this._set("message", message);

			this.displayMessage(message, isFocused);

			return isValid;

		},

		isValid: function(isFocused) {

			return !this._hasError() && this._satisfiesRequiredCondition();

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

		_isEmpty: function() {

			if (lang.isArray(this.value)) {

				return this.value.length === 0;

			} else {

				return this.value === null;

			}

		},

		_satisfiesRequiredCondition: function() {

			return !this.required || !this._isEmpty();

		},

		getErrorMessage: function(isFocused) {

			var error = this.get("error");

			if (this._hasError()) {

				return lang.isArray(error) ? "resources.validationError.dropDownError" : error;

			}

			if (!this._satisfiesRequiredCondition()) {

				return "resources.validationError.required";

			}

			return ""; // Ignore the inherited method.

		},

		displayMessage: function(message, force) {

			this.resize();

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

					var node = domStyle.get(this.iconNode, "visibility") === "hidden" ? this.oneuiBaseNode : this.iconNode;

					this.messageTooltip.open(node);

				}

			} else {

				this.messageTooltip && this.messageTooltip.close();

			}

		},

		focus: function() {

			this.focusNode.focus();

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

		_setValueAttr: function(value, row) {

			if (this.editorReady) {

			    this.value = value ;

			} else {

                this._initialValue = value;

			}

		},

		postInitializeEditor: function() {

		    this.contentItems = [];

		    this.propertiesPanes = [];

		    this.widgets = [];

            if (this.config) {

                if (this.readOnly) {

                    // отключаем все кнопки

                    domStyle.set(this._selectButton.domNode, "display", "none");

                }

                // считываем данные из документа

                delete this.configByTemplate ;

                this.configByTemplate = {} ;

                this._retrieveConfig(this.config, dojo.hitch(this, function(config){

                    array.forEach(config, function(configItem){

                        this.configByTemplate[configItem.contentClass.id] = configItem ;

                    }, this);

                    this._adjustView();

                    this._applyValue();

                }), dojo.hitch(this, function(error){

                    this.set("error", "Ошибка получения конфигурационных данных");

                }));

            } else {

                this.set("error", "Не указана конфигурация для редактора");

            }

		},

        // получает документ, содержащий конфигурацию редактора
        _retrieveConfig: function(id, callback, errorCallback) {

            this.repository.retrieveItem(id, dojo.hitch(this, function(contentItem){

                if (contentItem.currentVersion) {

                    this._retrieveConfigObject(contentItem, callback, errorCallback);

                } else {

                    this.repository.retrieveItem(contentItem.id, dojo.hitch(this, function(contentItem){

                        this._retrieveConfigObject(contentItem, callback, errorCallback);

                    }), null, "current", contentItem.vsId);

                }

            }));

        },

        // получает конфигурацию из документа
        _retrieveConfigObject: function(contentItem, callback, errorCallback) {

            dojo.xhrGet({

                url: contentItem.getContentUrl(),

                handleAs: "json",

                load: dojo.hitch(this, function(obj) {

                    var config = obj ;

                    // создаем объектную модель на основании конфигурационных данных
                    array.forEach(config, function(configItem){

                        configItem.contentClass = this.repository.getContentClass(configItem.contentClass);

                        configItem.viewEntryTemplate = new EntryTemplate({
                            repository: this.repository,
                            id: configItem.viewEntryTemplate
                        });

                        configItem.addEntryTemplate = new EntryTemplate({
                            repository: this.repository,
                            id: configItem.addEntryTemplate
                        });

                    }, this);

                    // загружаем данные по определениям классов
                    this.repository.retrieveContentClassList(dojo.hitch(this, function(contentClasses){

                        array.forEach(contentClasses, function(contentClass){

                            array.forEach(config, function(configItem){

                                if (configItem.contentClass.id == contentClass.id) {

                                    configItem.contentClass = contentClass ;

                                }

                            }, this);

                        }, this);

                        if (callback) {

                            callback(config);

                        }

                    }), array.map(config, function(configItem){

                        return configItem.contentClass.id ;

                    }), this);

                }),

                error: dojo.hitch(this, function(err) {

                    if (errorCallback) {

                        errorCallback(err);

                    }

                })

            });

        },

		// вызывается после того, как все данные конфигурации получены
		// форматирует внешний вид редактора под конфигурационные данные
		_adjustView: function() {

            // удаляем предыдущие элементы выпадающего меню

            var children = this.dropDownMenu.getChildren();

            if (children) {

                array.forEach(children, function(child){

                    this.dropDownMenu.removeChild(child);

                    child.destroy();

                }, this);

            }

            // обновляем выпадающее меню с перечнем классов

            var templates = [];

            for ( var id in this.configByTemplate ) {

                templates.push(id);

            }

            array.forEach(templates, function(template){

                var config = this.configByTemplate[template];

                var menuItem = new MenuItem({
                    label: config.contentClass.name,
                    onClick: dojo.hitch(this, function(){
                        this._onLookup(template);
                    })
                })

                this.dropDownMenu.addChild(menuItem);

            }, this);

            // удаляем информацию из основного блока

            array.forEach(this.propertiesPanes, function(propertiesPane){

                propertiesPane.clearRendering();

                propertiesPane.destroy();

            }, this);

            this.propertiesPanes = {} ;

            // удаляем информацию о вкладках

            array.forEach(this.widgets, function(widget){

                widget.destroy();

            }, this);

            this.widgets = {} ;

		},

		_applyValue: function() {

            var value = this.retrieveNormalizedValue();

            if (value && lang.isArray(value) && value.length > 0) {

                this.repository.retrieveMultiItem(value, dojo.hitch(this, function(contentItems){

                    this.contentItems = contentItems ;

                    array.forEach(this.contentItems, function(contentItem){

                        this._displayItem(contentItem);

                    }, this);

                }));

            }

		},

        // добавляет объект в список объектов
		_displayItem: function(contentItem, widgetIndex) {

		    var config = this.configByTemplate[contentItem.template];

            var widget = new TitlePane({

                title: config.title,

                closable: !this.readOnly,

                refreshable: !this.readOnly,

                onClose: dojo.hitch(this, function(){

                    var id = contentItem.id.split(",")[2];

                    var value = this.retrieveNormalizedValue();

                    if (value && lang.isArray(value)) {

                        value = array.filter(value, function(item){ return item != id; }, this);

                    }

                    this.applyNormalizedValue(value);

                    this.contentItems = array.filter(this.contentItems, function(item){ return item.id != contentItem.id; }, this);

                    // удаляем панель отображения

                    var propertiesPane = this.propertiesPanes[id];

                    if (propertiesPane) {

                        propertiesPane.clearRendering();

                        propertiesPane.destroy();

                    }

                    this.propertiesPanes[id] = null ;

                    // удаляем вкладку

                    var widget = this.widgets[id];

                    widget.destroy();

                    this.validate();

                }),

                onRefresh: dojo.hitch(this, function() {

                    this._onEdit(contentItem);

                }),

                resize: dojo.hitch(this, function(changeSize, resultSize){

                    var id = contentItem.id.split(",")[2];

                    var propertiesPane = this.propertiesPanes[id];

                    if (propertiesPane && propertiesPane.resize) {

                        propertiesPane.resize();

                    }

                })

            });

            var createRendering = dojo.hitch(this, function(config, contentItem){

                var propertiesPaneClass = "ecm/widget/CommonPropertiesPane";

                if (config.viewEntryTemplate && config.viewEntryTemplate.layoutPropertiesPaneClass) {

                    propertiesPaneClass = config.viewEntryTemplate.layoutPropertiesPaneClass ;

                }

                require([
                    propertiesPaneClass
                ], dojo.hitch(this, function(cls){

                    var propertiesPane = new cls();

                    propertiesPane.createRendering(
                        config.contentClass,
                        config.viewEntryTemplate,
                        contentItem,
                        "viewProperties",
                        true,
                        false,
                        dojo.hitch(this, function(callback){

                        }),
                        dojo.hitch(this, function(error){

                        })
                    );

                    widget.set("content", propertiesPane);

                    this.propertiesPanes[contentItem.id] = propertiesPane ;

                    this.widgets[contentItem.id] = widget ;

                }));

                if (widgetIndex) {

                    this.itemsNode.addChild(widget, widgetIndex);

                } else {

                    this.itemsNode.addChild(widget);

                }

            });

            if (config.viewEntryTemplate.isRetrieved) {

                createRendering(config, contentItem);

            } else {

                config.viewEntryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                    config.viewEntryTemplate = entryTemplate ;

                    createRendering(config, contentItem);

                }));

            }

		},

		// вызывает на событие добавления/выбора объекта, соответствующего
		// переданным конфигурационным данным
		_onLookup: function(template) {

		    var config = this.configByTemplate[template];

		    if (config.searchTemplatesPath) {

                var dialog = new LookupObjectDialog();

                dialog.show({

                    repository: this.repository,

                    searchTemplatesPath: config.searchTemplatesPath,

                    title: config.viewTitle,

                    introText: config.viewIntroText,

                    onSelect: dojo.hitch(this, function(contentItem){

                        if (array.some(this.contentItems, function(item){ return item.id == contentItem.id; }, this)){

                            var messageDialog = new MessageDialog({

                                text: "Данный объект уже присутствует в списке"

                            });

                            messageDialog.show();

                            return ;

                        };

                        contentItem.retrieveAttributes(dojo.hitch(this, function(){

                            var value = this.retrieveNormalizedValue();

                            if (!value || !lang.isArray(value)) {

                                value = [] ;

                            }

                            value.push(contentItem.id.split(",")[2]);

                            this.applyNormalizedValue(value);

                            this.contentItems.push(contentItem);

                            this._displayItem(contentItem);

                            dialog.hide();

                            this.emit("change", {});

                        }));

                    }),

                    onAdd: dojo.hitch(this, function(){

                        dialog.hide();

                        this._onAdd(template);

                    })

                });

            } else {

                this._onAdd(template);

            }

		},

        _onAdd: function(template) {

            var config = this.configByTemplate[template];

            var dialog = new AddObjectDialog();

            dialog.show({

                repository: this.repository,

                contentClass: config.contentClass,

                entryTemplate: config.addEntryTemplate,

                title: config.addTitle,

                introText: config.addIntroText,

                onSuccess: dojo.hitch(this, function(contentItem){

		            contentItem.retrieveAttributes(dojo.hitch(this, function(){

		                var value = this.retrieveNormalizedValue();

		                if (!value || !lang.isArray(value)) {

		                    value = [] ;

		                }

		                value.push(contentItem.id.split(",")[2]);

                        this.applyNormalizedValue(value);

                        this.contentItems.push(contentItem);

                        this._displayItem(contentItem);

                        dialog.hide();

                        this.emit("change", {});

		            }));

                })

            });

        },

        _onEdit: function(contentItem) {

            var id = contentItem.id.split(",")[2];

            var config = this.configByTemplate[contentItem.template];

            var propertiesPane = this.propertiesPanes[contentItem.id];

            var widget = this.widgets[contentItem.id];

            var widgetIndex = this.itemsNode.getIndexOfChild(widget);

            var dialog = new AddObjectDialog();

            dialog.show({

                repository: this.repository,

                contentClass: config.contentClass,

                contentItem: contentItem,

                entryTemplate: config.addEntryTemplate,

                title: config.addTitle,

                introText: config.addIntroText,

                onSuccess: dojo.hitch(this, function(newContentItem){

                    // удаляем старые значения

                    var value = this.retrieveNormalizedValue();

                    if (!value || !lang.isArray(value)) {

                        value = [] ;

                    }

                    value = array.filter(value, function(item){ return item != id }, true);

                    this.contentItems = array.filter(this.contentItems, function(item){ return item.id != contentItem.id; }, true);

                    value.push(newContentItem.id.split(",")[2]);

                    this.applyNormalizedValue(value);

                    this.contentItems.push(newContentItem);

                    // удаляем старое отображение

                    this.itemsNode.removeChild(widget);

                    // отрисовываем новое

                    this._displayItem(contentItem, widgetIndex);

                    dialog.hide();

                    this.emit("change", {});

                })

            });

        },

		resize: function() {

		    array.forEach(this.propertiesPanes, function(propertiesPane){

		        var view = propertiesPane._view;

		        view.layout();

		        array.forEach(view.properties, function(property){

		            property.layout();

		        }, this);

		    }, this);

            return this.inherited("resize", []);

		}

	});

});
