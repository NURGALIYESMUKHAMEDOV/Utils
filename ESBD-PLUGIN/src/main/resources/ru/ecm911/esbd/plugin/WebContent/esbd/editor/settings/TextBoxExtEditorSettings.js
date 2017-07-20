define([
	"pvd/widget/editors/settings/mixins/_WidthSettings",
	"pvd/widget/editors/settings/mixins/_HintSettings",
	"pvd/widget/editors/settings/mixins/_PatternSettings",
	"pvd/widget/editors/settings/mixins/_TextSettings",
	"esbd/editor/settings/_VisibilitySettings"
], function(widthSettings, hintSettings, patternSettings, textSettings, visibilitySettings) {

	return widthSettings.concat(hintSettings).concat(patternSettings).concat(textSettings).concat(visibilitySettings);

});
