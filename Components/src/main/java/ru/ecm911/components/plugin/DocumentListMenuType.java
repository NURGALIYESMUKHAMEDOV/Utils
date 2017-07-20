package ru.ecm911.components.plugin;

import com.ibm.ecm.extension.PluginMenuType;

import java.util.Locale;

public class DocumentListMenuType extends PluginMenuType {

    public static String Id = ComponentsPlugin.Id + "_DocumentListMenuType" ;

    @Override
    public String getId() {

        return DocumentListMenuType.Id;

    }

    @Override
    public String getName(Locale locale) {

        return "Панель инструментов для работы со списком документов (" + ComponentsPlugin.Name + ")";

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