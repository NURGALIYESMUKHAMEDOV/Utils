define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-class",
	"dojo/dom-style",
	"dijit/_base/wai",
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
	"esbd/vehicle2/LookupVehicleDialog",
	"ecm/widget/dialog/MessageDialog",
	"dojo/text!./templates/VehicleListBoxEditor.html"
],
function(
    declare,
    lang,
    array,
    domClass,
    domStyle,
    wai,
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
    LookupVehicleDialog,
    MessageDialog,
    template
) {

	return declare("esbd.editor.VehicleListBoxEditor", [
	   _Widget,
	   _TemplatedMixin,
	   _WidgetsInTemplateMixin,
	   _CompositeMixin,
	   _CssStateMixin,
	   _EditorMixin
	], {

		templateString: template,

		repository: null,

		entryTemplateId: null,

		label: "",

        // значения поля
		value: [],

        // выбранные объекты ecm.model.ContentItem
		items: [],

		// объекты, которые подверглись изменениям ecm.model.ContentItem
		dirtyItems: [],

		// компоненты, в которых отображаются объекты
		propertiesPanes: {},

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

		    console.log("[VehicleListBoxEditor] postCreate, this: ", this);

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

				return lang.isArray(error) ? "resources.validationError.dropDownError" : error; // TODO: replace dropDownError with the proper resource key.

			}

			if (!this._satisfiesRequiredCondition()) {

				return "resources.validationError.required"; // TODO Update this to use this.missingMessage.

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

		    console.log("[VehicleListBoxEditor] postInitializeEditor, this: ", this);

		    this.items = [];

		    this.dirtyItems = [];

		    this.propertiesPanes = [];

            if (this.config) {

                if (this.readOnly) {

                    // отключаем все кнопки

                    domStyle.set(this._addButton.domNode, "display", "none");

                    domStyle.set(this._saveButton.domNode, "display", "none");

                }

                // считываем данные из документа

                this.repository.retrieveItem(this.config, dojo.hitch(this, function(contentItem){

                    dojo.xhrGet({
                        url: contentItem.getContentUrl(),
                        handleAs: "json",
                        load: dojo.hitch(this, function(obj) {

                            this.config = obj ;

                            this.config.contentClass = this.repository.getContentClass(this.config.contentClass);

                            this.config.viewEntryTemplate = new EntryTemplate({
                                repository: this.repository,
                                id: this.config.viewEntryTemplate
                            });

                            this.config.addEntryTemplate = new EntryTemplate({
                                repository: this.repository,
                                id: this.config.addEntryTemplate
                            });

                            this._applyValue();

                        }),
                        error: dojo.hitch(this, function(err) {

                            this.config = null ;

                            this.set("error", "Неверно указана конфигурация редактора");

                        })
                    });

                }), null, "released");

            } else {

                this.set("error", "Не указана конфигурация для редактора");

            }

		},

		_applyValue: function() {

		    console.log("[VehicleListEditor] _applyValue");

            var value = this.retrieveNormalizedValue();

            console.log("[VehicleListEditor] _applyValue, value: ", value);

            if (value && lang.isArray(value) && value.length > 0) {

                this.repository.retrieveMultiItem(value, dojo.hitch(this, function(contentItems){

                    this.items = contentItems ;

                    array.forEach(contentItems, function(contentItem){

                        this._addItem(contentItem);

                    }, this);

                }));

            }

		},

		_onAdd: function() {

		    var dialog = new LookupVehicleDialog({

		        config: this.config,

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

                        this._addItem(contentItem);

                        dialog.hide();

                        this.emit("change", {});

		            }));

		        })

		    });

		    dialog.show();

		},

        // добавляет объект в список объектов
		_addItem: function(contentItem) {

            var widget = new TitlePane({
                title: "Транспортное средство",
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

            var createRendering = dojo.hitch(this, function(){

                var propertiesPaneClass = "ecm/widget/CommonPropertiesPane";

                if (this.config.viewEntryTemplate && this.config.viewEntryTemplate.layoutPropertiesPaneClass) {

                    propertiesPaneClass = this.config.viewEntryTemplate.layoutPropertiesPaneClass ;

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
                        this.config.contentClass,
                        this.config.viewEntryTemplate,
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

            if (this.config.viewEntryTemplate.isRetrieved) {

                createRendering();

            } else {

                this.config.viewEntryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                    this.config.viewEntryTemplate = entryTemplate ;

                    createRendering();

                }));

            }

		},

		_onSave: function() {

		    if (array.some(this.dirtyItems, function(contentItem){

		        var propertiesPane = this.propertiesPanes[contentItem.id];

		        return !!propertiesPane.validateAll(false, true);

		    }, this)) {

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

		}

	});

});
