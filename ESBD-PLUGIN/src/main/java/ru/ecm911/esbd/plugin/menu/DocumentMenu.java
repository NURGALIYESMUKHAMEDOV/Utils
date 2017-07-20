package ru.ecm911.esbd.plugin.menu;

import com.ibm.ecm.extension.PluginMenu;
import com.ibm.ecm.extension.PluginMenuItem;
import ru.ecm911.esbd.plugin.action.SaveDocumentAction;
import ru.ecm911.esbd.plugin.action.CancelAndCreateDocumentAction;
import ru.ecm911.esbd.plugin.action.CancelDocumentAction;
import ru.ecm911.esbd.plugin.action.CancelDueDuplicateDocumentAction;
import ru.ecm911.esbd.plugin.action.CancelDueErrorDocumentAction;

import java.util.Locale;

public class DocumentMenu extends PluginMenu {

    public static String Id = "ESBDDocumentMenu" ;

    @Override
    public String getId() {

        return DocumentMenu.Id ;

    }

    @Override
    public String getName(Locale locale) {

        return "Панель инструментов для работы с документом (ЕСБД)";

    }

    @Override
    public String getDescription(Locale locale) {

        return "Панель инструментов для работы с документом (ЕСБД)";

    }

    @Override
    public String getMenuType() {

        return DocumentMenuType.Id ;

    }

    @Override
    public PluginMenuItem[] getMenuItems() {

        return new PluginMenuItem[]{
                new PluginMenuItem(SaveDocumentAction.Id)
        };

    }

}
