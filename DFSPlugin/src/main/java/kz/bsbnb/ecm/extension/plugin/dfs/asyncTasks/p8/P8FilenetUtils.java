package kz.bsbnb.ecm.extension.plugin.dfs.asyncTasks.p8;

import com.filenet.api.core.*;
import com.filenet.api.property.PropertyFilter;
import com.filenet.api.util.UserContext;
import com.ibm.ecm.task.TaskLogger;
import javax.security.auth.Subject;

/**
 * Created by Nurgali.Yesmukhamedo on 20.07.2017.
 */
public class P8FilenetUtils
{
    public static final String TEAMSPACE_CLASS = "ICMTeamspace";

    public static Domain fetchP8Domain(String uri, String username, String password, String domainName)
    {
        Connection conn = Factory.Connection.getConnection(uri);
        String stanza = "FileNetP8WSI";
        Subject jaceSubject = UserContext.createSubject(conn, username, password, stanza);
        UserContext userCtx = UserContext.get();
        userCtx.pushSubject(jaceSubject);

        Domain domain = Factory.Domain.fetchInstance(conn, domainName, null);
        TaskLogger.fine("P8FilenetUtils", "fetchP8Domain", "Fetched domain '" + domain.get_Name() + "' successfully.");
        return domain;
    }

    static ObjectStore fetchObjectStoreInstance(Domain domain, String objStoreName)
    {
        PropertyFilter filter = new PropertyFilter();
        filter.addIncludeProperty(0, null, null, "RootClassDefinitions", null);
        filter.addIncludeProperty(0, null, null, "DisplayName", null);

        ObjectStore objStore = Factory.ObjectStore.fetchInstance(domain, objStoreName, filter);

        TaskLogger.fine("P8FilenetUtils", "fetchObjectStoreInstance",
                "Fetched object store '" + objStore.get_DisplayName() + "' successfully.");
        return objStore;
    }

    static boolean isTeamspaceFolder(ObjectStore os, String folderPath)
    {
        Folder folder = Factory.Folder.fetchInstance(os, folderPath, null);
        String className = folder.getClassName();
        TaskLogger.fine("P8FilenetUtils", "isTeamspaceFolder", "Folder path->" + folderPath + ", className->" +
                className);
        return className.equals("ICMTeamspace");
    }
}
