package ru.ecm911.esbd.plugin.menu;

import com.ibm.ecm.extension.PluginMenuType;
import ru.ecm911.esbd.plugin.ESBDPlugin;

import java.util.Locale;

/**
 * Created by Nurgali.Yesmukhamedo on 12.06.2016.
 */
public class ContractPaneMenuType extends PluginMenuType{

    public static String ID = ESBDPlugin.ID + "_ContractPaneMenuType" ;

    @Override
    public String getId() {
        return this.ID;
    }

    @Override
    public String getName(Locale locale) {
        return "Тип меню для работы с договорами внутри("+ESBDPlugin.NAME+")";
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
