package external_functions;

import lotus.domino.*;

public class DominoMailbox {

    public String sendTo;
    public String copyTo;
    public String subject = "test";
    public String message = "text";
//    private String dominoServer = "170.7.7.102:63148";
//    private String dominoMailbox = "mail\\tkab501-3.nsf";
//    private String dominoUsername = "test3 kab501-3";
//    private String dominoPassword = "test3";

    private String dominoServer = "127.0.0.1";
    private String dominoMailbox = "mail\\aad.nsf";
    private String dominoUsername = "admin ad";
    private String dominoPassword = "123456";


    public DominoMailbox(String sendTo, String copyTo, String subject, String message) {
        this.sendTo = sendTo;
        this.copyTo = copyTo;
        this.subject = subject;
        this.message = message;
    }

    public static void main(String[] args) {
        //DominoMailbox mail = new DominoMailbox("test3 kab501-3", "", "from mailBOX part", " oooo текст сообщения......");
        DominoMailbox mail = new DominoMailbox("admin ad", "", "from mailBOX part", " oooo текст сообщения......");

    	mail.send();
        System.out.println("Send message...");
    }

    public void send() {
        try {
            Session s = lotus.domino.NotesFactory.createSession(dominoServer, dominoUsername, dominoPassword);
            DbDirectory n = s.getDbDirectory("Domino");
            Database db = n.openDatabase(dominoMailbox);
            System.out.println("Connected user: " + s.getUserName());

            Document memo = db.createDocument();
            memo.appendItemValue("Form", "Memo");
            memo.appendItemValue("Importance", "1");
            memo.appendItemValue("CopyTo", copyTo);
            memo.appendItemValue("Subject", subject);
            memo.appendItemValue("Body", message);
            memo.send(false, sendTo);
            db.recycle();
            db.recycle();
        } catch (NotesException e) {
            System.out.println("Error1 - " + e.id + " " + e.text);

        } catch (Exception e) {
            System.out.println("Error2 - " + e.toString());
            System.out.println("message= " + e.getMessage());
        }

    }
}
