export const metadata = {
  title: 'PiDaily',
  description: 'Daily tools for Pi Network Pioneers',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://sdk.minepi.com/pi-sdk.js"></script>
      </head>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#0f172a', color: '#e2e8f0' }}>
        {children}
      </body>
    </html>
  );
}
