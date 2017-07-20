package external_functions;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.TimeZone;

import javax.security.auth.Subject;

import com.filenet.api.collection.DocumentSet;
import com.filenet.api.collection.FolderSet;
import com.filenet.api.core.Connection;
import com.filenet.api.core.Document;
import com.filenet.api.core.Domain;
import com.filenet.api.core.Factory;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.util.UserContext;
import com.filenet.api.core.Folder;

public class Cases {

	public static void main(String args[])
	
	{
		
		Date date = new Date();
        final String ISO_FORMAT = "yyyyMMdd'T'HHmmss'Z'";
        final SimpleDateFormat sdf = new SimpleDateFormat(ISO_FORMAT);
        TimeZone utc = TimeZone.getTimeZone("UTC");
        sdf.setTimeZone(utc);
        System.out.println(sdf.format(date));
		
        String ddMMyyyy = "dd.MM.yyyy";
        SimpleDateFormat Format_ddMMyyyy = new SimpleDateFormat(ddMMyyyy);
		
        
        Cases p8 = new Cases();
        ObjectStore store = p8.getP8Connection();
		
        String query = "select * from DMS_ResolutionCase where dms_deadlinedate<"+ sdf.format(date);
        System.out.println("query= " + query); 	
        SearchSQL sql = new SearchSQL(query);         	
        SearchScope search = new SearchScope(store);
        FolderSet ResolutionCases = (FolderSet) search.fetchObjects(sql, null, null, Boolean.valueOf(true));
        Iterator it = ResolutionCases.iterator();
        int ResolutionNum = 0;
        
        while (it.hasNext()) {
        ++ResolutionNum;
        	  Folder ResolutionCase = (Folder) it.next();
              String casetitle = ResolutionCase.getProperties().getStringValue("dms_casetitle");
        	  Date deadlinedate= ResolutionCase.getProperties().getDateTimeValue("dms_deadlinedate");
              System.out.println("№ "+ResolutionNum+ " Заголовок= "+casetitle+" контрольная дата "+Format_ddMMyyyy.format(deadlinedate));
        	//System.out.print ("" );
        }
        
        System.out.println("количество просроченных резолюций  "+ResolutionNum);
        
        
	}

	public ObjectStore getP8Connection() {
		// The connection URI includes the transport protocol (connection type),
		// host name, and port number that are used for server communication
		// Note these are the default P8 configuration parameters
		// String uri = "http://10.10.112.18:9080/wsi/FNCEWS40MTOM";
		String uri = "http://icm52.filenet.local:9080/wsi/FNCEWS40MTOM";
		// String uri = "http://10.10.112.170:9080/wsi/FNCEWS40MTOM";
		// Set the user id and password for authentication
		String username = "p8admin";
		String password = "s5XSVRxN";
		// Get the connection
		Connection conn = Factory.Connection.getConnection(uri);
		// The next 3 lines authenticate with the application server using the
		// JAAS API
		Subject subject = UserContext.createSubject(conn, username, password,
				null);
		UserContext uc = UserContext.get();
		uc.pushSubject(subject);
		// Retrieve the specific Domain Object P8demodom
		Domain domain = Factory.Domain.fetchInstance(conn, "demo", null);
		System.out.println("Domain Name is: " + domain.get_Name());
		// Get the specific object store EVTFS
		ObjectStore store = Factory.ObjectStore.fetchInstance(domain, "TOS",
				null);
		System.out.println("Objectstore is: " + store.get_Name());
		// Return the Object Store
		return store;
	}

}
