import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Row,
  Column,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface TaskAssignmentEmailProps {
  assigneeName: string;
  taskName: string;
  projectName: string;
  projectCode?: string;
  dueDate: string;
  priority: string;
  status: string;
  taskLink: string;
  description?: string;
  estimatedHours?: number;
}

export const TaskAssignmentEmail = ({
  assigneeName,
  taskName,
  projectName,
  projectCode,
  dueDate,
  priority,
  status,
  taskLink,
  description,
  estimatedHours,
}: TaskAssignmentEmailProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getPriorityBadgeStyle = (priority: string) => {
    const color = getPriorityColor(priority);
    return {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '6px',
      backgroundColor: `${color}15`,
      color: color,
      fontWeight: '600',
      fontSize: '13px',
      textTransform: 'capitalize' as const,
    };
  };

  return (
    <Html>
      <Head />
      <Preview>SkAi has created a new task for you to action</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logoText}>SkAi | SKROBAKI</Heading>
            <Text style={tagline}>
              Automated by SkAi – Your Intelligent Project Assistant
            </Text>
          </Section>

          {/* Main Content Card */}
          <Section style={card}>
            <Text style={greeting}>Hi {assigneeName},</Text>
            <Text style={bodyText}>
              SkAi has created a new task for you to action. Please review and
              update its status as you make progress.
            </Text>

            {/* Task Title */}
            <Heading style={taskTitle}>{taskName}</Heading>

            {/* Description */}
            {description && <Text style={descriptionText}>{description}</Text>}

            {/* Task Details Table */}
            <Section style={detailsTable}>
              <Row style={detailRow}>
                <Column style={detailLabel}>
                  <Text style={labelText}>Project:</Text>
                </Column>
                <Column style={detailValue}>
                  <Text style={valueText}>
                    {projectCode ? `${projectCode} - ` : ''}
                    {projectName}
                  </Text>
                </Column>
              </Row>

              <Row style={detailRow}>
                <Column style={detailLabel}>
                  <Text style={labelText}>Due Date:</Text>
                </Column>
                <Column style={detailValue}>
                  <Text style={valueText}>{dueDate}</Text>
                </Column>
              </Row>

              <Row style={detailRow}>
                <Column style={detailLabel}>
                  <Text style={labelText}>Priority:</Text>
                </Column>
                <Column style={detailValue}>
                  <span style={getPriorityBadgeStyle(priority)}>
                    {priority}
                  </span>
                </Column>
              </Row>

              <Row style={detailRow}>
                <Column style={detailLabel}>
                  <Text style={labelText}>Status:</Text>
                </Column>
                <Column style={detailValue}>
                  <Text style={valueText}>{status}</Text>
                </Column>
              </Row>

              {estimatedHours && (
                <Row style={detailRow}>
                  <Column style={detailLabel}>
                    <Text style={labelText}>Estimated Time:</Text>
                  </Column>
                  <Column style={detailValue}>
                    <Text style={valueText}>{estimatedHours}h</Text>
                  </Column>
                </Row>
              )}
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Link href={taskLink} style={button}>
                View Task in SkrobakiOS
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              Automated by SkAi | SkrobakiOS Project System
            </Text>
            <Text style={footerSmall}>
              You're receiving this email because you're assigned to a project
              task. Manage your notifications in SkrobakiOS.
            </Text>
            <Section style={footerLinks}>
              <Link href="https://skrobaki.com/help" style={footerLink}>
                💬 Help Center
              </Link>
              <Text style={footerLinkSeparator}>•</Text>
              <Link href="https://skrobaki.com/support" style={footerLink}>
                📞 Support
              </Link>
              <Text style={footerLinkSeparator}>•</Text>
              <Link href="https://skrobaki.com" style={footerLink}>
                🌐 skrobaki.com
              </Link>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default TaskAssignmentEmail;

// Styles
const main = {
  backgroundColor: '#F8F9FB',
  fontFamily:
    "'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif",
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#0A1F44',
  borderRadius: '12px 12px 0 0',
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const logoText = {
  color: '#FFFFFF',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  fontFamily: "'Playfair Display', Georgia, serif",
  letterSpacing: '0.5px',
};

const tagline = {
  color: '#C8A45D',
  fontSize: '14px',
  margin: '0',
  fontWeight: '500',
};

const card = {
  backgroundColor: '#FFFFFF',
  borderRadius: '0 0 12px 12px',
  padding: '32px 24px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
};

const greeting = {
  fontSize: '16px',
  color: '#0A1F44',
  margin: '0 0 16px 0',
  fontWeight: '500',
};

const bodyText = {
  fontSize: '15px',
  color: '#4B5563',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
};

const taskTitle = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#0A1F44',
  margin: '0 0 16px 0',
  fontFamily: "'Playfair Display', Georgia, serif",
  lineHeight: '1.3',
};

const descriptionText = {
  fontSize: '14px',
  color: '#6B7280',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
  padding: '16px',
  backgroundColor: '#F8F9FB',
  borderRadius: '8px',
  borderLeft: '3px solid #C8A45D',
};

const detailsTable = {
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#F8F9FB',
  borderRadius: '10px',
};

const detailRow = {
  marginBottom: '12px',
};

const detailLabel = {
  width: '35%',
  verticalAlign: 'top',
};

const detailValue = {
  width: '65%',
  verticalAlign: 'top',
};

const labelText = {
  fontSize: '14px',
  color: '#6B7280',
  fontWeight: '600',
  margin: '0',
};

const valueText = {
  fontSize: '14px',
  color: '#0A1F44',
  fontWeight: '500',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0 16px 0',
};

const button = {
  backgroundColor: '#0A1F44',
  color: '#FFFFFF',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '14px 32px',
  borderRadius: '8px',
  display: 'inline-block',
  transition: 'all 0.2s ease',
  border: '2px solid #0A1F44',
};

const divider = {
  borderColor: '#E5E7EB',
  margin: '32px 0 24px 0',
};

const footer = {
  textAlign: 'center' as const,
  padding: '0 24px 24px 24px',
};

const footerText = {
  fontSize: '13px',
  color: '#6B7280',
  margin: '0 0 8px 0',
  fontWeight: '500',
};

const footerSmall = {
  fontSize: '12px',
  color: '#9CA3AF',
  margin: '0 0 16px 0',
  lineHeight: '1.5',
};

const footerLinks = {
  textAlign: 'center' as const,
  margin: '16px 0 0 0',
};

const footerLink = {
  fontSize: '12px',
  color: '#C8A45D',
  textDecoration: 'none',
  margin: '0 8px',
  fontWeight: '500',
};

const footerLinkSeparator = {
  display: 'inline',
  color: '#D1D5DB',
  margin: '0 4px',
  fontSize: '12px',
};
