/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package DNDO;

/**
 * @author nurzhan.trimov
 */

import com.filenet.api.collection.DocumentSet;
import com.filenet.api.collection.FolderSet;
import com.filenet.api.collection.StringList;
import com.filenet.api.core.*;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.util.Id;

import java.io.*;
import java.security.AccessControlContext;
import java.security.AccessController;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Iterator;
import java.util.Set;

import lotus.domino.NotesException;
import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;

import external_functions.Domino;
import filenet.vw.api.VWSession;

import java.util.TimeZone;


import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.security.auth.Subject;

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
import filenet.vw.api.VWAttachmentType;
import filenet.vw.api.VWException;
import filenet.vw.api.VWLibraryType;
import filenet.vw.api.VWSession;

import javax.security.auth.Subject;
import java.security.AccessControlContext;
import java.security.AccessController;
import java.util.Iterator;
import java.util.Set;
import java.util.logging.FileHandler;
import java.util.logging.Level;


public class Send_Notifications {

    private static Logger logger = Logger.getLogger( Send_Notifications.class );

    //  private static Logger logger = Logger.getLogger(Send_Notifications.class.getName());
    public static StringList EmailList;
    Domino sendmail = new Domino();

    private Connection connection;

    private VWSession session;

    private UserContext userContext;

    private UserContext newUserContext;

    private Domain domain;

    // private Logger logger ;

    private PrintWriter out;

    public Send_Notifications() {

        System.out.println("System out !!!!");


        //  logger = Logger.getLogger(Send_Notifications.class.getName());

        //   logger.setLevel(Level.ALL);

        try {

            out = new PrintWriter(new File("C:\\logs\\Notif_.log"));

        } catch (Exception ex) {

            ex.printStackTrace();

            logException(ex);

            // logger.log(Level.SEVERE, "Ошибка установки FileHandler-а для Logger-а", ex);

        }

    }

    /**
     setByOutLook() - send message by Outlook.

     @param from
        From person

     @param fromName
        From person name

     @param to
        To person

     @param toName
        To person name

     @param host
        Mail host address

     @param subject
        Subject of message

     @param text
        Text of message
     */

    public void setByOutLook(String from, String fromName, String to, String toName, String host, String subject, String text){

        // Get system properties
        java.util.Properties properties = System.getProperties();

        // Setup mail server
        properties.setProperty("mail.smtp.host", host);

        // Get the default Session object.
        Session session = Session.getDefaultInstance(properties);

        try{
            // Create a default MimeMessage object.
            MimeMessage message = new MimeMessage(session);

            // Set From: header field of the header.
            message.setFrom(new InternetAddress(from, fromName));


            // Set To: header field of the header.
            message.addRecipient(Message.RecipientType.TO, new InternetAddress(to, toName));

            // Set Subject: header field
            message.setSubject(subject);

            // Now set the actual message
            message.setText(text);

            // Send message
            Transport.send(message);
            System.out.println("Sent message successfully....");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }catch (MessagingException mex) {
            mex.printStackTrace();
        }

    }

    public void log(String message) {

        logger.debug( "No database connection!!!" );

        logger.info( "No database connection!!!" );

        logger.warn( "No database connection!!!" );

        //logger.log(Level.INFO, message);

        out.println(message);

        out.flush();

        System.out.println(message);

        logMessage(message);

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

    private void logException(Exception e) {

        FileWriter write = null;
        DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
        Date date = new Date();

        try {
            write = new FileWriter("C:\\logs\\Notif_.log", true);
            PrintWriter print_line = new PrintWriter(write);
            print_line.printf(dateFormat.format(date) + "\n");
            e.printStackTrace(print_line);
            print_line.close();
        } catch (IOException exc) {
        }
    }


    public boolean init() throws VWException {

        AccessControlContext accessControlContext = AccessController.getContext();

        Subject subject = Subject.getSubject(accessControlContext);

        Set credentials;

        try {

            credentials = subject.getPrivateCredentials(Class.forName("filenet.vw.api.VWSession"));

            if (credentials.iterator().hasNext()) {

                session = (VWSession) credentials.iterator().next();

            }

        } catch (ClassNotFoundException e) {

            return false;

        }

        String connectionUrl = filenet.vw.server.Configuration.GetCEURI(null, null);

        connection = Factory.Connection.getConnection(connectionUrl);

        userContext = UserContext.get();

        newUserContext = new UserContext();

        newUserContext.pushSubject(subject);

        UserContext.set(newUserContext);

        EntireNetwork network = Factory.EntireNetwork.fetchInstance(connection, null);

        domain = network.get_LocalDomain();

        if (domain == null) {

            return false;

        }

        System.out.println("Domain= " + domain);
        return true;
    }


    public Connection getConnection() {

        return connection;

    }

    public VWSession getSession() {

        return session;

    }

    public Domain getDomain() {

        return domain;

    }

    public void destroy() {

        if (newUserContext != null) {

            newUserContext.popSubject();

        }

        if (userContext != null) {

            UserContext.set(userContext);

        }

    }


    public String DBU_ItogAkt_30Days_After(String objectStoreName, String Subject, String Body, String dominoServer,
                                           String dominoMailbox, String dominoUsername, String dominoPassword) throws VWException {
        //  PropertyConfigurator.configure(Send_Notifications.class.getResource("/logs/log4j.properties"));
        Send_Notifications Send_Notif = new Send_Notifications();
        Send_Notif.log("\tobjectStoreName: " + objectStoreName);


        Date date = new Date();
        final String ISO_FORMAT = "yyyyMMdd'T'HHmmss'Z'";

        final SimpleDateFormat sdf = new SimpleDateFormat(ISO_FORMAT);
        TimeZone utc = TimeZone.getTimeZone("UTC");
        sdf.setTimeZone(utc);
        Send_Notif.log(sdf.format(date));


        Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.add(Calendar.DATE, -30);
        final Date PastDate = c.getTime();
        Send_Notif.log("PastDate= " + PastDate);

        c.setTime(date);
        c.add(Calendar.DATE, -28);
        final Date FutureDate = c.getTime();
        Send_Notif.log("FutureDate= " + FutureDate);
        Send_Notif.log("===========");
        Send_Notif.log("");
        Send_Notif.log("");

        if (Send_Notif.init()) {
            Send_Notif.log("context initialized");
            ObjectStore store = Factory.ObjectStore.fetchInstance(Send_Notif.getDomain(), objectStoreName, null);

            //NOTIFICATION DATE FORMAT
            String format = "dd.MM.yyyy";
            SimpleDateFormat message_format = new SimpleDateFormat(format);

            String query = "select * from FinInspectDBU where DateRefItogFO> " + sdf.format(PastDate) + " and DateRefItogFO<" + sdf.format(FutureDate);
            Send_Notif.log("query= " + query);
            SearchSQL sql = new SearchSQL(query);
            SearchScope search = new SearchScope(store);
            FolderSet folders = (FolderSet) search.fetchObjects(sql, null, null, Boolean.valueOf(true));
            Iterator it = folders.iterator();
            Send_Notif.log("##1 ======== I am here========");

            while (it.hasNext()) {
                Folder folder = (Folder) it.next();
                String SectorFinOrg = folder.getProperties().getStringValue("SectorFinOrg");


                //MESSAGE TEXT
                Id FinInspectDocId = folder.get_Id();
                String subject = "Уведомление о дате вручения и вложения работниками ДИФО Акта о результатах проверки.";
                String Org = folder.getProperties().getStringValue("Org");
                Date DateRefItogFO = folder.getProperties().getDateTimeValue("DateRefItogFO");
                String body = "ВНИМАНИЕ! Касательно проверки «";
                body = body + Org + "»." + " Прошло 30 дней со дня окончания даты направления Акта о результатах проверки/Заключения " + message_format.format(DateRefItogFO);
                Send_Notif.log(body);
                Send_Notif.log("===========");
                Send_Notif.log("RKKDate DateRefItogFO= " + folder.getProperties().getDateTimeValue("DateRefItogFO"));
                Date RKKDate = folder.getProperties().getDateTimeValue("DateRefItogFO");


                Send_Notif.log("CURRENT DATE is " + date);

                c.setTime(date);
                c.add(Calendar.DATE, -29);
                Date DublicateDate = c.getTime();
                Send_Notif.log("DublicateDate is " + DublicateDate);

                if (DublicateDate.getDate() == RKKDate.getDate() && DublicateDate.getMonth() == RKKDate.getMonth() && DublicateDate.getYear() == RKKDate.getYear()) {

                    // NOTIFICATION STAFF
                    //String query3 = "select * from StaffInspectors where FinInspectDocId = " + "'" + FinInspectDocId + "'" + "and IsRuk= " + "'Руководитель'" + " and EndDate>" + sdf.format(date);
                    String query3 = "select * from StaffInspectors where FinInspectDocId = " + "'" + FinInspectDocId + "'" + "and EmailLotus is not null" + " and EndDate>" + sdf.format(date);
                    //String query3 = "select * from StaffInspectors where FinInspectDocId = '{B59A6664-99EF-4C8C-BBF4-AB60718DBF6F}'";
                    Send_Notif.log("query3=" + query3);
                    SearchSQL sql3 = new SearchSQL(query3);
                    SearchScope search3 = new SearchScope(store);
                    DocumentSet StaffInspectors = (DocumentSet) search3.fetchObjects(sql3, null, null, Boolean.valueOf(true));
                    Iterator it4 = StaffInspectors.iterator();

                    while (it4.hasNext()) {
                        Document doc3 = (Document) it4.next();
                        Send_Notif.log("FIO= " + doc3.getProperties().getStringValue("FIO"));
                        Send_Notif.log("Email= " + doc3.getProperties().getStringValue("EmailLotus"));
//	                    logger.debug("FIO= " + doc3.getProperties().getStringValue("FIO"));
//	                    logger.debug("Email= " + doc3.getProperties().getStringValue("EmailLotus"));

                        String email = doc3.getProperties().getStringValue("EmailLotus");
                        //sendmail.SendMail(email, subject, body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                        String[] mail = email.split("\\s+");
                        sendmail.SendMail(mail[0].trim() + " " + mail[1].trim(), subject, body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                    }


                } else {
                    Send_Notif.log("no notification");
                }
            }


        }


        return "null";
    }


    public String DBU_ItogAkt_0Days(String objectStoreName, String Subject, String Body, String dominoServer,
                                    String dominoMailbox, String dominoUsername, String dominoPassword) throws VWException {
        Send_Notifications Send_Notif = new Send_Notifications();
        Send_Notif.log("\tobjectStoreName: " + objectStoreName);

        Date date = new Date();
        final String ISO_FORMAT = "yyyyMMdd'T'HHmmss'Z'";

        final SimpleDateFormat sdf = new SimpleDateFormat(ISO_FORMAT);
        TimeZone utc = TimeZone.getTimeZone("UTC");
        sdf.setTimeZone(utc);
        Send_Notif.log(sdf.format(date));


        Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.add(Calendar.DATE, -1);
        final Date PastDate = c.getTime();
        Send_Notif.log("PastDate= " + PastDate);

        c.setTime(date);
        c.add(Calendar.DATE, +1);
        final Date FutureDate = c.getTime();
        Send_Notif.log("FutureDate= " + FutureDate);
        Send_Notif.log("===========");
        Send_Notif.log("");
        Send_Notif.log("");


        if (Send_Notif.init()) {
            Send_Notif.log("context initialized");
            ObjectStore store = Factory.ObjectStore.fetchInstance(Send_Notif.getDomain(), objectStoreName, null);

            //NOTIFICATION DATE FORMAT
            String format = "dd.MM.yyyy";
            SimpleDateFormat message_format = new SimpleDateFormat(format);

            String query = "select * from FinInspectDBU where DateRefItogFO> " + sdf.format(PastDate) + " and DateRefItogFO<" + sdf.format(FutureDate);
            Send_Notif.log("query= " + query);
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
                String body = "ВНИМАНИЕ! Касательно проверки «";
                body = body + Org + "»." + " Сегодня дата направления Акта о результатах проверки/Заключения " + message_format.format(DateRefItogFO);
                Send_Notif.log(body);
                Send_Notif.log("===========");
                Send_Notif.log("RKKDate DateRefItogFO= " + folder.getProperties().getDateTimeValue("DateRefItogFO"));
                Date RKKDate = folder.getProperties().getDateTimeValue("DateRefItogFO");


                Send_Notif.log("CURRENT DATE is " + date);

                c.setTime(date);
                c.add(Calendar.DATE, 0);
                Date DublicateDate = c.getTime();
                Send_Notif.log("DublicateDate is " + DublicateDate);

                if (DublicateDate.getDate() == RKKDate.getDate() && DublicateDate.getMonth() == RKKDate.getMonth() && DublicateDate.getYear() == RKKDate.getYear()) {

                    // NOTIFICATION STAFF
                    //String query3 = "select * from StaffInspectors where FinInspectDocId = " + "'" + FinInspectDocId + "'" + "and IsRuk= " + "'Руководитель'" + " and EndDate>" + sdf.format(date);
                    String query3 = "select * from StaffInspectors where FinInspectDocId = " + "'" + FinInspectDocId + "'" + "and EmailLotus is not null" + " and EndDate>" + sdf.format(date);

                    Send_Notif.log("query3=" + query3);
                    SearchSQL sql3 = new SearchSQL(query3);
                    SearchScope search3 = new SearchScope(store);
                    DocumentSet StaffInspectors = (DocumentSet) search3.fetchObjects(sql3, null, null, Boolean.valueOf(true));
                    Iterator it4 = StaffInspectors.iterator();

                    while (it4.hasNext()) {
                        Document doc3 = (Document) it4.next();
                        Send_Notif.log("FIO= " + doc3.getProperties().getStringValue("FIO"));
                        Send_Notif.log("Email= " + doc3.getProperties().getStringValue("EmailLotus"));
                        String email = doc3.getProperties().getStringValue("EmailLotus");
                        //sendmail.SendMail(email, subject, body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                        String[] mail = email.split("\\s+");
                        sendmail.SendMail(mail[0].trim() + " " + mail[1].trim(), subject, body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                    }

                } else {
                    Send_Notif.log("no notification");
                }
            }
        }

        return "null";
    }


    public String Notif_15DaysBefore_DateElimination(String objectStoreName, String Subject, String Body, String dominoServer,
                                                     String dominoMailbox, String dominoUsername, String dominoPassword) throws VWException {
        Send_Notifications Send_Notif = new Send_Notifications();
        Send_Notif.log("\tobjectStoreName: " + objectStoreName);

        Date date = new Date();
        final String ISO_FORMAT = "yyyyMMdd'T'HHmmss'Z'";

        final SimpleDateFormat sdf = new SimpleDateFormat(ISO_FORMAT);
        TimeZone utc = TimeZone.getTimeZone("UTC");
        sdf.setTimeZone(utc);
        System.out.println(sdf.format(date));

        Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.add(Calendar.DATE, +14);
        final Date PastDate = c.getTime();
        System.out.println("PastDate= " + PastDate);

        c.setTime(date);
        c.add(Calendar.DATE, +16);
        final Date FutureDate = c.getTime();
        System.out.println("FutureDate= " + FutureDate);
        System.out.println("===========");


        if (Send_Notif.init()) {
            Send_Notif.log("context initialized");
            ObjectStore store = Factory.ObjectStore.fetchInstance(Send_Notif.getDomain(), objectStoreName, null);

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
                String Org = folder.getProperties().getStringValue("Org");
                String OutNumRefFO = doc.getProperties().getStringValue("OutNumRefFO");
                String body = "ВНИМАНИЕ! Касательно проверки «";
                body = body + Org + "»." + " Осталось 15 дней до истечения срока исполнения ФО '" + message_format.format(DateElimination) + "' от №" + OutNumRefFO;
                System.out.println(body);


                System.out.println("===========");
                System.out.println("RKKDate DateExecLimMeasure= " + doc.getProperties().getDateTimeValue("DateExecLimMeasure"));
                Date RKKDate = doc.getProperties().getDateTimeValue("DateElimination");


                System.out.println("CURRENT DATE is " + date);

                c.setTime(date);
                c.add(Calendar.DATE, +15);
                Date DublicateDate = c.getTime();
                System.out.println("DublicateDate is " + DublicateDate);


                // if (date.after(PastDate) && (date.before(FutureDate)) && date.getDate() != PastDate.getDate() && date.getDate() != FutureDate.getDate()) {
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
                        // sendmail.SendMail(email, subject, body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                        String[] mail = email.split("\\s+");
                        sendmail.SendMail(mail[0].trim() + " " + mail[1].trim(), subject, body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                    }


                } else {
                    System.out.println("no notification");
                }

            }

        }
        return "null";
    }


    public String Notif_3DaysBefore_DateElimination(String objectStoreName, String Subject, String Body, String dominoServer,
                                                    String dominoMailbox, String dominoUsername, String dominoPassword) throws VWException {
        Send_Notifications Send_Notif = new Send_Notifications();
        Send_Notif.log("\tobjectStoreName: " + objectStoreName);

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
        c.add(Calendar.DATE, +4);
        final Date FutureDate = c.getTime();
        System.out.println("FutureDate= " + FutureDate);
        System.out.println("===========");

        if (Send_Notif.init()) {
            Send_Notif.log("context initialized");
            ObjectStore store = Factory.ObjectStore.fetchInstance(Send_Notif.getDomain(), objectStoreName, null);
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
                String Org = folder.getProperties().getStringValue("Org");
                String OutNumRefFO = doc.getProperties().getStringValue("OutNumRefFO");
                String body = "ВНИМАНИЕ! Касательно проверки «";
                body = body + Org + "»." + " Осталось 3 дня до истечения срока исполнения ФО '" + message_format.format(DateElimination) + "' от №" + OutNumRefFO;
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
                    // String query3 = "select * from StaffInspectors where FinInspectDocId = " + "'" + FinInspectDocId + "'" + "and IsRuk= " + "'Руководитель'" + " and EndDate>" + sdf.format(date);
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
                        //sendmail.SendMail(email, subject, body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                        String[] mail = email.split("\\s+");
                        sendmail.SendMail(mail[0].trim() + " " + mail[1].trim(), subject, body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                    }


                } else {
                    System.out.println("no notification");
                }
            }
        }


        return "null";
    }

    public String Mail_1_DayBefore(String objectStoreName, String Subject, String Body, String dominoServer, String dominoMailbox, String dominoUsername, String dominoPassword) throws VWException {

        //        PropertyConfigurator.configure(Send_Notifications.class.getResource("/logs/log4j.properties"));
//         System.out.println("  ");
//         System.out.println("  ");
//         System.out.println("*******************START Mail_1_DayBefore METHOD**********************************************************");
//
//         System.out.println("#####1");
//        String url = System.getProperty("filenet.pe.bootstrap.ceuri");
//         System.out.println("#####2");
//         System.out.println("##### url= " + url);
//        Connection connection = Factory.Connection.getConnection(url);
//         System.out.println("#####3");
//        Domain domain = Factory.Domain.fetchInstance(connection, "p8dom", null);
//         System.out.println("######4");
//         System.out.println("#######5 Domain= " + domain.get_Name());
//
//        ObjectStore store = Factory.ObjectStore.fetchInstance(domain, "FNOSINS", null);
//         System.out.println("#######6");
//         System.out.println("#######6 Store" + store.get_Name());

        Send_Notifications Send_Notif = new Send_Notifications();
        Send_Notif.log("\tobjectStoreName: " + objectStoreName);

        Date date = new Date();
        final String ISO_FORMAT = "yyyyMMdd'T'HHmmss'Z'";

        final SimpleDateFormat sdf = new SimpleDateFormat(ISO_FORMAT);
        final TimeZone utc = TimeZone.getTimeZone("UTC");
        sdf.setTimeZone(utc);
        System.out.println(sdf.format(date));
        System.out.println("SDF Format= " + sdf.format(date));


        Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.add(Calendar.DATE, 0);
        final Date PastDate = c.getTime();
        System.out.println("PastDate= " + PastDate);

        c.setTime(date);
        c.add(Calendar.DATE, +2);
        final Date FutureDate = c.getTime();
        System.out.println("FutureDate= " + FutureDate);
        System.out.println("===========");

        if (Send_Notif.init()) {
            Send_Notif.log("context initialized");
            ObjectStore store = Factory.ObjectStore.fetchInstance(Send_Notif.getDomain(), objectStoreName, null);

            //NOTIFICATION DATE FORMAT
            String format = "dd.MM.yyyy";
            SimpleDateFormat message_format = new SimpleDateFormat(format);


            //String query = "select * from FinInspect where DateRefItogFO>" + sdf.format(date);
            String query = "select * from FinInspect where DateRefItogFO> " + sdf.format(PastDate) + " and DateRefItogFO<" + sdf.format(FutureDate);
            System.out.println("query= " + query);
            System.out.println("query= " + query);

            SearchSQL sql = new SearchSQL(query);
            SearchScope search = new SearchScope(store);
            FolderSet folders = (FolderSet) search.fetchObjects(sql, null, null, Boolean.valueOf(true));
            Iterator it = folders.iterator();

            while (it.hasNext()) {
                Folder folder = (Folder) it.next();
                String SectorFinOrg = folder.getProperties().getStringValue("SectorFinOrg");
                //  System.out.println("SectorFinOrg= " + SectorFinOrg);


                //MESSAGE TEXT
                Id FinInspectDocId = folder.get_Id();
                String Org = folder.getProperties().getStringValue("Org");
                //  Subject = "Уведомление по предоставлению возражений к Акту о результатах проверки";
                Subject = "ВНИМАНИЕ! Касательно проверки «";
                Subject = Subject + Org + "»." + " Остался 1 день до наступления даты предоставление возражений на Акт о результатах проверки.";
                Body = "";
//            Body = "ВНИМАНИЕ! Касательно проверки «";
//            Body = Body + Org + "»." + " Остался 1 день до наступления даты предоставление возражений на Акт о результатах проверки.";
                System.out.println(Body);

                System.out.println("===========");
                System.out.println("RKKDate DateRefItogFO= " + folder.getProperties().getDateTimeValue("DateRefItogFO"));
                Date RKKDate = folder.getProperties().getDateTimeValue("DateRefItogFO");


                System.out.println("CURRENT DATE is " + date);

                c.setTime(date);
                c.add(Calendar.DATE, +1);
                Date DublicateDate = c.getTime();
                System.out.println("DublicateDate is " + DublicateDate);


                System.out.println("");
                System.out.println("");
                if (DublicateDate.getDate() == RKKDate.getDate() && DublicateDate.getMonth() == RKKDate.getMonth() && DublicateDate.getYear() == RKKDate.getYear()) {
                    System.out.println("send notification");

                    String query2 = "select * from NoticeInfo where SectorFinOrg = " + "'" + SectorFinOrg + "'";
                    System.out.println("query2= " + query2);
                    System.out.println("query2= " + query2);

                    SearchSQL sql2 = new SearchSQL(query2);
                    SearchScope search2 = new SearchScope(store);
                    DocumentSet documents = (DocumentSet) search2.fetchObjects(sql2, null, null, Boolean.valueOf(true));


                    Iterator it2 = documents.iterator();
                    Document doc2 = (Document) it2.next();
                    System.out.println("DocumentTitle= " + doc2.getProperties().getStringValue("DocumentTitle"));
                    System.out.println("DocumentTitle= " + doc2.getProperties().getStringValue("DocumentTitle"));
                    EmailList = doc2.getProperties().getStringListValue("email");
                    Iterator it3 = EmailList.iterator();

                    while (it3.hasNext()) {

                        String email = (String) it3.next();
                        System.out.println("email= " + email);
                        System.out.println("email= " + email);

                        sendmail.SendMail(email, Subject, Body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
//                    try {
//                        lotus.domino.Session dominoSession = lotus.domino.NotesFactory.createSession(dominoServer, dominoUsername, dominoPassword);
//                        lotus.domino.Database dominoDb = dominoSession.getDatabase(dominoServer, dominoMailbox);
//                        System.out.println("Connected as: " + dominoSession.getUserName());
//
//                        lotus.domino.Document memo = dominoDb.createDocument();
//                        memo.appendItemValue("Form", "Memo");
//                        memo.appendItemValue("Importance", "1");
//                        memo.appendItemValue("Subject", Subject);
//                        memo.appendItemValue("Body", Body);
//                        memo.send(false, email + "/BSBNB@bsbnb");
//
//
//                        dominoDb.recycle();
//                        dominoSession.recycle();
//                    } catch (NotesException e) {
//                        System.out.println("Error - " + e.id + " " + e.text);
//
//                    } catch (Exception e) {
//                        System.out.println("Error - " + e.toString());
//
//                    }


                    }


                    // NOTIFICATION STAFF
                    String query3 = "select * from StaffInspectors where FinInspectDocId = " + "'" + FinInspectDocId + "'" + "and IsRuk= " + "'Руководитель'" + " and EndDate>" + sdf.format(date);
                    //String query3 = "select * from StaffInspectors where FinInspectDocId = '{B59A6664-99EF-4C8C-BBF4-AB60718DBF6F}'";
                    System.out.println("query3=" + query3);
                    SearchSQL sql3 = new SearchSQL(query3);
                    SearchScope search3 = new SearchScope(store);
                    DocumentSet StaffInspectors = (DocumentSet) search3.fetchObjects(sql3, null, null, Boolean.valueOf(true));
                    Iterator it4 = StaffInspectors.iterator();
                    System.out.println("NOTIFICATION STAFF");
                    while (it4.hasNext()) {
                        Document doc3 = (Document) it4.next();
                        System.out.println("FIO= " + doc3.getProperties().getStringValue("FIO"));
                        System.out.println("Email= " + doc3.getProperties().getStringValue("EmailLotus"));
                        String EmailStaff = doc3.getProperties().getStringValue("EmailLotus");
                        sendmail.SendMail(EmailStaff, Subject, Body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                    }

                    System.out.println("Finished NOTIFICATION STAFF");


                } else {
                    System.out.println("no notification");
                }


            }


        }
        return "null";
    }


    public String Mail_2Days_Before(String objectStoreName, String Subject, String Body, String dominoServer, String dominoMailbox, String dominoUsername, String dominoPassword) throws VWException {
//        PropertyConfigurator.configure(Send_Notifications.class.getResource("/logs/log4j.properties"));
//        System.out.println("  ");
//        System.out.println("  ");
//        System.out.println("*******************START Mail_2Days_Before METHOD**********************************************************");
//
//        System.out.println("#####1");
//        String url = System.getProperty("filenet.pe.bootstrap.ceuri");
//        System.out.println("#####2");
//        System.out.println("##### url= " + url);
//        Connection connection = Factory.Connection.getConnection(url);
//        System.out.println("#####3");
//        Domain domain = Factory.Domain.fetchInstance(connection, "P8Dom", null);
//        System.out.println("######4");
//        System.out.println("#######5 Domain= " + domain.get_Name());
//
//        ObjectStore store = Factory.ObjectStore.fetchInstance(domain, "FNOSINS", null);
//        System.out.println("#######6");
//        System.out.println("#######6 Store" + store.get_Name());
        Send_Notifications Send_Notif = new Send_Notifications();
        Send_Notif.log("\tobjectStoreName: " + objectStoreName);

        Date date = new Date();
        final String ISO_FORMAT = "yyyyMMdd'T'HHmmss'Z'";

        final SimpleDateFormat sdf = new SimpleDateFormat(ISO_FORMAT);
        System.out.println(sdf.format(date));
        System.out.println("SDF Format= " + sdf.format(date));
        final TimeZone utc = TimeZone.getTimeZone("UTC");
        sdf.setTimeZone(utc);


        Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.add(Calendar.DATE, +1);
        final Date PastDate = c.getTime();
        System.out.println("PastDate= " + PastDate);

        c.setTime(date);
        c.add(Calendar.DATE, +3);
        final Date FutureDate = c.getTime();
        System.out.println("FutureDate= " + FutureDate);
        System.out.println("===========");

        if (Send_Notif.init()) {
            Send_Notif.log("context initialized");
            ObjectStore store = Factory.ObjectStore.fetchInstance(Send_Notif.getDomain(), objectStoreName, null);

            //NOTIFICATION DATE FORMAT
            String format = "dd.MM.yyyy";
            SimpleDateFormat message_format = new SimpleDateFormat(format);


            // String query = "select * from FinInspect where DateSubmPlan>" + sdf.format(date);
            String query = "select * from FinInspect where DateSubmPlan> " + sdf.format(PastDate) + " and DateSubmPlan<" + sdf.format(FutureDate);
            System.out.println("query= " + query);


            SearchSQL sql = new SearchSQL(query);
            SearchScope search = new SearchScope(store);
            FolderSet folders = (FolderSet) search.fetchObjects(sql, null, null, Boolean.valueOf(true));
            Iterator it = folders.iterator();

            while (it.hasNext()) {
                Folder folder = (Folder) it.next();
                String SectorFinOrg = folder.getProperties().getStringValue("SectorFinOrg");
                //  System.out.println("SectorFinOrg= " + SectorFinOrg);


                //MESSAGE TEXT
                Id FinInspectDocId = folder.get_Id();
                String Org = folder.getProperties().getStringValue("Org");
                //Subject = "Уведомление по плану мероприятий";
                Subject = "ВНИМАНИЕ! Касательно проверки «";
                Subject = Subject + Org + "»." + " Осталось 2 дня до наступления даты предоставления Плана мероприятий.";
                Body = "";
                //Body = "ВНИМАНИЕ! Касательно проверки «";
                //Body = Body + Org + "»." + " Осталось 2 дня до наступления даты предоставления Плана мероприятий.";
                System.out.println(Body);


                System.out.println("===========");
                System.out.println("RKKDate DateRefItogFO= " + folder.getProperties().getDateTimeValue("DateSubmPlan"));
                System.out.println("===========");
                System.out.println("RKKDate DateRefItogFO= " + folder.getProperties().getDateTimeValue("DateSubmPlan"));
                Date RKKDate = folder.getProperties().getDateTimeValue("DateSubmPlan");


                System.out.println("CURRENT DATE is " + date);

                c.setTime(date);
                c.add(Calendar.DATE, +2);
                Date DublicateDate = c.getTime();
                System.out.println("DublicateDate is " + DublicateDate);


                if (DublicateDate.getDate() == RKKDate.getDate() && DublicateDate.getMonth() == RKKDate.getMonth() && DublicateDate.getYear() == RKKDate.getYear()) {
                    System.out.println("send notification");


                    String query2 = "select * from NoticeInfo where SectorFinOrg = " + "'" + SectorFinOrg + "'";
                    System.out.println("query2= " + query2);

                    SearchSQL sql2 = new SearchSQL(query2);
                    SearchScope search2 = new SearchScope(store);
                    DocumentSet documents = (DocumentSet) search2.fetchObjects(sql2, null, null, Boolean.valueOf(true));


                    Iterator it2 = documents.iterator();
                    Document doc2 = (Document) it2.next();
                    System.out.println("DocumentTitle= " + doc2.getProperties().getStringValue("DocumentTitle"));
                    EmailList = doc2.getProperties().getStringListValue("email");
                    Iterator it3 = EmailList.iterator();

                    while (it3.hasNext()) {

                        String email = (String) it3.next();
                        System.out.println("email= " + email);


                        sendmail.SendMail(email, Subject, Body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
//                    try {
//                        lotus.domino.Session dominoSession = lotus.domino.NotesFactory.createSession(dominoServer, dominoUsername, dominoPassword);
//                        lotus.domino.Database dominoDb = dominoSession.getDatabase(dominoServer, dominoMailbox);
//                        System.out.println("Connected as: " + dominoSession.getUserName());
//
//                        lotus.domino.Document memo = dominoDb.createDocument();
//                        memo.appendItemValue("Form", "Memo");
//                        memo.appendItemValue("Importance", "1");
//                        memo.appendItemValue("Subject", Subject);
//                        memo.appendItemValue("Body", Body);
//                        memo.send(false, email + "/BSBNB@bsbnb");
//
//
//                        dominoDb.recycle();
//                        dominoSession.recycle();
//                    } catch (NotesException e) {
//                        System.out.println("Error - " + e.id + " " + e.text);
//
//                    } catch (Exception e) {
//                        System.out.println("Error - " + e.toString());
//
//                    }

                    }


                    // NOTIFICATION STAFF
                    String query3 = "select * from StaffInspectors where FinInspectDocId = " + "'" + FinInspectDocId + "'" + "and IsRuk= " + "'Руководитель'" + " and EndDate>" + sdf.format(date);
                    //String query3 = "select * from StaffInspectors where FinInspectDocId = '{B59A6664-99EF-4C8C-BBF4-AB60718DBF6F}'";
                    System.out.println("query3=" + query3);
                    SearchSQL sql3 = new SearchSQL(query3);
                    SearchScope search3 = new SearchScope(store);
                    DocumentSet StaffInspectors = (DocumentSet) search3.fetchObjects(sql3, null, null, Boolean.valueOf(true));
                    Iterator it4 = StaffInspectors.iterator();
                    System.out.println("NOTIFICATION STAFF");
                    while (it4.hasNext()) {
                        Document doc3 = (Document) it4.next();
                        System.out.println("FIO= " + doc3.getProperties().getStringValue("FIO"));
                        System.out.println("Email= " + doc3.getProperties().getStringValue("EmailLotus"));
                        String EmailStaff = doc3.getProperties().getStringValue("EmailLotus");
                        sendmail.SendMail(EmailStaff, Subject, Body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                    }
                    System.out.println("Finished NOTIFICATION STAFF");

                } else {
                    System.out.println("no notification");

                }


            }
        }

        return "null";
    }


    public String Select_1day_Before_EndDateInspect(String objectStoreName, String Subject, String Body, String dominoServer, String dominoMailbox, String dominoUsername, String dominoPassword) throws VWException {
//        PropertyConfigurator.configure(Send_Notifications.class.getResource("/logs/log4j.properties"));
//        System.out.println("  ");
//        System.out.println("  ");
//        System.out.println("*******************START Select_1day_Before_EndDateInspect METHOD**********************************************************");
//
//        System.out.println("#####1");
//        String url = System.getProperty("filenet.pe.bootstrap.ceuri");
//        System.out.println("#####2");
//        System.out.println("##### url= " + url);
//        Connection connection = Factory.Connection.getConnection(url);
//        System.out.println("#####3");
//        Domain domain = Factory.Domain.fetchInstance(connection, "p8dom", null);
//        System.out.println("######4");
//        System.out.println("#######5 Domain= " + domain.get_Name());
//
//        ObjectStore store = Factory.ObjectStore.fetchInstance(domain, "FNOSINS", null);
//        System.out.println("#######6");
//        System.out.println("#######6 Store" + store.get_Name());
        Send_Notifications Send_Notif = new Send_Notifications();
        Send_Notif.log("\tobjectStoreName: " + objectStoreName);


        Date date = new Date();
        final String ISO_FORMAT = "yyyyMMdd'T'HHmmss'Z'";

        final SimpleDateFormat sdf = new SimpleDateFormat(ISO_FORMAT);
        System.out.println("SDF Format= " + sdf.format(date));
        final TimeZone utc = TimeZone.getTimeZone("UTC");
        sdf.setTimeZone(utc);

        Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.add(Calendar.DATE, 0);
        final Date PastDate = c.getTime();
        System.out.println("PastDate= " + PastDate);

        c.setTime(date);
        c.add(Calendar.DATE, +2);
        final Date FutureDate = c.getTime();
        System.out.println("FutureDate= " + FutureDate);

        if (Send_Notif.init()) {
            Send_Notif.log("context initialized");
            ObjectStore store = Factory.ObjectStore.fetchInstance(Send_Notif.getDomain(), objectStoreName, null);

            //NOTIFICATION DATE FORMAT
            String format = "dd.MM.yyyy";
            SimpleDateFormat message_format = new SimpleDateFormat(format);


            String query = "select * from FinInspect where EndDateInspect> " + sdf.format(PastDate) + " and EndDateInspect<" + sdf.format(FutureDate);
            System.out.println("query= " + query);
            System.out.println("query= " + query);

            SearchSQL sql = new SearchSQL(query);
            SearchScope search = new SearchScope(store);
            FolderSet folders = (FolderSet) search.fetchObjects(sql, null, null, Boolean.valueOf(true));
            Iterator it = folders.iterator();

            while (it.hasNext()) {
                Folder folder = (Folder) it.next();
                String SectorFinOrg = folder.getProperties().getStringValue("SectorFinOrg");
                //  System.out.println("SectorFinOrg= " + SectorFinOrg);


                //MESSAGE TEXT
                Id FinInspectDocId = folder.get_Id();
                String Org = folder.getProperties().getStringValue("Org");
                //Subject = "Уведомление об окончании проверки";
                Subject = "ВНИМАНИЕ! Касательно проверки «";
                Subject = Subject + Org + "»." + " Остался 1 день до наступления даты окончания проверки.";
                Body = "";
//            Body = "ВНИМАНИЕ! Касательно проверки «";
//            Body = Body + Org + "»." + " Остался 1 день до наступления даты окончания проверки.";
                System.out.println(Body);

                System.out.println("===========");
                System.out.println("RKKDate DateRefItogFO= " + folder.getProperties().getDateTimeValue("EndDateInspect"));
                System.out.println("===========");
                System.out.println("RKKDate DateRefItogFO= " + folder.getProperties().getDateTimeValue("EndDateInspect"));
                Date RKKDate = folder.getProperties().getDateTimeValue("EndDateInspect");


                System.out.println("CURRENT DATE is " + date);

                c.setTime(date);
                c.add(Calendar.DATE, +1);
                Date DublicateDate = c.getTime();
                System.out.println("DublicateDate is " + DublicateDate);


                if (DublicateDate.getDate() == RKKDate.getDate() && DublicateDate.getMonth() == RKKDate.getMonth() && DublicateDate.getYear() == RKKDate.getYear()) {
                    System.out.println("send notification");


                    String query2 = "select * from NoticeInfo where SectorFinOrg = " + "'" + SectorFinOrg + "'";
                    System.out.println("query2= " + query2);


                    SearchSQL sql2 = new SearchSQL(query2);
                    SearchScope search2 = new SearchScope(store);
                    DocumentSet documents = (DocumentSet) search2.fetchObjects(sql2, null, null, Boolean.valueOf(true));


                    Iterator it2 = documents.iterator();
                    Document doc2 = (Document) it2.next();
                    System.out.println("DocumentTitle= " + doc2.getProperties().getStringValue("DocumentTitle"));

                    EmailList = doc2.getProperties().getStringListValue("email");
                    Iterator it3 = EmailList.iterator();

                    while (it3.hasNext()) {

                        String email = (String) it3.next();
                        System.out.println("email= " + email);
                        System.out.println("email= " + email);

                        sendmail.SendMail(email, Subject, Body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);

                    }


                    // NOTIFICATION STAFF
                    String query3 = "select * from StaffInspectors where FinInspectDocId = " + "'" + FinInspectDocId + "'" + "and IsRuk= " + "'Руководитель'" + " and EndDate>" + sdf.format(date);
                    //String query3 = "select * from StaffInspectors where FinInspectDocId = '{B59A6664-99EF-4C8C-BBF4-AB60718DBF6F}'";
                    System.out.println("query3=" + query3);
                    SearchSQL sql3 = new SearchSQL(query3);
                    SearchScope search3 = new SearchScope(store);
                    DocumentSet StaffInspectors = (DocumentSet) search3.fetchObjects(sql3, null, null, Boolean.valueOf(true));
                    Iterator it4 = StaffInspectors.iterator();

                    System.out.println("NOTIFICATION STAFF");
                    while (it4.hasNext()) {
                        Document doc3 = (Document) it4.next();
                        System.out.println("FIO= " + doc3.getProperties().getStringValue("FIO"));
                        System.out.println("Email= " + doc3.getProperties().getStringValue("EmailLotus"));
                        String email = doc3.getProperties().getStringValue("EmailLotus");
                        sendmail.SendMail(email, Subject, Body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                    }
                    System.out.println("Finished NOTIFICATION STAFF");


                } else {
                    System.out.println("no notification");

                }
            }
        }
        return "null";
    }


    public String After_1day_BegDateInspect(String objectStoreName, String Subject, String Body, String dominoServer, String dominoMailbox, String dominoUsername, String dominoPassword) throws VWException {
//        PropertyConfigurator.configure(Send_Notifications.class.getResource("/logs/log4j.properties"));
//        System.out.println("  ");
//        System.out.println("  ");
//        System.out.println("*******************START After_1day_BegDateInspect METHOD**********************************************************");
//
//        System.out.println("#####1");
//        String url = System.getProperty("filenet.pe.bootstrap.ceuri");
//        System.out.println("#####2");
//        System.out.println("##### url= " + url);
//        Connection connection = Factory.Connection.getConnection(url);
//        System.out.println("#####3");
//        Domain domain = Factory.Domain.fetchInstance(connection, "p8dom", null);
//        System.out.println("######4");
//        System.out.println("#######5 Domain= " + domain.get_Name());
//
//        ObjectStore store = Factory.ObjectStore.fetchInstance(domain, "FNOSINS", null);
//        System.out.println("#######6");
//        System.out.println("#######6 Store" + store.get_Name());
        Send_Notifications Send_Notif = new Send_Notifications();
        Send_Notif.log("\tobjectStoreName: " + objectStoreName);


        Date date = new Date();
        final String ISO_FORMAT = "yyyyMMdd'T'HHmmss'Z'";

        final SimpleDateFormat sdf = new SimpleDateFormat(ISO_FORMAT);
        final TimeZone utc = TimeZone.getTimeZone("UTC");
        sdf.setTimeZone(utc);
        System.out.println(sdf.format(date));
        System.out.println("SDF Format= " + sdf.format(date));


        Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.add(Calendar.DATE, -2);
        Date PastDate = c.getTime();
        System.out.println("PastDate= " + PastDate);

        c.setTime(date);
        c.add(Calendar.DATE, 0);
        Date FutureDate = c.getTime();
        System.out.println("FutureDate= " + FutureDate);


        if (Send_Notif.init()) {
            Send_Notif.log("context initialized");
            ObjectStore store = Factory.ObjectStore.fetchInstance(Send_Notif.getDomain(), objectStoreName, null);


            //NOTIFICATION DATE FORMAT
            String format = "dd.MM.yyyy";
            SimpleDateFormat message_format = new SimpleDateFormat(format);


            //String query = "select * from FinInspect where DateRefItogFO>"+"20120920T080000Z";
            String query = "select * from FinInspect where BegDateInspect> " + sdf.format(PastDate) + " and BegDateInspect<" + sdf.format(FutureDate);
            //  String query = "select * from FinInspect";
            System.out.println("query= " + query);
            SearchSQL sql = new SearchSQL(query);
            SearchScope search = new SearchScope(store);
            FolderSet folders = (FolderSet) search.fetchObjects(sql, null, null, Boolean.valueOf(true));
            Iterator it = folders.iterator();


            int kol = 0;
            while (it.hasNext()) {
                Folder folder = (Folder) it.next();
                String SectorFinOrg = folder.getProperties().getStringValue("SectorFinOrg");
                //  System.out.println("SectorFinOrg= " + SectorFinOrg);


                //MESSAGE TEXT
                Id FinInspectDocId = folder.get_Id();
                String Org = folder.getProperties().getStringValue("Org");
                //Subject = "Уведомление о регистрации Акта о назначении проверки";
                Subject = "ВНИМАНИЕ! Касательно проверки «";
                Subject = Subject + Org + "»." + " Остался 1 день до наступления последнего дня регистрации Акта о назначении проверки в уполномоченном органе по правовой статистике и специальным учетам.";
                //Body = "ВНИМАНИЕ! Касательно проверки «";
                //Body = Body + Org + "»." + " Остался 1 день до наступления последнего дня регистрации Акта о назначении проверки в уполномоченном органе по правовой статистике и специальным учетам.";
                System.out.println(Body);


                System.out.println("===========");
                kol++;
                System.out.println("kol= " + kol);
                System.out.println("RKKDate BegDateInspect= " + folder.getProperties().getDateTimeValue("BegDateInspect"));
                System.out.println("RKKDate BegDateInspect= " + folder.getProperties().getDateTimeValue("BegDateInspect"));
                Date RKKDate = folder.getProperties().getDateTimeValue("BegDateInspect");


                System.out.println("CURRENT DATE is " + date);

                c.setTime(date);
                c.add(Calendar.DATE, -1);
                Date DublicateDate = c.getTime();
                System.out.println("DublicateDate is " + DublicateDate);

                if (DublicateDate.getDate() == RKKDate.getDate() && DublicateDate.getMonth() == RKKDate.getMonth() && DublicateDate.getYear() == RKKDate.getYear()) {
                    System.out.println("send notification");
                    System.out.println("send notification");


                    String query2 = "select * from NoticeInfo where SectorFinOrg = " + "'" + SectorFinOrg + "'";
                    System.out.println("query2= " + query2);
                    SearchSQL sql2 = new SearchSQL(query2);
                    SearchScope search2 = new SearchScope(store);
                    DocumentSet documents = (DocumentSet) search2.fetchObjects(sql2, null, null, Boolean.valueOf(true));


                    Iterator it2 = documents.iterator();
                    Document doc2 = (Document) it2.next();
                    System.out.println("DocumentTitle= " + doc2.getProperties().getStringValue("DocumentTitle"));
                    EmailList = doc2.getProperties().getStringListValue("email");
                    Iterator it3 = EmailList.iterator();

                    while (it3.hasNext()) {

                        String email = (String) it3.next();
                        System.out.println("email= " + email);
                        System.out.println("email= " + email);
                        // System.out.println("User= " + User);

                        sendmail.SendMail(email, Subject, Body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);


                    }

                    // NOTIFICATION STAFF
                    String query3 = "select * from StaffInspectors where FinInspectDocId = " + "'" + FinInspectDocId + "'" + "and IsRuk= " + "'Руководитель'" + " and EndDate>" + sdf.format(date);
                    //String query3 = "select * from StaffInspectors where FinInspectDocId = '{B59A6664-99EF-4C8C-BBF4-AB60718DBF6F}'";
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
                        sendmail.SendMail(email, Subject, Body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                    }


                } else {
                    System.out.println("no notification");

                }


            }

        }


        return "null";
    }


    public String Before_1day_FO(String objectStoreName, String Subject, String Body, String dominoServer, String dominoMailbox, String dominoUsername, String dominoPassword) throws VWException {
//        PropertyConfigurator.configure(Send_Notifications.class.getResource("/logs/log4j.properties"));
//        System.out.println("  ");
//        System.out.println("  ");
//        System.out.println("*******************START Before_1day_FO METHOD**********************************************************");
//
//        System.out.println("#####1");
//        String url = System.getProperty("filenet.pe.bootstrap.ceuri");
//        System.out.println("#####2");
//        System.out.println("##### url= " + url);
//        Connection connection = Factory.Connection.getConnection(url);
//        System.out.println("#####3");
//        Domain domain = Factory.Domain.fetchInstance(connection, "p8dom", null);
//        System.out.println("######4");
//        System.out.println("#######5 Domain= " + domain.get_Name());
//
//        ObjectStore store = Factory.ObjectStore.fetchInstance(domain, "FNOSINS", null);
//        System.out.println("#######6");
//        System.out.println("#######6 Store" + store.get_Name());
        Send_Notifications Send_Notif = new Send_Notifications();
        Send_Notif.log("\tobjectStoreName: " + objectStoreName);

        Date date = new Date();
        final String ISO_FORMAT = "yyyyMMdd'T'HHmmss'Z'";

        final SimpleDateFormat sdf = new SimpleDateFormat(ISO_FORMAT);
        System.out.println("SDF Format= " + sdf.format(date));
        final TimeZone utc = TimeZone.getTimeZone("UTC");
        sdf.setTimeZone(utc);

        Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.add(Calendar.DATE, 0);
        Date PastDate = c.getTime();
        System.out.println("PastDate= " + PastDate);

        c.setTime(date);
        c.add(Calendar.DATE, +2);
        Date FutureDate = c.getTime();
        System.out.println("FutureDate= " + FutureDate);
        System.out.println("===========");

        if (Send_Notif.init()) {
            Send_Notif.log("context initialized");
            ObjectStore store = Factory.ObjectStore.fetchInstance(Send_Notif.getDomain(), objectStoreName, null);

            //NOTIFICATION DATE FORMAT
            String format = "dd.MM.yyyy";
            SimpleDateFormat message_format = new SimpleDateFormat(format);


            String query = "select * from PlanInspect where DatePreparation> " + sdf.format(PastDate) + " and DatePreparation<" + sdf.format(FutureDate);
            System.out.println("query= " + query);
            SearchSQL sql = new SearchSQL(query);
            SearchScope search = new SearchScope(store);
            DocumentSet Docs = (DocumentSet) search.fetchObjects(sql, null, null, Boolean.valueOf(true));
            Iterator it = Docs.iterator();


            while (it.hasNext()) {

                Document doc = (Document) it.next();
                String FinInspectDocId = doc.getProperties().getStringValue("FinInspectDocId");
                System.out.println("FinInspectDocId= " + FinInspectDocId);
                System.out.println("FinInspectDocId= " + FinInspectDocId);
                String FinIdQuery = "select * from FinInspect where ID=" + "'" + FinInspectDocId + "'";
                SearchSQL sqlFinId = new SearchSQL(FinIdQuery);
                SearchScope searchFinId = new SearchScope(store);
                FolderSet folders = (FolderSet) searchFinId.fetchObjects(sqlFinId, null, null, Boolean.valueOf(true));

                Iterator iterator = folders.iterator();
                Folder folder = (Folder) iterator.next();
                System.out.println("title=" + folder.get_FolderName());
                System.out.println("title=" + folder.get_FolderName());
                String SectorFinOrg = folder.getProperties().getStringValue("SectorFinOrg");


                //MESSAGE TEXT
                String Org = folder.getProperties().getStringValue("Org");
                String NameRazdel = doc.getProperties().getStringValue("NameRazdel");
                //Subject = "Уведомление по работам указанным в программе проверки деятельности ФО ";
                Subject = "ВНИМАНИЕ! Касательно проверки «";
                Subject = Subject + Org + "»." + " Остался 1 день до контрольного срока по отчету «" + NameRazdel + "».";
                //Body = "ВНИМАНИЕ! Касательно проверки «";
                //Body = Body + Org + "»." + " Остался 1 день до контрольного срока по отчету «" + NameRazdel + "».";
                System.out.println(Body);


                System.out.println("===========");
                System.out.println("RKKDate DatePreparation= " + doc.getProperties().getDateTimeValue("DatePreparation"));
                Date RKKDate = doc.getProperties().getDateTimeValue("DatePreparation");

                System.out.println("CURRENT DATE is " + date);
                c.setTime(date);
                c.add(Calendar.DATE, +1);
                Date DublicateDate = c.getTime();
                System.out.println("DublicateDate is " + DublicateDate);

                if (DublicateDate.getDate() == RKKDate.getDate() && DublicateDate.getMonth() == RKKDate.getMonth() && DublicateDate.getYear() == RKKDate.getYear()) {
                    System.out.println("send notification");

                    String query2 = "select * from NoticeInfo where SectorFinOrg = " + "'" + SectorFinOrg + "'";
                    System.out.println("query2= " + query2);
                    SearchSQL sql2 = new SearchSQL(query2);
                    SearchScope search2 = new SearchScope(store);
                    DocumentSet documents = (DocumentSet) search2.fetchObjects(sql2, null, null, Boolean.valueOf(true));


                    Iterator it2 = documents.iterator();
                    Document doc2 = (Document) it2.next();
                    System.out.println("DocumentTitle= " + doc2.getProperties().getStringValue("DocumentTitle"));

                    EmailList = doc2.getProperties().getStringListValue("email");
                    Iterator it3 = EmailList.iterator();

                    while (it3.hasNext()) {

                        String email = (String) it3.next();
                        System.out.println("email= " + email);
                        sendmail.SendMail(email, Subject, Body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);

                    }


                    // NOTIFICATION STAFF
                    System.out.println("NOTIFICATION STAFF");
                    String query3 = "select * from StaffInspectors where FinInspectDocId  = " + "'" + FinInspectDocId + "'" + "and IsRuk= " + "'Руководитель'" + " and EndDate>" + sdf.format(date);
                    //String query3 = "select * from StaffInspectors where FinInspectDocId = '{B59A6664-99EF-4C8C-BBF4-AB60718DBF6F}'";
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
                        sendmail.SendMail(email, Subject, Body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                    }

                    System.out.println("Finished NOTIFICATION STAFF");
                } else {
                    System.out.println("no notification");

                }
            }

        }

        return "null";
    }


    public String Before_2day_LimitedMeasure(String objectStoreName, String Subject, String Body, String dominoServer, String dominoMailbox, String dominoUsername, String dominoPassword) throws VWException {
//        PropertyConfigurator.configure(Send_Notifications.class.getResource("/logs/log4j.properties"));
//        System.out.println("  ");
//        System.out.println("  ");
//        System.out.println("*******************START Before_2day_LimitedMeasure METHOD**********************************************************");
//
//        System.out.println("#####1");
//        String url = System.getProperty("filenet.pe.bootstrap.ceuri");
//        System.out.println("#####2");
//        System.out.println("##### url= " + url);
//        Connection connection = Factory.Connection.getConnection(url);
//        System.out.println("#####3");
//        Domain domain = Factory.Domain.fetchInstance(connection, "p8dom", null);
//        System.out.println("######4");
//        System.out.println("#######5 Domain= " + domain.get_Name());
//
//        ObjectStore store = Factory.ObjectStore.fetchInstance(domain, "FNOSINS", null);
//        System.out.println("#######6");
//        System.out.println("#######6 Store" + store.get_Name());
        Send_Notifications Send_Notif = new Send_Notifications();
        Send_Notif.log("\tobjectStoreName: " + objectStoreName);

        Date date = new Date();
        final String ISO_FORMAT = "yyyyMMdd'T'HHmmss'Z'";

        final SimpleDateFormat sdf = new SimpleDateFormat(ISO_FORMAT);
        System.out.println("SDF Format= " + sdf.format(date));
        TimeZone utc = TimeZone.getTimeZone("UTC");
        sdf.setTimeZone(utc);

        Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.add(Calendar.DATE, +1);
        final Date PastDate = c.getTime();
        System.out.println("PastDate= " + PastDate);

        c.setTime(date);
        c.add(Calendar.DATE, +3);
        final Date FutureDate = c.getTime();
        System.out.println("FutureDate= " + FutureDate);
        System.out.println("===========");


        if (Send_Notif.init()) {
            Send_Notif.log("context initialized");
            ObjectStore store = Factory.ObjectStore.fetchInstance(Send_Notif.getDomain(), objectStoreName, null);
            //NOTIFICATION DATE FORMAT
            String format = "dd.MM.yyyy";
            SimpleDateFormat message_format = new SimpleDateFormat(format);


            String query = "select * from LimitedMeasure where DateExecLimMeasure> " + sdf.format(PastDate) + " and DateExecLimMeasure<" + sdf.format(FutureDate);
            System.out.println("query= " + query);
            SearchSQL sql = new SearchSQL(query);
            SearchScope search = new SearchScope(store);
            DocumentSet Docs = (DocumentSet) search.fetchObjects(sql, null, null, Boolean.valueOf(true));
            Iterator it = Docs.iterator();


            while (it.hasNext()) {

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
                //Subject = "Уведомление по ограниченным мерам воздействия";
                Date DateExecLimMeasure = doc.getProperties().getDateTimeValue("DateExecLimMeasure");
                String Org = folder.getProperties().getStringValue("Org");
                String VidImpact = doc.getProperties().getStringValue("VidImpact");
                String OutNumRefFO = doc.getProperties().getStringValue("OutNumRefFO");
                Subject = "ВНИМАНИЕ! Касательно проверки «";
                Subject = Subject + Org + "»." + " Осталось 2 дня до наступления даты исполнения по '" + VidImpact + "' от " + message_format.format(DateExecLimMeasure) + " №" + OutNumRefFO;
                //Body = "ВНИМАНИЕ! Касательно проверки «";
                //Body = Body + Org + "»." + " Осталось 2 дня до наступления даты исполнения по '" + VidImpact + "' от " + message_format.format(DateRefFO) + " №" + OutNumRefFO;
                System.out.println(Body);


                System.out.println("===========");
                System.out.println("RKKDate DateExecLimMeasure= " + doc.getProperties().getDateTimeValue("DateExecLimMeasure"));
                System.out.println("===========");
                System.out.println("RKKDate DateExecLimMeasure= " + doc.getProperties().getDateTimeValue("DateExecLimMeasure"));
                Date RKKDate = doc.getProperties().getDateTimeValue("DateExecLimMeasure");


                System.out.println("CURRENT DATE is " + date);

                c.setTime(date);
                c.add(Calendar.DATE, +2);
                Date DublicateDate = c.getTime();
                System.out.println("DublicateDate is " + DublicateDate);


                if (DublicateDate.getDate() == RKKDate.getDate() && DublicateDate.getMonth() == RKKDate.getMonth() && DublicateDate.getYear() == RKKDate.getYear()) {
                    System.out.println("Current Date= " + date);
                    System.out.println("send notification");


                    String query2 = "select * from NoticeInfo where SectorFinOrg = " + "'" + SectorFinOrg + "'";
                    // System.out.println("query2= " + query2);
                    SearchSQL sql2 = new SearchSQL(query2);
                    SearchScope search2 = new SearchScope(store);
                    DocumentSet documents = (DocumentSet) search2.fetchObjects(sql2, null, null, Boolean.valueOf(true));


                    Iterator it2 = documents.iterator();
                    Document doc2 = (Document) it2.next();
                    System.out.println("DocumentTitle= " + doc2.getProperties().getStringValue("DocumentTitle"));
                    System.out.println("");
                    EmailList = doc2.getProperties().getStringListValue("email");
                    Iterator it3 = EmailList.iterator();

                    while (it3.hasNext()) {

                        String email = (String) it3.next();
                        System.out.println("email= " + email);
                        sendmail.SendMail(email, Subject, Body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                    }


                    // NOTIFICATION STAFF
                    System.out.println("NOTIFICATION STAFF");
                    String query3 = "select * from StaffInspectors where FinInspectDocId = " + "'" + FinInspectDocId + "'" + "and IsRuk= " + "'Руководитель'" + " and EndDate>" + sdf.format(date);
                    //String query3 = "select * from StaffInspectors where FinInspectDocId = '{B59A6664-99EF-4C8C-BBF4-AB60718DBF6F}'";
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
                        sendmail.SendMail(email, Subject, Body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                    }

                    System.out.println("Finished NOTIFICATION STAFF");

                } else {
                    System.out.println("no notification");

                }

            }

        }

        return "null";
    }

    public String After_25day_Sunction(String objectStoreName, String Subject, String Body, String dominoServer, String dominoMailbox, String dominoUsername, String dominoPassword) throws VWException {
//        PropertyConfigurator.configure(Send_Notifications.class.getResource("/logs/log4j.properties"));
//        System.out.println("  ");
//        System.out.println("  ");
//        System.out.println("*******************START After_25day_Sunction METHOD**********************************************************");
//
//        System.out.println("#####1");
//        String url = System.getProperty("filenet.pe.bootstrap.ceuri");
//        System.out.println("#####2");
//        System.out.println("##### url= " + url);
//        Connection connection = Factory.Connection.getConnection(url);
//        System.out.println("#####3");
//        Domain domain = Factory.Domain.fetchInstance(connection, "p8dom", null);
//        System.out.println("######4");
//        System.out.println("#######5 Domain= " + domain.get_Name());
//
//        ObjectStore store = Factory.ObjectStore.fetchInstance(domain, "FNOSINS", null);
//        System.out.println("#######6");
//        System.out.println("#######6 Store" + store.get_Name());
        Send_Notifications Send_Notif = new Send_Notifications();
        Send_Notif.log("\tobjectStoreName: " + objectStoreName);

        Date date = new Date();
        final String ISO_FORMAT = "yyyyMMdd'T'HHmmss'Z'";

        final SimpleDateFormat sdf = new SimpleDateFormat(ISO_FORMAT);
        TimeZone utc = TimeZone.getTimeZone("UTC");
        sdf.setTimeZone(utc);
        System.out.println("SDF Format= " + sdf.format(date));
        Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.add(Calendar.DATE, -25);
        Date PastDate = c.getTime();
        System.out.println("PastDate= " + PastDate);

        c.setTime(date);
        c.add(Calendar.DATE, -23);
        Date FutureDate = c.getTime();
        System.out.println("FutureDate= " + FutureDate);

        if (Send_Notif.init()) {
            Send_Notif.log("context initialized");
            ObjectStore store = Factory.ObjectStore.fetchInstance(Send_Notif.getDomain(), objectStoreName, null);

            //NOTIFICATION DATE FORMAT
            String format = "dd.MM.yyyy";
            SimpleDateFormat message_format = new SimpleDateFormat(format);


            String payment = "Не уплачен";
            String query = "select * from Sanction where DateAppointedResol> " + sdf.format(PastDate) + " and DateAppointedResol<" + sdf.format(FutureDate) + " and MarkPaymPenalty=" + "'" + payment + "'";
            System.out.println("query= " + query);
            SearchSQL sql = new SearchSQL(query);
            SearchScope search = new SearchScope(store);
            DocumentSet Docs = (DocumentSet) search.fetchObjects(sql, null, null, Boolean.valueOf(true));
            Iterator it = Docs.iterator();


            while (it.hasNext()) {

                Document doc = (Document) it.next();
                String FinInspectDocId = doc.getProperties().getStringValue("FinInspectDocId");
                System.out.println("FinInspectDocId= " + FinInspectDocId);
                String FinIdQuery = "select * from FinInspect where ID=" + "'" + FinInspectDocId + "'";
                SearchSQL sqlFinId = new SearchSQL(FinIdQuery);
                SearchScope searchFinId = new SearchScope(store);
                FolderSet folders = (FolderSet) searchFinId.fetchObjects(sqlFinId, null, null, Boolean.valueOf(true));

                Iterator iterator = folders.iterator();
                Folder folder = (Folder) iterator.next();
                System.out.println("title=" + folder.get_FolderName());

                String SectorFinOrg = folder.getProperties().getStringValue("SectorFinOrg");


                //MESSAGE TEXT
                // Subject = "Уведомление о не уплате штрафа.";
                Date DateAppointedResol = doc.getProperties().getDateTimeValue("DateAppointedResol");
                String Org = folder.getProperties().getStringValue("Org");
                String NumProtAdmViolat = doc.getProperties().getStringValue("NumProtAdmViolat");
                Subject = "ВНИМАНИЕ! Касательно проверки «";
                Subject = Subject + Org + "»." + " Прошло 25 дней со дня вступления в силу постановления от " + message_format.format(DateAppointedResol) + " №" + NumProtAdmViolat;
                //Body = "ВНИМАНИЕ! Касательно проверки «";
                //Body = Body + Org + "»." + " Прошло 25 дней со дня вступления в силу постановления от " + message_format.format(DateAppointedResol) + " №" + NumProtAdmViolat;
                System.out.println(Body);


                System.out.println("===========");
                System.out.println("RKKDate DateAppointedResol= " + doc.getProperties().getDateTimeValue("DateAppointedResol"));
                Date RKKDate = doc.getProperties().getDateTimeValue("DateAppointedResol");


                System.out.println("CURRENT DATE is " + date);

                c.setTime(date);
                c.add(Calendar.DATE, -24);
                Date DublicateDate = c.getTime();
                System.out.println("DublicateDate is " + DublicateDate);

                if (DublicateDate.getDate() == RKKDate.getDate() && DublicateDate.getMonth() == RKKDate.getMonth() && DublicateDate.getYear() == RKKDate.getYear()) {
                    // if (date.after(PastDate) && (date.before(FutureDate)) && date.getDate() != PastDate.getDate() && date.getDate() != FutureDate.getDate()) {
                    System.out.println("send notification");

                    String query2 = "select * from NoticeInfo where SectorFinOrg = " + "'" + SectorFinOrg + "'";
                    System.out.println("query2= " + query2);
                    SearchSQL sql2 = new SearchSQL(query2);
                    SearchScope search2 = new SearchScope(store);
                    DocumentSet documents = (DocumentSet) search2.fetchObjects(sql2, null, null, Boolean.valueOf(true));


                    Iterator it2 = documents.iterator();
                    Document doc2 = (Document) it2.next();
                    System.out.println("DocumentTitle= " + doc2.getProperties().getStringValue("DocumentTitle"));
                    EmailList = doc2.getProperties().getStringListValue("email");
                    Iterator it3 = EmailList.iterator();

                    while (it3.hasNext()) {

                        String email = (String) it3.next();
                        System.out.println("email= " + email);


                        sendmail.SendMail(email, Subject, Body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);

                    }

                    // NOTIFICATION STAFF
                    String query3 = "select * from StaffInspectors where FinInspectDocId = " + "'" + FinInspectDocId + "'" + "and IsRuk= " + "'Руководитель'" + " and EndDate>" + sdf.format(date);
                    //String query3 = "select * from StaffInspectors where FinInspectDocId = '{B59A6664-99EF-4C8C-BBF4-AB60718DBF6F}'";
                    System.out.println("query3=" + query3);
                    SearchSQL sql3 = new SearchSQL(query3);
                    SearchScope search3 = new SearchScope(store);
                    DocumentSet StaffInspectors = (DocumentSet) search3.fetchObjects(sql3, null, null, Boolean.valueOf(true));
                    Iterator it4 = StaffInspectors.iterator();
                    System.out.println("NOTIFICATION STAFF");

                    while (it4.hasNext()) {
                        Document doc3 = (Document) it4.next();
                        System.out.println("FIO= " + doc3.getProperties().getStringValue("FIO"));
                        System.out.println("Email= " + doc3.getProperties().getStringValue("EmailLotus"));
                        String email = doc3.getProperties().getStringValue("EmailLotus");
                        sendmail.SendMail(email, Subject, Body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                    }
                    System.out.println("Finished NOTIFICATION STAFF");

                } else {
                    System.out.println("no notification");
                }
            }


        }

        return "null";
    }


    public String Before_1day_Sunction(String objectStoreName, String Subject, String Body, String dominoServer, String dominoMailbox, String dominoUsername, String dominoPassword) throws VWException {
//        PropertyConfigurator.configure(Send_Notifications.class.getResource("/logs/log4j.properties"));
//        System.out.println("  ");
//        System.out.println("  ");
//        System.out.println("*******************START After_25day_Sunction METHOD**********************************************************");
//
//        System.out.println("#####1");
//        String url = System.getProperty("filenet.pe.bootstrap.ceuri");
//        System.out.println("#####2");
//        System.out.println("##### url= " + url);
//        Connection connection = Factory.Connection.getConnection(url);
//        System.out.println("#####3");
//        Domain domain = Factory.Domain.fetchInstance(connection, "p8dom", null);
//        System.out.println("######4");
//        System.out.println("#######5 Domain= " + domain.get_Name());
//
//        ObjectStore store = Factory.ObjectStore.fetchInstance(domain, "FNOSINS", null);
//        System.out.println("#######6");
//        System.out.println("#######6 Store" + store.get_Name());
        Send_Notifications Send_Notif = new Send_Notifications();
        Send_Notif.log("\tobjectStoreName: " + objectStoreName);

        Date date = new Date();
        final String ISO_FORMAT = "yyyyMMdd'T'HHmmss'Z'";
        final SimpleDateFormat sdf = new SimpleDateFormat(ISO_FORMAT);
        TimeZone utc = TimeZone.getTimeZone("UTC");
        sdf.setTimeZone(utc);
        System.out.println("SDF Format= " + sdf.format(date));


        Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.add(Calendar.DATE, 0);
        final Date PastDate = c.getTime();
        System.out.println("PastDate= " + PastDate);

        c.setTime(date);
        c.add(Calendar.DATE, +2);
        final Date FutureDate = c.getTime();
        System.out.println("FutureDate= " + FutureDate);


        if (Send_Notif.init()) {
            Send_Notif.log("context initialized");
            ObjectStore store = Factory.ObjectStore.fetchInstance(Send_Notif.getDomain(), objectStoreName, null);


            //NOTIFICATION DATE FORMAT
            String format = "dd.MM.yyyy";
            SimpleDateFormat message_format = new SimpleDateFormat(format);

            String query = "select * from Sanction where DateAppointedResol> " + sdf.format(PastDate) + " and DateAppointedResol<" + sdf.format(FutureDate);
            System.out.println("query= " + query);
            SearchSQL sql = new SearchSQL(query);
            SearchScope search = new SearchScope(store);
            DocumentSet Docs = (DocumentSet) search.fetchObjects(sql, null, null, Boolean.valueOf(true));
            Iterator it = Docs.iterator();


            while (it.hasNext()) {

                Document doc = (Document) it.next();
                String FinInspectDocId = doc.getProperties().getStringValue("FinInspectDocId");
                System.out.println("FinInspectDocId= " + FinInspectDocId);
                String FinIdQuery = "select * from FinInspect where ID=" + "'" + FinInspectDocId + "'";
                SearchSQL sqlFinId = new SearchSQL(FinIdQuery);
                SearchScope searchFinId = new SearchScope(store);
                FolderSet folders = (FolderSet) searchFinId.fetchObjects(sqlFinId, null, null, Boolean.valueOf(true));

                Iterator iterator = folders.iterator();
                Folder folder = (Folder) iterator.next();
                System.out.println("title=" + folder.get_FolderName());

                String SectorFinOrg = folder.getProperties().getStringValue("SectorFinOrg");


                //MESSAGE TEXT
                //  Subject = "Уведомление по санкциям";
                Date DateProtocol = doc.getProperties().getDateTimeValue("DateProtocol");
                String Org = folder.getProperties().getStringValue("Org");
                String NumProtAdmViolat = doc.getProperties().getStringValue("NumProtAdmViolat");
                Subject = "ВНИМАНИЕ! Касательно проверки «";
                Subject = Subject + Org + "»." + " Остался 1 день до вступления в силу постановления о наложении административного взыскания по протоколу от " + message_format.format(DateProtocol) + " №" + NumProtAdmViolat;
                //Body = "ВНИМАНИЕ! Касательно проверки «";
                //Body = Body + Org + "»." + " Остался 1 день до вступления в силу постановления о наложении административного взыскания по протоколу от " + message_format.format(DateProtocol) + " №" + NumProtAdmViolat;
                System.out.println(Body);

                System.out.println("===========");
                System.out.println("RKKDate DateAppointedResol= " + doc.getProperties().getDateTimeValue("DateAppointedResol"));
                Date RKKDate = doc.getProperties().getDateTimeValue("DateAppointedResol");


                System.out.println("CURRENT DATE is " + date);

                c.setTime(date);
                c.add(Calendar.DATE, +1);
                Date DublicateDate = c.getTime();
                System.out.println("DublicateDate is " + DublicateDate);

                if (DublicateDate.getDate() == RKKDate.getDate() && DublicateDate.getMonth() == RKKDate.getMonth() && DublicateDate.getYear() == RKKDate.getYear()) {
                    // if (date.after(PastDate) && (date.before(FutureDate)) && date.getDate() != PastDate.getDate() && date.getDate() != FutureDate.getDate()) {
                    System.out.println("send notification");

                    String query2 = "select * from NoticeInfo where SectorFinOrg = " + "'" + SectorFinOrg + "'";
                    System.out.println("query2= " + query2);
                    SearchSQL sql2 = new SearchSQL(query2);
                    SearchScope search2 = new SearchScope(store);
                    DocumentSet documents = (DocumentSet) search2.fetchObjects(sql2, null, null, Boolean.valueOf(true));


                    Iterator it2 = documents.iterator();
                    Document doc2 = (Document) it2.next();
                    System.out.println("DocumentTitle= " + doc2.getProperties().getStringValue("DocumentTitle"));
                    EmailList = doc2.getProperties().getStringListValue("email");
                    Iterator it3 = EmailList.iterator();

                    while (it3.hasNext()) {

                        String email = (String) it3.next();
                        System.out.println("email= " + email);
                        sendmail.SendMail(email, Subject, Body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);

                    }


                    // NOTIFICATION STAFF
                    String query3 = "select * from StaffInspectors where FinInspectDocId = " + "'" + FinInspectDocId + "'" + "and IsRuk= " + "'Руководитель'" + " and EndDate>" + sdf.format(date);
                    //String query3 = "select * from StaffInspectors where FinInspectDocId = '{B59A6664-99EF-4C8C-BBF4-AB60718DBF6F}'";
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
                        sendmail.SendMail(email, Subject, Body, dominoServer, dominoMailbox, dominoUsername, dominoPassword);
                    }


                } else {
                    System.out.println("no notification");
                }
            }

        }
        return "null";
    }

    public String Resolution_deadline(String objectStoreName) throws VWException {

        Send_Notifications Send_Notif = new Send_Notifications();
        Send_Notif.log("\tobjectStoreName: " + objectStoreName);

        Date date = new Date();
        final String ISO_FORMAT = "yyyyMMdd'T'HHmmss'Z'";
        final SimpleDateFormat sdf = new SimpleDateFormat(ISO_FORMAT);
        TimeZone utc = TimeZone.getTimeZone("UTC");
        sdf.setTimeZone(utc);
        System.out.println(sdf.format(date));

        String ddMMyyyy = "dd.MM.yyyy";
        SimpleDateFormat Format_ddMMyyyy = new SimpleDateFormat(ddMMyyyy);

        int ResolutionNum = 0;

        if (Send_Notif.init()) {
            Send_Notif.log("context initialized");
            ObjectStore store = Factory.ObjectStore.fetchInstance(Send_Notif.getDomain(), objectStoreName, null);

            String query = "select * from DMS_ResolutionCase where dms_deadlinedate<" + sdf.format(date);
            System.out.println("query= " + query);
            SearchSQL sql = new SearchSQL(query);
            SearchScope search = new SearchScope(store);
            FolderSet ResolutionCases = (FolderSet) search.fetchObjects(sql, null, null, Boolean.valueOf(true));
            Iterator it = ResolutionCases.iterator();

            while (it.hasNext()) {
                ++ResolutionNum;
                Folder ResolutionCase = (Folder) it.next();
                String casetitle = ResolutionCase.getProperties().getStringValue("dms_casetitle");
                Date deadlinedate = ResolutionCase.getProperties().getDateTimeValue("dms_deadlinedate");
                System.out.println("№ " + ResolutionNum + " Заголовок= " + casetitle + " контрольная дата " + Format_ddMMyyyy.format(deadlinedate));
                //System.out.print ("" );
            }

            System.out.println("количество просроченных резолюций  " + ResolutionNum);

        }

        String StrResolutionNum = Integer.toString(5);

        return StrResolutionNum;
    }


}
