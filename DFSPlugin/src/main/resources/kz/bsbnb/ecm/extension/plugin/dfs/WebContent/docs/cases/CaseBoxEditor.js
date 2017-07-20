define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/CaseBoxEditor.html",
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

    console.log("инициализация редактора 'Дело' ...");

    return declare(
        "docs.cases.CaseBoxEditor",
        [
            _WidgetBase,
            _TemplatedMixin,
            _CssStateMixin,
            _CompositeMixin,
            _ValidationMixin,
            _EditorMixin
        ],{

            templateString: template,

            // кейс\дело
            value: null,

            // индикатор фоновой загрузки данных
            loading: false,

            _onOpen: function(evt) {

                var solution = ecm.model.desktop.currentSolution ;

                var role = ecm.model.desktop.currentRole ;

                var caseType = this.value.caseType ;

                caseType.retrievePage("CasePage", role, dojo.hitch(this, function(page){

                    console.log("page: ", page);

                    var caseEditable = this.value.createEditable();

                    var listener = icm.container.ICMSolutionSelectorListener.getInstance();

                    var pagesCollection = listener._currentPagesCollection ;

                    var payload = {
                        caseEditable: caseEditable,
                        coordination: new icm.util.Coordination()
                    }

                    pagesCollection.handleICM_OpenPageEvent({
                        pageClassName: page.pageClass,
                        pageType: "CASE",
                        isLazy: false,
                        subject: caseEditable,
                        pageContext: {
                            solution: ecm.model.desktop.currentSolution,
                            role: ecm.model.desktop.currentRole
                        },
                        crossPageEventName: "icm.SendCaseInfo",
                        crossPageEventPayload: payload
                    });

                }));

            },

            oneuiBaseClass: "caseBoxEditor",

            postCreate: function() {

                this._event = {
                    "input" : "onChange",
                    "blur" : "_onBlur",
                    "focus" : "_onFocus"
                }

                this.inherited(arguments);

            },

            _setValueAttr: function(_val) {

                if (!this.loading) {

                    this.value = _val ;

                    if (this.value) {

                        this.loading = true ;

                        this._setVisibility("loading");

                        var solution = ecm.model.desktop.currentSolution ;

                        console.log("loading case by id: ", this.value);

                        solution.retrieveCase(this.value, dojo.hitch(this, function(caseObject){

                            console.log("caseObject: ", caseObject);

                            this.value = caseObject ;

                            this.loading = false ;

                            if (caseObject.caseTitle) {

                                this.caseNode.innerHTML = caseObject.caseTitle ;

                            } else {

                                this.caseNode.innerHTML = caseObject.caseIdentifier ;

                            }

                            this._setVisibility("case");

                        }));

                    } else {

                        this._setVisibility("empty");

                    }

                } else {

                    this._setVisibility("loading");

                }

            },

            _getValueAttr: function() {

                return this.value ;

            },

            _setVisibility: function(name) {

                if (name == "empty") {

                    this.emptyNode.style.display = "block" ;
                    this.loadingNode.style.display = "none" ;
                    this.caseNode.style.display = "none" ;

                } else if (name == "loading") {

                    this.emptyNode.style.display = "none" ;
                    this.loadingNode.style.display = "block" ;
                    this.caseNode.style.display = "none" ;

                } else if (name == "case") {

                    this.emptyNode.style.display = "none" ;
                    this.loadingNode.style.display = "none" ;
                    this.caseNode.style.display = "block" ;

                } else {

                    this.emptyNode.style.display = "none" ;
                    this.loadingNode.style.display = "none" ;
                    this.caseNode.style.display = "none" ;

                }

            }

        }

    );

});