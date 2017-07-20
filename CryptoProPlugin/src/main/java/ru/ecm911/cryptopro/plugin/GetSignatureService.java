package ru.ecm911.cryptopro.plugin;

import com.filenet.api.collection.ContentElementList;
import com.filenet.api.constants.FilteredPropertyType;
import com.filenet.api.core.Annotation;
import com.filenet.api.core.ContentTransfer;
import com.filenet.api.core.Factory;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.property.PropertyFilter;
import com.filenet.api.util.Id;
import com.filenet.api.util.UserContext;
import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.io.PrintWriter;
import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class GetSignatureService
        extends PluginService
{
    public static final String ID = "GetSignatureService";
    private static final String REPOSITORY_ID_PARAM_NAME = "repositoryId";
    private static final String REPOSITORY_TYPE_PARAM_NAME = "repositoryType";
    private static final String ANNOTATION_ID_PARAM_NAME = "id";
    private static final String P8_REPOSITORY_TYPE = "p8";

    public String getId()
    {
        return "GetSignatureService";
    }

    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response)
            throws Exception
    {
        log("-> GetSignatureService.execute(callbacks, request, response)");

        String repositoryId = request.getParameter("repositoryId");

        String repositoryType = request.getParameter("repositoryType");

        String documentId = request.getParameter("id");
        if ("p8".equalsIgnoreCase(repositoryType))
        {
            getSignature(callbacks, request, response);
        }
        else
        {
            PrintWriter out = response.getWriter();

            out.println("{message: 'Указанный тип репозитория не поддерживается'}");
        }
        log("<- GetSignatureService.execute(callbacks, request, response)");
    }

    private void getSignature(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response)
            throws Exception
    {
        try
        {
            String repositoryId = request.getParameter("repositoryId");

            String annotationId = request.getParameter("id");

            log("\tget signature by id '" + annotationId + "'");

            Subject subject = callbacks.getP8Subject(repositoryId);

            UserContext userContext = UserContext.get();

            userContext.pushSubject(subject);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            PropertyFilter propertyFilter = new PropertyFilter();

            propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

            Annotation annotation = Factory.Annotation.fetchInstance(objectStore, new Id(annotationId), propertyFilter);

            ContentElementList contentElements = annotation.get_ContentElements();
            if (contentElements != null)
            {
                ContentTransfer content = (ContentTransfer)contentElements.get(0);

                byte[] buf = new byte['?'];

                response.setContentType("application/octet-stream");

                OutputStream out = response.getOutputStream();

                InputStream in = content.accessContentStream();
                int position;
                while ((position = in.read(buf)) > 0) {
                    out.write(buf, 0, position);
                }
                response.flushBuffer();
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
