define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "ecm/model/Request",
    "ecm/widget/dialog/SelectUserGroupDialog",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/CompanyBox.html"
],function(
    declare,
    lang,
    Request,
    SelectUserGroupDialog,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template
) {

    return declare("esbd.company.CompanyBox", [
        _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,
        widgetsInTemplate: true,
        value: null,
        isDirty: false,

        /*
         * Устанавливает значение формы редактирования
         * в виде списка параметров вида:
         * [
         *    {
         *       name: "<обозначение>",
         *       label: "<наименование>",
         *       type: "<тип>",
         *       value: <значение>
         *    }
         *    ...
         *
         * ]
         *
         */
        setValue: function(value) {

            this.value = value ;

            this._setLocalValue();

        },

        getValue: function() {

            this._getLocalValue();

            return this.value;

        },

        _setLocalValue: function() {

            if (this.value) {

                for (var index = 0; index < this.value.length; index++) {

                    var item = this.value[index];

                    if (this[item.name]) {

                        this[item.name].set("value", item.value, false);

                    }

                }

            } else {

                for (var i = 0; i < this._attachPoints.length; i++) {

                    var attachPoint = this._attachPoints[i];

                    this[attachPoint].set("value", null, false);

                }

            }

            this.isDirty = false ;

        },

        _getLocalValue: function() {

            var value = [];

            var attachPoints = this._attachPoints ;

            for (var index = 0; index < attachPoints.length; index++) {

                var attachPoint = attachPoints[index];

                value.push({
                    name: attachPoint,
                    value: this[attachPoint].get("value")
                })

            }

            value.push({
                name: "DocumentTitle",
                value: this.ESBD_CompanyName.get("value")
            });

            this.value = value ;

        },

        _onDirty: function() {

            this.isDirty = true ;

        },

        isValid: function() {

            var isValid = true ;

            var attachPoints = this._attachPoints ;

            for (var index = 0; index < attachPoints.length; index++) {

                var attachPoint = attachPoints[index];

                if (this[attachPoint] && this[attachPoint].validate) {

                    this[attachPoint].focus();

                    var result = this[attachPoint].validate();

                    isValid = isValid & result;

                }

            }

            return isValid ;

        },

        _onUsers: function() {

            var repository = ecm.model.desktop.repositories[0];

            var dialog = new SelectUserGroupDialog({
                queryMode: "users",
                callback: dojo.hitch(this, function(users){

                    var userGroupData = this.ESBD_Agents.get("userGroupData");

                    if (userGroupData) {

                        this.ESBD_Agents.set("userGroupData", userGroupData.concat(users));

                    } else {

                        this.ESBD_Agents.set("userGroupData", users);

                    }

                })
            });

            dialog.show(repository);

        }

    });

});