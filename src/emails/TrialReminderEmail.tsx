import { 
  Body, 
  Button, 
  Container, 
  Head, 
  Hr, 
  Html, 
  Img, 
  Preview, 
  Section, 
  Text 
} from '@react-email/components';
import * as React from 'react';

interface TrialReminderEmailProps {
  name: string;
  loginUrl: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const TrialReminderEmail = ({ name, loginUrl }: TrialReminderEmailProps) => (
  <Html>
    <Head />
    <Preview>Your Mok Mzansi Books Trial is Ending Soon!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${baseUrl}/static/logo.png`}
          width="120"
          height="50"
          alt="Mok Mzansi Books"
          style={logo}
        />
        <Text style={paragraph}>Hi {name},</Text>
        <Text style={paragraph}>
          Your 30-day trial of Mok Mzansi Books is ending in 5 days. We hope you've enjoyed the full access to our features.
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={loginUrl}>
            Upgrade to a Paid Plan
          </Button>
        </Section>
        <Text style={paragraph}>
          If you have any questions, please don't hesitate to contact our support team.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>Mok Mzansi Books, 123 Finance Street, Johannesburg, South Africa</Text>
      </Container>
    </Body>
  </Html>
);

export default TrialReminderEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
};

const logo = {
  margin: '0 auto',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
};

const btnContainer = {
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#5F51E8',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
};

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
};