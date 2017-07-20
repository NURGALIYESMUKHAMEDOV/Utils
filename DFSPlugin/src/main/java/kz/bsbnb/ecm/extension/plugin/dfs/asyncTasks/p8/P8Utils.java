package kz.bsbnb.ecm.extension.plugin.dfs.asyncTasks.p8;

import com.filenet.api.collection.ContentElementList;
import com.filenet.api.collection.DocumentSet;
import com.filenet.api.core.*;
import com.filenet.api.property.Properties;
import com.filenet.api.property.PropertyFilter;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.util.UserContext;
import com.ibm.ecm.task.TaskLogger;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.util.Iterator;
import java.util.logging.Logger;
import javax.security.auth.Subject;

/**
 * Created by Nurgali.Yesmukhamedo on 20.07.2017.
 */
public class P8Utils
{
    static void getObjectStoreInstance(Domain domain, String objStoreName)
    {
        ObjectStore ojbStore = Factory.ObjectStore.getInstance(domain, objStoreName);

        ojbStore.refresh();
        System.out.println("Object store name: " + ojbStore.get_Name());
    }

    public static ObjectStore fetchObjectStoreInstance(Domain domain, String objStoreName)
    {
        PropertyFilter filter = new PropertyFilter();
        filter.addIncludeProperty(0, null, null, "RootClassDefinitions", null);
        filter.addIncludeProperty(0, null, null, "DisplayName", null);

        ObjectStore objStore = Factory.ObjectStore.fetchInstance(domain, objStoreName, filter);

        System.out.println("Object store name: " + objStore.get_DisplayName());
        return objStore;
    }

    public static ObjectStore fetchObjectStoreInstance_org(Domain domain, String objStoreName)
    {
        PropertyFilter filter = new PropertyFilter();

        filter.addIncludeProperty(0, null, null, "DisplayName", null);

        ObjectStore objStore = Factory.ObjectStore.fetchInstance(domain, objStoreName, filter);

        TaskLogger.get()
                .fine(Thread.currentThread().toString() + ":: Object store name: " + objStore.get_DisplayName());
        return objStore;
    }

    public static String getDocumentContent(Document document, boolean download, File storeDir)
            throws Exception
    {
        ContentElementList contents = document.get_ContentElements();
        ContentElement content = null;
        Iterator itContent = contents.iterator();
        if (itContent.hasNext())
        {
            content = (ContentElement)itContent.next();

            File dfile = new File(storeDir, ((ContentTransfer)content).get_RetrievalName());
            if (dfile.exists())
            {
                TaskLogger.get().fine(
                        "!!!skipping document " + dfile.getAbsolutePath() + " extract because it exists...");
                return dfile.getAbsolutePath();
            }
            TaskLogger.get().fine("target fileName = " + dfile.getAbsolutePath() + "...");
            if (download)
            {
                InputStream inputStream = ((ContentTransfer)content).accessContentStream();

                OutputStream outputStream = new FileOutputStream(dfile);

                byte[] nextBytes = new byte[64000];
                int nBytesRead;
                while ((nBytesRead = inputStream.read(nextBytes)) != -1)
                {
                    outputStream.write(nextBytes, 0, nBytesRead);
                    outputStream.flush();
                }
            }
            return dfile.getAbsolutePath();
        }
        return null;
    }

    public static void getDocumentMetaData(Document document)
    {
        try
        {
            document.fetchProperties(new String[] { "DocumentTitle", "DateCreated" });

            TaskLogger.get().fine("\tDocument title = " + document.getProperties().getStringValue("DocumentTitle"));
            TaskLogger.get().fine(
                    "\tDocument creation date = " + document.getProperties().getDateTimeValue("DateCreated"));
        }
        catch (Exception e)
        {
            TaskLogger.get().fine("getting document meta data skip " + e.getLocalizedMessage() + "...");
        }
    }

    public static Domain getP8Connection(String uri, String username, String password, String domainName)
    {
        UserContext userCtx = UserContext.get();
        Connection conn = Factory.Connection.getConnection(uri);
        String stanza = "FileNetP8WSI";
        Subject jaceSubject = UserContext.createSubject(conn, username, password, stanza);
        userCtx.pushSubject(jaceSubject);

        Domain domain = Factory.Domain.fetchInstance(conn, domainName, null);
        TaskLogger.get().fine("Domain Name is: " + domain.get_Name());
        return domain;
    }

    public static Domain getP8Connection_org(String uri, String username, String password, String domainName)
    {
        Connection conn = Factory.Connection.getConnection(uri);

        Subject subject = UserContext.createSubject(conn, username, password, "FileNetP8WSI");
        UserContext uc = UserContext.get();
        uc.pushSubject(subject);

        Domain domain = Factory.Domain.fetchInstance(conn, domainName, null);
        TaskLogger.get().fine("Domain Name is: " + domain.get_Name());
        return domain;
    }

    public static DocumentSet searchDocuments(ObjectStore os)
    {
        SearchScope search = new SearchScope(os);

        SearchSQL sql = new SearchSQL();

        sql.setSelectList("DocumentType, DocumentTitle, Description, ContentElements");

        sql.setFromClauseInitialValue("Document", "d", true);

        sql.setWhereClause("CustomerNumber='12345'");

        DocumentSet documents = (DocumentSet)search.fetchObjects(sql, new Integer(50), null, Boolean.valueOf(true));

        return documents;
    }

    public static void viewDocument(String fileName)
            throws Exception
    {
        String VIEWER = "Explorer.exe ";
        Runtime rt = Runtime.getRuntime();

        String cmd = VIEWER + fileName;
        rt.exec(cmd);
    }
}

