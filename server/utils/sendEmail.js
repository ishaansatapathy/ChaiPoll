const sendEmail = async (options) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  
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
          name: 'ChaiPoll',
          email: 'ishaansatapathy09@gmail.com'
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
