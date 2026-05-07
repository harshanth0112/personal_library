import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function Login({ onLogin, API, initialResetToken }) {
  const [view, setView] = useState('login'); // login, register, forgot, reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialResetToken) {
      setView('reset');
    }
  }, [initialResetToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      if (view === 'login' || view === 'register') {
        const endpoint = view === 'register' ? '/auth/register' : '/auth/login';
        
        const payload = { email, password };
        if (view === 'register') {
          payload.first_name = firstName;
          payload.last_name = lastName;
          payload.gender = gender;
          payload.date_of_birth = dateOfBirth;
        }

        const res = await fetch(`${API}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Authentication failed');
        
        onLogin(data.token, data.user);
      } 
      else if (view === 'forgot') {
        const res = await fetch(`${API}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to process request');
        setMessage(data.message);
      }
      else if (view === 'reset') {
        const res = await fetch(`${API}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: initialResetToken, new_password: password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to reset password');
        setMessage(data.message);
        setTimeout(() => {
            window.history.replaceState({}, document.title, "/");
            setView('login');
        }, 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google authentication failed');
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Login Failed');
  };

  const inputStyle = {
    width: '100%',
    padding: '0.85rem 1rem',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s',
    marginTop: '0.4rem'
  };

  const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'var(--text-muted)',
    marginLeft: '0.25rem'
  };

  return (
    <div className="login-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #eef2ff, #f8fafc)',
      padding: '2rem'
    }}>
      <div className="glass fade-in" style={{ 
        width: '100%', 
        maxWidth: '480px', 
        padding: '3rem', 
        borderRadius: '24px', 
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative element */}
        <div style={{ 
          position: 'absolute', 
          top: '-50px', 
          right: '-50px', 
          width: '150px', 
          height: '150px', 
          borderRadius: '50%', 
          background: 'rgba(99, 102, 241, 0.05)',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{ 
              fontSize: '2.25rem', 
              color: 'var(--text-main)', 
              marginBottom: '0.5rem',
              letterSpacing: '-0.025em'
            }}>
              {view === 'register' && 'Create Account'}
              {view === 'login' && 'Welcome Back'}
              {view === 'forgot' && 'Reset Link'}
              {view === 'reset' && 'New Password'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              {view === 'login' && 'Sign in to access your personal library'}
              {view === 'register' && 'Join our community of book lovers'}
              {view === 'forgot' && 'Enter your email to receive a reset link'}
              {view === 'reset' && 'Choose a strong password for your account'}
            </p>
          </div>

          {error && (
            <div className="fade-in" style={{ 
              padding: '1rem', 
              backgroundColor: '#fef2f2', 
              color: '#991b1b', 
              borderRadius: '12px', 
              marginBottom: '1.5rem', 
              fontSize: '0.875rem',
              border: '1px solid #fee2e2',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {message && (
            <div className="fade-in" style={{ 
              padding: '1rem', 
              backgroundColor: '#f0fdf4', 
              color: '#166534', 
              borderRadius: '12px', 
              marginBottom: '1.5rem', 
              fontSize: '0.875rem',
              border: '1px solid #dcfce7',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {(view === 'login' || view === 'register' || view === 'forgot') && (
              <div>
                <label style={labelStyle}>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="name@example.com"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            )}

            {view === 'register' && (
              <>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>First Name</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Last Name</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ ...inputStyle, appearance: 'none' }} onFocus={(e) => e.target.style.borderColor = 'var(--primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Birthday</label>
                    <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                </div>
              </>
            )}

            {(view === 'login' || view === 'register' || view === 'reset') && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <label style={labelStyle}>
                     {view === 'reset' ? 'New Password' : 'Password'}
                   </label>
                   {view === 'login' && (
                     <button type="button" onClick={() => { setView('forgot'); setError(''); setMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                       Forgot password?
                     </button>
                   )}
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                padding: '1rem', 
                background: 'var(--primary)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                fontSize: '1rem', 
                fontWeight: '600', 
                marginTop: '0.5rem',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--primary-hover)'}
              onMouseLeave={(e) => e.target.style.background = 'var(--primary)'}
            >
              {loading ? 'Processing...' : (
                <>
                  {view === 'register' && 'Create Account'}
                  {view === 'login' && 'Sign In'}
                  {view === 'forgot' && 'Send Reset Link'}
                  {view === 'reset' && 'Reset Password'}
                </>
              )}
            </button>
          </form>
          
          {(view === 'login' || view === 'register') && (
            <>
              <div style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--text-muted)', fontSize: '0.875rem', position: 'relative' }}>
                <span style={{ background: 'transparent', padding: '0 15px', position: 'relative', zIndex: 1 }}>or continue with</span>
                <hr style={{ position: 'absolute', top: '50%', left: 0, right: 0, border: 'none', borderTop: '1px solid var(--border)', margin: 0, zIndex: 0 }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_blue"
                  shape="pill"
                  width="350"
                />
              </div>
            </>
          )}
          
          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem' }}>
            {view === 'register' && (
              <span style={{ color: 'var(--text-muted)' }}>Already have an account? <button onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '700' }}>Sign In</button></span>
            )}
            {(view === 'login' || view === 'forgot') && (
              <span style={{ color: 'var(--text-muted)' }}>Don't have an account? <button onClick={() => setView('register')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '700' }}>Create Account</button></span>
            )}
            {(view === 'forgot') && (
               <div style={{ marginTop: '1rem' }}>
                 <button onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem' }}>Back to Login</button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
