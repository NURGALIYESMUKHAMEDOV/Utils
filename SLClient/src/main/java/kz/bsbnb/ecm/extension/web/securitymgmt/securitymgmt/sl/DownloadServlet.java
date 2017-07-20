package kz.bsbnb.ecm.extension.web.securitymgmt.securitymgmt.sl;

/**
 * Created by Nurgali.Yesmukhamedo on 08.06.2017.
 */
import com.filenet.api.collection.ContentElementList;
import com.filenet.api.collection.RepositoryRowSet;
import com.filenet.api.core.*;
import com.filenet.api.core.Connection;
import com.filenet.api.core.Domain;
import com.filenet.api.property.Properties;
import com.filenet.api.query.RepositoryRow;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.util.Id;
import com.filenet.api.util.UserContext;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.net.URLEncoder;
import java.util.Date;
import java.util.Iterator;
import javax.security.auth.Subject;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class DownloadServlet extends HttpServlet
{
    private static final long EXPIRATION_TIME = 259200000L;
    private static final String CONNECTION_URL_PARAM_NAME = "connectionUrl";
    private static final String USERNAME_PARAM_NAME = "username";
    private static final String PASSWORD_PARAM_NAME = "password";
    private static final String DOMAIN_NAME_PARAM_NAME = "domainName";
    private static final String OBJECT_STORE_NAME_PARAM_NAME = "objectStoreName";

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        ServletContext servletContext = request.getSession().getServletContext();

        String connectionUrl = servletContext.getInitParameter(CONNECTION_URL_PARAM_NAME);

        String username = servletContext.getInitParameter(USERNAME_PARAM_NAME);

        String password = servletContext.getInitParameter(PASSWORD_PARAM_NAME);

        String domainName = servletContext.getInitParameter(DOMAIN_NAME_PARAM_NAME);

        String objectStoreName = servletContext.getInitParameter(OBJECT_STORE_NAME_PARAM_NAME);

        String uuid = request.getPathInfo();
        if (uuid.startsWith("/")) {
            uuid = uuid.substring(1);
        }
        log("uuid: '" + uuid + "'");

        Connection connection = getConnection(connectionUrl, username, password);

        log("connection: " + connection);

        Domain domain = getDomain(connection, domainName);

        log("domain: " + domain);

        ObjectStore objectStore = getObjectStore(domain, objectStoreName);

        log("objectStore: " + objectStore);

        SearchSQL search = new SearchSQL();

        search.setQueryString("SELECT s.Id, s.DateLastModified, s.SlDocumentId  FROM SlSharedLink s WHERE s.SlName = '" + uuid + "'");

        log("query: '" + search + "'");

        SearchScope searchScope = new SearchScope(objectStore);

        RepositoryRowSet rowSet = searchScope.fetchRows(search, null, null, Boolean.valueOf(false));
        if (rowSet != null)
        {
            Iterator it = rowSet.iterator();
            if (it.hasNext())
            {
                RepositoryRow repositoryRow = (RepositoryRow)it.next();

                Date date = repositoryRow.getProperties().getDateTimeValue("DateLastModified");

                Id documentId = repositoryRow.getProperties().getIdValue("SlDocumentId");

                Id id = repositoryRow.getProperties().getIdValue("Id");

                long diff = System.currentTimeMillis() - date.getTime();
                if (diff < EXPIRATION_TIME)
                {
                    log("not expired yet!");

                    Document document = Factory.Document.fetchInstance(objectStore, documentId, null);

                    log("document: " + document);

                    ContentElementList elements = document.get_ContentElements();
                    if (elements.size() > 0)
                    {
                        ContentElement element = (ContentElement)elements.get(0);
                        if ((element instanceof ContentTransfer))
                        {
                            ContentTransfer content = (ContentTransfer)element;

                            response.setContentType(content.get_ContentType());

                            String filename = content.get_RetrievalName();

                            response.setHeader("Content-Disposition", "attachment; filename=" + URLEncoder.encode(filename, "UTF-8"));

                            InputStream in = content.accessContentStream();

                            OutputStream out = response.getOutputStream();

                            byte[] buf = new byte['?'];
                            int position;
                            while ((position = in.read(buf)) > 0) {
                                out.write(buf, 0, position);
                            }
                            response.flushBuffer();

                            return;
                        }
                    }
                }
            }
        }
        response.setStatus(200);
    }

    public void log(String msg)
    {
        System.out.println(msg);
    }

    protected Connection getConnection(String connectionUrl, String username, String password)
    {
        Connection connection = Factory.Connection.getConnection(connectionUrl);

        Subject subject = UserContext.createSubject(connection, username, password, null);

        UserContext.get().pushSubject(subject);

        return connection;
    }

    protected Domain getDomain(Connection connection, String domainName)
    {
        return Factory.Domain.fetchInstance(connection, domainName, null);
    }

    protected ObjectStore getObjectStore(Domain domain, String objectStoreName)
    {
        return Factory.ObjectStore.fetchInstance(domain, objectStoreName, null);
    }
}
