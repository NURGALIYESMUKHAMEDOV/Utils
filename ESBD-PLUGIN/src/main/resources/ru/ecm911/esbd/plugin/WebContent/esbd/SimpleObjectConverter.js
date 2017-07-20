define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"pvr/controller/converters/_Converter"
], function(declare, lang, _Converter) {

	/**
	 * @name pvr.controller.converters.SampleObjectConverter
	 * @class Extends the {@link pvr.controller.converters._Converter} class to support runtime attributes that are of type object
	 * @augments pvr.controller.converters._Converter
	 */
	var SimpleObjectConverter =  declare("esbd.SimpleObjectConverter", _Converter, {
		/** @lends samplePluginDojo.SampleObjectConverter.prototype */

		/**
		 * Indicates the type of values that are supported by this converter.
		 *
		 * @constant
		 */
		type: "object",

		/**
		 * Overloaded just return the object itself, it's not necessary to do any conversion on the object,
		 * however a converter is required by the sample controller
		 */
		parse: function(value, localized) {
			return value;
		}

	});
	lang.mixin(SimpleObjectConverter, {

		/**
		 * The default {@link samplePluginDojo.SampleObjectConverter} instance.
		 *
		 * @static
		 */
		Default: new SimpleObjectConverter()

	});

	return SimpleObjectConverter;

});
