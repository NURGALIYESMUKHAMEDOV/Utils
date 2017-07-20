package ru.ecm911.cryptopro.plugin;

import com.filenet.api.collection.ContentElementList;
import com.filenet.api.constants.RefreshMode;
import com.filenet.api.core.*;
import com.filenet.api.property.Properties;
import com.filenet.api.util.Id;
import com.filenet.api.util.UserContext;
import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.security.Principal;
import java.security.cert.X509Certificate;
import java.util.Iterator;
import java.util.List;
import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONObject;
import ru.CryptoPro.JCP.tools.Decoder;

public class AddDigitalSignatureService
        extends PluginService
{
    public static final String ID = "AddDigitalSignatureService";
    private static final String REPOSITORY_ID_PARAM_NAME = "repositoryId";
    private static final String REPOSITORY_TYPE_PARAM_NAME = "repositoryType";
    private static final String DOCUMENT_ID_PARAM_NAME = "documentId";
    private static final String DIGITAL_SIGNATURE_PARAM_NAME = "sig";
    private static final String P8_REPOSITORY_TYPE = "p8";

    public String getId()
    {
        return "AddDigitalSignatureService";
    }

    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response)
            throws Exception
    {
        log("-> AddDigitalSignatureService.execute(callbacks, request, response)");

        String repositoryId = request.getParameter("repositoryId");

        String repositoryType = request.getParameter("repositoryType");

        String documentId = request.getParameter("documentId");
        if ("p8".equalsIgnoreCase(repositoryType))
        {
            try
            {
                Decoder decoder = new Decoder();

                byte[] cms = decoder.decodeBuffer(request.getInputStream());

                byte[] content = getContent(callbacks, repositoryId, documentId);

                List<DSigSignerInfo> signers = DSigUtils.verify(cms, content);

                log("\tsigners: " + signers.size());
                if (signers.size() > 1)
                {
                    PrintWriter out = response.getWriter();

                    JSONObject object = new JSONObject();

                    object.put("status", 0);

                    object.put("message", "Подписание несколькими сертификатами не поддерживается");

                    out.print(object);
                }
                else if ((signers.isEmpty()) || (!((DSigSignerInfo)signers.get(0)).isValid()))
                {
                    PrintWriter out = response.getWriter();

                    JSONObject object = new JSONObject();

                    object.put("status", 0);

                    object.put("message", "Ошибка проверки цифровой подписи");

                    out.print(object);
                }
                else
                {
                    DSigSignerInfo signer = (DSigSignerInfo)signers.get(0);

                    addDigitalSignature(callbacks, repositoryId, documentId, signer, cms);

                    PrintWriter out = response.getWriter();

                    JSONObject object = new JSONObject();

                    object.put("status", 1);

                    object.put("message", "");

                    out.print(object);
                }
            }
            catch (Exception e)
            {
                log(e);

                PrintWriter out = response.getWriter();

                JSONObject object = new JSONObject();

                object.put("status", 0);

                object.put("message", "Ошибка добавления цифровой подписи в ЭХД");

                out.print(object);
            }
        }
        else
        {
            PrintWriter out = response.getWriter();

            JSONObject object = new JSONObject();

            object.put("status", 0);

            object.put("message", "Указанный тип репозитория не поддерживается");

            out.print(object);
        }
        log("<- AddDigitalSignatureService.execute(callbacks, request, response)");
    }

    private void addDigitalSignature(PluginServiceCallbacks callbacks, String repositoryId, String documentId, DSigSignerInfo signer, byte[] cmsData)
    {
        Subject subject = callbacks.getP8Subject(repositoryId);

        UserContext userContext = UserContext.get();

        userContext.pushSubject(subject);

        ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

        Document document = Factory.Document.fetchInstance(objectStore, new Id(documentId), null);

        Annotation annotation = Factory.Annotation.createInstance(objectStore, "sigDigitalSignature");

        annotation.set_AnnotatedObject(document);

        Properties properties = annotation.getProperties();

        properties.putValue("sigSigner", signer.getCertificate().getSubjectDN().getName());

        properties.putValue("sigIssuer", signer.getCertificate().getIssuerDN().getName());

        properties.putValue("sigValidFrom", signer.getCertificate().getNotBefore());

        properties.putValue("sigValidTo", signer.getCertificate().getNotAfter());

        properties.putValue("sigStatus", 3);

        ContentElementList contentElements = Factory.ContentElement.createList();

        ContentTransfer contentElement = Factory.ContentTransfer.createInstance();

        contentElement.setCaptureSource(new ByteArrayInputStream(cmsData));

        contentElement.set_RetrievalName("digitalSignature.sig");

        contentElements.add(contentElement);

        annotation.set_ContentElements(contentElements);

        annotation.save(RefreshMode.REFRESH);
    }

    private byte[] getContent(PluginServiceCallbacks callbacks, String repositoryId, String documentId)
    {
        log("-> getContent(...)");
        try
        {
            Subject subject = callbacks.getP8Subject(repositoryId);

            UserContext userContext = UserContext.get();

            userContext.pushSubject(subject);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            Document document = Factory.Document.fetchInstance(objectStore, new Id(documentId), null);

            document.fetchProperties(new String[] { "ContentElements" });

            ContentElementList contentElements = document.get_ContentElements();
            if (contentElements != null)
            {
                Iterator it = contentElements.iterator();
                if (it.hasNext())
                {
                    ContentTransfer contentElement = (ContentTransfer)it.next();

                    InputStream in = contentElement.accessContentStream();

                    ByteArrayOutputStream out = new ByteArrayOutputStream();

                    byte[] buf = new byte['?'];
                    int position;
                    while ((position = in.read(buf)) > 0) {
                        out.write(buf, 0, position);
                    }
                    out.flush();

                    out.close();

                    log("\t\t\tcontent size: " + out.toByteArray().length);

                    return out.toByteArray();
                }
            }
        }
        catch (Exception e)
        {
            log(e);
        }
        log("<- getContent(...)");

        return null;
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
