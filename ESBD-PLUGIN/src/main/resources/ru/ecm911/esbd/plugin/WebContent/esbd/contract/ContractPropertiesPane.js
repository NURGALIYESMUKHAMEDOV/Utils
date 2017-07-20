define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/date/locale",
    "dijit/layout/ContentPane",
    "dijit/layout/TabContainer",
    "dijit/layout/BorderContainer",
    "ecm/model/EntryTemplate",
    "ecm/widget/_PropertiesPaneMixin",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/ContractTab.html"
],function(
    declare,
    lang,
    domStyle,
    locale,
    ContentPane,
    TabContainer,
    BorderContainer,
    EntryTemplate,
    _PropertiesPaneMixin,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template
) {

    return declare("esbd.contract.ContractPropertiesPane", [
        _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _PropertiesPaneMixin
    ], {

        templateString: template,
        widgetsInTemplate: true,
        contentItem: null,

		/**
		 * Renders the attributes.
		 *
		 * @param attributeDefinitions
		 *            An array of {@link ecm.model.AttributeDefinition} objects. Provides the definitions for the
		 *            attributes in the <code>item</code> parameter.
		 * @param item
		 *            A {@link ecm.model.ContentItem} object.
		 * @param reason
		 *            The reason for displaying properties. Pass <code>"create"</code> when creating a new content
		 *            item, <code>"checkin"</code> when checking in a content item, <code>"editProperties"</code>
		 *            when editing the properties of a content item, or <code>"multiEditProperties"</code> when
		 *            editing the properties of multiple content items.
		 * @param isReadOnly
		 *            Pass <code>true</code> if the entire item is read only.
		 * @param params
		 *            A object containing additional parameters and objects for the properties pane. (@since 2.0.3)
		 */
		renderAttributes: function(attributeDefinitions, item, reason, isReadOnly, params) {

		    // do something

		},

    });

});