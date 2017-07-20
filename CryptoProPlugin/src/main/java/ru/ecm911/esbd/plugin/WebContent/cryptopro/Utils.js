define([
    "dojo/_base/declare",
    "dojo/_base/lang"
], function(
    declare,
    lang
) {

	var Utils = declare("cryptopro.Utils", null, {

	});

	Utils.extractNameFromDn = function(dn) {

          var result = /CN=(.*?),{1}?/g.exec(dn);

          if (result && result[1]) {

              return result[1] ;

          }

          return null ;

    };

    Utils.extractDocumentId = function(str) {

        var results = /docid=(.*?)&{1}?/g.exec(str);

        if (results && results[1]) {

            var complexId = unescape(results[1]);

            var tokens = complexId.split(",");

            if (tokens && tokens[2]) {

                return tokens[2];

            }

        }

        return null;

    };

    Utils.extractRepositoryId = function(str) {

        var results = /repositoryId=(.*?)&{1}?/g.exec(str);

        if (results && results[1]) {

            return unescape(results[1]);

        }

        return null;

    };

    return Utils ;

});