const nodemailer = require('nodemailer');

const sendMail = async (option) => {
  const transporter = nodemailer.createTransport({
    // host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT,
    service: 'hotmail',
    secure: false,
    auth: {
      user: 'forn0dema1ler@outlook.com',
      pass: 'igotconfirmed',
    }
    
  });

  const emailOption = {
    from: 'abijeet <forn0dema1ler@outlook.com>',
    to: 'bebishnewar@gmail.com',
    subject: option.subject,
    text: option.message,
  };
  console.log(emailOption)

  await transporter.sendMail(emailOption, (err, data) => {
    if (err) return console.log(err);
    console.log('send sucessfuly');
  });
};

module.exports = sendMail;
