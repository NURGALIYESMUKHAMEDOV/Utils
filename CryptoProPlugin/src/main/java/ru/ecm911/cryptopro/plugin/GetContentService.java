package ru.ecm911.cryptopro.plugin;

import com.filenet.api.collection.ContentElementList;
import com.filenet.api.constants.FilteredPropertyType;
import com.filenet.api.core.ContentTransfer;
import com.filenet.api.core.Document;
import com.filenet.api.core.Factory;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.property.PropertyFilter;
import com.filenet.api.util.Id;
import com.filenet.api.util.UserContext;
import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.util.Iterator;
import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import ru.CryptoPro.JCP.tools.Encoder;

public class GetContentService
        extends PluginService
{
    public static final String ID = "GetContentService";
    private static final String REPOSITORY_ID_PARAM_NAME = "repositoryId";
    private static final String REPOSITORY_TYPE_PARAM_NAME = "repositoryType";
    private static final String DOCUMENT_ID_PARAM_NAME = "id";
    private static final String P8_REPOSITORY_TYPE = "p8";

    public String getId()
    {
        return "GetContentService";
    }

    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response)
            throws Exception
    {
        log("-> GetContentService.execute(callbacks, request, response)");

        String repositoryId = request.getParameter("repositoryId");

        String repositoryType = request.getParameter("repositoryType");

        String documentId = request.getParameter("id");
        if ("p8".equalsIgnoreCase(repositoryType))
        {
            getContent(callbacks, request, response);
        }
        else
        {
            PrintWriter out = response.getWriter();

            out.println("{message: 'Указанный тип репозитория не поддерживается'}");
        }
        log("<- GetContentService.execute(callbacks, request, response)");
    }

    private void getContent(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response)
            throws Exception
    {
        try
        {
            String repositoryId = request.getParameter("repositoryId");

            String documentId = request.getParameter("id");

            log("\tget content by id '" + documentId + "'");

            Subject subject = callbacks.getP8Subject(repositoryId);

            UserContext userContext = UserContext.get();

            userContext.pushSubject(subject);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            PropertyFilter propertyFilter = new PropertyFilter();

            propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

            Document document = Factory.Document.fetchInstance(objectStore, new Id(documentId), propertyFilter);

            ContentElementList contentElements = document.get_ContentElements();
            if (contentElements != null)
            {
                Iterator it = contentElements.iterator();
                if (it.hasNext())
                {
                    ContentTransfer content = (ContentTransfer)it.next();

                    Encoder encoder = new Encoder();

                    encoder.encode(content.accessContentStream(), response.getOutputStream());
                }
            }
        }
        catch (Exception e)
        {
            log("\tfailed to get signature");

            log(e);
        }
    }

    private void log(String message)
    {
        System.out.println(message);
    }

    private void log(Throwable throwable)
    {
        throwable.printStackTrace(System.out);
    }
}
