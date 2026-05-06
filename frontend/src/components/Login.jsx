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

  useEffect(() => {
    if (initialResetToken) {
      setView('reset');
    }
  }, [initialResetToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
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
            // Clean up the URL
            window.history.replaceState({}, document.title, "/");
            setView('login');
        }, 3000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
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
    }
  };

  const handleGoogleError = () => {
    setError('Google Login Failed');
  };

  return (
    <div className="login-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '20px' }}>
      <div className="login-card" style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px' }}>
        
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1a1a1a', fontSize: '1.8rem' }}>
          {view === 'register' && 'Create an Account'}
          {view === 'login' && 'Welcome Back'}
          {view === 'forgot' && 'Reset Password'}
          {view === 'reset' && 'Create New Password'}
        </h2>
        
        {error && <div style={{ color: '#d32f2f', marginBottom: '1rem', textAlign: 'center', padding: '0.75rem', background: '#ffebee', borderRadius: '6px', fontSize: '0.9rem' }}>{error}</div>}
        {message && <div style={{ color: '#2e7d32', marginBottom: '1rem', textAlign: 'center', padding: '0.75rem', background: '#e8f5e9', borderRadius: '6px', fontSize: '0.9rem' }}>{message}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {(view === 'login' || view === 'register' || view === 'forgot') && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#555', fontSize: '0.9rem', fontWeight: '500' }}>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '1rem' }}
              />
            </div>
          )}

          {view === 'register' && (
            <>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: '#555', fontSize: '0.9rem', fontWeight: '500' }}>First Name</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: '#555', fontSize: '0.9rem', fontWeight: '500' }}>Last Name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: '#555', fontSize: '0.9rem', fontWeight: '500' }}>Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', backgroundColor: 'white' }}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: '#555', fontSize: '0.9rem', fontWeight: '500' }}>Date of Birth</label>
                  <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
                </div>
              </div>
            </>
          )}

          {(view === 'login' || view === 'register' || view === 'reset') && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <label style={{ display: 'block', marginBottom: '0.4rem', color: '#555', fontSize: '0.9rem', fontWeight: '500' }}>
                   {view === 'reset' ? 'New Password' : 'Password'}
                 </label>
                 {view === 'login' && (
                   <button type="button" onClick={() => { setView('forgot'); setError(''); setMessage(''); }} style={{ background: 'none', border: 'none', color: '#2196F3', cursor: 'pointer', fontSize: '0.85rem' }}>
                     Forgot password?
                   </button>
                 )}
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '1rem' }}
              />
            </div>
          )}

          <button 
            type="submit" 
            style={{ padding: '0.8rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', marginTop: '0.5rem', transition: 'background 0.2s' }}
          >
            {view === 'register' && 'Register'}
            {view === 'login' && 'Login'}
            {view === 'forgot' && 'Send Reset Link'}
            {view === 'reset' && 'Reset Password'}
          </button>
        </form>
        
        {(view === 'login' || view === 'register') && (
          <>
            <div style={{ textAlign: 'center', margin: '1.5rem 0', color: '#888', fontSize: '0.9rem', position: 'relative' }}>
              <span style={{ background: 'white', padding: '0 10px', position: 'relative', zIndex: 1 }}>Or continue with</span>
              <hr style={{ position: 'absolute', top: '50%', left: 0, right: 0, border: 'none', borderTop: '1px solid #eee', margin: 0, zIndex: 0 }} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                shape="rectangular"
              />
            </div>
          </>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem' }}>
          {view === 'register' && (
            <span style={{ color: '#555' }}>Already have an account? <button onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>Login</button></span>
          )}
          {(view === 'login' || view === 'forgot') && (
            <span style={{ color: '#555' }}>Don't have an account? <button onClick={() => setView('register')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>Sign up</button></span>
          )}
          {(view === 'forgot') && (
             <div style={{ marginTop: '0.5rem' }}>
               <button onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', textDecoration: 'underline' }}>Back to Login</button>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}
