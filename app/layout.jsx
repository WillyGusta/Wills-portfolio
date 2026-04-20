import './globals.css';

export const metadata = {
  title: 'Will Portfolio',
  description: 'Personal portfolio with AI assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}