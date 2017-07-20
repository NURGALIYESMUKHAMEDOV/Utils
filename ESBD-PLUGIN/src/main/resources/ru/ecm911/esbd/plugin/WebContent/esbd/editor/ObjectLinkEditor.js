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
	"dojo/text!./templates/ObjectLinkEditor.html"
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

	return declare("esbd.editor.ObjectLinkEditor", [
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

		editorClass: "pvrObjectLinkEditor",

		baseClass: "pvrObjectLinkEditor",

		oneuiBaseClass: "",

		// выбранный объект типа ecm.model.ContentItem
		contentItem: null,

        // действие, которое будет вызвано при клике на ссылку
        actionName: null,

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

                this._initialValue = value;

			}

		},

        // отображает текущее значение выбранного значения
		_displayObject: function() {

            if (this.contentItem) {

                var name = this.contentItem.getValue("{NAME}");

                this.objectNode.set("label", name);

            } else {

                this.objectNode.set("label", "");

            }

		},

        // вызывается после создания редактора
		postInitializeEditor: function() {

            var value = this.retrieveNormalizedValue();

            if (value) {

                this.repository.retrieveItem(value, dojo.hitch(this, function(contentItem){

                    this.contentItem = contentItem ;

                    this._displayObject();

                }));

            }

		},

		_onOpen: function() {

		    var action = lang.getObject(this.actionName);

		    if (action && lang.isFunction(action)) {

		        action(this.repository, [this.contentItem], null, null, null, {widget : this});

		    }

		},

	});

});