import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWeekReminderEmail(
  email: string,
  name: string,
  weekStart: string
): Promise<void> {
  const weekDate = new Date(weekStart);
  const weekEnd = new Date(weekDate);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const formatDateFr = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Rappel : C\'est votre semaine pour les poubelles !',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Rappel Poubelles</h2>
        <p>Bonjour ${name},</p>
        <p>C'est votre tour de sortir les poubelles cette semaine !</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Période :</strong></p>
          <p style="margin: 5px 0;">Du ${formatDateFr(weekDate)}</p>
          <p style="margin: 5px 0;">Au ${formatDateFr(weekEnd)}</p>
        </div>
        <p>N'oubliez pas de sortir les poubelles aux jours de collecte !</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Cet email a été envoyé automatiquement par l'application de gestion des poubelles de votre copropriété.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de rappel envoyé à ${email}`);
  } catch (error) {
    console.error(`Erreur lors de l'envoi de l'email à ${email}:`, error);
  }
}

export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Configuration SMTP vérifiée avec succès');
    return true;
  } catch (error) {
    console.error('Erreur de configuration SMTP:', error);
    return false;
  }
}
