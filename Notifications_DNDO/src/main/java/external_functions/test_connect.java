/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package external_functions;

import lotus.domino.Database;
import lotus.domino.Name;
import lotus.domino.NotesException;
import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;

/**
 *
 * @author invent
 */
import lotus.domino.NotesException;
import lotus.domino.NotesFactory;
import lotus.domino.Session;

public class test_connect {

    public String sendTo;
    public String copyTo;
//    public String subject="test";
//    public String message="text";
//    private String dominoServer = "10.10.112.164";
//    private String dominoMailbox = "mail\\mr.nsf";
//    private String dominoUsername = "msguser r/BSBNB@bsbnb";
//    private String dominoPassword = "123456";
    public String subject = "test";
    public String message = "text";
    private String dominoServer = "170.7.7.102:81";
    // private String dominoServer = "170.7.7.102:63148";
    private String dominoMailbox = "mail\\tkab501-3.nsf";
    // private String dominoUsername = "test3 kab501-3/NBK@NBK";
    private String dominoUsername = "test3 kab501-3/NBK@NBK";
    private String dominoPassword = "test3";
    public String path = "IOR:01016d092900000049444c3a6c6f7475732f646f6d696e6f2f636f7262612f494f626a6563745365727665723a312e3000000000010000000000000074000000010101090f0000003231322e3135342e3133312e36390000acf60000310000000438353235363531612d656336382d313036632d656565302d303037653264323233336235004c6f7475734e4f4901000100000001000000010000001400000001016d0901000105000000000001010000000000";

    public test_connect(String sendTo, String copyTo, String subject, String message) {
        this.sendTo = sendTo;
        this.copyTo = copyTo;
        this.subject = subject;
        this.message = message;
    }

    public static void main(String[] args) {
        DominoMailbox mail = new DominoMailbox("test3 kab501-3/NBK@NBK", "", "from mailBOX part", "текст сообщения......");
        mail.send();
    }

    public void send() {
        try {
      


            
            Session s = NotesFactory.createSession("170.7.7.102:63148", "test3 kab501-3", "test3");//erlachok.bsbnb.kz
        Name serverName = s.createName(s.getServerName());
        System.out.println("Connected to server " + serverName.getAbbreviated() + " as ");

        //   System.out.println("User Name = " + s.getCommonUserName());
        Database database = s.getDatabase(s.getServerName(), "mail\tkab501-3.nsf");
        String a = database.getTitle();
        System.out.println(a);
            
            
            

        } catch (NotesException e) {
            System.out.println("Error - " + e.id + " " + e.text);
        } catch (Exception e) {
            System.out.println("Error - " + e.toString());
        }

    }
}