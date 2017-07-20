define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-class",
	"dojo/dom-style",
	"dijit/_base/wai",
	"dijit/MenuItem",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"idx/form/_CompositeMixin",
	"idx/form/_CssStateMixin",
	"dijit/form/Button",
	"ecm/model/EntryTemplate",
	"ecm/widget/TitlePane",
	"ecm/widget/ValidationTextBox",
	"ecm/widget/dialog/YesNoCancelDialog",
	"pvr/widget/editors/mixins/_EditorMixin",
	"pvr/widget/editors/mixins/_TextMixin",
	"idx/widget/HoverHelpTooltip",
	"pvr/controller/value/Value",
	"esbd/LookupObjectDialog",
	"esbd/AddObjectDialog",
	"dojo/text!./templates/ClientBoxEditor.html"
],
function(
    declare,
    lang,
    array,
    domClass,
    domStyle,
    wai,
    MenuItem,
    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _CompositeMixin,
    _CssStateMixin,
    Button,
    EntryTemplate,
    TitlePane,
    ValidationTextBox,
    YesNoCancelDialog,
    _EditorMixin,
    _TextMixin,
    HoverHelpTooltip,
    Value,
    LookupObjectDialog,
    AddObjectDialog,
    template
) {

	return declare("esbd.editor.ClientBoxEditor", [
	   _Widget,
	   _TemplatedMixin,
	   _WidgetsInTemplateMixin,
	   _CompositeMixin,
	   _CssStateMixin,
	   _EditorMixin
	], {

		templateString: template,

		repository: null,

		label: "",

		value: null,

		internalError: null,

		externalError: null,

		readOnly: false,

		message: "",

		state: "",

		editorClass: "pvrClientBoxEditor",

		baseClass: "pvrClientBoxEditor",

		oneuiBaseClass: "",

		// выбранный объект типа ecm.model.ContentItem
		contentItem: null,

		// конфигурационные данные в виде идентификатора объекта, содержащего
		// данные в виде json
		config: null,

        // конфигурационные данные по наименованию шаблона/ид класса
		configByTemplate: {},

		// виджет для отобрадения свойств выбранного объекта
		propertiesPane: null,

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

				return lang.isArray(error) ? "resources.validationError.dropDownError" : error; // TODO: replace dropDownError with the proper resource key.

			}

			if (!this._satisfiesRequiredCondition()) {

				return "Значение обязательно к указанию"; // TODO Update this to use this.missingMessage.

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

		_getValueAttr: function(row) {

			var value = this._get("value");

			if (typeof(row) === "number") {

				if (lang.isArray(value)) {

					return value[row];

				}

			} else {

				return value;

			}

		},

		_setValueAttr: function(value, row) {

			if (this.editorReady) {

			    this.value = value ;

			} else {

				if (!Value.equals(this.value, value)) {

					this._initialValue = value;

				}

			}

		},

        // отображает текущее значение выбранного значения
		_displayObject: function() {

            // удаляем старые данные

            if (this.propertiesPane) {

                this.propertiesPane.clearRendering();

                this.propertiesPane.destroy();

                this.propertiesPane = null ;

            }

            // скрываем кнопки редактировать и удалить

            domStyle.set(this._editButton.domNode, "display", "none");

            domStyle.set(this._deleteButton.domNode, "display", "none");

            // если выбранный объект пустой, ничего не отображаем

            if (!this.contentItem) {

                return ;

            }

            if (!this.readOnly) {

                domStyle.set(this._editButton.domNode, "display", "");

                domStyle.set(this._deleteButton.domNode, "display", "");

            }

            var contentItem = this.contentItem ;

            var config = this.configByTemplate[contentItem.template];

            var renderAttributes = dojo.hitch(this, function(contentItem, config) {

                var propertiesPaneClass = "ecm/widget/CommonPropertiesPane";

                if (config.viewEntryTemplate && config.viewEntryTemplate.layoutPropertiesPaneClass) {

                    propertiesPaneClass = config.viewEntryTemplate.layoutPropertiesPaneClass ;

                }

                require([
                    propertiesPaneClass
                ], dojo.hitch(this, function(cls){

                    this.propertiesPane = new cls();

                    this.propertiesPane.createRendering(
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

                    this.itemNode.set("content", this.propertiesPane);

                }));


            });

            if (config.viewEntryTemplate.isRetrieved) {

                renderAttributes(contentItem, config);

            } else {

                config.viewEntryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                    config.viewEntryTemplate = entryTemplate ;

                    renderAttributes(contentItem, config);

                }), false, true);

            }

		},

        // вызывается после создания редактора
		postInitializeEditor: function() {

            if (this.config) {

                // считываем данные из документа

                if (this.readOnly) {

                    // отключаем все кнопки

                    domStyle.set(this._selectButton.domNode, "display", "none");

                    domStyle.set(this._editButton.domNode, "display", "none");

                    domStyle.set(this._deleteButton.domNode, "display", "none");

                }

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

		_applyValue: function() {

            var value = this.retrieveNormalizedValue();

            if (value) {

                this.repository.retrieveItem(value, dojo.hitch(this, function(contentItem){

                    this.contentItem = contentItem ;

                    this._displayObject();

                }));

            }

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

            if (this.propertiesPane) {

                this.propertiesPane.clearRendering();

                this.propertiesPane.destroy();

                this.propertiesPane = null ;

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

                        contentItem.retrieveAttributes(dojo.hitch(this, function(){

                            this.applyNormalizedValue(contentItem.id.split(",")[2]);

                            this.contentItem = contentItem ;

                            this._displayObject();

                            dialog.hide();

                            this.emit("change", {});

                            this.validate();

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

                        this.applyNormalizedValue(contentItem.id.split(",")[2]);

                        this.contentItem = contentItem ;

                        this._displayObject();

                        dialog.hide();

                        this.emit("change", {});

		            }));

                })

            });

        },

        _onEdit: function() {

            if (!this.contentItem) {

                return ;

            }

            var config = this.configByTemplate[this.contentItem.template];

            var dialog = new AddObjectDialog();

            dialog.show({

                repository: this.repository,

                contentClass: config.contentClass,

                contentItem: this.contentItem,

                entryTemplate: config.addEntryTemplate,

                title: config.addTitle,

                introText: config.addIntroText,

                onSuccess: dojo.hitch(this, function(contentItem){

		            contentItem.retrieveAttributes(dojo.hitch(this, function(){

                        this.applyNormalizedValue(contentItem.id.split(",")[2]);

                        this.contentItem = contentItem ;

                        this._displayObject();

                        dialog.hide();

                        this.emit("change", {});

		            }));

                })

            });

        },

		_onSave: function() {

		    var result = this.propertiesPane.validateAll(false, true);

		    if (result) {

		        return ;

		    }

            if (this._updatingDocument) {

                return;

            }

            this._updatingDocument = true;

            this.repository.lockItems([this.item], dojo.hitch(this, function(contentItems){

                if (contentItems) {

                    var contentItem = this.item ;

                    var properties = this.propertiesPane.getPropertiesJSON(true, true, false);

                    contentItem.checkIn(
                        contentItem.template,
                        properties,         // criteria
                        "Item",             // contentSourceType
                        null,               // mimeType
                        null,               // filename
                        null,               // content
                        [],                 // childComponentValues
                        null,               // permissions
                        null,               // securityPolicyId
                        true,               // newVersion
                        false,              // checkInAsMinorVersion
                        false,              // autoClassify
                        dojo.hitch(this, function(contentItem){

                            if (contentItem) {

                                // успешно сохранен

                                var value = contentItem.docid || contentItem.id.split(",")[2] ;

                                this.applyNormalizedValue(value);

                                this.item = contentItem ;

                                array.forEach(this.config, function(config){

                                    if (config.contentClass.id == contentItem.template) {

                                        this._displayObject(contentItem, config);

                                    }

                                }, this);

                                this.validate();

                            }

                        })
                    );

                }

            }));

            delete this._updatingDocument ;

		},

		_onDelete: function() {

		    this.applyNormalizedValue(null);

		    this.contentItem = null ;

		    this._displayObject();

		    this.validate(false);

		}

	});

});