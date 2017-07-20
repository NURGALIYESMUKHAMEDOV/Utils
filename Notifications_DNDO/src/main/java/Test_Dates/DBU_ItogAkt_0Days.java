package Test_Dates;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Iterator;
import java.util.TimeZone;

import javax.security.auth.Subject;

import com.filenet.api.collection.DocumentSet;
import com.filenet.api.collection.FolderSet;
import com.filenet.api.collection.StringList;
import com.filenet.api.core.Connection;
import com.filenet.api.core.Document;
import com.filenet.api.core.Domain;
import com.filenet.api.core.Factory;
import com.filenet.api.core.Folder;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.util.Id;
import com.filenet.api.util.UserContext;

import external_functions.Domino;

public class DBU_ItogAkt_0Days {


	   public static StringList EmailList;
	    public static String Subject = "Уведомление";
	    public static String Body = "Окончание срока через 2 день";

	    //public static String dominoServer = "170.7.7.102:63148";
	    public static String dominoServer = "10.8.1.102:63148";
	    public static String dominoMailbox = "mail\\tkab501-3.nsf";
	    public static String dominoUsername = "test3 kab501-3";
	    public static String dominoPassword = "test3";
	    
	  
//	    private static String dominoServer = "127.0.0.1";
//	    private static String dominoMailbox = "mail\\aad.nsf";
//	    private static String dominoUsername = "admin ad";
//	    private static String dominoPassword = "123456";


	public static void main(String[] args) {


		DBU_ItogAkt_0Days p8 = new DBU_ItogAkt_0Days();
        ObjectStore store = p8.getP8Connection();
        Domino sendmail = new Domino();

        Date date = new Date();
        final String ISO_FORMAT = "yyyyMMdd'T'HHmmss'Z'";

        final SimpleDateFormat sdf = new SimpleDateFormat(ISO_FORMAT);
        TimeZone utc = TimeZone.getTimeZone("UTC");
        sdf.setTimeZone(utc);
        System.out.println(sdf.format(date));


        Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.add(Calendar.DATE, -1);
        final Date PastDate = c.getTime();
        System.out.println("PastDate= " + PastDate);

        c.setTime(date);
        c.add(Calendar.DATE, +1);
        final Date FutureDate = c.getTime();
        System.out.println("FutureDate= " + FutureDate);
        System.out.println("===========");
        System.out.println("");
        System.out.println("");


        //NOTIFICATION DATE FORMAT
        String format = "dd.MM.yyyy";
        SimpleDateFormat message_format = new SimpleDateFormat(format);

        String query = "select * from FinInspect where DateRefItogFO> " + sdf.format(PastDate) + " and DateRefItogFO<" + sdf.format(FutureDate);
        System.out.println("query= " + query);
        SearchSQL sql = new SearchSQL(query);
        SearchScope search = new SearchScope(store);
        FolderSet folders = (FolderSet) search.fetchObjects(sql, null, null, Boolean.valueOf(true));
        Iterator it = folders.iterator();


        while (it.hasNext()) {
        	  Folder folder = (Folder) it.next();
              String SectorFinOrg = folder.getProperties().getStringValue("SectorFinOrg");



            //MESSAGE TEXT
            Id FinInspectDocId = folder.get_Id();
            String subject = "Уведомление о дате вручения и вложения работниками ДИФО Акта о результатах проверки.";
            String Org = folder.getProperties().getStringValue("Org");
            Date DateRefItogFO = folder.getProperties().getDateTimeValue("DateRefItogFO");
            String body = "ВНИМАНИЕ! Работникам ДБУ! Касательно проверки «";
            body = body + Org + "»." + " Сегодня дата направления Акта о результатах проверки/Заключения " + message_format.format(DateRefItogFO);
            System.out.println(body);
            System.out.println("===========");
            System.out.println("RKKDate DateRefItogFO= " + folder.getProperties().getDateTimeValue("DateRefItogFO"));
            Date RKKDate = folder.getProperties().getDateTimeValue("DateRefItogFO");




            System.out.println("CURRENT DATE is " + date);

            c.setTime(date);
            c.add(Calendar.DATE, 0);
            Date DublicateDate = c.getTime();
            System.out.println("DublicateDate is " + DublicateDate);

            if (DublicateDate.getDate() == RKKDate.getDate() && DublicateDate.getMonth() == RKKDate.getMonth() && DublicateDate.getYear() == RKKDate.getYear()) {

                // NOTIFICATION STAFF
                //String query3 = "select * from StaffInspectors where FinInspectDocId = " + "'" + FinInspectDocId + "'" + "and IsRuk= " + "'Руководитель'" + " and EndDate>" + sdf.format(date);
                String query3 = "select * from StaffInspectors where FinInspectDocId = " + "'" + FinInspectDocId + "'" + "and EmailLotus is not null" + " and EndDate>" + sdf.format(date);
                System.out.println("query3=" + query3);
                SearchSQL sql3 = new SearchSQL(query3);
                SearchScope search3 = new SearchScope(store);
                DocumentSet StaffInspectors = (DocumentSet) search3.fetchObjects(sql3, null, null, Boolean.valueOf(true));
                Iterator it4 = StaffInspectors.iterator();

                while (it4.hasNext()) {
                    Document doc3 = (Document) it4.next();
                    System.out.println("FIO= " + doc3.getProperties().getStringValue("FIO"));
                    System.out.println("Email= " + doc3.getProperties().getStringValue("EmailLotus"));
                    String email = doc3.getProperties().getStringValue("EmailLotus");
                 //   sendmail.SendMail(email, subject, body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                    String[] mail = email.split("\\s+");
                    sendmail.SendMail(mail[0].trim()+" "+mail[1].trim(), subject, body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                }



            } else {
                System.out.println("no notification");
            }
        }






	}
	  public ObjectStore getP8Connection() {
	        // The connection URI includes the transport protocol (connection type),
	        // host name, and port number that are used for server communication
	        // Note these are the default P8 configuration parameters
	        // String uri = "http://10.10.112.18:9080/wsi/FNCEWS40MTOM";
	        String uri = "http://testcontent.corp.nb.rk:9080/wsi/FNCEWS40MTOM";
	        // String uri = "http://10.10.112.170:9080/wsi/FNCEWS40MTOM";
	        // Set the user id and password for authentication
	        String username = "testinsadmin";
	        String password = "Qwerty123";
	        // Get the connection
	        Connection conn = Factory.Connection.getConnection(uri);
	        // The next 3 lines authenticate with the application server using the JAAS API
	        Subject subject = UserContext.createSubject(conn, username, password, null);
	        UserContext uc = UserContext.get();
	        uc.pushSubject(subject);
	        // Retrieve the specific Domain Object P8demodom
	        Domain domain = Factory.Domain.fetchInstance(conn, "p8dom", null);
	        System.out.println("Domain Name is: " + domain.get_Name());
	        // Get the specific object store EVTFS
	        ObjectStore store =
	                Factory.ObjectStore.fetchInstance(domain, "FNOSINS", null);
	        System.out.println("Objectstore is: " + store.get_Name());
	        // Return the Object Store
	        return store;
	    }
}
