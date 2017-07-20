define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/store/Memory",
    "gridx/core/model/cache/Sync",
    "gridx/Grid",
    "gridx/modules/select/Row",
    "dojo/text!./templates/CategoryBoxEditor.html",
    "idx/form/_CssStateMixin",
    "idx/form/_CompositeMixin",
    "idx/form/_ValidationMixin",
    "pvr/widget/editors/mixins/_EditorMixin"
], function(
    declare,
    _WidgetBase,
    _TemplatedMixin,
    Memory,
    Cache,
    Grid,
    SelectRow,
    template,
    _CssStateMixin,
    _CompositeMixin,
    _ValidationMixin,
    _EditorMixin
) {

    return declare(
        "docs.category.CategoryBoxEditor",
        [
            _WidgetBase,
            _TemplatedMixin,
            _CssStateMixin,
            _CompositeMixin,
            _ValidationMixin,
            _EditorMixin
        ],{

            templateString: template,
            dialog: null,
            grid: null,

            _onSelectObject: function(evt) {

                console.log("_onSelectObject, evt: ", evt);

                require(["docs/category/ChooseCategoryDialog"], dojo.hitch(this, function(ChooseCategoryDialog){

                    if (!this.dialog) {

                        this.dialog = new ChooseCategoryDialog();

                    }

                    this.dialog.show();

                    this.dialog.onSelect = dojo.hitch(this, function() {

                        if (this.dialog.selectedObject) {

                            this.value = this.dialog.selectedObject ;

                            this._setValueAttr(this.value.code);

                            console.log("grid: ", this.grid);

                            this.grid.store.add(this.value);

                            this.dialog.hide();

                        }

                    });

                }));

            },

            oneuiBaseClass: "categoryBoxEditor",

            postCreate: function() {

                this._event = {
                    "input" : "onChange",
                    "blur" : "_onBlur",
                    "focus" : "_onFocus"
                }

                if (this.grid) {

                    this.grid.destroy();

                }

                var store = new Memory({
                    idProperty: "code",
                    data: []
                });

                var structure = [
                    { field: 'code', name: 'Индекс', width: '10em'},
                    { field: 'name', name: 'Заголовок', width: '20em'},
                    { field: 'retentionPeriod', name: 'Срок хранения', width: '10em'},
                    { field: 'retentionClause', name: 'Статья хранения', width: '10em'}
                ];

                var gridId = Math.floor(Math.random()*10000);

                this.grid = new Grid({
                    id: 'grid_' + gridId,
                    cacheClass: Cache,
                    store: store,
                    structure: structure,
                    modules: [
                        SelectRow
                    ],
                    selectRowTriggerOnCell: true
                });

                this.grid.placeAt(this.categoryNode);

                this.grid.startup();

                this.grid.resize();

                this.inherited(arguments);

            },

            _setValueAttr: function(_val) {

                /*

                if (typeof _val === "undefined" || _val == null) {

                    this.categoryNameNode.innerHTML = "укажите значение";

                } else {

                    this.categoryNameNode.innerHTML = _val;

                }

                */

            },

            _getValueAttr: function() {

                return null ;

                /*

                if (this.categoryNameNode.innerHTML == "укажите значение") {

                    return null;

                } else {

                    return this.categoryNameNode.innerHTML;

                }

                */

            }

        }
    );
});