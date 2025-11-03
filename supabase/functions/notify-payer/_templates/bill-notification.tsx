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
  storage_path?: string;
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
            <Text style={{ ...paragraph, backgroundColor: '#ffffff' }}>
              Hi {payerName},
            </Text>
            <Text style={{ ...paragraph, backgroundColor: '#ffffff' }}>
              Attached are project invoices that require direct payment to suppliers/subcontractors. 
              Please process these by the due dates and share remittance once completed.
            </Text>
          </Section>

          {/* Summary of Invoices */}
          <Section style={billsSection}>
            <Heading as="h3" style={{ ...sectionHeading, backgroundColor: '#ffffff' }}>
              Summary of Invoices:
            </Heading>
            {bills.map((bill, index) => {
              const markAsPaidUrl = `${SUPABASE_URL}/functions/v1/mark-bill-paid?billId=${bill.id}&token=${bill.token}`;
              const downloadUrl = bill.storage_path 
                ? `${SUPABASE_URL}/storage/v1/object/public/bills/${bill.storage_path}`
                : null;
              
              return (
                <div key={index} style={invoiceItem}>
                  <Row style={{ backgroundColor: '#ffffff' }}>
                    <Column style={{ width: '100%', backgroundColor: '#ffffff' }}>
                      <Text style={{ margin: '0 0 16px 0', lineHeight: '1.8', color: '#1a1a1a', backgroundColor: '#ffffff' }}>
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
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {downloadUrl && (
                          <Button href={downloadUrl} style={downloadButton}>
                            📥 Download Bill
                          </Button>
                        )}
                        <Button href={markAsPaidUrl} style={markAsPaidButton}>
                          ✓ Mark as Paid
                        </Button>
                      </div>
                    </Column>
                  </Row>
                </div>
              );
            })}
          </Section>

          {/* Footer Message */}
          <Section style={content}>
            <Text style={{ ...paragraph, backgroundColor: '#ffffff' }}>
              Let me know if you need any clarification.
            </Text>
          </Section>

          {/* Signature */}
          <Section style={signature}>
            <Text style={{ ...signatureText, backgroundColor: '#ffffff' }}>
              Kind regards,<br />
              <strong>Skrobaki Project Team</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={footerDivider} />
          <Section style={footer}>
            <Text style={{ ...footerText, backgroundColor: '#ffffff' }}>
              SKROBAKI Finance • accounts@skrobaki.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default BillNotificationEmail;

// Styles - Clean White Background Design
const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  padding: '40px 20px',
  margin: '0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '12px',
  border: '2px solid #cccccc',
  overflow: 'hidden',
};

const header = {
  backgroundColor: '#217BF4',
  padding: '48px 40px 40px',
  textAlign: 'center' as const,
  margin: '0',
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
};

const subtitle = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
};

const content = {
  padding: '36px 40px 24px',
  backgroundColor: '#ffffff',
  margin: '0',
};

const paragraph = {
  color: '#1a1a1a',
  fontSize: '15px',
  lineHeight: '1.7',
  margin: '0 0 18px',
  fontWeight: '400',
};

const billsSection = {
  padding: '24px 40px 32px',
  backgroundColor: '#ffffff',
  margin: '0',
};

const sectionHeading = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 24px',
  paddingTop: '0',
  letterSpacing: '-0.5px',
};

const invoiceItem = {
  backgroundColor: '#ffffff',
  color: '#1a1a1a',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0 0 16px',
  padding: '20px 24px',
  borderRadius: '8px',
  border: '2px solid #cccccc',
};

const signature = {
  padding: '24px 40px 36px',
  backgroundColor: '#ffffff',
  margin: '0',
};

const signatureText = {
  color: '#1a1a1a',
  fontSize: '15px',
  lineHeight: '1.7',
  margin: '0 0 12px',
  fontWeight: '400',
};

const footerDivider = {
  borderColor: '#cccccc',
  borderWidth: '1px',
  margin: '0',
};

const footer = {
  padding: '28px 40px',
  textAlign: 'center' as const,
  backgroundColor: '#ffffff',
  margin: '0',
};

const footerText = {
  color: '#666666',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: '0',
  fontWeight: '500',
};

const downloadButton = {
  backgroundColor: 'rgba(16, 185, 129, 0.95)',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '600' as const,
  borderRadius: '8px',
  padding: '10px 18px',
  textDecoration: 'none',
  display: 'inline-block',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  cursor: 'pointer',
  textAlign: 'center' as const,
  flex: '1',
  minWidth: '140px',
  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  letterSpacing: '0.2px',
};

const markAsPaidButton = {
  backgroundColor: 'rgba(33, 123, 244, 0.95)',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '600' as const,
  borderRadius: '8px',
  padding: '10px 18px',
  textDecoration: 'none',
  display: 'inline-block',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  cursor: 'pointer',
  textAlign: 'center' as const,
  flex: '1',
  minWidth: '140px',
  boxShadow: '0 2px 8px rgba(33, 123, 244, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  letterSpacing: '0.2px',
};
