define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/RegistryBoxEditor.html",
    "idx/form/_CssStateMixin",
    "idx/form/_CompositeMixin",
    "idx/form/_ValidationMixin",
    "pvr/widget/editors/mixins/_EditorMixin"
], function(
    declare,
    _WidgetBase,
    _TemplatedMixin,
    template,
    _CssStateMixin,
    _CompositeMixin,
    _ValidationMixin,
    _EditorMixin
) {

    console.log("initialize RegistryBoxEditor");

    return declare(
        "docs.registry.RegistryBoxEditor",
        [
            _WidgetBase,
            _TemplatedMixin,
            _CssStateMixin,
            _CompositeMixin,
            _ValidationMixin,
            _EditorMixin
        ],{

            templateString: template,

            _onSelectObject: function(evt) {

                console.log("Показать диалоговое окно с выбором!");

                require(["docs/registry/SelectRegistryDialog"], dojo.hitch(this, function(SelectRegistryDialog){

                    var selectRegistryDialog = new SelectRegistryDialog();

                    selectRegistryDialog.show();

                }));

            },

            oneuiBaseClass: "registryBoxEditor",

            postCreate: function() {

                this._event = {
                    "input" : "onChange",
                    "blur" : "_onBlur",
                    "focus" : "_onFocus"
                }

                this.inherited(arguments);

            },

            _setValueAttr: function(_val) {
                console.log("set value: ", _val);

                if (typeof _val === "undefined" || _val == null) {
                    console.log("--> empty")
                    this.registryNameNode.innerHtml = "укажите значение";
                } else {
                    this.registryNameNode.innerHtml = _val;
                }
            },

            _getValueAttr: function() {
                console.log("get value: ");

                if (this.registryNameNode.innerHtml == "укажите значение") {
                    console.log("  null");
                    return null;
                } else {
                    return this.registryNameNode.innerHtml;
                }
            }

        }
    );
});