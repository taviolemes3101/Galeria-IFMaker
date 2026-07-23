import React, { useState } from 'react';
import { X, LogIn, UserPlus, AlertCircle, Mail, Lock, User, Copy, Check, GraduationCap, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import firebaseConfigJson from '../../firebase-applet-config.json';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [course, setCourse] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDomainError(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) {
          setError('Por favor, informe seu nome completo.');
          setSubmitting(false);
          return;
        }
        if (!course.trim()) {
          setError('Por favor, informe o curso que você realiza no IFSP.');
          setSubmitting(false);
          return;
        }
        if (!phone.trim()) {
          setError('Por favor, informe seu número de contato.');
          setSubmitting(false);
          return;
        }
        await registerWithEmail(name.trim(), email, password, course.trim(), phone.trim());
      }
      onClose();
    } catch (err: any) {
      console.warn('Auth modal submit error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso por outro usuário.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve conter no mínimo 6 caracteres.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('O método E-mail/Senha não está ativado no Console do Firebase (Authentication > Sign-in method).');
      } else {
        setError(err.message || 'Ocorreu um erro ao autenticar.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setDomainError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.warn('Google auth popup error:', err);
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setDomainError(window.location.hostname);
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('O provedor de login do Google não está ativado no Console do Firebase (Authentication > Sign-in method).');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('A janela de login do Google foi fechada antes de concluir.');
      } else {
        setError(err.message || 'Falha na autenticação via Google.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-if-green text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-white text-lg">
              IF
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Acesso Galeria IFMaker</h3>
              <p className="text-xs text-emerald-100">Campus São Paulo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setDomainError(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
              mode === 'login'
                ? 'border-if-green text-if-green bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setDomainError(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
              mode === 'register'
                ? 'border-if-green text-if-green bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Criar Conta Maker
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {domainError && (
            <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-950 text-xs">Domínio não autorizado no Firebase</h4>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    O projeto Firebase <strong className="text-amber-950 font-semibold font-mono">{firebaseConfigJson.projectId}</strong> precisa autorizar o domínio desta aplicação para permitir login do Google:
                  </p>
                  <div className="bg-amber-100/80 px-2.5 py-1.5 rounded-lg font-mono text-[11px] text-amber-950 font-semibold border border-amber-200/80 flex items-center justify-between gap-2 my-1">
                    <span className="truncate">{domainError}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(domainError);
                        setCopiedDomain(true);
                        setTimeout(() => setCopiedDomain(false), 2000);
                      }}
                      className="shrink-0 bg-amber-200 hover:bg-amber-300 text-amber-950 px-2 py-0.5 rounded font-sans text-[10px] font-bold flex items-center gap-1 transition-colors"
                    >
                      {copiedDomain ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDomain ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-700">
                    <strong>Como resolver no Firebase Console:</strong> Vá em <em>Authentication</em> &gt; <em>Settings</em> &gt; <em>Authorized domains</em> e adicione este domínio.
                  </p>
                  <p className="text-[11px] font-bold text-emerald-800 pt-1">
                    💡 Dica: Você pode criar uma conta abaixo com E-mail e Senha agora mesmo sem precisar autorizar o domínio!
                  </p>
                </div>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Maria Silva"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-if-green transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Curso no IFSP</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Ex: Análise e Desenvolvimento de Sistemas"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-if-green transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Número de Contato / WhatsApp</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-if-green transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-if-green transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-if-green transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-if-green hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50"
          >
            {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{mode === 'login' ? 'Entrar no Repositório' : 'Cadastrar Conta Maker'}</span>
          </button>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-3 text-[11px] font-medium text-slate-400">ou acesse com</span>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting}
            className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar com Google</span>
          </button>
        </form>
      </div>
    </div>
  );
};

