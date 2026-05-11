const sendEmail = async (options) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_QRXxmMDi_6zBCqEcuMy9wK1M3ceowNCcj';
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'ChaiPoll <onboarding@resend.dev>',
        to: options.email,
        subject: options.subject,
        html: options.html,
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API Error Detail:', data);
      throw new Error(data.message || 'API rejected the request');
    }

    console.log('Nexus Signal Dispatched Successfully:', data.id);
    return data;
  } catch (err) {
    console.error('Critical Email System Failure:', err);
    throw err;
  }
};

export default sendEmail;
