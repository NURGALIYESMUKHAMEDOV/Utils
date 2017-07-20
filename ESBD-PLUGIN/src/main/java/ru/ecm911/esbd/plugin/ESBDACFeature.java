package ru.ecm911.esbd.plugin;

import com.ibm.ecm.extension.PluginFeature;

import java.util.Locale;

public class ESBDACFeature extends PluginFeature {

    public static final String ID = "ESBDACFeature" ;

    public static final String NAME = "Административная консоль ЕСБД" ;

    public static final String DESCRIPTION = "Административная консоль ЕСБД" ;

    @Override
    public String getId() {

        return ESBDACFeature.ID ;

    }

    @Override
    public String getName(Locale locale) {

        return ESBDACFeature.NAME ;

    }

    @Override
    public String getDescription(Locale locale) {

        return ESBDACFeature.DESCRIPTION ;

    }

    @Override
    public String getIconUrl() {

        return "esbdAdminFeatureIcon";

    }

    @Override
    public String getFeatureIconTooltipText(Locale locale) {

        return ESBDACFeature.NAME ;

    }

    @Override
    public String getConfigurationDijitClass() {

        return "esbd.ESBDACFeatureConfigurationPane";

    }

    @Override
    public String getPopupWindowTooltipText(Locale locale) {

        return null;

    }

    @Override
    public String getContentClass() {

        return "esbd.ESBDACFeature";

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
