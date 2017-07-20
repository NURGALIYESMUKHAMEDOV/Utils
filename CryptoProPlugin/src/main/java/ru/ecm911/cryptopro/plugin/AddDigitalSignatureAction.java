package ru.ecm911.cryptopro.plugin;

import com.ibm.ecm.extension.PluginAction;
import java.util.Locale;

public class AddDigitalSignatureAction
        extends PluginAction
{
    public static final String ID = "AddDigitalSignatureAction";
    public static final String NAME = "Подписать";

    public String getId()
    {
        return "AddDigitalSignatureAction";
    }

    public String getName(Locale locale)
    {
        return NAME;
    }

    public String getIcon()
    {
        return "something.png";
    }

    public String getPrivilege()
    {
        return "privViewDoc";
    }

    public boolean isMultiDoc()
    {
        return false;
    }

    public String getActionFunction()
    {
        return "addDigitalSignature";
    }

    public String getServerTypes()
    {
        return "p8";
    }

    public boolean isGlobal()
    {
        return false;
    }
}
