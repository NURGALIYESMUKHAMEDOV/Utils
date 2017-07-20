package kz.bsbnb.ecm.extension.plugin.sl;

/**
 * Created by Nurgali.Yesmukhamedo on 08.06.2017.
 */
import com.ibm.ecm.extension.Plugin;
import com.ibm.ecm.extension.PluginAction;
import com.ibm.ecm.extension.PluginService;
import java.util.Locale;

public class SLPlugin extends Plugin
{
    public static final String ID = "SLPlugin";
    public static final String NAME = "Ссылки";
    public static final String VERSION = "0.1-018";

    public String getId()
    {
        return "SLPlugin";
    }

    public String getName(Locale locale)
    {
        return "Ссылки";
    }

    public String getVersion()
    {
        return "0.1-018";
    }

    public String getDojoModule()
    {
        return "sl";
    }

    public String getScript()
    {
        return "SLPlugin.js";
    }

    public PluginAction[] getActions()
    {
        return new PluginAction[] { new SLAction() };
    }

    public PluginService[] getServices()
    {
        return new PluginService[] { new SLService() };
    }
}
