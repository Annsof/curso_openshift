import './globals.css';

export const metadata = {
  title: 'Capybara App 🦫',
  description: 'Frontend Next.js + API interna para practicar OpenShift'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
