define([
	"dojo/_base/declare",
	"components/editors/DocumentBoxEditor",
	"components/editors/settings/DocumentBoxEditorSettings",
	"components/editors/DocumentsBoxEditor",
	"components/editors/settings/DocumentsBoxEditorSettings",
	"components/editors/PrincipalsBoxEditor",
	"components/editors/settings/PrincipalsBoxEditorSettings",
	"pvr/widget/editors/formatters/TextFormatter",
	"pvd/widget/designer/settings/TextBoxSetting",
	"pvd/widget/designer/settings/TextareaSetting",
	"pvd/widget/designer/settings/DimensionSetting",
	"dojo/i18n!pvr/nls/common"
], function(
    declare,
    DocumentBoxEditor,
    DocumentBoxEditorSettings,
    DocumentsBoxEditor,
    DocumentsBoxEditorSettings,
    PrincipalsBoxEditor,
    PrincipalsBoxEditorSettings,
    TextFormatter,
    TextBoxSetting,
    TextareaSetting,
    DimensionSetting,
    resources
) {

	return {
		editors: {
			editorConfigs: {
				"documentBoxEditor": {
				    label: "Документ",
				    editorClass: DocumentBoxEditor,
				    defaultFieldWidth: "100%",
				    settings: DocumentBoxEditorSettings
				},
				"documentsBoxEditor": {
				    label: "Документы",
				    editorClass: DocumentsBoxEditor,
				    defaultFieldWidth: "100%",
				    settings: DocumentsBoxEditorSettings
				},
				"principalsBoxEditor": {
				    label: "Пользователи",
				    editorClass: PrincipalsBoxEditor,
				    settings: PrincipalsBoxEditorSettings
				}
			},
			mappings: {
				types: {
					"string": {
						single: {
							editorConfigs: [
								"documentBoxEditor"
							]
						},
						multi: {
						    editorConfigs: [
						        "documentsBoxEditor",
						        "principalsBoxEditor"
						    ]
						}
					}
				},
				multiEditors: {
				    editorConfigs: [
				        "documentsBoxEditor",
				        "principalsBoxEditor"
				    ]
				}
			}
		}
	};

});
