package kz.bsbnb.ecm.extension.plugin.sl;

/**
 * Created by Nurgali.Yesmukhamedo on 08.06.2017.
 */
import com.filenet.api.collection.RepositoryRowSet;
import com.filenet.api.constants.RefreshMode;
import com.filenet.api.core.Connection;

import com.filenet.api.core.Document;
import com.filenet.api.core.Factory;
import com.filenet.api.core.CustomObject;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.property.Properties;
import com.filenet.api.query.RepositoryRow;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.util.Id;
import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.util.Date;
import java.util.Iterator;
import java.util.Random;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class SLService extends PluginService
{
    public static final long EXPIRATION_TIME = 259200000L;
    public static final String REPOSITORY_ID = "repositoryId";
    public static final String REPOSITORY_TYPE = "repositoryType";
    public static final String DOCUMENT_ID = "documentId";
    public static final String VS_ID = "vsId";
    private static final char[] symbols;

    static
    {
        StringBuilder tmp = new StringBuilder();
        for (char ch = '0'; ch <= '9'; ch = (char)(ch + '\001')) {
            tmp.append(ch);
        }
        for (char ch = 'a'; ch <= 'z'; ch = (char)(ch + '\001')) {
            tmp.append(ch);
        }
        symbols = tmp.toString().toCharArray();
    }

    private final Random random = new Random();
    public static final String ID = "SLService";

    public String getId()
    {
        return ID;
    }

    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response)
            throws Exception
    {
        log("-> SLService.execute(callbacks, request, response)");

        String result = "{result : 'error'}";

        String repositoryId = request.getParameter(REPOSITORY_ID);

        String repositoryType = request.getParameter(REPOSITORY_TYPE);

        String documentId = request.getParameter(DOCUMENT_ID);

        String vsId = request.getParameter(VS_ID);

        log("repositoryId: '" + repositoryId + "', repositoryType: '" + repositoryType + "', documentId: '" + documentId + "', vsId: '" + vsId + "'");

        if ("p8".equalsIgnoreCase(repositoryType))
        {
            Connection connection = callbacks.getP8Connection(repositoryId);

            System.out.println("connection: " + connection);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            Document document = callbacks.getP8Document(repositoryId, documentId, vsId, "current");

            System.out.println("document: " + document);

            boolean exists = false;
            if (document != null)
            {
                SearchSQL search = new SearchSQL();

                search.setQueryString("SELECT s.Id, s.DateLastModified, s.SlName  FROM SlSharedLink s WHERE s.SlDocumentId = '" + document.get_Id() + "'");

                log("query: '" + search + "'");

                SearchScope searchScope = new SearchScope(objectStore);

                RepositoryRowSet rowSet = searchScope.fetchRows(search, null, null, Boolean.valueOf(false));
                if (rowSet != null)
                {
                    Iterator it = rowSet.iterator();
                    if (it.hasNext())
                    {
                        RepositoryRow repositoryRow = (RepositoryRow)it.next();

                        Date lastModifiedDate = repositoryRow.getProperties().getDateTimeValue("DateLastModified");

                        String uuid = repositoryRow.getProperties().getStringValue("SlName");

                        Id id = repositoryRow.getProperties().getIdValue("Id");

                        log("lastModifiedDate: " + lastModifiedDate + ", uuid: '" + uuid + "', id: " + id);

                        long diff = System.currentTimeMillis() - lastModifiedDate.getTime();
                        if (diff < EXPIRATION_TIME)
                        {
                            log("not expired yet!");

                            String url = "http://www.ecm911.ru:9080/sl/" + uuid;

                            result = "{url: '" + url + "'}";

                            exists = true;
                        }
                        else
                        {
                            log("expired!");

                            CustomObject customObject = Factory.CustomObject.fetchInstance(objectStore, id, null);

                            customObject.delete();

                            customObject.save(RefreshMode.NO_REFRESH);
                        }
                    }
                }
                if (!exists)
                {
                    String uuid = nextString();

                    CustomObject customObject = Factory.CustomObject.createInstance(objectStore, "SlSharedLink");

                    customObject.getProperties().putObjectValue("SlDocumentId", document.get_Id());

                    customObject.getProperties().putValue("SlName", uuid);

                    customObject.save(RefreshMode.REFRESH);

                    String url = "http://www.ecm911.ru:9080/sl/" + uuid;

                    result = "{url: '" + url + "'}";
                }
            }
        }
        PrintWriter out = response.getWriter();

        out.print(result);

        log("<- SLService.execute(callbacks, request, response)");
    }

    private void log(String message)
    {
        System.out.println(message);
    }

    public String nextString()
    {
        char[] buf = new char[10];
        for (int idx = 0; idx < buf.length; idx++) {
            buf[idx] = symbols[this.random.nextInt(symbols.length)];
        }
        return new String(buf);
    }
}
