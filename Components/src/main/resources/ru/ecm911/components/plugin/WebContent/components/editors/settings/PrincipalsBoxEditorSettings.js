define([
	"pvd/widget/editors/settings/mixins/_WidthSettings",
	"pvd/widget/editors/settings/mixins/_HintSettings",
	"./_ConfigurationSettings"
], function(widthSettings, hintSettings, configurationSettings) {

	return widthSettings.concat(hintSettings);

});
