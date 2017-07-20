define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-style",
	"dijit/_base/wai",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"idx/form/_CompositeMixin",
	"idx/form/_CssStateMixin",
	"ecm/model/EntryTemplate",
	"pvr/widget/editors/mixins/_EditorMixin",
	"idx/widget/HoverHelpTooltip",
	"esbd/client/LookupClientDialog",
	"dojo/text!./templates/PersonBoxEditor.html"
], function(
    declare,
    lang,
    array,
    domStyle,
    wai,
    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _CompositeMixin,
    _CssStateMixin,
    EntryTemplate,
    _EditorMixin,
    HoverHelpTooltip,
    LookupClientDialog,
    template
) {

	return declare("esbd.editor.PersonBoxEditor", [
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

		editorClass: "pvrDropDownEditor",

		baseClass: "pvrDropDownEditor",

		oneuiBaseClass: "",

		// выбранный объект типа ecm.model.ContentItem
		item: null,

		// конфигурационные данные в виде идентификатора объекта, содержащего
		// данные в виде json
		config: null,

		// виджет для отобрадения свойств выбранного объекта
		propertiesPane: null,

		postCreate: function() {

		    console.log("[PersonBoxEditor] postCreate, this: ", this);

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

                this._initialValue = value;

			}

		},

		_displayObject: function(contentItem) {

            if (this.propertiesPane) {

                this.propertiesPane.clearRendering();

                this.propertiesPane.destroy();

                this.propertiesPane = null ;

            }

            var renderAttributes = dojo.hitch(this, function(contentItem) {

                var propertiesPaneClass = "ecm/widget/CommonPropertiesPane";

                if (this.config.viewEntryTemplate && this.config.viewEntryTemplate.layoutPropertiesPaneClass) {

                    propertiesPaneClass = this.config.viewEntryTemplate.layoutPropertiesPaneClass ;

                }

                require([
                    propertiesPaneClass
                ], dojo.hitch(this, function(cls){

                    var self = this ;

                    this.propertiesPane = new cls();

                    this.propertiesPane.createRendering(
                        this.config.contentClass,
                        this.config.viewEntryTemplate,
                        contentItem,
                        "viewProperties",
                        true,   // isReadonly
                        false,  // showHidden
                        dojo.hitch(this, function(callback){

                        }),
                        dojo.hitch(this, function(error){

                        })
                    );

                    this.itemNode.set("content", this.propertiesPane);

                }));


            });

            if (this.config.viewEntryTemplate.isRetrieved) {

                renderAttributes(contentItem);

            } else {

                this.config.viewEntryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                    this.config.viewEntryTemplate = entryTemplate ;

                    renderAttributes(contentItem);

                }), false, true);

            }

		},

		postInitializeEditor: function() {

		    console.log("[PersonBoxEditor] postInitializeEditor, this: ", this);

            if (this.config) {

                // считываем данные из документа

                if (this.readOnly) {

                    // отключаем все кнопки

                    domStyle.set(this._selectButton.domNode, "display", "none");

                }

                this.repository.retrieveItem(this.config, dojo.hitch(this, function(contentItem){

                    var retrieveConfig = dojo.hitch(this, function(contentItem){

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

		    console.log("[PersonBoxEditor] _applyValue, value: ", value);

            if (value) {

                this.repository.retrieveItem(value, dojo.hitch(this, function(contentItem){

                    this._displayObject(contentItem);

                }));

            }

		},

		// вызывает на событие добавления/выбора объекта, соответствующего
		// переданным конфигурационным данным
		_onSelect: function() {

		    var dialog = new LookupClientDialog({

		        config: this.config,

		        onSelect: dojo.hitch(this, function(contentItem){

		            console.log("[PersonBoxEditor] onSelect, contentItem: ", contentItem);

		            contentItem.retrieveAttributes(dojo.hitch(this, function(){

                        this.applyNormalizedValue(contentItem.id.split(",")[2]);

                        this.item = contentItem ;

                        this._displayObject(contentItem);

                        dialog.hide();

                        this.emit("change", {});

		            }));

		        })

		    });

		    dialog.show();

		}

	});

});