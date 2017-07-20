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
	"esbd/client/LookupClientDialog",
	"dojo/text!./templates/InsurerBoxEditor.html"
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
    LookupClientDialog,
    template
) {

	return declare("esbd.editor.InsurerBoxEditor", [
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

		editorClass: "pvrInsurerBoxEditor",

		baseClass: "pvrInsurerBoxEditor",

		oneuiBaseClass: "",

		// если данные выбранного объекта были изменены
		dirtyState: false,

		// выбранный объект типа ecm.model.ContentItem
		item: null,

		// конфигурационные данные в виде идентификатора объекта, содержащего
		// данные в виде json
		config: null,

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

			var value = this.retrieveNormalizedValue();

			var isDirty = this._isDirty();

            domStyle.set(this._saveButton.domNode, "display", value && isDirty ? "inline" : "none");

            domStyle.set(this._deleteButton.domNode, "display", value ? "inline" : "none");

			this.displayMessage(message, isFocused);

			return isValid;

		},

		isValid: function(isFocused) {

		    if (this._hasError()) {

		        return false ;

		    }

		    if (this._isDirty()) {

		        return false ;

		    }

            var result = !this._hasError() && this._satisfiesRequiredCondition();

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

		_isDirty: function() {

		    return this.dirtyState ;

		},

		getErrorMessage: function(isFocused) {

			var error = this.get("error");

			if (this._hasError()) {

				return lang.isArray(error) ? "resources.validationError.dropDownError" : error; // TODO: replace dropDownError with the proper resource key.

			}

			if (!this._satisfiesRequiredCondition()) {

				return "Значение обязательно к указанию"; // TODO Update this to use this.missingMessage.

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

		_displayObject: function(contentItem, config) {

            if (this.propertiesPane) {

                this.propertiesPane.clearRendering();

                this.propertiesPane.destroy();

                this.propertiesPane = null ;

                this.propertiesLoadTime = null ;

            }

            var renderAttributes = dojo.hitch(this, function(contentItem, config) {

                var propertiesPaneClass = "ecm/widget/CommonPropertiesPane";

                if (config.viewEntryTemplate && config.viewEntryTemplate.layoutPropertiesPaneClass) {

                    propertiesPaneClass = config.viewEntryTemplate.layoutPropertiesPaneClass ;

                }

                require([
                    propertiesPaneClass
                ], dojo.hitch(this, function(cls){

                    var self = this ;

                    this.propertiesPane = new cls({

                        onChange: function() {

                            if (this.completeRendering) {

                                if (self.property && self.property.view) {

                                    self.dirtyState = true ;

                                    self.property.view.set("state", "Error");

                                }

                            }

                        },

                        onCompleteRendering: function() {

                            this.completeRendering = true ;

                        }

                    });

                    this.propertiesPane.createRendering(
                        config.contentClass,
                        config.viewEntryTemplate,
                        contentItem,
                        "editProperties",
                        this.readOnly,   // isReadonly
                        false,  // showHidden
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

		postInitializeEditor: function() {

            if (this.config) {

                // считываем данные из документа

                if (this.readOnly) {

                    // отключаем все кнопки

                    domStyle.set(this._selectButton.domNode, "display", "none");

                    domStyle.set(this._saveButton.domNode, "display", "none");

                    domStyle.set(this._deleteButton.domNode, "display", "none");

                }

                this.repository.retrieveItem(this.config, dojo.hitch(this, function(contentItem){

                    var retrieveConfig = dojo.hitch(this, function(contentItem){

                        dojo.xhrGet({
                            url: contentItem.getContentUrl(),
                            handleAs: "json",
                            load: dojo.hitch(this, function(obj) {

                                this.config = obj ;

                                // создаем объектную модель на основании конфигурационных данных
                                array.forEach(this.config, function(item){

                                    item.contentClass = this.repository.getContentClass(item.contentClass);

                                    item.viewEntryTemplate = new EntryTemplate({
                                        repository: this.repository,
                                        id: item.viewEntryTemplate
                                    });

                                    item.addEntryTemplate = new EntryTemplate({
                                        repository: this.repository,
                                        id: item.addEntryTemplate
                                    });

                                }, this);

                                // загружаем данные по определениям классов
                                this.repository.retrieveContentClassList(dojo.hitch(this, function(contentClasses){

                                    array.forEach(contentClasses, function(contentClass){

                                        array.forEach(this.config, function(item){

                                            if (item.contentClass.id == contentClass.id) {

                                                item.contentClass = contentClass ;

                                            }

                                        }, this);

                                    }, this);

                                    this._adjustView();

                                    this._applyValue();

                                }), array.map(this.config, function(item){

                                    return item.contentClass.id ;

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

		_applyValue: function() {

            var value = this.retrieveNormalizedValue();

            if (value) {

                this.repository.retrieveItem(value, dojo.hitch(this, function(contentItem){

                    array.forEach(this.config, function(config){

                        if (config.contentClass.id == contentItem.template) {

                            this.item = contentItem ;

                            this._displayObject(contentItem, config);

                        }

                    }, this);

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

            array.forEach(this.config, function(item){

                var menuItem = new MenuItem({
                    label: item.contentClass.name,
                    onClick: dojo.hitch(this, function(){
                        this._onLookup(item);
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
		_onLookup: function(config) {

		    var dialog = new LookupClientDialog({

		        config: config,

		        onSelect: dojo.hitch(this, function(contentItem){

		            contentItem.retrieveAttributes(dojo.hitch(this, function(){

                        this.applyNormalizedValue(contentItem.docid);

                        this.item = contentItem ;

                        this._displayObject(contentItem, config);

                        dialog.hide();

                        this.emit("change", {});

		            }));

		        })

		    });

		    dialog.show();

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

                                this.dirtyState = null ;

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

/*
            var request ;

            var completedHandler = aspect.after(ecm.model.desktop, "onRequestCompleted", dojo.hitch(this, function(completedRequest) {

                if (!request || !request.isSameRequestAs(completedRequest)) {

                    return;

                }


                delete this._addingDocument;

                completedHandler.remove();

            }), true);

		    var parentFolder = this.config.addEntryTemplate.folder ;

		    var properties = this.propertiesPane.getPropertiesJSON(true, true, false);

		    var permissions = this.config.addEntryTemplate.permissions;

		    permissions = array.map(permissions, function(permission){

		        return permission.json();

		    }, this);

            request = this.repository.addDocumentItem(
                parentFolder,
                this.repository.objectStore,
                this.config.contentClass.id,    // имя класса
                properties,                     // свойства
                "Item",                         // contentSourceType
                null,                           // mimetype
                null,                           // filename
                null,                           // content
                [],                             // childComponentValues (CM only)
                permissions,
                null,                           // securityPolicyId
                false,                          // addAsMinorVersion
                false,                          // autoClassify
                false,                          // allowDuplicateFileNames
                false,                          // setSecurityParent
                null,                           // teamspaceId
                lang.hitch(this, function(contentItem){

                    this.onAdd(contentItem);

                }),
                false,                          // isBackgroundRequest
                lang.hitch(this, function(error){
                                                // error
                }),
                false                           // compoundDocument
            );

            if (!request) {

                if (completedHandler) {

                    completedHandler.remove();
                }

                delete this._addingDocument;
            }

*/

		},

		_onDelete: function() {

		    this.applyNormalizedValue(null);

		    this.dirtyState = false ;

		    if (this.propertiesPane) {

                this.propertiesPane.clearRendering();

                this.propertiesPane.destroy();

                this.propertiesPane = null ;

                this.propertiesLoadTime = null ;

		    }

		    this.validate(false);

		}

	});

});