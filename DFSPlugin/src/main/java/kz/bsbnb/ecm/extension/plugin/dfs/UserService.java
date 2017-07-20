package kz.bsbnb.ecm.extension.plugin.dfs;


import com.filenet.api.core.Connection;
import com.filenet.api.core.Factory;
import com.filenet.api.security.User;
import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import org.json.JSONObject;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

public class UserService extends PluginService {

    public static final String Id = "UserService" ;

    private static final String REPOSITORY_ID = "repositoryId" ;

    private static final String REPOSITORY_TYPE = "repositoryType" ;

    private static final String DN = "dn" ;

    @Override
    public String getId() {
        return UserService.Id;
    }

    @Override
    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        log("-> UserService.execute({callbacks : '" + callbacks + "', request: '" + request + "', response: '" + response + "'})");

        String repositoryId = request.getParameter(REPOSITORY_ID);

        String repositoryType = request.getParameter(REPOSITORY_TYPE);

        String distinguishedName = request.getParameter(DN);

        JSONObject result = new JSONObject();

        log("\t process {repositoryId: '" + repositoryId + "', repositoryType: '" + repositoryType + "', dn: '" + distinguishedName + "'}");

        if ("p8".equalsIgnoreCase(repositoryType)) {

            Connection connection = callbacks.getP8Connection(repositoryId);

            User user = Factory.User.fetchInstance(connection, distinguishedName, null);

            log("\tuser: " + user);

            JSONObject object = new JSONObject();

            object.put("id", user.get_Id());

            object.put("name", user.get_Name());

            object.put("shortName", user.get_ShortName());

            object.put("displayName", user.get_DisplayName());

            result.put("user", object);

        }

        PrintWriter out = response.getWriter();

        out.print(result);

        String a = "SELECT \n" +
                "  c.[FolderName], \n" +
                "  c.[LastModifier], \n" +
                "  c.[DateLastModified], \n" +
                "  c.[CmAcmCaseTypeFolder], \n" +
                "  c.[CmAcmCaseState], \n" +
                "  c.[CmAcmCaseIdentifier] AS \"CmAcmCaseIdentifier\", \n" +
                "  c.[DateCreated], \n" +
                "  c.[Creator], \n" +
                "  c.[Id], \n" +
                "  c.[ClassDescription], \n" +
                "  c.[DMS_CaseTitle], \n" +
                "  c.[DMS_RegistrationDate], \n" +
                "  c.[DMS_Status], \n" +
                "  e.[DmEmployeeName] \n" +
                "FROM \n" +
                "  [DMS_InboxDocument] c \n" +
                "    INNER JOIN [DmEmployee] e ON e.[DmEmployeeId] = c.[DMS_CreatorId] \n" +
                "ORDER BY \n" +
                "  c.[DMS_CaseTitle]" ;

    }

    private void log(String message) {

        System.out.println(message);

    }

}
