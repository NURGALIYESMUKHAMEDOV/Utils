package ru.ecm911.cryptopro.plugin;

import com.ibm.ecm.extension.Plugin;
import com.ibm.ecm.extension.PluginAction;
import com.ibm.ecm.extension.PluginService;
import java.util.Locale;

public class CryptoProPlugin
        extends Plugin
{
    public static final String ID = "CryptoProPlugin";
    public static final String NAME = "КриптоПро ЭЦП";
    public static final String VERSION = "0.1-141";

    public String getId()
    {
        return "CryptoProPlugin";
    }

    public String getName(Locale locale)
    {
        return NAME;
    }

    public String getVersion()
    {
        return "0.1-141";
    }

    public String getDojoModule()
    {
        return "cryptopro";
    }

    public String getCSSFileName()
    {
        return "CryptoProPlugin.css";
    }

    public String getScript()
    {
        return "CryptoProPlugin.js";
    }

    public String getConfigurationDijitClass()
    {
        return "cryptopro.ConfigurationPane";
    }

    public PluginAction[] getActions()
    {
        return new PluginAction[] { new AddDigitalSignatureAction(), new ListDigitalSignaturesAction() };
    }

    public PluginService[] getServices()
    {
        return new PluginService[] { new GetContentService(), new AddDigitalSignatureService(), new ListDigitalSignaturesService(), new GetSignatureService() };
    }
}
