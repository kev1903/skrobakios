import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface UserInvitationEmailProps {
  name: string;
  email: string;
  role: string;
  invitedBy: string;
  inviteUrl: string;
}

export const UserInvitationEmail = ({
  name,
  email,
  role,
  invitedBy,
  inviteUrl,
}: UserInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>You've been invited to join KAKSIK - Modern Task Management</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to KAKSIK!</Heading>
        <Text style={text}>
          Hello {name},
        </Text>
        <Text style={text}>
          You've been invited by {invitedBy} to join KAKSIK as a <strong>{role}</strong>.
        </Text>
        <Text style={text}>
          Click the button below to accept your invitation and set up your account:
        </Text>
        <Link
          href={inviteUrl}
          target="_blank"
          style={{
            ...button,
            display: 'inline-block',
            marginTop: '16px',
            marginBottom: '16px',
          }}
        >
          Accept Invitation
        </Link>
        <Text style={text}>
          Or copy and paste this link into your browser:
        </Text>
        <Text style={code}>{inviteUrl}</Text>
        <Text style={{ ...text, color: '#ababab', marginTop: '14px' }}>
          If you didn't expect this invitation, you can safely ignore this email.
        </Text>
        <Text style={footer}>
          <Link
            href="https://kaksik.com"
            target="_blank"
            style={{ ...link, color: '#898989' }}
          >
            KAKSIK
          </Link>
          - Modern Task Management
        </Text>
      </Container>
    </Body>
  </Html>
);

export default UserInvitationEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  paddingLeft: '12px',
  paddingRight: '12px',
  margin: '0 auto',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
};

const text = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
};

const link = {
  color: '#3b82f6',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  textDecoration: 'underline',
};

const footer = {
  color: '#898989',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
};

const code = {
  display: 'inline-block',
  padding: '16px 4.5%',
  width: '90.5%',
  backgroundColor: '#f4f4f4',
  borderRadius: '5px',
  border: '1px solid #eee',
  color: '#333',
  fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: '14px',
  wordBreak: 'break-all' as const,
};