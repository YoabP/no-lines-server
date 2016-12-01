var nodemailer = require('nodemailer');
var config = require ('./environment');
// create reusable transporter object using the default SMTP transport
var transporter = nodemailer
  .createTransport(
    `smtps://${config.mail.user}%40${config.mail.provider}:${config.mail.pass}@smtp.${config.mail.provider}`
  );

exports.sendMail = function(reciever){
  console.log("SENDING");
  // setup e-mail data with unicode symbols
  var mailOptions = {
      from: `"No Lines" <${config.mail.user}@${config.mail.provider}>`, // sender address
      to: reciever.email, // list of receivers
      subject: `Your turn! in ${reciever.business}`, // Subject line
      text: `Hi ${reciever.name? reciever.name : reciever.email } it is your turn! attend to ${reciever.business} as soon as possible.`, // plaintext body
      html: `Hi <b>${reciever.name? reciever.name : reciever.email }</b> it is your turn! attend to <b>${reciever.business}</b> as soon as possible.` // html body
  };
  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          return console.log(error);
      }
      console.log('Message sent: ' + info.response);
  });
};
