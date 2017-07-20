package ru.ecm911.esbd.plugin.menu;

import com.ibm.ecm.extension.PluginMenuType;

import java.util.Locale;

public class VehicleDocumentMenuType extends PluginMenuType {

    public static String Id = "ESBDVehicleDocumentMenuType" ;

    @Override
    public String getId() {

        return DocumentMenuType.Id;

    }

    @Override
    public String getName(Locale locale) {

        return "Панель инструментов для работы с транспортным документом (ЕСБД)" ;

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