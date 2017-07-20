define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/date/locale"
],function(
    declare,
    lang,
    locale
) {

    var Utils = declare("esbd.Utils", [], {});

    Utils.getCriterias = function(contentItem) {

        var isNew = contentItem.getValue("Id") == null ;

        var criterias = [];

        for (var attributeName in contentItem.attributes) {

            if (!isNew) {

                if (contentItem.isSystemProperty(attributeName) || contentItem.isAttributeReadOnly(attributeName)) {

                    continue;

                }

            }

            criterias.push({
                name: attributeName,
                value: contentItem.getValue(attributeName)
            });

        }

        return criterias ;

    };

    Utils.formatDateToQuery = function(date) {

        if (date) {

            try {

                var value = locale.format(date, {selector: "date", datePattern: "yyyy-MM-dd"});

                return value ;

            } catch (e) {

                return null ;

            }

        }

        return date ;

    };

    Utils.replaceAll = function(string, find, replace) {

        return string.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);

    };

    Utils.escape = function(string) {

        var result = Utils.replaceAll(string, "\\", "\\\\");

        result = Utils.replaceAll(result, "\"", "\\\"");

        result = Utils.replaceAll(result, "%", "\\%");

        result = Utils.replaceAll(result, "_", "\\_");

        return result ;

    };

    return Utils ;


});