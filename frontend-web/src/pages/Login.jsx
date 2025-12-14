import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login({ email, password });
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    const fillCredentials = (roleEmail, rolePass) => {
        setEmail(roleEmail);
        setPassword(rolePass);
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '400px', margin: '1rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem', fontWeight: 'bold' }}>Gym App</h2>
                <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)' }}>Welcome back, athlete</p>

                {error && <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.2)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                            placeholder="you@example.com"
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>Demo Credentials (Click to fill):</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <button onClick={() => fillCredentials('admin@gym.com', 'admin123')} style={{ padding: '0.25rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text)', borderRadius: '4px', cursor: 'pointer' }}>Super Admin</button>
                        <button onClick={() => fillCredentials('owner@gym.com', 'owner123')} style={{ padding: '0.25rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text)', borderRadius: '4px', cursor: 'pointer' }}>Gym Owner</button>
                        <button onClick={() => fillCredentials('trainer@gym.com', 'trainer123')} style={{ padding: '0.25rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text)', borderRadius: '4px', cursor: 'pointer' }}>Trainer</button>
                        <button onClick={() => fillCredentials('user@gym.com', 'user123')} style={{ padding: '0.25rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text)', borderRadius: '4px', cursor: 'pointer' }}>User</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
