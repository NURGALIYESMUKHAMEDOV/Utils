package kz.bsbnb.ecm.extension.plugin.dfs;

import com.filenet.api.collection.RepositoryRowSet;
import com.filenet.api.core.Connection;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.query.RepositoryRow;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.util.Iterator;

public class CategoryService extends PluginService {

    public static final String Id = "CategoryService" ;

    private static final String REPOSITORY_ID = "repositoryId" ;

    private static final String REPOSITORY_TYPE = "repositoryType" ;

    @Override
    public String getId() {
        return CategoryService.Id;
    }

    @Override
    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        log("-> CategoryService.execute({callbacks : '" + callbacks + "', request: '" + request + "', response: '" + response + "'})");

        String repositoryId = request.getParameter(REPOSITORY_ID);

        String repositoryType = request.getParameter(REPOSITORY_TYPE);

        JSONObject result = new JSONObject();

        log("\t process {repositoryId: '" + repositoryId + "', repositoryType: '" + repositoryType + "'}");

        if ("p8".equalsIgnoreCase(repositoryType)) {

            Connection connection = callbacks.getP8Connection(repositoryId);

            System.out.println("\t connection: " + connection);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            SearchSQL searchSQL = new SearchSQL();

            searchSQL.setQueryString("SELECT [FolderName], [DmFolderCode], [DmRetentionPeriod], [DmRetentionClause] FROM [DmFolder] WHERE [This] INSUBFOLDER '/Номенклатура дел/2015' ORDER BY [DmFolderCode]");

            SearchScope searchScope = new SearchScope(objectStore);

            RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

            JSONArray objects = new JSONArray();

            if (rowSet != null) {

                Iterator it = rowSet.iterator();

                while(it.hasNext()) {

                    RepositoryRow row = (RepositoryRow)it.next();

                    String code = row.getProperties().getStringValue("DmFolderCode");

                    String name = row.getProperties().getStringValue("FolderName");

                    String retentionPeriod = row.getProperties().getStringValue("DmRetentionPeriod");

                    String retentionClause = row.getProperties().getStringValue("DmRetentionClause");

                    JSONObject object = new JSONObject();

                    object.put("code", code);

                    object.put("name", name);

                    object.put("retentionPeriod", retentionPeriod);

                    object.put("retentionClause", retentionClause);

                    objects.put(object);

                }

            }

            result.put("data", objects);

        }

        PrintWriter out = response.getWriter();

        out.print(result);

    }

    private void log(String message) {

        System.out.println(message);

    }

}
