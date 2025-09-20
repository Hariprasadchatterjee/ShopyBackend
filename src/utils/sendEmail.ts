import { config } from "../config/config";
import sendGrid from "@sendgrid/mail";

sendGrid.setApiKey(config.sendgrid_api_key as string);

interface EmailPayload {
  to: string;
  from: string;
  subject: string;
  html: string;
}

const sendEmail = async (email: string, subject: string, emailBody: string):Promise<void>=>{
  console.log(`Sending email to ${email} with subject "${subject},${emailBody}"`);

  const payload : EmailPayload = {
    to: email,
    from: config.email_from,
    subject: subject,
    html: emailBody
  }

  try {
    await sendGrid.send(payload);
  } catch (error: any) {
    // Log detailed SendGrid error information
    if (error.response) {
      console.error('SendGrid API Error Details:');
      console.error('Status Code:', error.response.status);
      console.error('Response Body:', error.response.body);
      console.error('Response Headers:', error.response.headers);
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
  

}

export default sendEmail