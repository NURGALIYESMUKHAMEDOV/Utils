define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/json",
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
	"ecm/model/Request",
	"ecm/model/EntryTemplate",
	"ecm/widget/TitlePane",
	"ecm/widget/ValidationTextBox",
	"ecm/widget/dialog/YesNoCancelDialog",
	"pvr/widget/editors/mixins/_EditorMixin",
	"pvr/widget/editors/mixins/_TextMixin",
	"idx/widget/HoverHelpTooltip",
	"pvr/controller/value/Value",
	"esbd/client/LookupClientDialog",
	"dojo/text!./templates/PremiumBoxEditor.html"
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
    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _CompositeMixin,
    _CssStateMixin,
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
    LookupClientDialog,
    template
) {

	return declare("esbd.editor.PremiumBoxEditor", [
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

		postCreate: function() {

			this.inherited(arguments);

            if (!this.repository) {

                // редактор работает всегда только с одним репозиторием

                this.repository = ecm.model.desktop.repositories[0];

            }

			console.log(this._lastValue);
			console.log(this.normalizedValue);
			console.log(this.value);

			console.log("this.property.toString()");
			console.log(this);
			console.log("this.property.toString()");
			console.log(this.property);

			this.contentNode.set("value", this.normalizedValue);

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

		    if (this._hasError()) {

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

        /*
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
		*/

		_setValueAttr: function(value, row) {

			if (this.editorReady) {

			    this.value = value ;

			} else {

				if (!Value.equals(this.value, value)) {

					this._initialValue = value;

				}

			}

		},

		postInitializeEditor: function() {

		    if (this.readOnly) {

		        domStyle.set(this._calculateButton.domNode, "display", "none");

            }

		},

        /*
		postInitializeEditor: function() {

            if (this.config) {

                // считываем данные из документа

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

                            this._displayObject(contentItem, config.contentClass, config.viewEntryTemplate);

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

                        this.validate();

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

                                console.log("updated contentItem: ", contentItem);

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

		*/

		_onCalculate: function() {

		    console.log("onCalculate, this: ", this);

		    var property = this.property ;

		    var view = property.view ;

		    // console.log("view: ", view);

		    var properties = [] ;

		    view.forEachProperty({

		        callback: dojo.hitch(this, function(property){

					console.log(property.controller.id);

		            if (property.controller.id == "ESBD_InsuredClients" || property.controller.id == "ESBD_InsuredVehicles"
						|| property.controller.id == "ESBD_Amount" || property.controller.id == "ESBD_Tarif"
						|| property.controller.id == "ESBD_PassengerType" || property.controller.id == "ESBD_CorrectionFactor"
						|| property.controller.id == "ESBD_ProfRiskClass" || property.controller.id == "ESBD_StartDate"
						|| property.controller.id == "ESBD_EndDate") {

		                console.log("property: ", property);

                        properties.push({
                            "name" : property.controller.id,
                            "value": property.controller.get("value"),
                            "dataType": property.controller.model.dataType,
                            "label": property.controller.get("name")
                        });

						console.log("Premium property");
						console.log(property);
                    }

		        })

		    });

		    console.log("properties: ", properties);
			console.log("this.property: ", this.property);


		    // submit to the service & display result

		    // var prop = view.getProperty("Properties", "ESBD_Premium");

		    // console.log("prop: ", prop);

		    // prop[0].controller.set("value", 1000);

				var requestParams = {
					name: "calculatePremium",
					repositoryId: this.repository.id,
					properties: json.stringify(properties),
					item: this.property.controller.model.contentClass.id
				};


            requestParams = Request.setSecurityToken(requestParams);

			console.log("Test property");
			console.log(requestParams);

            Request.invokePluginService("ESBDPlugin", "CommonService", {
                requestParams: requestParams,
                requestCompleteCallback: dojo.hitch(this, dojo.hitch(this, function(response){

                    console.log("response: ", response);

                    if ("calculatedPremium" in response) {

                        this.property.controller.set("value", response.calculatedPremium);

                        this.contentNode.set("value", response.calculatedPremium);

                        view.forEachProperty({

                            filter: function(property) {

                                return property.controller.id == "ESBD_Premium" ;

                            },

                            callback: dojo.hitch(this, function(property){

                                console.log("property: ", property);

                                property.controller.set("value", response.calculatedPremium);

                            })

                        });

                    }

                }))

            });


		}

	});

});