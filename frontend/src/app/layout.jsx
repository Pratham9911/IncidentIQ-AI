import './globals.css';

export const metadata = {
  title: 'INCIDENTIQ NEXUS',
  description: 'AI-powered incident intelligence platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
