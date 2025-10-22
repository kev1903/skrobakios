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
      <Preview>New Task Assignment: {taskName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Modern Header */}
          <Section style={header}>
            <Text style={logoText}>SkAi | SKROBAKI</Text>
            <Text style={tagline}>Your Intelligent Project Assistant</Text>
          </Section>

          {/* Main Content Card */}
          <Section style={card}>
            {/* Greeting */}
            <Text style={greeting}>Hi {assigneeName},</Text>
            <Text style={bodyText}>
              A new task has been assigned to you. Please review the details below and update the status as you make progress.
            </Text>

            {/* Task Title Section */}
            <Section style={taskTitleSection}>
              <Heading style={taskTitle}>{taskName}</Heading>
              {description && <Text style={descriptionText}>{description}</Text>}
            </Section>

            {/* Task Details Grid */}
            <Section style={detailsGrid}>
              <Section style={detailCard}>
                <Text style={detailCardLabel}>Project</Text>
                <Text style={detailCardValue}>
                  {projectCode ? `${projectCode} - ` : ''}
                  {projectName}
                </Text>
              </Section>

              <Section style={detailCard}>
                <Text style={detailCardLabel}>Due Date</Text>
                <Text style={detailCardValue}>{dueDate}</Text>
              </Section>

              <Section style={detailCard}>
                <Text style={detailCardLabel}>Priority</Text>
                <span style={getPriorityBadgeStyle(priority)}>
                  {priority}
                </span>
              </Section>

              <Section style={detailCard}>
                <Text style={detailCardLabel}>Status</Text>
                <Text style={detailCardValue}>{status}</Text>
              </Section>

              {estimatedHours && (
                <Section style={detailCard}>
                  <Text style={detailCardLabel}>Estimated Time</Text>
                  <Text style={detailCardValue}>{estimatedHours}h</Text>
                </Section>
              )}
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Link href={taskLink} style={button}>
                View Task Details
              </Link>
            </Section>
          </Section>

          {/* Minimalist Footer */}
          <Section style={footer}>
            <Text style={footerBrand}>SkAi by SKROBAKI</Text>
            <Text style={footerContact}>
              <Link href="tel:0423117480" style={footerLink}>0423 117 480</Link>
              {' · '}
              <Link href="https://www.skrobaki.com" style={footerLink}>skrobaki.com</Link>
            </Text>
            <Text style={footerSmall}>
              Automated notification · You're receiving this because you're assigned to a project task
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default TaskAssignmentEmail;

// Modern Apple-like Styles
const main = {
  backgroundColor: '#FAFAFA',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
  padding: '20px',
};

const container = {
  margin: '0 auto',
  padding: '0',
  maxWidth: '640px',
};

const header = {
  background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
  borderRadius: '16px 16px 0 0',
  padding: '40px 32px',
  textAlign: 'center' as const,
  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
};

const logoText = {
  color: '#1A1A1A',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0 0 8px 0',
  letterSpacing: '-0.5px',
};

const tagline = {
  color: '#C8A45D',
  fontSize: '13px',
  margin: '0',
  fontWeight: '500',
  letterSpacing: '0.3px',
};

const card = {
  backgroundColor: '#FFFFFF',
  borderRadius: '0 0 16px 16px',
  padding: '40px 32px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
};

const greeting = {
  fontSize: '18px',
  color: '#1A1A1A',
  margin: '0 0 12px 0',
  fontWeight: '600',
};

const bodyText = {
  fontSize: '15px',
  color: '#6B7280',
  lineHeight: '1.6',
  margin: '0 0 32px 0',
};

const taskTitleSection = {
  padding: '24px',
  backgroundColor: '#FAFAFA',
  borderRadius: '12px',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  marginBottom: '24px',
};

const taskTitle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#1A1A1A',
  margin: '0 0 8px 0',
  lineHeight: '1.4',
  letterSpacing: '-0.3px',
};

const descriptionText = {
  fontSize: '14px',
  color: '#6B7280',
  lineHeight: '1.6',
  margin: '12px 0 0 0',
};

const detailsGrid = {
  margin: '0 0 32px 0',
  display: 'grid' as const,
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '12px',
};

const detailCard = {
  padding: '16px 20px',
  backgroundColor: '#FAFAFA',
  borderRadius: '10px',
  border: '1px solid rgba(0, 0, 0, 0.04)',
  display: 'block',
  marginBottom: '12px',
};

const detailCardLabel = {
  fontSize: '12px',
  color: '#9CA3AF',
  fontWeight: '500',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const detailCardValue = {
  fontSize: '15px',
  color: '#1A1A1A',
  fontWeight: '600',
  margin: '0',
  lineHeight: '1.4',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0 0 0',
};

const button = {
  background: 'linear-gradient(135deg, #C8A45D 0%, #B8944D 100%)',
  color: '#FFFFFF',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '14px 32px',
  borderRadius: '10px',
  display: 'inline-block',
  boxShadow: '0 2px 8px rgba(200, 164, 93, 0.25)',
  letterSpacing: '0.2px',
};

const footer = {
  textAlign: 'center' as const,
  padding: '32px 32px',
  borderTop: '1px solid rgba(0, 0, 0, 0.06)',
  marginTop: '0',
};

const footerBrand = {
  fontSize: '14px',
  color: '#1A1A1A',
  margin: '0 0 12px 0',
  fontWeight: '600',
  letterSpacing: '0.3px',
};

const footerContact = {
  fontSize: '13px',
  color: '#6B7280',
  margin: '0 0 16px 0',
  lineHeight: '1.6',
};

const footerLink = {
  color: '#C8A45D',
  textDecoration: 'none',
  fontWeight: '500',
};

const footerSmall = {
  fontSize: '12px',
  color: '#9CA3AF',
  margin: '0',
  lineHeight: '1.5',
};
