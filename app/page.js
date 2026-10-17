'use client';

import { useEffect, useState } from 'react';

const FREE_NOTE_LIMIT = 5;
const PREMIUM_NOTE_LIMIT = 50;

export default function Home() {
  const [user, setUser] = useState(null);
  const [premium, setPremium] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('notes');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [countdown, setCountdown] = useState(0);
  const [countdownRunning, setCountdownRunning] = useState(false);
  const [tipAmount, setTipAmount] = useState('0.1');
  const [checkInStreak, setCheckInStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Pi) {
      window.Pi.init({ version: '2.0', sandbox: true });
    }
    const savedNotes = localStorage.getItem('pidaily_notes');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    const streak = localStorage.getItem('pidaily_streak');
    const last = localStorage.getItem('pidaily_last_checkin');
    if (streak) setCheckInStreak(parseInt(streak, 10));
    if (last) setLastCheckIn(last);
  }, []);

  useEffect(() => {
    localStorage.setItem('pidaily_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    let timer;
    if (countdownRunning && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0 && countdownRunning) {
      setCountdownRunning(false);
      setStatus('Countdown finished!');
    }
    return () => clearTimeout(timer);
  }, [countdown, countdownRunning]);

  const authenticate = async () => {
    if (!window.Pi) {
      setStatus('Open this app inside the Pi Browser');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      const auth = await window.Pi.authenticate(['username', 'payments'], (payment) => {
        setStatus('Incomplete payment found — finishing it...');
        fetch('/api/pi/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: payment.identifier, txid: payment.transaction?.txid }),
        });
      });
      setUser(auth.user);
      setStatus(`Logged in as ${auth.user.username}`);
      const saved = localStorage.getItem(`premium_${auth.user.uid}`);
      if (saved === 'true') setPremium(true);
    } catch (err) {
      setStatus('Auth failed: ' + (err.message || 'Unknown error'));
    }
    setLoading(false);
  };

  const createPayment = (amount, memo, metadata, onSuccess) => {
    if (!user) return;
    setLoading(true);
    window.Pi.createPayment(
      { amount: parseFloat(amount), memo, metadata },
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
            if (res.ok && onSuccess) onSuccess();
          });
        },
        onCancel: () => setStatus('Payment cancelled'),
        onError: (error) => setStatus('Payment error: ' + (error.message || 'Failed')),
      }
    );
    setLoading(false);
  };

  const unlockPremium = () => {
    createPayment(1, 'PiDaily Premium Unlock', { feature: 'premium_lifetime', user: user.uid }, () => {
      setPremium(true);
      localStorage.setItem(`premium_${user.uid}`, 'true');
      setStatus('Premium unlocked! Enjoy the full tools.');
    });
  };

  const sendTip = () => {
    const amt = parseFloat(tipAmount);
    if (isNaN(amt) || amt <= 0) {
      setStatus('Enter a valid tip amount');
      return;
    }
    createPayment(amt, 'PiDaily Tip', { type: 'tip', from: user.username }, () => {
      setStatus(`Tip of ${amt} π sent. Thank you!`);
    });
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const limit = premium ? PREMIUM_NOTE_LIMIT : FREE_NOTE_LIMIT;
    if (notes.length >= limit) {
      setStatus(premium ? 'Note limit reached' : 'Free limit reached — unlock Premium for more');
      return;
    }
    setNotes([{ id: Date.now(), text: newNote.trim(), created: new Date().toISOString() }, ...notes]);
    setNewNote('');
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleCalc = (val) => {
    if (val === 'C') {
      setCalcDisplay('0');
      return;
    }
    if (val === '=') {
      try {
        const result = Function(`"use strict"; return (${calcDisplay})`)();
        setCalcDisplay(String(result));
      } catch {
        setCalcDisplay('Error');
      }
      return;
    }
    setCalcDisplay((prev) => (prev === '0' && val !== '.' ? val : prev + val));
  };

  const startCountdown = (mins) => {
    setCountdown(mins * 60);
    setCountdownRunning(true);
  };

  const doCheckIn = () => {
    const today = new Date().toDateString();
    if (lastCheckIn === today) {
      setStatus('Already checked in today');
      return;
    }
    const newStreak = lastCheckIn && new Date(lastCheckIn).toDateString() === new Date(Date.now() - 86400000).toDateString()
      ? checkInStreak + 1
      : 1;
    setCheckInStreak(newStreak);
    setLastCheckIn(today);
    localStorage.setItem('pidaily_streak', String(newStreak));
    localStorage.setItem('pidaily_last_checkin', today);
    setStatus(`Checked in! Streak: ${newStreak}`);
  };

  const noteLimit = premium ? PREMIUM_NOTE_LIMIT : FREE_NOTE_LIMIT;

  return (
    <main style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '32px', margin: '0 0 4px', background: 'linear-gradient(90deg, #a78bfa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PiDaily</h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>Tools for Pi Network Pioneers</p>
      </header>

      {!user ? (
        <button
          onClick={authenticate}
          disabled={loading}
          style={{
            width: '100%', padding: '18px', background: '#7c3aed', color: 'white',
            border: 'none', borderRadius: '14px', fontSize: '18px', fontWeight: '600', cursor: 'pointer'
          }}
        >
          {loading ? 'Connecting...' : 'Login with Pi'}
        </button>
      ) : (
        <>
          <div style={{ background: '#1e293b', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{user.username}</strong>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{premium ? 'Premium' : 'Free'}</div>
            </div>
            {!premium && (
              <button onClick={unlockPremium} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', fontWeight: '600' }}>
                Unlock 1π
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
            {['notes', 'calc', 'timer', 'checkin', 'tip'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '10px 14px', borderRadius: '10px', border: 'none',
                  background: tab === t ? '#7c3aed' : '#1e293b', color: 'white', fontSize: '14px', whiteSpace: 'nowrap'
                }}
              >
                {t === 'notes' ? 'Notes' : t === 'calc' ? 'Calc' : t === 'timer' ? 'Timer' : t === 'checkin' ? 'Check-in' : 'Tip'}
              </button>
            ))}
          </div>

          {tab === 'notes' && (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="New note..."
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#1e293b', color: 'white' }}
                  onKeyDown={(e) => e.key === 'Enter' && addNote()}
                />
                <button onClick={addNote} style={{ background: '#7c3aed', color: 'white', border: 'none', borderRadius: '10px', padding: '0 16px' }}>Add</button>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 8px' }}>{notes.length}/{noteLimit} notes</p>
              {notes.map((n) => (
                <div key={n.id} style={{ background: '#1e293b', padding: '12px', borderRadius: '10px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, wordBreak: 'break-word' }}>{n.text}</div>
                  <button onClick={() => deleteNote(n.id)} style={{ background: 'transparent', color: '#f87171', border: 'none', fontSize: '18px', marginLeft: '8px' }}>×</button>
                </div>
              ))}
            </div>
          )}

          {tab === 'calc' && (
            <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px' }}>
              <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', textAlign: 'right', fontSize: '28px', marginBottom: '12px', minHeight: '48px' }}>{calcDisplay}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+','C'].map((btn) => (
                  <button key={btn} onClick={() => handleCalc(btn)} style={{ padding: '16px', background: btn === '=' ? '#059669' : btn === 'C' ? '#dc2626' : '#334155', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px' }}>{btn}</button>
                ))}
              </div>
            </div>
          )}

          {tab === 'timer' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', fontWeight: '700', margin: '20px 0', fontVariantNumeric: 'tabular-nums' }}>
                {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {[1, 5, 10, 15, 25].map((m) => (
                  <button key={m} onClick={() => startCountdown(m)} style={{ background: '#1e293b', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 16px' }}>{m}m</button>
                ))}
              </div>
              {countdownRunning && (
                <button onClick={() => setCountdownRunning(false)} style={{ marginTop: '16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 24px' }}>Stop</button>
              )}
            </div>
          )}

          {tab === 'checkin' && (
            <div style={{ textAlign: 'center', background: '#1e293b', padding: '24px', borderRadius: '12px' }}>
              <div style={{ fontSize: '48px', fontWeight: '700', marginBottom: '8px' }}>{checkInStreak}</div>
              <p style={{ color: '#94a3b8', margin: '0 0 16px' }}>day streak</p>
              <button onClick={doCheckIn} style={{ background: '#7c3aed', color: 'white', border: 'none', borderRadius: '12px', padding: '14px 32px', fontSize: '16px', fontWeight: '600' }}>
                Check In Today
              </button>
              {lastCheckIn && <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>Last: {lastCheckIn}</p>}
            </div>
          )}

          {tab === 'tip' && (
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ marginTop: 0 }}>Support PiDaily development</p>
              <input
                type="number"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                step="0.1"
                min="0.01"
                style={{ width: '120px', padding: '12px', borderRadius: '10px', border: 'none', background: '#0f172a', color: 'white', textAlign: 'center', fontSize: '18px', marginBottom: '12px' }}
              />
              <div>
                <button onClick={sendTip} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: '12px', padding: '14px 32px', fontSize: '16px', fontWeight: '600' }}>
                  Send Tip
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {status && (
        <p style={{ marginTop: '20px', color: '#a78bfa', fontSize: '14px', textAlign: 'center' }}>{status}</p>
      )}
    </main>
  );
}
