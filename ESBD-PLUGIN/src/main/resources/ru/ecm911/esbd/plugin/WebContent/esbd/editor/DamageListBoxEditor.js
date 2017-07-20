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
	"ecm/model/ResultSet",
	"esbd/widget/TitlePane",
	"ecm/widget/ValidationTextBox",
	"pvr/widget/editors/mixins/_EditorMixin",
	"pvr/widget/editors/mixins/_TextMixin",
	"idx/widget/HoverHelpTooltip",
	"pvr/controller/value/Value",
	"esbd/client/LookupClientDialog",
	"esbd/AddObjectDialog",
	"ecm/widget/dialog/MessageDialog",
	"dojo/text!./templates/DamageListBoxEditor.html"
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
    ResultSet,
    TitlePane,
    ValidationTextBox,
    _EditorMixin,
    _TextMixin,
    HoverHelpTooltip,
    Value,
    LookupClientDialog,
    AddObjectDialog,
    MessageDialog,
    template
) {

	return declare("esbd.editor.DamageListBoxEditor", [
	   _Widget,
	   _TemplatedMixin,
	   _WidgetsInTemplateMixin,
	   _CompositeMixin,
	   _CssStateMixin,
	   _EditorMixin
	], {

		templateString: template,

		repository: null,

        // значения свойства
		value: [],

        // объекты отражающие ущерб ecm.model.ContentItem
		contentItems: [],

		// компоненты, в которых отображаются объекты
		propertiesPanes: {},

		label: "",

		internalError: [],

		externalError: [],

		readOnly: false,

		message: "",

		state: "",

		editorClass: "pvrDamageListBoxEditor",

		baseClass: "pvrDamageListBoxEditor",

		oneuiBaseClass: "",

		// конфигурационные данные в виде идентификатора объекта, содержащего
		// данные в виде json
		config: null,

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

			var value = this.retrieveNormalizedValue();

			this.displayMessage(message, isFocused);

			return isValid;

		},

		isValid: function(isFocused) {

			return !this._hasError() && this._satisfiesRequiredCondition() && !this._isDirty();

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

		_isDirty: function() {

		    return this.dirtyItems && this.dirtyItems.length > 0 ;

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

            if (this.config) {

                if (this.readOnly) {

                    // отключаем все кнопки

                    domStyle.set(this._selectButton.domNode, "display", "none");

                }

                // считываем данные из документа

                this.repository.retrieveItem(this.config, dojo.hitch(this, function(contentItem){

                    var retrieveConfig = dojo.hitch(this, function(contentItem){

                        dojo.xhrGet({
                            url: contentItem.getContentUrl(),
                            handleAs: "json",
                            load: dojo.hitch(this, function(obj) {

                                this.config = obj ;

                                // создаем объектную модель на основании конфигурационных данных
                                array.forEach(this.config, function(config){

                                    config.contentClass = this.repository.getContentClass(config.contentClass);

                                    config.viewEntryTemplate = new EntryTemplate({
                                        repository: this.repository,
                                        id: config.viewEntryTemplate
                                    });

                                    config.addEntryTemplate = new EntryTemplate({
                                        repository: this.repository,
                                        id: config.addEntryTemplate
                                    });

                                }, this);

                                // загружаем данные по определениям классов
                                this.repository.retrieveContentClassList(dojo.hitch(this, function(contentClasses){

                                    array.forEach(contentClasses, function(contentClass){

                                        array.forEach(this.config, function(config){

                                            if (config.contentClass.id == contentClass.id) {

                                                config.contentClass = contentClass ;

                                            }

                                        }, this);

                                    }, this);

                                    this._createMenu();

                                    this._applyValue();

                                }), array.map(this.config, function(config){

                                    return config.contentClass.id ;

                                }), this);

                            }),
                            error: dojo.hitch(this, function(err) {

                                this.config = [] ;

                                this.set("error", "Неверно указана конфигурация редактора");

                            })
                        });

                    });

                    if (contentItem.currentVersion) {

                        retrieveConfig(contentItem);

                    } else {

                        this.repository.retrieveItem(contentItem.id, dojo.hitch(this, function(current){

                            retrieveConfig(current);

                        }), null, "current", contentItem.vsId);

                    }

                }));

            } else {

                this.set("error", "Не указана конфигурация для редактора");

            }

		},

		// вызывается после того, как все данные конфигурации получены
		// форматирует внешний вид редактора под конфигурационные данные
		_createMenu: function() {

            // удаляем предыдущие элементы выпадающего меню

            var children = this.dropDownMenu.getChildren();

            if (children) {

                array.forEach(children, function(child){

                    this.dropDownMenu.removeChild(child);

                    child.destroy();

                }, this);

            }

            // обновляем выпадающее меню с перечнем классов

            array.forEach(this.config, function(config){

                var menuItem = new MenuItem({
                    label: config.contentClass.name,
                    onClick: dojo.hitch(this, function(){
                        this._onSelect(config);
                    })
                })

                this.dropDownMenu.addChild(menuItem);

            }, this);

		},

		_applyValue: function() {

            var value = this.retrieveNormalizedValue();

            if (value && lang.isArray(value) && value.length > 0) {

                this.repository.retrieveMultiItem(value, dojo.hitch(this, function(contentItems){

                    this.items = contentItems ;

                    array.forEach(this.items, function(contentItem){

                        array.forEach(this.config, function(config){

                            if (config.contentClass.id == contentItem.template) {

                                this.contentItems.push(contentItem);

                                this._addItem(contentItem, config);

                            }

                        }, this);

                    }, this);

                }));

            }

		},

        // добавляет объект в список объектов
		_onSelect: function(config) {

		    // на основании информации о классе, открывает диалог со
		    // свойствами

		    var dialog = new AddObjectDialog();

		    dialog.show({

		        repository: this.repository,

		        contentClass: config.contentClass,

		        entryTemplate: config.addEntryTemplate,

		        onSuccess: dojo.hitch(this, function(contentItem){

		            // добавить документ в список

		            dialog.hide();

		            this._onAdd(contentItem, config);

		        })

		    })

		},

		_onAdd: function(contentItem, config) {

		    console.log("[DamageListBoxEditor] _onAdd, contentItem: ", contentItem);

            var widget = new TitlePane({
                title: contentItem.template_label,
                closable: true,
                onClose: dojo.hitch(this, function(){

                    var id = contentItem.id.split(",")[2];

                    if (this.value && lang.isArray(this.value)) {

                        this.value = array.filter(this.value, function(item){ return item != id; }, this);

                    }

                    this.contentItems = array.filter(this.contentItems, function(item){ return item.id != contentItem.id; }, this);

                    // удаляем панель отображения

                    var propertiesPane = this.propertiesPanes[id];

                    if (propertiesPane) {

                        propertiesPane.clearRendering();

                        propertiesPane.destroy();

                    }

                    delete this.propertiesPanes[id];

                    this.validate();

                }),

                resize: dojo.hitch(this, function(changeSize, resultSize){

                    var id = contentItem.id.split(",")[2];

                    var propertiesPane = this.propertiesPanes[id];

                    if (propertiesPane && propertiesPane.resize) {

                        propertiesPane.resize();

                    }

                })

            });

            var createRendering = dojo.hitch(this, function(config){

                var propertiesPaneClass = "ecm/widget/CommonPropertiesPane";

                if (config.viewEntryTemplate && config.viewEntryTemplate.layoutPropertiesPaneClass) {

                    propertiesPaneClass = config.viewEntryTemplate.layoutPropertiesPaneClass ;

                }

                require([
                    propertiesPaneClass
                ], dojo.hitch(this, function(cls){

                    var self = this ;

                    var propertiesPane = new cls({

                        onChange: function() {

                            if (this.completeRendering) {

                                if (self.property && self.property.view) {

                                    self.validate();

                                }

                            }

                        },

                        onCompleteRendering: function() {

                            this.completeRendering = true ;

                        }

                    });

                    widget.set("content", propertiesPane);

                    propertiesPane.createRendering(
                        config.contentClass,
                        config.viewEntryTemplate,
                        contentItem,
                        "editProperties",
                        this.readOnly,
                        false,
                        dojo.hitch(this, function(callback){

                        }),
                        dojo.hitch(this, function(error){

                        })
                    );

                    this.propertiesPanes[contentItem.id] = propertiesPane ;

                }));

                this.itemsNode.addChild(widget);

            });

            if (config.viewEntryTemplate.isRetrieved) {

                createRendering(config);

            } else {

                config.viewEntryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                    config.viewEntryTemplate = entryTemplate ;

                    createRendering(config);

                }));

            }

		}

	});

});
