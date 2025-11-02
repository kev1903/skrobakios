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
  Button,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

const SUPABASE_URL = "https://xtawnkhvxgxylhxwqnmm.supabase.co";

interface Bill {
  id: string;
  token?: string;
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
            {bills.map((bill, index) => {
              const markAsPaidUrl = `${SUPABASE_URL}/functions/v1/mark-bill-paid?billId=${bill.id}&token=${bill.token}`;
              return (
                <div key={index} style={invoiceItem}>
                  <Row>
                    <Column style={{ width: '70%', paddingRight: '12px', verticalAlign: 'top' }}>
                      <Text style={{ margin: '0', lineHeight: '1.8' }}>
                        {index + 1}) <strong>{bill.supplier_name}</strong><br />
                        Invoice: {bill.invoice_number || bill.bill_no || 'Not provided'}<br />
                        Amount: ${bill.total.toFixed(2)}<br />
                        Due: {new Date(bill.due_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                        {bill.projects && <><br />Project: {bill.projects.name}</>}
                      </Text>
                    </Column>
                    <Column style={{ width: '30%', verticalAlign: 'middle', textAlign: 'center' as const }}>
                      <Button href={markAsPaidUrl} style={markAsPaidButton}>
                        Mark as Paid
                      </Button>
                    </Column>
                  </Row>
                </div>
              );
            })}
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

// Styles - Modern Liquid Glass Design
const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  padding: '40px 20px',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 40px rgba(15, 23, 42, 0.1), 0 4px 12px rgba(15, 23, 42, 0.05)',
  overflow: 'hidden',
};

const header = {
  background: 'linear-gradient(135deg, #217BF4 0%, #1e70e8 50%, #217BF4 100%)',
  padding: '48px 40px 40px',
  textAlign: 'center' as const,
  position: 'relative' as const,
};

const heading = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '700',
  letterSpacing: '0.5px',
  margin: '0 0 12px',
  padding: '0',
  lineHeight: '1.2',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  textShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
};

const subtitle = {
  color: 'rgba(255, 255, 255, 0.95)',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
};

const content = {
  padding: '36px 40px 24px',
  backgroundColor: '#ffffff',
};

const paragraph = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '1.7',
  margin: '0 0 18px',
  fontWeight: '400',
};

const billsSection = {
  padding: '24px 40px 32px',
  backgroundColor: '#f8fafc',
  margin: '0',
};

const sectionHeading = {
  color: '#0f172a',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 24px',
  paddingTop: '0',
  letterSpacing: '-0.5px',
};

const invoiceItem = {
  backgroundColor: '#ffffff',
  color: '#1e293b',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0 0 16px',
  padding: '20px 24px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)',
};

const signature = {
  padding: '24px 40px 36px',
  backgroundColor: '#ffffff',
};

const signatureText = {
  color: '#475569',
  fontSize: '15px',
  lineHeight: '1.7',
  margin: '0 0 12px',
  fontWeight: '400',
};

const footerDivider = {
  borderColor: 'rgba(226, 232, 240, 0.5)',
  borderWidth: '1px',
  margin: '0',
};

const footer = {
  padding: '28px 40px',
  textAlign: 'center' as const,
  backgroundColor: '#f8fafc',
};

const footerText = {
  color: '#64748b',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: '0',
  fontWeight: '500',
};

const markAsPaidButton = {
  background: 'linear-gradient(135deg, #217BF4 0%, #1e70e8 100%)',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '600' as const,
  borderRadius: '8px',
  padding: '10px 18px',
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 2px 8px rgba(33, 123, 244, 0.25)',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'center' as const,
  letterSpacing: '0.3px',
};
