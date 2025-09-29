interface UserInvitationEmailProps {
  name: string;
  email: string;
  role: string;
  invitedBy: string;
  inviteUrl: string;
}

export const generateUserInvitationEmail = ({
  name,
  email,
  role,
  invitedBy,
  inviteUrl,
}: UserInvitationEmailProps): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've been invited to join KAKSIK</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 12px;">
    <h1 style="color: #333; font-size: 24px; font-weight: bold; margin: 40px 0; padding: 0;">Welcome to KAKSIK!</h1>
    
    <p style="color: #333; font-size: 16px; line-height: 24px; margin: 16px 0;">
      Hello ${name},
    </p>
    
    <p style="color: #333; font-size: 16px; line-height: 24px; margin: 16px 0;">
      You've been invited by ${invitedBy} to join KAKSIK as a <strong>${role}</strong>.
    </p>
    
    <p style="color: #333; font-size: 16px; line-height: 24px; margin: 16px 0;">
      Click the button below to accept your invitation and set up your account:
    </p>
    
    <a href="${inviteUrl}" target="_blank" style="display: inline-block; margin: 16px 0; padding: 12px 24px; background-color: #3b82f6; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center;">
      Accept Invitation
    </a>
    
    <p style="color: #333; font-size: 16px; line-height: 24px; margin: 16px 0;">
      Or copy and paste this link into your browser:
    </p>
    
    <div style="display: inline-block; padding: 16px 4.5%; width: 90.5%; background-color: #f4f4f4; border-radius: 5px; border: 1px solid #eee; color: #333; font-family: Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 14px; word-break: break-all;">
      ${inviteUrl}
    </div>
    
    <p style="color: #ababab; font-size: 16px; line-height: 24px; margin: 16px 0;">
      If you didn't expect this invitation, you can safely ignore this email.
    </p>
    
    <p style="color: #898989; font-size: 12px; line-height: 22px; margin: 12px 0 24px 0;">
      <a href="https://kaksik.com" target="_blank" style="color: #898989; font-size: 14px; text-decoration: underline;">
        KAKSIK
      </a>
      - Modern Task Management
    </p>
  </div>
</body>
</html>
  `;
};