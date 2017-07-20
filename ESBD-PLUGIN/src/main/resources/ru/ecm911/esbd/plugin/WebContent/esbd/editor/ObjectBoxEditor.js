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
	"esbd/editor/LookupObjectDialog",
	"dojo/text!./templates/ObjectBoxEditor.html"
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
    LookupObjectDialog,
    template
) {

	return declare("esbd.editor.ObjectBoxEditor", [
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

		// идентификатор класса (указывается в настройках редактора)
		contentClassId: null,

		// класс документа
		contentClass: null,

		// идентификатор шаблона ввода, для отображения данных объекта (указывается в настройках параметра)
		entryTemplateId: null,

		// шаблон ввода, для отображения данных документа
		entryTemplate: null,

		// путь к папке в которой находятся шаблоны поиска для поиска необходимых объектов (указывается в настройках редактора)
		searchTemplatesPath: null,

		postCreate: function() {

			this.inherited(arguments);

            if (!this.repository) {

                // редактор работает всегда только с одним репозиторием

                this.repository = ecm.model.desktop.repositories[0];

            }

            // находим класс по его идентификатору
            this.contentClass = this.repository.getContentClass(this.contentClassId);

            // убираем значок вопроса для получения справочной информации

            if (this.editorParams && this.editorParams.property) {

                var propertyController = this.editorParams.property ;

                propertyController._helpNode.style.display = "none" ;

            }

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
		},

		_onAdd: function() {

		    var dialog = new LookupObjectDialog({

		        searchTemplatesPath: this.searchTemplatesPath,

		        onSelect: dojo.hitch(this, function(contentItem){

		            this._displayObject(contentItem);

		            dialog.hide();

		        })

		    });

		    dialog.show();

		},

		_displayObject: function(contentItem) {

            // находит соответствующий EntryTemplate

            var entryTemplate = new EntryTemplate({
                repository: this.repository,
                id: this.entryTemplateId
            });

            entryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(item){

                this.entryTemplate = item ;

                var commonPropertiesClass = "ecm/widget/CommonPropertiesPane";

                if (this.entryTemplate && this.entryTemplate.layoutPropertiesPaneClass) {

                    commonPropertiesClass = this.entryTemplate.layoutPropertiesPaneClass ;

                }

                require([
                    commonPropertiesClass
                ], dojo.hitch(this, function(cls){

                    var commonProperties = new cls();

                    this.itemNode.set("content", commonProperties);

                    commonProperties.createRendering(
                        this.contentClass,
                        this.entryTemplate,
                        contentItem,
                        "editProperties",
                        false,
                        false,
                        dojo.hitch(this, function(callback){

                        }),
                        dojo.hitch(this, function(error){

                        })
                    );

                }));


            }),false,true);

		},

	});

});