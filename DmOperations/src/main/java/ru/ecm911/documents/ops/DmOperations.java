package ru.ecm911.documents.ops;

import com.filenet.api.collection.RepositoryRowSet;
import com.filenet.api.constants.FilteredPropertyType;
import com.filenet.api.core.*;
import com.filenet.api.property.Properties;
import com.filenet.api.property.PropertyFilter;
import com.filenet.api.query.RepositoryRow;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.util.Id;
import com.filenet.api.util.UserContext;
import filenet.vw.api.VWAttachment;
import filenet.vw.api.VWSession;
import filenet.vw.server.Configuration;

import java.io.*;
import java.security.AccessControlContext;
import java.security.AccessController;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.Set;
import javax.security.auth.Subject;

public class DmOperations
{
    private class Context
    {
        private Connection connection;
        private VWSession session;
        private UserContext userContext;
        private UserContext newUserContext;
        private Domain domain;
        private PrintWriter out;

        public Context()
        {
            System.out.println("System out !!!!");
            try
            {
                this.out = new PrintWriter(new File("C:\\temp\\DmOperations.log"));
            }
            catch (Exception ex)
            {
                ex.printStackTrace();
            }
        }

        public void log(String message)
        {
            System.out.println(message);
        }

        public void log(Throwable throwable)
        {
            throwable.printStackTrace();
        }

        public boolean init()
        {
            AccessControlContext accessControlContext = AccessController.getContext();

            Subject subject = Subject.getSubject(accessControlContext);
            try
            {
                Set credentials = subject.getPrivateCredentials(Class.forName("filenet.vw.api.VWSession"));
                if (credentials.iterator().hasNext()) {
                    this.session = ((VWSession)credentials.iterator().next());
                }
            }
            catch (ClassNotFoundException e)
            {
                return false;
            }
            String connectionUrl = Configuration.GetCEURI(null, null);

            this.connection = Factory.Connection.getConnection(connectionUrl);

            this.userContext = UserContext.get();

            this.newUserContext = new UserContext();

            this.newUserContext.pushSubject(subject);

            UserContext.set(this.newUserContext);

            EntireNetwork network = Factory.EntireNetwork.fetchInstance(this.connection, null);

            this.domain = network.get_LocalDomain();
            if (this.domain == null) {
                return false;
            }
            return true;
        }

        public Connection getConnection()
        {
            return this.connection;
        }

        public VWSession getSession()
        {
            return this.session;
        }

        public Domain getDomain()
        {
            return this.domain;
        }

        public void destroy()
        {
            if (this.newUserContext != null) {
                this.newUserContext.popSubject();
            }
            if (this.userContext != null) {
                UserContext.set(this.userContext);
            }
        }
    }

    public String getFieldValueInProfile(String objectStoreName, String fieldName){

        Context context = new Context();

        context.log("entering getFieldValueInProfile ...");

        context.log("\tobjectStoreName: " + objectStoreName);

        context.log("\temployeeId: " + fieldName);

        try
        {
            if (context.init())
            {
                context.log("context initialized");

                ObjectStore objectStore = Factory.ObjectStore.fetchInstance(context.getDomain(), objectStoreName, null);

                context.log("objectstore: " + objectStore);

                String query = "SELECT e.["+fieldName+"] FROM [PPG_Profile] e";

                context.log("query: " + query);

                SearchSQL searchSQL = new SearchSQL();

                searchSQL.setQueryString(query);

                SearchScope searchScope = new SearchScope(objectStore);

                RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, Boolean.valueOf(false));
                if (rowSet != null)
                {
                    Iterator it = rowSet.iterator();
                    if (it.hasNext())
                    {
                        RepositoryRow row = (RepositoryRow)it.next();

                        Properties properties = row.getProperties();

                        context.log("result : " + properties.getStringValue(fieldName));

                        return properties.getStringValue(fieldName);
                    }
                }

            }

        }
        catch (Exception e)
        {
            context.log(e);
        }
        finally
        {
            context.destroy();
        }
        return null;

    }

    public String getUsernameByEmployeeId(String objectStoreName, int employeeId)
    {
        Context context = new Context();

        context.log("entering getUsernameByEmployeeId ...");

        context.log("\tobjectStoreName: " + objectStoreName);

        context.log("\temployeeId: " + employeeId);
        try
        {
            if (context.init())
            {
                context.log("context initialized");

                ObjectStore objectStore = Factory.ObjectStore.fetchInstance(context.getDomain(), objectStoreName, null);

                context.log("objectstore: " + objectStore);

                String query = "SELECT e.[DmEmployeeId], e.[DmUserPrincipal] FROM [DmEmployee] e WHERE e.[DmEmployeeId] = " + employeeId + "";

                context.log("query: " + query);

                SearchSQL searchSQL = new SearchSQL();

                searchSQL.setQueryString(query);

                SearchScope searchScope = new SearchScope(objectStore);

                RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, Boolean.valueOf(false));
                if (rowSet != null)
                {
                    Iterator it = rowSet.iterator();
                    if (it.hasNext())
                    {
                        RepositoryRow row = (RepositoryRow)it.next();

                        Properties properties = row.getProperties();

                        context.log("result : " + properties.getStringValue("DmUserPrincipal"));

                        return properties.getStringValue("DmUserPrincipal");
                    }
                }
            }
        }
        catch (Exception e)
        {
            context.log(e);
        }
        finally
        {
            context.destroy();
        }
        return null;
    }

    public String getNameByEmployeeId(String objectStoreName, int employeeId)
    {
        Context context = new Context();
        try
        {
            if (context.init())
            {
                ObjectStore objectStore = Factory.ObjectStore.fetchInstance(context.getDomain(), objectStoreName, null);

                String query = "SELECT \n  e.[DmEmployeeId],\n  e.[DmEmployeeName] \nFROM \n  [DmEmployee] e \nWHERE \n  e.[DmEmployeeId] = " + employeeId + "";

                SearchSQL searchSQL = new SearchSQL();

                searchSQL.setQueryString(query);

                SearchScope searchScope = new SearchScope(objectStore);

                RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, Boolean.valueOf(false));
                if (rowSet != null)
                {
                    Iterator it = rowSet.iterator();
                    if (it.hasNext())
                    {
                        RepositoryRow row = (RepositoryRow)it.next();

                        Properties properties = row.getProperties();

                        return properties.getStringValue("DmEmployeeName");
                    }
                }
            }
        }
        catch (Exception e)
        {
            context.log(e);
        }
        finally
        {
            context.destroy();
        }
        return null;
    }

    public String getNameByDivisionId(String objectStoreName, int divisionId)
    {
        Context context = new Context();
        try
        {
            if (context.init())
            {
                ObjectStore objectStore = Factory.ObjectStore.fetchInstance(context.getDomain(), objectStoreName, null);

                String query = "SELECT \n  e.[DmDivisionId],\n  e.[DmDivisionName] \nFROM \n  [DmDivision] e \nWHERE \n  e.[DmDivisionId] = " + divisionId + "";

                SearchSQL searchSQL = new SearchSQL();

                searchSQL.setQueryString(query);

                SearchScope searchScope = new SearchScope(objectStore);

                RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, Boolean.valueOf(false));
                if (rowSet != null)
                {
                    Iterator it = rowSet.iterator();
                    if (it.hasNext())
                    {
                        RepositoryRow row = (RepositoryRow)it.next();

                        Properties properties = row.getProperties();

                        return properties.getStringValue("DmDivisionName");
                    }
                }
            }
        }
        catch (Exception e)
        {
            context.log(e);
        }
        finally
        {
            context.destroy();
        }
        return null;
    }

    public VWAttachment getDocumentById(String objectStoreName, String documentId)
    {
        Context context = new Context();
        try
        {
            if (context.init())
            {
                ObjectStore objectStore = Factory.ObjectStore.fetchInstance(context.getDomain(), objectStoreName, null);

                PropertyFilter propertyFilter = new PropertyFilter();

                propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

                Document document = Factory.Document.fetchInstance(objectStore, new Id(documentId), propertyFilter);

                VWAttachment vwAttachment = new VWAttachment();

                vwAttachment.setId(document.get_Id().toString());

                vwAttachment.setVersion(document.get_VersionSeries().get_Id().toString());

                vwAttachment.setAttachmentName(document.get_Name());

                vwAttachment.setAttachmentDescription(document.get_Name());

                vwAttachment.setLibraryName(objectStoreName);

                vwAttachment.setLibraryType(3);

                vwAttachment.setType(3);

                System.out.println("id : " + vwAttachment.getId() + ", version: " + vwAttachment.getVersion() + ", name: " + vwAttachment.getAttachmentName() + ", description: " + vwAttachment.getAttachmentDescription());

                return vwAttachment;
            }
        }
        catch (Exception e)
        {
            context.log(e);
        }
        finally
        {
            context.destroy();
        }
        return null;
    }

    private void logMessage(String s){

        FileWriter write = null;
        DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
        Date date = new Date();

        try {
            write = new FileWriter("C:\\logs\\Notif_.log", true);
            PrintWriter print_line = new PrintWriter(write);
            print_line.printf(dateFormat.format(date) + "\n");
            print_line.printf(s);
            print_line.close();
        } catch (IOException exc) {

        }
    }

    public static abstract interface DmConstants
    {
        public static final String EMPLOYEE_CLASS_NAME = "DmEmployee";
        public static final String EMPLOYEE_ID_PROPERTY_NAME = "DmEmployeeId";
        public static final String EMPLOYEE_CODE_PROPERTY_NAME = "DmEmployeeCode";
        public static final String EMPLOYEE_NAME_PROPERTY_NAME = "DmEmployeeName";
        public static final String EMPLOYEE_USERNAME_PROPERTY_NAME = "DmUserPrincipal";
        public static final String DIVISION_CLASS_NAME = "DmDivision";
        public static final String DIVISION_ID_PROPERTY_NAME = "DmDivisionId";
        public static final String DIVISION_NAME_PROPERTY_NAME = "DmDivisionName";
    }
}
