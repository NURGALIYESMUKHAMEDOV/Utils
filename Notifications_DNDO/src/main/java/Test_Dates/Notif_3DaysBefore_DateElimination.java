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
import com.filenet.api.util.UserContext;

import external_functions.Domino;

public class Notif_3DaysBefore_DateElimination {

    public static StringList EmailList;
    public static String Subject = "Уведомление";
    public static String Body = "Окончание срока через 2 день";
//    public static String dominoServer = "127.0.0.1";
//    public static String dominoMailbox = "mail\\aad.nsf";
//    public static String dominoUsername = "admin ad";
//    public static String dominoPassword = "123456";
    private static String dominoServer = "10.8.1.102:63148";
    private static String dominoMailbox = "mail\\tkab501-3.nsf";
    private static String dominoUsername = "test3 kab501-3";
    private static String dominoPassword = "test3";


	public static void main(String[] args) {
		Notif_3DaysBefore_DateElimination p8 = new Notif_3DaysBefore_DateElimination();
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
        c.add(Calendar.DATE, +2);
        final Date PastDate = c.getTime();
        System.out.println("PastDate= " + PastDate);

        c.setTime(date);
        c.add(Calendar.DATE, +6);
        final Date FutureDate = c.getTime();
        System.out.println("FutureDate= " + FutureDate);
        System.out.println("===========");


        //NOTIFICATION DATE FORMAT
        String format = "dd.MM.yyyy";
        SimpleDateFormat message_format = new SimpleDateFormat(format);

        int kol = 0;
        String query = "select * from LimitedMeasureDBU where DateElimination> " + sdf.format(PastDate) + " and DateElimination<" + sdf.format(FutureDate);
        System.out.println("query= " + query);
        SearchSQL sql = new SearchSQL(query);
        SearchScope search = new SearchScope(store);
        DocumentSet Docs = (DocumentSet) search.fetchObjects(sql, null, null, Boolean.valueOf(true));
        Iterator it = Docs.iterator();


        while (it.hasNext()) {
            kol++;
            System.out.println("kol= " + kol);
            Document doc = (Document) it.next();
            String FinInspectDocId = doc.getProperties().getStringValue("FinInspectDocId");
            System.out.println("FinInspectDocId= " + FinInspectDocId);
            String FinIdQuery = "select * from FinInspect where ID=" + "'" + FinInspectDocId + "'";
            SearchSQL sqlFinId = new SearchSQL(FinIdQuery);
            SearchScope searchFinId = new SearchScope(store);
            FolderSet folders = (FolderSet) searchFinId.fetchObjects(sqlFinId, null, null, Boolean.valueOf(true));
            Iterator iterator = folders.iterator();
            Folder folder = (Folder) iterator.next();
            System.out.println("title= " + folder.get_FolderName());

            String SectorFinOrg = folder.getProperties().getStringValue("SectorFinOrg");

            //MESSAGE TEXT
            String subject = "Уведомление по ограниченным мерам воздействия";
            Date DateElimination = doc.getProperties().getDateTimeValue("DateElimination");
            Date dateCurrent = new Date();
            long diff= Math.abs(DateElimination.getTime()-dateCurrent.getTime());
            long diffDays=diff/(24*60*60*1000);
                        
            String Org = folder.getProperties().getStringValue("Org");
            String OutNumRefFO = doc.getProperties().getStringValue("OutNumRefFO");
            String body = "ВНИМАНИЕ! Работникам ДБУ! Касательно проверки «";
            body = body + Org + "»." + " Осталось "+ diffDays+" дня до истечения срока исполнения '" + message_format.format(DateElimination) + "' от №" + OutNumRefFO;
            System.out.println(body);


            System.out.println("===========");
            System.out.println("RKKDate DateExecLimMeasure= " + doc.getProperties().getDateTimeValue("DateExecLimMeasure"));
            Date RKKDate = doc.getProperties().getDateTimeValue("DateElimination");



            System.out.println("CURRENT DATE is " + date);

            c.setTime(date);
            c.add(Calendar.DATE, +3);
            Date DublicateDate = c.getTime();
            System.out.println("DublicateDate is " + DublicateDate);



            // if (date.after(PastDate) && (date.before(FutureDate)) && date.getDate() != PastDate.getDate() && date.getDate() != FutureDate.getDate()) {
            if (DublicateDate.getDate() == RKKDate.getDate() && DublicateDate.getMonth() == RKKDate.getMonth() && DublicateDate.getYear() == RKKDate.getYear()) {

         	   // NOTIFICATION STAFF
             //   String query3 = "select * from StaffInspectors where FinInspectDocId = " + "'" + FinInspectDocId + "'" + "and IsRuk= " + "'Руководитель'" + " and EndDate>" + sdf.format(date);
            	String query3 = "select * from StaffInspectors where FinInspectDocId = " + "'" + FinInspectDocId + "'" + "and EmailLotus is not null" + " and EndDate>" + sdf.format(date)+"and IsRuk= " + "'Инспектор'";
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
                    String[] mail = email.split("\\s+");
                  //  sendmail.SendMail(mail[0].trim()+" "+mail[1].trim(), subject, body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
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
