package external_functions;

import java.util.*;
import javax.mail.*;
import javax.mail.internet.*;
import javax.activation.*;

public class SMTP_mail2 {

	/**
	 * @param args
	 */
	public static void main(String[] args) {

		   // Recipient's email ID needs to be mentioned.
	      String to = "kurmanbek@nationalbank.kz";

	      // Sender's email ID needs to be mentioned
	      String from = "test_content@nationalbank.kz";

	      // Assuming you are sending email from localhost
	      String host = "170.7.15.134";

	      // Get system properties
	      Properties properties = System.getProperties();

	      // Setup mail server
	      properties.setProperty("mail.smtp.host", host);

	      // Get the default Session object.
	      Session session = Session.getDefaultInstance(properties);

	      try{
	         // Create a default MimeMessage object.
	         MimeMessage message = new MimeMessage(session);

	         // Set From: header field of the header.
	         message.setFrom(new InternetAddress(from));

	         // Set To: header field of the header.
	         message.addRecipient(Message.RecipientType.TO, new InternetAddress(to));

	         // Set Subject: header field
	         message.setSubject("Тестовое сообщение");

	         // Now set the actual message
	         message.setText(" ТОКИ доки");

	         // Send message
	         Transport.send(message);
	         System.out.println("Sent message successfully....");
	      }catch (MessagingException mex) {
	         mex.printStackTrace();
	      }
	
	
	
	
	}

}
