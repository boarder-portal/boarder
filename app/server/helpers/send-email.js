const { promisify } = require('util');
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

transporter.sendEmail = promisify(transporter.sendMail);

exports.sendEmail = ({
  from: {
    name,
    email
  },
  to,
  subject,
  templatePath,
  locals
}) => (
  transporter.sendEmail({
    from: `"${name}" <${email}>`,
    to,
    subject,
    html: templates[templatePath](locals)
  })
);
