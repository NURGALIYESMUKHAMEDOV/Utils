package ru.ecm911.components.plugin;

import com.ibm.ecm.extension.PluginAction;

import java.util.Locale;

public class AdjustEntryTemplateAction extends PluginAction {

    public static String Id = ComponentsPlugin.Id + "_AdjustEntryTemplateAction" ;

    @Override
    public String getId() {

        return AdjustEntryTemplateAction.Id ;

    }

    @Override
    public String getName(Locale locale) {

        return "Исправить" ;

    }

    @Override
    public String getIcon() {

        return null;

    }

    @Override
    public String getPrivilege() {

        return "";

    }

    @Override
    public boolean isMultiDoc() {

        return false;

    }

    @Override
    public String getActionFunction() {

        return AdjustEntryTemplateAction.Id ;

    }

    @Override
    public String getServerTypes() {

        return "p8";

    }

    @Override
    public boolean isGlobal() {

        return false ;

    }

}