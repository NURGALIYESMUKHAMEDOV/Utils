/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package external_functions;

/**
 *
 * @author nurzhan.trimov
 */
import java.util.*;
import javax.mail.*;
import javax.mail.internet.*;
import javax.activation.*;

public class SMTP_mail {

    public static void main(String args[]) {


        final String username = "test_content@nationalbank.kz";
        final String password = "Qwerty123";

        Properties props = new Properties();
      //  props.put("mail.smtp.auth", "true");
      //  props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "170.7.15.134");
        props.put("mail.smtp.port", "25");

        Session session = Session.getInstance(props,
                new javax.mail.Authenticator() {
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(username, password);
                    }
                });

        try {

            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress("test_content@nationalbank.kz"));
            message.setRecipients(Message.RecipientType.TO,
                    InternetAddress.parse("kurmanbek@nationalbank.kz"));
            message.setSubject("Testing Subject Тестовое сообщение");
            message.setText("Dear Mail Crawler,"
                    + "\n\n  НЕ получается отправить из CASE MANAGER, это письмо написано Java кодом");

            Transport.send(message);

            System.out.println("Done");

        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }
}
