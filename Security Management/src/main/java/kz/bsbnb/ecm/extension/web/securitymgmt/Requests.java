package kz.bsbnb.ecm.extension.web.securitymgmt;

/**
 * Created by Nurgali.Yesmukhamedo on 08.06.2017.
 */
import java.util.HashMap;
import java.util.Map;

public class Requests
{
    private static Map<String, Object> objects = new HashMap();

    public static Object getData(String uuid)
    {
        return objects.get(uuid);
    }

    public static void setData(String uuid, Object data)
    {
        objects.put(uuid, data);
    }

    public static void removeData(String uuid)
    {
        objects.remove(uuid);
    }
}
