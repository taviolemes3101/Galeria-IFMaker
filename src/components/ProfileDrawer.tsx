import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfileDrawer: React.FC = () => {
  const {
    currentUser,
    userProfile,
    isProfileDrawerOpen,
    closeProfileDrawer,
    updateUserProfileData
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync form inputs with current user profile whenever drawer opens or profile updates
  useEffect(() => {
    if (userProfile && currentUser) {
      setName(userProfile.name || currentUser.displayName || '');
      setEmail(userProfile.email || currentUser.email || '');
      setPhone(userProfile.phone || '');
      setCourse(userProfile.course || '');
      setNewPassword('');
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [userProfile, currentUser, isProfileDrawerOpen]);

  if (!isProfileDrawerOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setSubmitting(true);

    try {
      await updateUserProfileData({
        name,
        email,
        phone,
        course,
        newPassword: newPassword.trim() || undefined
      });
      setSuccessMsg('Informações de cadastro atualizadas com sucesso!');
      setNewPassword('');
    } catch (err: any) {
      console.warn('Error updating user profile:', err);
      setErrorMsg(err.message || 'Falha ao atualizar dados de cadastro.');
    } finally {
      setSubmitting(false);
    }
  };

  const formattedDate = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
        onClick={closeProfileDrawer}
        aria-hidden="true"
      />

      {/* Right Drawer Panel */}
      <aside className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden animate-slide-in-right border-l border-slate-200">
        {/* Drawer Header */}
        <div className="bg-if-green text-white p-5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-white text-base uppercase border border-white/30 shadow-2xs">
              {userProfile?.name?.[0] || currentUser.email?.[0] || 'M'}
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Meu Cadastro</h3>
              <p className="text-xs text-emerald-100 font-medium">Informações Pessoais & Acesso</p>
            </div>
          </div>
          <button
            onClick={closeProfileDrawer}
            className="p-1.5 hover:bg-white/10 rounded-xl text-emerald-100 hover:text-white transition-colors"
            title="Fechar Painel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">{userProfile?.name}</span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  userProfile?.role === 'admin'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                {userProfile?.role === 'admin' ? 'Administrador' : 'Maker'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{currentUser.email}</p>
          </div>

          {formattedDate && (
            <div className="text-right text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Membro desde {formattedDate}</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2.5 shadow-2xs animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2.5 shadow-2xs animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-if-green" />
              Dados Pessoais & Acadêmicos
            </h4>

            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-if-green transition-all"
                />
              </div>
            </div>

            {/* Curso */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Curso no IFSP <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="Ex: Análise e Desenvolvimento de Sistemas"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-if-green transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Sua licenciatura, bacharelado ou técnico no campus.</p>
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Número de Contato / WhatsApp <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-if-green transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Usado para contato pela equipe do IFMaker se necessário.</p>
            </div>

            <hr className="border-slate-100 my-4" />

            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-0.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-if-green" />
              Credenciais de Acesso
            </h4>

            {/* E-mail de Acesso */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-mail de Acesso</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-if-green transition-all"
                />
              </div>
            </div>

            {/* Nova Senha */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nova Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Deixe em branco para não alterar"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-if-green transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                  title={showPassword ? 'Ocultar Senha' : 'Exibir Senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Mínimo de 6 caracteres. Preencha apenas se desejar mudar a senha.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeProfileDrawer}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-if-green hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 uppercase tracking-wide cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};
