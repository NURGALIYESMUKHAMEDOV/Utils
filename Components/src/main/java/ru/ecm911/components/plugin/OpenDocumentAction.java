package ru.ecm911.components.plugin;

import com.ibm.ecm.extension.PluginAction;

import java.util.Locale;

public class OpenDocumentAction extends PluginAction {

    public static String Id = ComponentsPlugin.Id + "_OpenDocumentAction" ;

    @Override
    public String getId() {

        return OpenDocumentAction.Id ;

    }

    @Override
    public String getName(Locale locale) {

        return "Открыть" ;

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

        return OpenDocumentAction.Id ;

    }

    @Override
    public String getServerTypes() {

        return "p8";

    }

    @Override
    public String[] getMenuTypes() {

        return new String[]{DocumentListMenuType.Id};

    }

    @Override
    public boolean isGlobal() {

        return false ;

    }

    @Override
    public String getActionModelClass() {

        return "components.ComponentsPluginAction";

    }

}