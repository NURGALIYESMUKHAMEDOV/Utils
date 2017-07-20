package kz.bsbnb.ecm.extension.plugin.sl;

/**
 * Created by Nurgali.Yesmukhamedo on 08.06.2017.
 */
import com.ibm.ecm.extension.PluginAction;
import java.util.Locale;

public class SLAction extends PluginAction
{
    public static final String ID = "SLAction";
    public static final String NAME = "Поделиться ссылкой";

    public String getId()
    {
        return "SLAction";
    }

    public String getName(Locale locale)
    {
        return "Поделиться ссылкой";
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
        return "shareLink";
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
