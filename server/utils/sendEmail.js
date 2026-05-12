const sendEmail = async (options) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'ChaiPoll';

  if (!BREVO_API_KEY || !senderEmail) {
    throw new Error('Email is not configured (BREVO_API_KEY and BREVO_SENDER_EMAIL required)');
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [{ email: options.email }],
        subject: options.subject,
        htmlContent: options.html,
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Brevo API Error Detail:', data);
      throw new Error(data.message || 'API rejected the request');
    }

    console.log('Email sent via Brevo:', data.messageId);
    return data;
  } catch (err) {
    console.error('Email send failed:', err);
    throw err;
  }
};

export default sendEmail;
