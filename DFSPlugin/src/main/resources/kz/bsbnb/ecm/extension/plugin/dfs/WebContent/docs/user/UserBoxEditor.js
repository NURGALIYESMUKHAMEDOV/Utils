define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/UserBoxEditor.html",
    "idx/form/_CssStateMixin",
    "idx/form/_CompositeMixin",
    "idx/form/_ValidationMixin",
    "pvr/widget/editors/mixins/_EditorMixin"
], function(
    declare,
    array,
    _WidgetBase,
    _TemplatedMixin,
    template,
    _CssStateMixin,
    _CompositeMixin,
    _ValidationMixin,
    _EditorMixin
) {

    console.log("инициализация редактора 'Сотрудник' ...");

    return declare(
        "docs.user.UserBoxEditor",
        [
            _WidgetBase,
            _TemplatedMixin,
            _CssStateMixin,
            _CompositeMixin,
            _ValidationMixin,
            _EditorMixin
        ],{

            templateString: template,
            selectedUser: null,
            loading: false,

            _onSelectUser: function(evt) {

                require(["ecm/widget/dialog/SelectUserGroupDialog"], dojo.hitch(this, function(SelectUserGroupDialog){

                    var dialog = new SelectUserGroupDialog({
                        queryMode: "users",
                        selectionMode: "single",
                        callback: dojo.hitch(this, this._selectUser)
                    });

                    var repository = ecm.model.desktop.currentSolution.getTargetOS();

                    dialog.show(repository);

                }));

            },

            _selectUser: function(members) {

                this.selectedUser = members[0];

                console.log("select user: ", this.selectedUser);

                this.property.controller.set("value", this.selectedUser.distinguishedName);

                this.userNode.innerHTML = this.selectedUser.displayName;

            },

            oneuiBaseClass: "userBoxEditor",

            postCreate: function() {

                this._event = {
                    "input" : "onChange",
                    "blur" : "_onBlur",
                    "focus" : "_onFocus"
                }

                this.inherited(arguments);

            },

            _setValueAttr: function(_val) {

                console.log("check if undefined via try/catch");

                try {

                    if (ecm) {}

                } catch(e) {

                    this.selectedUser = null ;

                    this.userNode.innerHTML = "укажите значение" ;

                    return ;

                }

                // console.log("this: ", this, ", set value: ", _val, ", loading: ", this.loading, ", selectedUser: ", this.selectedUser);

                require(["ecm/model/User", "ecm/model/Request"], dojo.hitch(this, function(User, Request){

                    if (typeof _val === "undefined" || _val == null) {

                        this.selectedUser = null ;

                        this.userNode.innerHTML = "укажите значение" ;

                    } else if (_val instanceof User) {

                        this.selectedUser = _val ;

                        this.userNode.innerHTML = this.selectedUser.displayName;

                    } else if (typeof _val === "string") {

                        if (!this.loading || this.selectedUser != _val) {

                            this.selectedUser = _val ;

                            // console.log("retrieve user by dn: ", this.selectedUser);

                            var repo = ecm.model.desktop.currentSolution.getTargetOS();

                            var params = {};

                            params.repositoryId = repo.repositoryId;
                            params.repositoryType = repo.type;
                            params.dn = _val;

                            this.userNode.innerHTML = "..." ;

                            this.loading = true;

                            Request.invokePluginService("DFSPlugin", "UserService", {
                                requestParams: params,
                                requestCompleteCallback: dojo.hitch(this, function(response) {

                                    // console.log("response: ", response);

                                    this.selectedUser = new User(response.user);

                                    this.userNode.innerHTML = response.user.displayName ;

                                    this.loading = false;

                                })

                            });

                        }

                    } else {

                        this.selectedUser = null ;

                        this.userNode.innerHTML = "укажите значение" ;

                    }

                }));

            },

            _getValueAttr: function() {

                // console.log("get value, loading: ", this.loading, ", selectedUser: ", this.selectedUser);

                if (this.selectedUser) {

                    if (this.loading) {

                        return this.selectedUser ;

                    } else {

                        return this.selectedUser.distinguishedName ;

                    }

                } else {

                    return null ;

                }

            }

        }
    );
});