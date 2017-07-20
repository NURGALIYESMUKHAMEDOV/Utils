define([
	"components/editors/settings/JSONSetting"
], function(JSONSetting) {

	return [
		{
			name: "configuration",
			controlClass: JSONSetting,
			controlParams: {
				label: "Конфигурация",
				help: "Конфигурация редактора в виде JSON объекта",
				intermediateChanges: true
			},
			localized: true
		}
	];

});