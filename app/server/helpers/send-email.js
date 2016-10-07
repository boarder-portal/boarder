const nodemailer = require('nodemailer');
const { templates } = require('./compiled-pug');
const {
  mail: {
    auth
  }
} = require('../../config/config.json');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth
});

exports.sendEmail = ({
  from: {
    name, email
  },
  to,
  subject,
  templatePath,
  locals
}) => {
  const mailOptions = {
    from: `"${ name }" <${ email }>`,
    to,
    subject,
    html: templates[templatePath](locals)
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return reject(err);
      }

      resolve(info);
    });
  });
};
