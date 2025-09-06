import React, {useState} from 'react';
import {environment} from "../env/Enviroment.ts";

const LoginPage = ({onLoginSuccess}: { onLoginSuccess?: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            const response = await fetch(environment.apiHost + 'auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password}),
            });

            if (!response.ok) {
                throw new Error('Neuspešan login!');
            }

            const data = await response.json();
            if (data.accessToken) {
                localStorage.setItem('authToken', data.accessToken);
                setMessage('Uspešno ste ulogovani ✅');
                if (onLoginSuccess) onLoginSuccess();
            } else {
                setMessage('Login nije uspeo – token nije dobijen.');
            }
        } catch (error) {
            console.error(error);
            setMessage('Greška prilikom logovanja ❌');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            <form onSubmit={handleSubmit} style={formStyle}>
                <h2 style={titleStyle}>Login</h2>
                <label style={labelStyle}>
                    Email:
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={inputStyle}
                        required
                    />
                </label>
                <label style={labelStyle}>
                    Password:
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={inputStyle}
                        required
                    />
                </label>
                <button type="submit" style={buttonStyle} disabled={loading}>
                    {loading ? 'Logovanje...' : 'Login'}
                </button>

                {message && (
                    <p style={{marginTop: '1rem', textAlign: 'center', color: '#000'}}>
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
};

const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    backgroundColor: '#ffffff',
};

const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    padding: '2rem',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#000000',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    minWidth: '300px',
};

const titleStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '1.5rem',
};

const labelStyle: React.CSSProperties = {
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
    fontSize: '1rem',
};

const inputStyle: React.CSSProperties = {
    marginTop: '0.5rem',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    color: '#000',
    backgroundColor: '#fff',
};

const buttonStyle: React.CSSProperties = {
    padding: '0.7rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#007BFF',
    color: '#FFFFFF',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem',
};

export default LoginPage;
