package ru.ecm911.esbd.plugin.menu;

import com.ibm.ecm.extension.PluginMenuType;

import java.util.Locale;

public class DocumentMenuType extends PluginMenuType {

    public static String Id = "ESBDDocumentMenuType" ;

    @Override
    public String getId() {

        return DocumentMenuType.Id;

    }

    @Override
    public String getName(Locale locale) {

        return "Панель инструментов для работы с документом (ЕСБД)" ;

    }

    @Override
    public String getTooltip(Locale locale) {

        return null;

    }

    @Override
    public boolean isToolbar() {

        return true;

    }

}
