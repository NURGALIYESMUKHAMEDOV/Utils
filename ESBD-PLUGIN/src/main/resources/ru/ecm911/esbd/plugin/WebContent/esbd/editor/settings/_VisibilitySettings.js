/**
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2013, 2014
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"pvd/widget/designer/settings/TextareaSetting",
	"esbd/editor/settings/JavaScriptSetting",
	"esbd/editor/settings/CodeSetting"
], function(TextareaSetting, JavaScriptSetting, CodeSetting) {

	return [
		{
			name: "visibility",
			controlClass: CodeSetting,
			controlParams: {
				label: "Visibility",
				help: "Скрипт, который возвращает true в случае если данное свойство должно быть показано и false в противном случае",
				intermediateChanges: true
			},
			localized: true
		}
	];

});