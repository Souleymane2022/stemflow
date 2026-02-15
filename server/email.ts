import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export async function sendPasswordResetEmail(toEmail: string, resetToken: string, username: string) {
  const { client, fromEmail } = await getUncachableResendClient();

  const resetUrl = `${process.env.REPLIT_DEV_DOMAIN
    ? 'https://' + process.env.REPLIT_DEV_DOMAIN
    : 'http://localhost:5000'}/auth?reset=${resetToken}`;

  await client.emails.send({
    from: fromEmail || 'STEM FLOW <onboarding@resend.dev>',
    to: toEmail,
    subject: 'STEM FLOW - Réinitialisation de votre mot de passe',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f8f9fa; padding: 0;">
        <div style="background: linear-gradient(135deg, #0B3C5D 0%, #00C896 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">STEM FLOW</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Scroll. Learn. Level Up.</p>
        </div>
        <div style="background: white; padding: 32px 24px;">
          <h2 style="color: #1E1E1E; margin: 0 0 16px; font-size: 20px;">Bonjour ${username},</h2>
          <p style="color: #555; line-height: 1.6; margin: 0 0 24px;">
            Vous avez demandé la réinitialisation de votre mot de passe. 
            Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #0B3C5D, #00C896); color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="color: #888; font-size: 13px; line-height: 1.5; margin: 24px 0 0;">
            Ce lien expire dans <strong>15 minutes</strong>. Si vous n'avez pas fait cette demande, ignorez cet email.
          </p>
        </div>
        <div style="padding: 16px 24px; text-align: center;">
          <p style="color: #aaa; font-size: 12px; margin: 0;">STEM FLOW &copy; 2026</p>
        </div>
      </div>
    `,
  });
}
