package ru.ecm911.esbd.plugin.menu;

import com.ibm.ecm.extension.PluginMenu;
import com.ibm.ecm.extension.PluginMenuItem;
import ru.ecm911.esbd.plugin.ESBDPlugin;
import ru.ecm911.esbd.plugin.action.SaveDocumentAction;

import java.util.Locale;

/**
 * Created by Nurgali.Yesmukhamedo on 12.06.2016.
 */
public class ContractWithPolicePaneListMenu extends PluginMenu{

    public static String ID = ESBDPlugin.ID + "_ContractWithPolicePaneListMenu";

    @Override
    public String getId() {
        return this.ID;
    }

    @Override
    public String getName(Locale locale) {
        return "Cписок меню для работы с договорами с полисом внутри(" + ESBDPlugin.NAME + ")";
    }

    @Override
    public String getDescription(Locale locale) {
        return "Cписок меню для работы с договорами с полисом внутри(" + ESBDPlugin.NAME + ")";
    }

    @Override
    public String getMenuType() {
        return ContractWithPolicePaneMenuType.ID;
    }

    @Override
    public PluginMenuItem[] getMenuItems() {
        return new PluginMenuItem[]{
                new PluginMenuItem(SaveDocumentAction.Id)
        };
    }
}
