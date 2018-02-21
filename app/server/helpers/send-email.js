import util from 'util';
import nodemailer from 'nodemailer';

import { templates } from './compiled-pug';
import config from '../config';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: config.mail.auth
});

transporter.sendEmail = util.promisify(::transporter.sendMail);

export function sendEmail({
  from: {
    name,
    email
  },
  to,
  subject,
  templatePath,
  locals
}) {
  return transporter.sendEmail({
    from: `"${name}" <${email}>`,
    to,
    subject,
    html: templates[templatePath](locals)
  });
}
