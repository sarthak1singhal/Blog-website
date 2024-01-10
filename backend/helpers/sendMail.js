const nodemailer = require('nodemailer');


async function sendMail(mail) {
    // Create a transporter object using the SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.zoho.in',
        port: 465, // SSL port
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'sarthak@ventureup.in', // Your Zoho email
            pass: 'Sarthak1singhal@' // Your Zoho password or App Password
        }
    });

    // Email options
  

    // Send email
    try {
        let info = await transporter.sendMail(mail);
        console.log('Message sent: %s', info.messageId);
        return {error: false, message : ""}
    } catch (error) {
        console.error('Error occurred: ', error);
        return {error: true, message: error.message}
    }
}

// sendMail("S")
module.exports = sendMail;