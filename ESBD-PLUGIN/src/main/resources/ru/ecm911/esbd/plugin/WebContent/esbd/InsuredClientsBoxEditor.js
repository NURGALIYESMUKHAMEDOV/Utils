define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-class",
	"dijit/_base/wai",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"idx/form/_CompositeMixin",
	"idx/form/_CssStateMixin",
	"dijit/form/Button",
	"ecm/model/EntryTemplate",
	"ecm/widget/TitlePane",
	"ecm/widget/ValidationTextBox",
	"pvr/widget/editors/mixins/_EditorMixin",
	"pvr/widget/editors/mixins/_TextMixin",
	"idx/widget/HoverHelpTooltip",
	"esbd/client/person/LookupPersonDialog",
	"dojo/text!./templates/InsuredClientsBoxEditor.html"
],
function(
    declare,
    lang,
    array,
    domClass,
    wai,
    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _CompositeMixin,
    _CssStateMixin,
    Button,
    EntryTemplate,
    TitlePane,
    ValidationTextBox,
    _EditorMixin,
    _TextMixin,
    HoverHelpTooltip,
    LookupPersonDialog,
    template
) {

	return declare("esbd.InsuredClientsBoxEditor", [
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

		value: [],

		internalError: [],

		externalError: [],

		readOnly: false,

		message: "",

		state: "",

		editorClass: "pvrDropDownEditor",

		baseClass: "pvrDropDownEditor",

		oneuiBaseClass: "",

		// класс документа, добавляемого в список
		contentClass: null,

		// шаблон ввода, для отображения данных документа
		entryTemplate: null,

		postCreate: function() {

			this.inherited(arguments);

            if (!this.repository) {

                this.repository = ecm.model.desktop.repositories[0];

            }

            this.contentClass = this.repository.getContentClass("ESBD_Person");

            var propertyController = this.editorParams.property ;

            propertyController._helpNode.style.display = "none" ;

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

				return "resources.validationError.required"; // TODO Update this to use this.missingMessage.

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
			// Don't call the inherited method (found in _EditorMixin.js).
			/*
			if (this.editorReady) {
				if (typeof(row) === "number") {
					if (row >= 0 && this.property.controller.cardinality === "multi") {
						var currentError = array.map(this.get("error"), function(item) {
							return item;
						});
						for (var i = currentError.length; i < row; i++) {
							currentError.push(null); // Note: The adjustPendingValue method will coerce null as required.
						}
						currentError[row] = error;
						this.adjustPendingError(currentError);
						this._applyPendingChanges();
					}
				} else {
					this.adjustPendingError(error);
					this._applyPendingChanges();
				}
			} else {
				this._initialError = error;
			}
			*/
		},

		_onAdd: function() {

		    var dialog = new LookupPersonDialog({

		        onSelect: dojo.hitch(this, function(contentItem){

		            // необходима некоторая структура где отображать выбранный объект

		            this._createItem(contentItem);

		            dialog.hide();

		        })

		    });

		    dialog.show();

		},

		_createItem: function(contentItem) {

            var widget = new TitlePane({
                title: "Застрахованное лицо",
                closable: true,
                onClose: dojo.hitch(this, function(){
                    console.log("закрытие")
                })
            });

            // находит соответствующий EntryTemplate

            var entryTemplate = new EntryTemplate({
                repository: this.repository,
                id: this.entryTemplateId
            });

            console.log("entryTemplate: ", entryTemplate);

            entryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(item){

                this.entryTemplate = item ;

                console.log("retrieved entryTemplate: ", this.entryTemplate);

                var commonPropertiesClass = "ecm/widget/CommonPropertiesPane";

                if (this.entryTemplate && this.entryTemplate.layoutPropertiesPaneClass) {

                    commonPropertiesClass = this.entryTemplate.layoutPropertiesPaneClass ;

                }

                require([
                    commonPropertiesClass
                ], dojo.hitch(this, function(cls){

                    var commonProperties = new cls();

                    widget.set("content", commonProperties);

                    commonProperties.createRendering(
                        this.contentClass,
                        this.entryTemplate,
                        contentItem,
                        "editProperties",
                        true,
                        false,
                        dojo.hitch(this, function(callback){

                        }),
                        dojo.hitch(this, function(error){

                        })
                    );

                }));


            }),false,true);

            this.itemsNode.addChild(widget);

		}

	});

});
