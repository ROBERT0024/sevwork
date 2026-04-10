import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2, Key, Cpu, ShieldAlert } from 'lucide-react';
import { login, register } from '../services/api.js';

function Login() {
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password);
        toast.success("Cuenta creada exitosamente");
      }
      const res = await login(email, password);
      localStorage.setItem('access_token',  res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      localStorage.setItem('user_email',    email);
      toast.success("Bienvenido de vuelta");
      navigate('/dashboard');
    } catch (err) {
      const d = err.response?.data?.detail;
      const errorMsg = typeof d === 'string' ? d : Array.isArray(d) ? d.map(x => x.msg).join(', ') : 'Error de conexión con el servidor';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-6">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primaryLight rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-primaryLight rounded-full blur-[120px] pointer-events-none" />

      {/* Main Card */}
      <div className="bg-surface/80 backdrop-blur-2xl border border-white/5 rounded-[24px] shadow-glow p-8 sm:p-10 w-full max-w-[420px] relative z-10 animate-fade-in-up">
        
        {/* Logo */}
        <div className="flex justify-center mb-8 relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <div className="bg-gradient-to-br from-primary to-primaryHover p-3 rounded-2xl shadow-lg relative">
            <ShieldCheck className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-textMain to-textMuted mb-2">
            SevWork
          </h1>
          <p className="text-sm text-textMuted font-medium">
            Tu espacio de trabajo privado y seguro
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-black/40 p-1 rounded-xl mb-8 border border-white/5">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isRegister ? 'bg-primary text-white shadow-md' : 'text-textMuted hover:text-textMain'}`}
            onClick={() => setIsRegister(false)}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isRegister ? 'bg-primary text-white shadow-md' : 'text-textMuted hover:text-textMain'}`}
            onClick={() => setIsRegister(true)}
          >
            Crear cuenta
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-textMuted uppercase tracking-wider pl-1">
              Correo Electrónico
            </label>
            <div className="relative flex items-center bg-black/30 border border-border rounded-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden">
              <Mail className="absolute left-3 w-4 h-4 text-textMuted" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-transparent border-none text-textMain text-sm pl-10 pr-4 py-3 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5 pb-2">
            <label className="text-xs font-bold text-textMuted uppercase tracking-wider pl-1">
              Contraseña
            </label>
            <div className="relative flex items-center bg-black/30 border border-border rounded-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden">
              <Lock className="absolute left-3 w-4 h-4 text-textMuted" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isRegister ? 'Mínimo 8 caracteres' : '••••••••'}
                className="w-full bg-transparent border-none text-textMain text-sm pl-10 pr-10 py-3 outline-none"
              />
              <button
                type="button"
                className="absolute right-3 text-textMuted hover:text-primary transition-colors"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isRegister ? 'Creando cuenta...' : 'Autenticando...'}</span>
              </>
            ) : (
              <span>{isRegister ? 'Crear cuenta segura' : 'Entrar al Workspace'}</span>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-textMuted mt-6 mb-6">
          {isRegister ? '¿Ya estás a bordo? ' : '¿Nuevo en la tripulación? '}
          <button 
            type="button"
            className="text-primary hover:text-primaryHover font-medium underline underline-offset-4 decoration-primary/30 transition-colors"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Inicia sesión' : 'Regístrate aquí'}
          </button>
        </p>

        {/* Security Badges */}
        <div className="flex justify-center items-center gap-4 pt-5 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-textMuted font-medium">
            <Key className="w-3.5 h-3.5" /> JWT Auth
          </div>
          <div className="flex items-center gap-1.5 text-xs text-textMuted font-medium">
            <ShieldAlert className="w-3.5 h-3.5" /> Cifrado
          </div>
          <div className="flex items-center gap-1.5 text-xs text-textMuted font-medium">
            <Cpu className="w-3.5 h-3.5" /> DevSecOps
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
