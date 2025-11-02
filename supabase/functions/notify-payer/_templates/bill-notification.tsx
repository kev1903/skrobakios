import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface Bill {
  invoice_number?: string;
  supplier_name: string;
  description?: string;
  total: number;
  due_date: string;
  bill_no?: string;
  projects?: {
    name: string;
    project_id: string;
  };
}

interface BillNotificationEmailProps {
  payerName: string;
  bills: Bill[];
}

export const BillNotificationEmail = ({
  payerName,
  bills,
}: BillNotificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Project Cost Invoices for Your Payment</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>SKROBAKI Finance</Heading>
            <Text style={subtitle}>Project Cost Invoices</Text>
          </Section>

          {/* Greeting */}
          <Section style={content}>
            <Text style={paragraph}>
              Hi {payerName},
            </Text>
            <Text style={paragraph}>
              Attached are project invoices that require direct payment to suppliers/subcontractors. 
              Please process these by the due dates and share remittance once completed.
            </Text>
          </Section>

          {/* Summary of Invoices */}
          <Section style={billsSection}>
            <Heading as="h3" style={sectionHeading}>
              Summary of Invoices:
            </Heading>
            {bills.map((bill, index) => (
              <Text key={index} style={invoiceItem}>
                {index + 1}) <strong>{bill.supplier_name}</strong> - 
                Invoice: {bill.invoice_number || bill.bill_no || 'Not provided'} - 
                Amount: ${bill.total.toFixed(2)} - 
                Due: {new Date(bill.due_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
                {bill.projects && ` - Project: ${bill.projects.name}`}
              </Text>
            ))}
          </Section>

          {/* Footer Message */}
          <Section style={content}>
            <Text style={paragraph}>
              Let me know if you need any clarification.
            </Text>
          </Section>

          {/* Signature */}
          <Section style={signature}>
            <Text style={signatureText}>
              Kind regards,<br />
              <strong>Skrobaki Project Team</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={footerDivider} />
          <Section style={footer}>
            <Text style={footerText}>
              SKROBAKI Finance • accounts@skrobaki.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default BillNotificationEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#217BF4',
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const heading = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px',
  padding: '0',
  lineHeight: '1.2',
};

const subtitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '400',
  margin: '0',
  opacity: 0.9,
};

const content = {
  padding: '32px 40px',
};

const paragraph = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const billsSection = {
  padding: '0 40px 24px',
};

const sectionHeading = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 16px',
};

const invoiceItem = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0 0 12px',
  paddingLeft: '0',
};

const signature = {
  padding: '0 40px 32px',
};

const signatureText = {
  color: '#475569',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px',
};

const footerDivider = {
  borderColor: '#e2e8f0',
  margin: '0 40px',
};

const footer = {
  padding: '24px 40px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#94a3b8',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: '0 0 8px',
};
