package ru.ecm911.components.plugin;

import com.ibm.ecm.extension.PluginMenu;
import com.ibm.ecm.extension.PluginMenuItem;

import java.util.Locale;

public class DocumentListMenu extends PluginMenu {

    public static String Id = ComponentsPlugin.Id + "_DocumentListMenu" ;

    @Override
    public String getId() {

        return DocumentListMenu.Id;

    }

    @Override
    public String getName(Locale locale) {

        return "Панель инструментов для работы со списком документов (" + ComponentsPlugin.Name + ")";

    }

    @Override
    public String getDescription(Locale locale) {

        return "Панель инструментов для работы со списком документов (" + ComponentsPlugin.Name + ")";

    }

    @Override
    public String getMenuType() {

        return DocumentListMenuType.Id ;

    }

    @Override
    public PluginMenuItem[] getMenuItems() {

        return new PluginMenuItem[]{
                new PluginMenuItem(AddDocumentAction.Id),
                new PluginMenuItem(OpenDocumentAction.Id),
                new PluginMenuItem(DeleteDocumentAction.Id)
        };

    }

    @Override
    public PluginMenuItem[] getMenuItems(Locale locale) {

        return getMenuItems();

    }

}