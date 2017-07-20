package ru.ecm911.esbd.plugin;

import com.ibm.ecm.extension.PluginFeature;

import java.util.Locale;

public class ESBDFeature extends PluginFeature {

    public static final String ID = "ESBDFeature" ;

    public static final String NAME = "ПЗТ" ;

    public static final String DESCRIPTION = "ПЗТ" ;

    @Override
    public String getId() {

        return ESBDFeature.ID ;

    }

    @Override
    public String getName(Locale locale) {

        return ESBDFeature.NAME ;

    }

    @Override
    public String getDescription(Locale locale) {

        return ESBDFeature.DESCRIPTION ;

    }

    @Override
    public String getIconUrl() {

        return "esbdFeatureIcon ";

    }

    @Override
    public String getFeatureIconTooltipText(Locale locale) {

        return "ПЗТ";

    }

    @Override
    public String getConfigurationDijitClass() {

        return "esbd.ESBDFeatureConfigurationPane";

    }

    @Override
    public String getPopupWindowTooltipText(Locale locale) {
        return null;
    }

    @Override
    public String getContentClass() {
        return "esbd.ESBDFeature";
    }

    @Override
    public String getPopupWindowClass() {
        return null;
    }

    @Override
    public boolean isPreLoad() {
        return false;
    }
}
