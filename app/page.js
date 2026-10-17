'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [premium, setPremium] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Pi) {
      window.Pi.init({ version: '2.0', sandbox: true });
    }
  }, []);

  const authenticate = async () => {
    if (!window.Pi) {
      setStatus('Open this app inside Pi Browser');
      return;
    }
    setLoading(true);
    try {
      const auth = await window.Pi.authenticate(['username', 'payments'], (payment) => {
        console.log('Incomplete payment found', payment);
      });
      setUser(auth.user);
      setStatus(`Logged in as ${auth.user.username}`);
      const saved = localStorage.getItem(`premium_${auth.user.uid}`);
      if (saved === 'true') setPremium(true);
    } catch (err) {
      setStatus('Auth failed: ' + err.message);
    }
    setLoading(false);
  };

  const unlockPremium = () => {
    if (!user) return;
    setLoading(true);
    window.Pi.createPayment(
      {
        amount: 1,
        memo: 'PiDaily Premium Unlock',
        metadata: { feature: 'premium_lifetime', user: user.uid },
      },
      {
        onReadyForServerApproval: (paymentId) => {
          fetch('/api/pi/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          fetch('/api/pi/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid, uid: user.uid }),
          }).then((res) => {
            if (res.ok) {
              setPremium(true);
              localStorage.setItem(`premium_${user.uid}`, 'true');
              setStatus('Premium unlocked!');
            }
          });
        },
        onCancel: () => setStatus('Payment cancelled'),
        onError: (error) => setStatus('Payment error: ' + error.message),
      }
    );
    setLoading(false);
  };

  return (
    <main style={{ padding: '24px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>PiDaily</h1>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
        Practical tools for Pi Network Pioneers
      </p>

      {!user ? (
        <button
          onClick={authenticate}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            background: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '600',
          }}
        >
          {loading ? 'Connecting...' : 'Login with Pi'}
        </button>
      ) : (
        <>
          <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
            <p>Welcome, <strong>{user.username}</strong></p>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>UID: {user.uid}</p>
          </div>

          <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
            <h3 style={{ marginTop: 0 }}>Free Tools</h3>
            <p>• Pi Browser status check</p>
            <p>• Simple notes (local only)</p>
            <p>• Quick calculator</p>
          </div>

          {premium ? (
            <div style={{ background: '#14532d', padding: '16px', borderRadius: '12px' }}>
              <h3 style={{ marginTop: 0 }}>Premium Unlocked</h3>
              <p>Extra tools, reminders, and expanded notes are now active.</p>
            </div>
          ) : (
            <button
              onClick={unlockPremium}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600',
              }}
            >
              Unlock Premium (1 π)
            </button>
          )}
        </>
      )}

      {status && (
        <p style={{ marginTop: '16px', color: '#a78bfa', fontSize: '14px' }}>{status}</p>
      )}
    </main>
  );
}
