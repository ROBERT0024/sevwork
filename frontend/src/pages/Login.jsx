// Login.jsx — SevWork Premium Login
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api.js';

function Login() {
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) await register(email, password);
      const res = await login(email, password);
      localStorage.setItem('access_token',  res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      localStorage.setItem('user_email',    email);
      navigate('/dashboard');
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : Array.isArray(d) ? d.map(x => x.msg).join(', ') : 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Orbs de fondo */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo-wrap">
          <div className="login-logo-glow" />
          <div className="login-logo">🔒</div>
        </div>

        {/* Header */}
        <div className="login-header">
          <h1>SevWork</h1>
          <p>Tu espacio de trabajo privado y seguro</p>
        </div>

        {/* Tabs login/register */}
        <div className="login-tabs">
          <button
            className={`login-tab ${!isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(false); setError(''); }}
            type="button"
          >Iniciar sesión</button>
          <button
            className={`login-tab ${isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(true); setError(''); }}
            type="button"
          >Crear cuenta</button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="login-field">
            <label htmlFor="email">Correo electrónico</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">✉</span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete="email"
                className="login-input"
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">Contraseña</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">🔑</span>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isRegister ? 'Mínimo 8 caracteres' : '••••••••'}
                required
                minLength={8}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                className="login-input"
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
                title={showPass ? 'Ocultar' : 'Ver contraseña'}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="login-btn-loading">
                <span className="login-spinner" />
                {isRegister ? 'Creando cuenta...' : 'Iniciando sesión...'}
              </span>
            ) : (
              isRegister ? '🚀 Crear cuenta' : '→ Iniciar sesión'
            )}
          </button>
        </form>

        <p className="login-hint">
          {isRegister ? '¿Ya tienes cuenta? ' : '¿Nuevo aquí? '}
          <button
            className="login-switch-btn"
            type="button"
            onClick={() => { setIsRegister(v => !v); setError(''); }}
          >
            {isRegister ? 'Inicia sesión' : 'Regístrate gratis'}
          </button>
        </p>

        <div className="login-badges">
          <span>🔐 JWT</span>
          <span>🛡️ Cifrado</span>
          <span>🔒 Seguro</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
