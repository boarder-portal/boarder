const nodemailer = require('nodemailer');
const templates = require('./compiled-pug');
const {
  mail: {
    auth
  }
} = require('../../config/config.json');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth
});

module.exports = ({
  from: {
    name, email
  },
  to,
  subject,
  viewPath,
  locals
}) => {
  const mailOptions = {
    from: `"${ name }" <${ email }>`,
    to,
    subject,
    html: templates[viewPath](locals)
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
