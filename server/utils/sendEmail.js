import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_QRXxmMDi_6zBCqEcuMy9wK1M3ceowNCcj');

const sendEmail = async (options) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'ChaiPoll <onboarding@resend.dev>',
      to: options.email,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Resend API Error:', error);
      throw new Error(error.message);
    }

    console.log('Signal sent successfully via Resend:', data.id);
    return data;
  } catch (err) {
    console.error('Nexus Mail Failure:', err);
    throw err;
  }
};

export default sendEmail;
