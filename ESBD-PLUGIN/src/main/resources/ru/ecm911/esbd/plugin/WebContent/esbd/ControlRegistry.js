define([
	"dojo/_base/declare",
	"esbd/editor/ObjectBoxEditor",
	"esbd/editor/InsurerBoxEditor",
	"esbd/editor/ClientListBoxEditor",
	"esbd/editor/VehicleListBoxEditor",
	"esbd/editor/PremiumBoxEditor",
	"esbd/editor/PersonBoxEditor",
	"esbd/editor/VehicleBoxEditor",
	"esbd/editor/ClientBoxEditor",
	"esbd/editor/ObjectListBoxEditor",
	"esbd/editor/DamageListBoxEditor",
	"esbd/editor/ObjectLinkEditor",
	"esbd/editor/TextBoxExtEditor",
	"esbd/editor/settings/TextBoxExtEditorSettings",
	"pvr/widget/editors/formatters/TextFormatter",
	"pvd/widget/designer/settings/TextBoxSetting",
	"pvd/widget/designer/settings/TextareaSetting",
	"pvd/widget/designer/settings/DimensionSetting",
	"dojo/i18n!pvr/nls/common"
], function(
    declare,
    ObjectBoxEditor,
    InsurerBoxEditor,
    ClientListBoxEditor,
    VehicleListBoxEditor,
    PremiumBoxEditor,
    PersonBoxEditor,
    VehicleBoxEditor,
    ClientBoxEditor,
    ObjectListBoxEditor,
    DamageListBoxEditor,
    ObjectLinkEditor,
    TextBoxExtEditor,
    TextBoxExtEditorSettings,
    TextFormatter,
    TextBoxSetting,
    TextareaSetting,
    DimensionSetting,
    resources
) {

	return {
		editors: {
			editorConfigs: {
				"insurerBoxEditor": {
				    label: "Страхователь",
				    editorClass: InsurerBoxEditor,
				    defaultFieldWidth: "100%",
				    settings: [
                        {
				            name: "config",
				            controlClass: TextBoxSetting,
				            controlParams: {
				                label: "Конфигурация",
				                help: "Идентификатор документа, содержащего конфигурационные данные указанног редактора"
				            }
				        }
				    ]
				},
				"clientListBoxEditor": {
				    label: "Застрахованные лица",
				    editorClass: ClientListBoxEditor,
				    defaultFieldWidth: "100%",
				    settings: [
                        {
				            name: "config",
				            controlClass: TextBoxSetting,
				            controlParams: {
				                label: "Конфигурация",
				                help: "Идентификатор документа, содержащего конфигурационные данные указанног редактора"
				            }
				        }
				    ]
				},
				"vehicleListBoxEditor": {
				    label: "Транспортные средства",
				    editorClass: VehicleListBoxEditor,
				    defaultFieldWidth: "100%",
				    settings: [
				        {
				            name: "config",
				            controlClass: TextBoxSetting,
				            controlParams: {
				                label: "Конфигурация",
				                help: "Идентификатор документа, содержащего конфигурационные данные указанног редактора"
				            }
				        }
				    ]
				},
				"premiumBoxEditor": {
				    label: "Страховая премия",
				    editorClass: PremiumBoxEditor,
				    defaultFieldWidth: "100%"
				},
				"personBoxEditor": {
				    label: "Физическое лицо",
				    editorClass: PersonBoxEditor,
				    defaultFieldWidth: "100%",
				    settings: [
                        {
				            name: "config",
				            controlClass: TextBoxSetting,
				            controlParams: {
				                label: "Конфигурация",
				                help: "Идентификатор документа, содержащего конфигурационные данные указанног редактора"
				            }
				        }
				    ]
				},
				"vehicleBoxEditor": {
				    label: "Транспортное средство",
				    editorClass: VehicleBoxEditor,
				    defaultFieldWidth: "100%",
				    settings: [
                        {
				            name: "config",
				            controlClass: TextBoxSetting,
				            controlParams: {
				                label: "Конфигурация",
				                help: "Идентификатор документа, содержащего конфигурационные данные указанног редактора"
				            }
				        }
				    ]
				},
				"clientBoxEditor": {
				    label: "Объект",
				    editorClass: ClientBoxEditor,
				    defaultFieldWidth: "100%",
				    settings: [
                        {
				            name: "config",
				            controlClass: TextBoxSetting,
				            controlParams: {
				                label: "Конфигурация",
				                help: "Идентификатор документа, содержащего конфигурационные данные указанног редактора"
				            }
				        }
				    ]
				},
				"objectListBoxEditor": {
				    label: "Объекты",
				    editorClass: ObjectListBoxEditor,
				    defaultFieldWidth: "100%",
				    settings: [
                        {
				            name: "config",
				            controlClass: TextBoxSetting,
				            controlParams: {
				                label: "Конфигурация",
				                help: "Идентификатор документа, содержащего конфигурационные данные указанног редактора"
				            }
				        }
				    ]
				},
				"damageListBoxEditor": {
				    label: "Повреждения",
				    editorClass: DamageListBoxEditor,
				    defaultFieldWidth: "100%",
				    settings: [
                        {
				            name: "config",
				            controlClass: TextBoxSetting,
				            controlParams: {
				                label: "Конфигурация",
				                help: "Идентификатор документа, содержащего конфигурационные данные указанног редактора"
				            }
				        }
				    ]
				},
				"objectLinkEditor": {
				    label: "Объект (ссылка)",
				    editorClass: ObjectLinkEditor,
				    defaultFieldWidth: "100%",
				    settings: [
                        {
				            name: "actionName",
				            controlClass: TextBoxSetting,
				            controlParams: {
				                label: "Действие",
				                help: "Идентификатор действия, которое выполнится при клике на значение"
				            }
				        }
				    ]
				},
				"textBoxExtEditor": {
				    label: "Текстовое поле (*)",
				    editorClass: TextBoxExtEditor,
				    settings: TextBoxExtEditorSettings
				},
			},
			mappings: {
				types: {
					"string": {
						single: {
							editorConfigs: [
								"insurerBoxEditor",
								"personBoxEditor",
								"vehicleBoxEditor",
								"clientBoxEditor",
								"objectLinkEditor",
								"textBoxExtEditor"
							]
						},
						multi: {
						    editorConfigs: [
						        "clientListBoxEditor",
						        "vehicleListBoxEditor",
						        "damageListBoxEditor",
						        "objectListBoxEditor"
						    ]
						}
					},
					"float": {
					    single: {
					        editorConfigs: [
					            "premiumBoxEditor"
					        ]
					    }
					}
				},
				multiEditors: {
				    editorConfigs: [
				        "clientListBoxEditor",
				        "vehicleListBoxEditor",
				        "damageListBoxEditor",
				        "objectListBoxEditor"
				    ]
				}
			}
		}
	};

});
