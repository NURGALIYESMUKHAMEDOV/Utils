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
	"esbd/widget/TitlePane",
	"ecm/widget/ValidationTextBox",
	"pvr/widget/editors/mixins/_EditorMixin",
	"pvr/widget/editors/mixins/_TextMixin",
	"idx/widget/HoverHelpTooltip",
	"pvr/controller/value/Value",
	"esbd/client/LookupClientDialog",
	"ecm/widget/dialog/MessageDialog",
	"dojo/text!./templates/ClientListBoxEditor.html"
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
    LookupClientDialog,
    MessageDialog,
    template
) {

	return declare("esbd.editor.ClientListBoxEditor", [
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
		items: [],

		// объекты, которые подверглись изменениям ecm.model.ContentItem
		dirtyItems: [],

		// компоненты, в которых отображаются объекты
		propertiesPanes: {},

		label: "",

		internalError: [],

		externalError: [],

		readOnly: false,

		message: "",

		state: "",

		editorClass: "pvrDropDownEditor",

		baseClass: "pvrDropDownEditor",

		oneuiBaseClass: "",

		// конфигурационные данные в виде идентификатора объекта, содержащего
		// данные в виде json
		config: null,

		postCreate: function() {

		    console.log("[ClientListBoxEditor] postCreate, this: ", this);

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

			var isDirty = this._isDirty();

			var value = this.retrieveNormalizedValue();

            domStyle.set(this._saveButton.domNode, "display", value && lang.isArray(value) && value.length > 0 && isDirty ? "inline" : "none");

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

			if (this._isDirty()) {

			    return "Данные были изменены" ;

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

		    console.log("[ClientListBoxEditor] postInitializeEditor, this: ", this);

		    this.items = [];

		    this.dirtyItems = [];

		    this.propertiesPanes = [];

            if (this.config) {

                if (this.readOnly) {

                    // отключаем все кнопки

                    domStyle.set(this._selectButton.domNode, "display", "none");

                    domStyle.set(this._saveButton.domNode, "display", "none");

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

                                    console.log("[ClientBoxEditor] config: ", config);

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

                                    this._adjustView();

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

            array.forEach(this.config, function(config){

                var menuItem = new MenuItem({
                    label: config.contentClass.name,
                    onClick: dojo.hitch(this, function(){
                        this._onLookup(config);
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

		},

		_applyValue: function() {

            var value = this.retrieveNormalizedValue();

            console.log("apply value: ", value);

            if (value && lang.isArray(value) && value.length > 0) {

                this.repository.retrieveMultiItem(value, dojo.hitch(this, function(contentItems){

                    this.items = contentItems ;

                    console.log("retrieved items: ", this.items);

                    array.forEach(this.items, function(contentItem){

                        array.forEach(this.config, function(config){

                            if (config.contentClass.id == contentItem.template) {

                                this._addItem(contentItem, config);

                            }

                        }, this);

                    }, this);

                }));

            }

		},

        // добавляет объект в список объектов
		_addItem: function(contentItem, config) {

            var widget = new TitlePane({
                title: "Застрахованное лицо",
                closable: true,
                onClose: dojo.hitch(this, function(){

                    var id = contentItem.id.split(",")[2];

                    if (this.value && lang.isArray(this.value)) {

                        this.value = array.filter(this.value, function(item){ return item != id; }, this);

                    }

                    this.items = array.filter(this.items, function(item){ return item.id != contentItem.id; }, this);

                    this.dirtyItems = array.filter(this.dirtyItems, function(item){ return item.id != contentItem.id; }, this);

                    // удаляем панель отображения

                    var propertiesPane = this.propertiesPanes[id];

                    if (propertiesPane) {

                        propertiesPane.clearRendering();

                        propertiesPane.destroy();

                    }

                    this.propertiesPanes[id] = null ;

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

                                    if (!array.some(self.dirtyItems, function(item){ return item.id == contentItem.id; }, this)) {

                                        self.dirtyItems.push(contentItem);

                                    }

                                    self.dirtyState = true ;

                                    self.property.view.set("state", "Error");

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

		},

		// вызывает на событие добавления/выбора объекта, соответствующего
		// переданным конфигурационным данным
		_onLookup: function(config) {

		    var dialog = new LookupClientDialog({

		        config: config,

		        onSelect: dojo.hitch(this, function(contentItem){

		            if (array.some(this.items, function(item){ return item.id == contentItem.id; }, this)){

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

                        this.items.push(contentItem);

                        this._addItem(contentItem, config);

                        dialog.hide();

                        this.emit("change", {});

		            }));

		        })

		    });

		    dialog.show();

		},

		_onSave: function() {

		    var result = array.some(this.dirtyItems, function(contentItem){

		        var propertiesPane = this.propertiesPanes[contentItem.id];

                var result = propertiesPane.validateAll(false, true);

                if (result) {

                    return true ;

                } else {

                    return false ;

                }

		    }, this);

		    if (result) {

		        return ;

		    }

		    // Необходимо сохранить все сделанные изменения, при этом обновить соответствующие объекты в
		    // массиве

		    // 1. блокируем объекты

		    this.repository.lockItems(this.dirtyItems, dojo.hitch(this, function(){

		        // 2. для каждого объекта обновляем его данные

		        var checkIn = dojo.hitch(this, function(contentItem) {

		            var propertiesPane = this.propertiesPanes[contentItem.id];

		            var properties = propertiesPane.getPropertiesJSON(true, true, false);

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
                        dojo.hitch(this, function(newContentItem) {

                            if (newContentItem) {

                                // удалить предыдущий из dirtyItems

                                this.dirtyItems = array.filter(this.dirtyItems, function(item){ return item.id != contentItem.id ; }, this);

                                var id = contentItem.id.split(",")[2];

                                var value = this.retrieveNormalizedValue();

                                value = array.map(value, function(item){ return item == id ? newContentItem.id.split(",")[2] : item ; }, this);

                                this.applyNormalizedValue(value);

                                this.items = array.map(this.items, function(item){ return item.id == contentItem.id ? newContentItem : item ; }, this);

                                var propertiesPane = this.propertiesPanes[contentItem.id];

                                if (this.dirtyItems.length > 0) {

                                    // взять следующий из dirtyItems

                                    checkIn(this.dirtyItems[0]);

                                } else {

                                    this.validate();

                                }

                                // если ничего не осталось, то validate

                            } else {

                                // разблокируем оставшиеся элементы

                                if (this.dirtyItems) {

                                    this.repository.unlockItems(this.dirtyItems);

                                }

                            }

                        })
		            );

		        });

		        checkIn(this.dirtyItems[0]);

		    }));

		},

		resize: function() {

		    console.log("[ClientListBoxEditor] resize[3], this: ", this);

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
