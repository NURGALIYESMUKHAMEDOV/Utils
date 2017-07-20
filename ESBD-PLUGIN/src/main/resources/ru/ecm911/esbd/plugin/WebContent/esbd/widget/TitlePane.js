define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dijit/form/Button",
    "idx/layout/TitlePane",
    "ecm/widget/_HoverHelpMixin"
], function(
    declare,
    lang,
    aspect,
    Button,
    TitlePane,
    _HoverHelpMixin
) {

	return declare("esbd.widget.TitlePane", [ TitlePane, _HoverHelpMixin ], {

        editable: false,

        postCreate: function() {

            this.inherited(arguments);

        },

        _createDefaultRefreshButton: function() {

            if (this._refreshButton) return;

            this._refreshButton = new Button({
                buttonType: "edit",
                placement: "toolbar",
                region: "titleActions",
                displayMode: this.defaultActionDisplay
            });

            if (this._refreshHandle) {
                this._refreshHandle.remove();
                delete this._refreshHandle;
            }

            this._refreshHandle = aspect.after(this._refreshButton, "onClick", lang.hitch(this, "refreshPane"), true);

            this.addChild(this._refreshButton);

            if (this._idxStarted) this._refreshButton.startup();

        },

        refreshPane: function() {

            console.log("cheat!");

        }


	});

});
