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
  payerEmail: string;
  bills: Bill[];
}

export const BillNotificationEmail = ({
  payerEmail,
  bills,
}: BillNotificationEmailProps) => {
  const totalAmount = bills.reduce((sum, bill) => sum + bill.total, 0);

  return (
    <Html>
      <Head />
      <Preview>Outstanding Bills - Payment Required from SKROBAKI</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>SKROBAKI Finance</Heading>
            <Text style={subtitle}>Outstanding Bills - Payment Required</Text>
          </Section>

          {/* Greeting */}
          <Section style={content}>
            <Text style={paragraph}>
              Dear Payer,
            </Text>
            <Text style={paragraph}>
              This email is to notify you of outstanding bills that require your payment. 
              Below is a list of the bills along with their respective due dates.
            </Text>
          </Section>

          {/* Bills Summary */}
          <Section style={summaryBox}>
            <Row>
              <Column>
                <Text style={summaryLabel}>Total Bills</Text>
                <Text style={summaryValue}>{bills.length}</Text>
              </Column>
              <Column>
                <Text style={summaryLabel}>Total Amount</Text>
                <Text style={summaryValue}>${totalAmount.toFixed(2)}</Text>
              </Column>
            </Row>
          </Section>

          {/* Bills List */}
          <Section style={billsSection}>
            <Heading as="h2" style={sectionHeading}>
              Bill Details
            </Heading>
            {bills.map((bill, index) => (
              <div key={index}>
                <Section style={billCard}>
                  <Row>
                    <Column style={billHeader}>
                      <Text style={billVendor}>{bill.supplier_name}</Text>
                      <Text style={billNumber}>
                        {bill.invoice_number || bill.bill_no || 'N/A'}
                      </Text>
                    </Column>
                  </Row>
                  
                  {bill.projects && (
                    <Row>
                      <Column>
                        <Text style={billProject}>
                          Project: {bill.projects.name} ({bill.projects.project_id})
                        </Text>
                      </Column>
                    </Row>
                  )}

                  {bill.description && (
                    <Row>
                      <Column>
                        <Text style={billDescription}>{bill.description}</Text>
                      </Column>
                    </Row>
                  )}

                  <Row style={billFooter}>
                    <Column>
                      <Text style={billAmount}>
                        Amount: <strong>${bill.total.toFixed(2)}</strong>
                      </Text>
                    </Column>
                    <Column style={dueColumn}>
                      <Text style={billDue}>
                        Due: {new Date(bill.due_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    </Column>
                  </Row>
                </Section>
                {index < bills.length - 1 && <Hr style={divider} />}
              </div>
            ))}
          </Section>

          {/* Footer Message */}
          <Section style={content}>
            <Text style={paragraph}>
              Please ensure these bills are settled by their respective due dates to 
              avoid any disruption in services or further action.
            </Text>
            <Text style={paragraph}>
              If you have already made these payments or believe there is a discrepancy, 
              please reply to this email with proof of payment or further details so we 
              can investigate.
            </Text>
          </Section>

          {/* Signature */}
          <Section style={signature}>
            <Text style={signatureText}>
              Thank you for your prompt attention to this matter.
            </Text>
            <Text style={signatureText}>
              Sincerely,<br />
              <strong>The SKROBAKI Team</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={footerDivider} />
          <Section style={footer}>
            <Text style={footerText}>
              SKROBAKI Finance • finance@skrobaki.com
            </Text>
            <Text style={footerText}>
              This is an automated notification. Please do not reply to this email 
              unless you need to provide payment information.
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

const summaryBox = {
  backgroundColor: '#f8fafc',
  border: '2px solid #217BF4',
  borderRadius: '8px',
  margin: '0 40px 32px',
  padding: '24px',
};

const summaryLabel = {
  color: '#64748b',
  fontSize: '13px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
};

const summaryValue = {
  color: '#217BF4',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0',
};

const billsSection = {
  padding: '0 40px 32px',
};

const sectionHeading = {
  color: '#1e293b',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 24px',
};

const billCard = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '16px',
};

const billHeader = {
  marginBottom: '12px',
};

const billVendor = {
  color: '#1e293b',
  fontSize: '17px',
  fontWeight: '700',
  margin: '0 0 4px',
};

const billNumber = {
  color: '#64748b',
  fontSize: '13px',
  fontWeight: '500',
  margin: '0',
  fontFamily: 'monospace',
};

const billProject = {
  color: '#64748b',
  fontSize: '14px',
  margin: '8px 0',
  fontStyle: 'italic' as const,
};

const billDescription = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '12px 0',
};

const billFooter = {
  marginTop: '16px',
  paddingTop: '16px',
  borderTop: '1px solid #e2e8f0',
};

const billAmount = {
  color: '#1e293b',
  fontSize: '16px',
  margin: '0',
};

const dueColumn = {
  textAlign: 'right' as const,
};

const billDue = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '24px 40px',
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
