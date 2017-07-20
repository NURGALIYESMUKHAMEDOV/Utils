define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/json",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/dom-geometry",
	"dijit/_base/wai",
	"dijit/DropDownMenu",
	"dijit/MenuItem",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"idx/html",
	"idx/form/_CompositeMixin",
	"idx/form/_CssStateMixin",
	"dijit/form/_FormWidget",
	"dijit/form/Button",
	"dijit/layout/ContentPane",
	"ecm/model/Request",
	"ecm/model/EntryTemplate",
	"ecm/model/User",
	"ecm/model/UserGroup",
	"ecm/widget/TitlePane",
	"ecm/widget/DropDownLink",
	"ecm/widget/ValidationTextBox",
	"ecm/widget/dialog/YesNoCancelDialog",
	"pvr/widget/editors/mixins/_EditorMixin",
	"pvr/widget/editors/mixins/_TextMixin",
	"idx/widget/HoverHelpTooltip",
	"pvr/controller/value/Value",
	"ecm/widget/dialog/SelectUserGroupDialog",
	"dojo/text!./templates/PrincipalsBoxEditor.html",
	"dojo/i18n!pvr/nls/common"
],
function(
    declare,
    lang,
    array,
    json,
    domClass,
    domStyle,
    domGeometry,
    wai,
    DropDownMenu,
    MenuItem,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    html,
    _CompositeMixin,
    _CssStateMixin,
    _FormWidget,
    Button,
    ContentPane,
    Request,
    EntryTemplate,
    User,
    UserGroup,
    TitlePane,
    DropDownLink,
    ValidationTextBox,
    YesNoCancelDialog,
    _EditorMixin,
    _TextMixin,
    HoverHelpTooltip,
    Value,
    SelectUserGroupDialog,
    template,
    resources
) {

	return declare("components.editors.PrincipalsBoxEditor", [
	   _WidgetBase,
	   _TemplatedMixin,
	   _WidgetsInTemplateMixin,
	   _CompositeMixin,
	   _CssStateMixin,
	   _EditorMixin
	], {

        // шаблон отображения редактора
		templateString: template,

        // значение редактора
		value: [],

		// значения в виде объектов
		principals: [],

		// панели отображения объектов
		principalPanes: {},

        // ошибка
        internalError: [],

        externalError: [],

        // требуется заполнение или нет?
		required: false,

        // редактируемое поли или нет
        readOnly: false,

        // css класс редактора
		editorClass: "pvrPrincipalsBoxEditor",

        // базовый css класс редактора
		baseClass: "pvrPrincipalsBoxEditor",

        // css класс виджета
		oneuiBaseClass: "",

		postCreate: function() {

			this.inherited(arguments);

		},

		_setValueAttr: function(value) {

			this.value = value;

			this.validate();

			this.formatValue();

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

		_setRequiredAttr: function(required) {

			this.required = required;

			this.validate();

		},


		_setReadOnlyAttr: function(readOnly) {

			this.readOnly = readOnly;

		},

		_setHintAttr: function(hint) {

			this.hint = hint;

		},

		formatValue: function() {

            // удаляем все значения из панели контента

            var children = this.contentNode.getChildren();

            if (children) {

                array.forEach(children, function(child){

                    this.contentNode.removeChild(child);

                    child.destroyRecursive();

                }, this);

            }

            this.principals = [];

            this.principalPanes = {};

            domStyle.set(this.contentNode.domNode, "padding-top", "");

            array.forEach(this.value, function(value){

                var params = json.parse(value);

                var principal = params.isGroup ? new UserGroup(params) : new User(params);

                this.principals.push(principal);

                var principalPane = this._createPrincipalPane(principal);

                this.principalPanes[principal.id] = principalPane ;

                this.contentNode.addChild(principalPane);

            }, this);

		},

		_createPrincipalPane: function(principal) {

            var contentPane = new ContentPane();

            domStyle.set(contentPane.domNode, "padding-top", "2px");

            domStyle.set(contentPane.domNode, "padding-bottom", "2px");

            // domStyle.set(contentPane.domNode, "border-top", "1px solid #008abf");

            // создаем меню для отображения

            var menu = new DropDownMenu();

            if (!this.readOnly) {

                menu.addChild(new MenuItem({
                    label: "Удалить",
                    onClick: dojo.hitch(this, function(){ this._onRemove(principal); })
                }));

            }

            var link = new DropDownLink({
                label: principal.displayName,
                dropDown: menu
            });

            contentPane.addChild(link);

            return contentPane ;

		},

		_isEmpty: function() {

		    return this.value.length == 0;

		},

		isValid: function(isFocused) {

			return !this._hasError() && this._satisfiesRequiredCondition();

		},

		getErrorMessage: function(isFocused) {

			if (this._hasError()) {

				return this.error;

			}

			if (!this._satisfiesRequiredCondition()) {

				return resources.validationError.required;

			}

			return "";

		},

		_satisfiesRequiredCondition: function() {

			return !this.required || !this._isEmpty();

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

		validate: function(isFocused) {

			var isValid = this.disabled || this.isValid(isFocused);

			var isEmpty = this._isEmpty();

			this.set("state", isValid ? "" : "Error");

			this.focusNode.setAttribute("aria-invalid", isValid ? "false" : "true");

			wai.setWaiState(this.focusNode, "invalid", !isValid);

			var message = this.state === "Error" ? this.getErrorMessage(isFocused) : "";

			this._set("message", message);

			this.displayMessage(message, isFocused);

			return isValid;

		},

		displayMessage: function(message, force) {

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

					var node = domStyle.get(this.iconNode, "visibility") == "hidden" ? this.oneuiBaseNode : this.iconNode;

					this.messageTooltip.open(node);

				}

			} else {

				this.messageTooltip && this.messageTooltip.close();

			}

		},

		onEditorChange: function(value) {
		},

		focus: function() {

			this.focusNode && this.focusNode.focus();

		},

		_onFocus: function() {

			this.validate(true);

			this.inherited(arguments);

		},

		_onSelect: function() {

            var dialog = new SelectUserGroupDialog({

                callback: dojo.hitch(this, function(selectedItems){

                    var value = this.value.slice(0);

                    array.forEach(selectedItems, function(principal){

                        var element = json.stringify(principal.toJSON());

                        value.push(element);

                    }, this);

                    this.value = value ;

                    this.emit("change", {});

                    this.resize();

                })

            });

            dialog.show(this.property.controller.model.repository);

		},

		_onRemove: function(principal) {

            // удалить элемент из списка

            this.principals = array.filter(this.principals, function(element){

                return element.id != principal.id ;

            }, this);

            // удалить элемент из значения

            var value = this.value.slice(0);

            var v = json.stringify(principal.toJSON());

            value = array.filter(value, function(element){

                return element != v ;

            }, this);

            // удалить панель из отображения

            var principalPane = this.principalPanes[principal.id];

            this.contentNode.removeChild(principalPane);

            delete this.principalPanes[principal.id];

            if (this.principals.length == 0) {

                domStyle.set(this.contentNode.domNode, "padding-top", "");

            }

            // отчистить панель

            principalPane.destroyRecursive();

            // уведомить об изменениях

            this.value = value ;

            this.emit("change", {});

            this.resize();

		},

		adjustWidth: function(widthSettings) {

		    this.inherited(arguments);

		    domStyle.set(this.contentNode, "width", this.computeAdjustedWidth(widthSettings.computed, widthSettings) + "px");

		    var height = this.contentNode.domNode.clientHeight + 20;

		    if (height) {

		        domStyle.set(this.oneuiBaseNode, "height", height + "px");

		        domStyle.set(this.contentNode, "height", height + "px");

		    }

		    this.contentNode.resize();

		},

	});

});