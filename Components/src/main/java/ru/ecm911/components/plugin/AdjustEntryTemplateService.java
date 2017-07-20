package ru.ecm911.components.plugin;

import com.filenet.api.collection.ContentElementList;
import com.filenet.api.constants.*;
import com.filenet.api.core.ContentTransfer;
import com.filenet.api.core.Document;
import com.filenet.api.core.Factory;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.property.PropertyFilter;
import com.filenet.api.util.UserContext;
import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import com.ibm.json.java.JSONObject;

import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;
import java.util.logging.Logger;
import java.util.regex.Pattern;

public class AdjustEntryTemplateService extends PluginService {

    private static class Content {

        private String name ;

        private String type ;

        private String value ;

        public String getName() {

            return name;

        }

        public void setName(String name) {

            this.name = name;

        }

        public String getType() {

            return type;

        }

        public void setType(String type) {

            this.type = type;

        }

        public String getValue() {

            return value;

        }

        public void setValue(String value) {

            this.value = value;

        }

    }

    public static final String Id = "AdjustEntryTemplateService" ;

    private Logger logger ;

    @Override
    public String getId() {

        return AdjustEntryTemplateService.Id ;

    }

    @Override
    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        getLogger().entering(getClass().getName(), "execute", new Object[]{callbacks, request, response});

        String repositoryId = request.getParameter("repositoryId");

        getLogger().info("repositoryId is '" + repositoryId + "'");

        String id = request.getParameter("id"); // текущий идентификатор шаблона ввода

        getLogger().info("document id is '" + id + "'");

        Subject subject = callbacks.getP8Subject(repositoryId);

        try {

            String oVal = request.getParameter("oval");

            String nVal = request.getParameter("nval");

            getLogger().info("old value is '" + oVal + "'");

            getLogger().info("new value is '" + nVal + "'");

            UserContext.get().pushSubject(subject);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            PropertyFilter propertyFilter = new PropertyFilter();

            propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

            Document document = Factory.Document.fetchInstance(objectStore, new com.filenet.api.util.Id(id), propertyFilter);

            getLogger().info("document is '" + document + "'");

            Content content = getContent(document);

            if (document.get_MimeType() != null) {

                content.setType(document.get_MimeType());

            }

            getLogger().info("content is '" + content + "'");

            // заменяем значения

            content.setValue(content.getValue().replaceAll(Pattern.quote(oVal), nVal));

            getLogger().info("updated content is '" + content + "'");

            Document newDocument = setContent(document, content);

            JSONObject responseObject = new JSONObject();

            responseObject.put("result", "success");

            responseObject.put("id", newDocument.get_Id().toString());

            response.setContentType("text/plain");

            response.getWriter().print(responseObject.toString());

            response.flushBuffer();

        } finally {

            UserContext.get().popSubject();

        }

    }

    private Content getContent(Document document) throws IOException {

        Content content = new Content();

        ContentElementList elements = document.get_ContentElements();

        if (elements != null) {

            Iterator it = elements.iterator();

            if (it.hasNext()) {

                ContentTransfer contentTransfer = (ContentTransfer) it.next();

                content.setName(contentTransfer.get_RetrievalName());

                content.setType(contentTransfer.get_ContentType());

                InputStream inputStream = contentTransfer.accessContentStream();

                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

                byte[] buf = new byte[10240];

                int length;

                while ((length = inputStream.read(buf)) > 0) {

                    outputStream.write(buf, 0, length);

                }

                outputStream.flush();

                outputStream.close();

                content.setValue(outputStream.toString());

            }

        }

        return content ;

    }

    private Document setContent(Document document, Content content) {

        document.checkout(ReservationType.EXCLUSIVE, null, document.getClassName(), document.getProperties());

        document.save(RefreshMode.REFRESH);

        Document reservation = (Document)document.get_Reservation();

        ContentTransfer contentTransfer = Factory.ContentTransfer.createInstance();

        contentTransfer.set_RetrievalName(content.getName());

        contentTransfer.set_ContentType(content.getType());

        contentTransfer.setCaptureSource(new ByteArrayInputStream(content.getValue().getBytes()));

        ContentElementList elements = Factory.ContentElement.createList();

        elements.add(contentTransfer);

        reservation.set_ContentElements(elements);

        reservation.save(RefreshMode.REFRESH);

        reservation.checkin(AutoClassify.DO_NOT_AUTO_CLASSIFY, CheckinType.MAJOR_VERSION);

        reservation.save(RefreshMode.REFRESH);

        return reservation ;

    }

    private Logger getLogger() {

        return logger != null ? logger : (logger = Logger.getLogger(getClass().getName()));

    }

}
