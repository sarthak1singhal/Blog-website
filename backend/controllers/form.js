const sendMail = require("../helpers/sendMail");
const formidable = require("formidable");




exports.contactForm = async (req, res) => {
  // console.log(req.body);
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req,async (err, fields, files) =>  {
    if (err) {
      return res.status(400).json({
        error: "Image could not upload",
      });
    }
    const { email, name, message, number } = fields;

 
   if(!email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )) {
     return res.json({
      success: false,
      message : "Incorrect email address."
    });
  }
  let mailOptions = {
    from: 'VentureUp Contact Form <sarthak@ventureup.in>', // sender address
    to: ["shrey@ventureup.in", "sarthak@ventureup.in"], // list of receivers
    subject: "Let's get in touch!", // Subject line
    text: message + "\n\n" + "From: " + name + "\n" + "Contact: " +  email + ", " +  number, // plain text body
};



  let resp = await sendMail(mailOptions)
  if(!resp.error){
    return res.json({
      success: true,
      message : "Thank you for contacting us! We will get back to you."
    });
  }else{
    return res.json({
      success: false,
      message : "Some error occured while submitting the form. Please drop a mail on sarthak@ventureup.in"

    });
  }

 
    })
};

exports.contactBlogAuthorForm = (req, res) => {
  const { authorEmail, email, name, message } = req.body;
  // console.log(req.body);

  let maillist = [authorEmail, process.env.EMAIL_TO];

  const emailData = {
    to: maillist,
    from: email,
    subject: `Someone messaged you from ${process.env.APP_NAME}`,
    text: `Email received from contact from \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
    html: `
            <h4>Message received from:</h4>
            <p>name: ${name}</p>
            <p>Email: ${email}</p>
            <p>Message: ${message}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>https://seoblog.com</p>
        `,
  };

  sgMail
    .send(emailData)
    .then((sent) => {
      return res.json({
        success: true,
      });
    })
    .catch((error) => {
      console.error(error);
      if (error.response) {
        // Extract error msg
        const { message, code, response } = error;

        // Extract response msg
        const { headers, body } = response;

        console.error(body);
      }
    });
};
