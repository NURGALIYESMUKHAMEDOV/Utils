package ru.ecm911.esbd.plugin;

import com.ibm.ecm.extension.*;
import ru.ecm911.esbd.plugin.action.*;
import ru.ecm911.esbd.plugin.filter.CompanyRequestFilter;
import ru.ecm911.esbd.plugin.filter.CompanyResponseFilter;
import ru.ecm911.esbd.plugin.filter.LifecycleResponseFilter;
import ru.ecm911.esbd.plugin.filter.VehicleResponseFilter;
import ru.ecm911.esbd.plugin.menu.*;
import ru.ecm911.esbd.plugin.service.CaseService;
import ru.ecm911.esbd.plugin.service.CommonService;

import java.util.Locale;

public class ESBDPlugin extends Plugin {

    public static final String ID = "ESBDPlugin" ;

    public static final String NAME = "ЕСБД" ;

    public static final String VERSION = "0.2-001" ;

    @Override
    public String getId() {

        return ESBDPlugin.ID;

    }

    @Override
    public String getName(Locale locale) {

        return ESBDPlugin.NAME ;

    }

    @Override
    public String getVersion() {

        return ESBDPlugin.VERSION ;

    }

    @Override
    public String getDojoModule() {

        return "esbd";

    }

    @Override
    public String getScript() {

        return "ESBDPlugin.js";

    }

    @Override
    public String getCSSFileName() {

        return "ESBDPlugin.css";

    }

    @Override
    public PluginFeature[] getFeatures() {

        return new PluginFeature[]{new ESBDFeature(), new ESBDACFeature()};

    }

    @Override
    public PluginService[] getServices() {

        return new PluginService[]{
                new VehiclePluginService(),
                new DictionaryPluginService(),
                new InsuranceContractPluginService(),
                new CaseService(),
                new CommonService()
        };

    }

    @Override
    public PluginRequestFilter[] getRequestFilters() {

        return new PluginRequestFilter[]{
                new CompanyRequestFilter()
        };

    }

    @Override
    public PluginResponseFilter[] getResponseFilters() {

        return new PluginResponseFilter[]{
                new VehicleResponseFilter()
        };

    }

    @Override
    public PluginMenuType[] getMenuTypes() {

        return new PluginMenuType[]{
                new DocumentMenuType(),
                new VehicleDocumentMenuType(),
                new ContractWithPolicePaneMenuType(),
                new ContractPaneMenuType()
        };

    }

    @Override
    public PluginMenu[] getMenus() {

        return new PluginMenu[]{
                new DocumentMenu(),
                new ContractWithPolicePaneListMenu(),
                new ContractPaneListMenu()
        };

    }

    @Override
    public PluginAction[] getActions() {

        return new PluginAction[]{
                new SaveDocumentAction(),
                new CancelAndCreateDocumentAction(),
                new CancelDocumentAction(),
                new CancelDueDuplicateDocumentAction(),
                new CancelDueErrorDocumentAction()
        };

    }

}
