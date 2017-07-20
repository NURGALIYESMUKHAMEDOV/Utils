package ru.ecm911.components.plugin;

import com.ibm.ecm.extension.*;

import java.util.Locale;

public class ComponentsPlugin extends Plugin {

    public static String Id = "ComponentsPlugin" ;

    public static String Name = "Расширенные компоненты" ;

    private static String Version = "0.1-037" ;

    @Override
    public String getId() {

        return ComponentsPlugin.Id ;

    }

    @Override
    public String getName(Locale locale) {

        return ComponentsPlugin.Name ;

    }

    @Override
    public String getVersion() {

        return ComponentsPlugin.Version ;

    }

    @Override
    public String getDojoModule() {

        return "components";

    }

    @Override
    public String getScript() {

        return "ComponentsPlugin.js";

    }

    @Override
    public PluginMenuType[] getMenuTypes() {
        return new PluginMenuType[]{
                new DocumentListMenuType()
        };
    }

    @Override
    public PluginMenu[] getMenus() {
        return new PluginMenu[]{
                new DocumentListMenu()
        };
    }

    @Override
    public PluginAction[] getActions() {
        return new PluginAction[]{
                new AddDocumentAction(),
                new OpenDocumentAction(),
                new DeleteDocumentAction(),
                new AdjustEntryTemplateAction()
        };
    }

    @Override
    public PluginService[] getServices() {

        return new PluginService[] {
                new AdjustEntryTemplateService()
        };

    }

}
