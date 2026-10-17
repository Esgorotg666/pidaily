export const metadata = {
  title: 'PiDaily',
  description: 'Daily utility tools for Pi Network Pioneers',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://sdk.minepi.com/pi-sdk.js"></script>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0f172a', color: '#e2e8f0', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
