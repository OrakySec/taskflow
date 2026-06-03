import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM || "TaskFlow <no-reply@ykaromarques.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendInviteEmail({
  to,
  companyName,
  inviteToken,
  inviterName,
}: {
  to: string;
  companyName: string;
  inviteToken: string;
  inviterName: string;
}) {
  const inviteUrl = `${APP_URL}/invite/${inviteToken}`;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Você foi convidado para o ${companyName} no TaskFlow`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #6366f1; font-size: 28px; margin: 0;">TaskFlow</h1>
        </div>
        <h2 style="color: #f1f5f9; font-size: 22px;">Você foi convidado! 🎉</h2>
        <p style="color: #94a3b8; line-height: 1.6;">
          <strong style="color: #e2e8f0;">${inviterName}</strong> convidou você para fazer parte da equipe 
          <strong style="color: #e2e8f0;">${companyName}</strong> no TaskFlow.
        </p>
        <p style="color: #94a3b8; line-height: 1.6;">
          O TaskFlow é um sistema de organização de tarefas para equipes. Clique no botão abaixo para aceitar o convite e criar sua conta.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${inviteUrl}" style="background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Aceitar Convite
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          Este convite expira em 7 dias. Se você não esperava este e-mail, pode ignorá-lo.
        </p>
        <p style="color: #64748b; font-size: 12px; margin-top: 16px;">
          Ou copie e cole este link no seu navegador:<br/>
          <span style="color: #6366f1;">${inviteUrl}</span>
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetToken,
}: {
  to: string;
  name: string;
  resetToken: string;
}) {
  const resetUrl = `${APP_URL}/reset-password/${resetToken}`;

  return resend.emails.send({
    from: FROM,
    to,
    subject: "Redefinição de senha — TaskFlow",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #6366f1; font-size: 28px; margin: 0;">TaskFlow</h1>
        </div>
        <h2 style="color: #f1f5f9; font-size: 22px;">Redefinir sua senha</h2>
        <p style="color: #94a3b8; line-height: 1.6;">
          Olá, <strong style="color: #e2e8f0;">${name}</strong>!<br/>
          Recebemos uma solicitação para redefinir sua senha.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Redefinir Senha
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          Este link expira em 1 hora. Se você não solicitou a redefinição, ignore este e-mail.
        </p>
      </div>
    `,
  });
}
