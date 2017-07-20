define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/CorrespondentBoxEditor.html",
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

    console.log("initialize CorrespondentBoxEditor");

    return declare(
        "docs.correspondent.CorrespondentBoxEditor",
        [
            _WidgetBase,
            _TemplatedMixin,
            _CssStateMixin,
            _CompositeMixin,
            _ValidationMixin,
            _EditorMixin
        ],{

            templateString: template,

            _onYesClick: function(evt) {
                console.log("yes clicked!");
                this.noNode.checked = false;
            },

            _onNoClick: function(evt) {
                console.log("no clicked");
                this.yesNode.checked = false;
            },

            oneuiBaseClass: "correspondentBoxEditor",

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
                    console.log("yes = unchecked, no = unchecked");
                    this.yesNode.checked = false;
                    this.noNode.checked = false;
                } else if (_val == "Yes") {
                    console.log("yes = checked, no = unchecked");
                    this.yesNode.checked = true;
                    this.noNode.checked = false;
                } else {
                    console.log("yes = unchecked, no = checked");
                    this.yesNode.checked = false;
                    this.noNode.checked = true;
                }
            },

            _getValueAttr: function() {

                 console.log("get value");

                if (this.yesNode.checked) {
                    console.log("  Yes");
                    return "Yes";
                } else if (this.noNode.checked) {
                    console.log("  No");
                    return "No";
                } else {
                    console.log("  null");
                    return null;
                }
            }

        }
    );
});