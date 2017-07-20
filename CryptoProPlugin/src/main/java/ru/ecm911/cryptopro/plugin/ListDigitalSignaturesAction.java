package ru.ecm911.cryptopro.plugin;

import com.ibm.ecm.extension.PluginAction;
import java.util.Locale;

public class ListDigitalSignaturesAction
        extends PluginAction
{
    public static final String ID = "ListDigitalSignaturesAction";
    public static final String NAME = "Список";

    public String getId()
    {
        return "ListDigitalSignaturesAction";
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
        return "listDigitalSignatures";
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
