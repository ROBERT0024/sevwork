// SharedView.jsx
import React, { useState } from 'react';
import { ShieldCheck, Mail, Send, Users, ShieldAlert, Edit3, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_MEMBERS = [{ id:1, email:'tu@email.com', role:'owner', initials:'TU', color:'#3b82f6' }];
const ROLES = ['owner','editor','viewer'];
const ROLE_LABELS = { owner:'Dueño', editor:'Editor', viewer:'Lector' };
const ROLE_DESC   = { owner:'Control total', editor:'Edita contenido', viewer:'Visualización' };
const ROLE_ICONS  = { owner: ShieldAlert, editor: Edit3, viewer: Eye };

function SharedView() {
  const [members, setMembers]         = useState(MOCK_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole]   = useState('editor');

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.includes('@')) { toast.error('Email inválido'); return; }
    
    const initials = inviteEmail.slice(0,2).toUpperCase();
    const colors   = ['#10b981','#f59e0b','#3b82f6','#8b5cf6','#ec4899'];
    setMembers(prev => [...prev, { id:Date.now(), email:inviteEmail, role:inviteRole, initials, color:colors[members.length % colors.length] }]);
    setInviteEmail(''); 
    toast.success('Invitación enviada');
  };

  return (
    <div className="p-8 sm:p-12 max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in-up">
      {/* Intro */}
      <div className="bg-surface/50 border border-primary/20 rounded-2xl p-6 flex items-start sm:items-center gap-5 shadow-glow">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-textMain mb-1">Colaboración segura JWT</h3>
          <p className="text-sm text-textMuted leading-relaxed">Invita a miembros a tu workspace y asígnales permisos de acceso. Los colaboradores inician sesión con sus propias credenciales mediante autenticación JWT cifrada.</p>
        </div>
      </div>

      {/* Invite Form */}
      <div>
        <h2 className="text-base font-bold text-textMain mb-4 flex items-center gap-2"><Send className="w-4 h-4" /> Agregar miembro</h2>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
            <input 
              type="email" 
              required
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-textMain outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all" 
              placeholder="correo@ejemplo.com" 
              value={inviteEmail} 
              onChange={e => setInviteEmail(e.target.value)} 
            />
          </div>
          <select 
            className="sm:w-40 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-textMain outline-none focus:border-primary transition-all appearance-none cursor-pointer"
            value={inviteRole} 
            onChange={e => setInviteRole(e.target.value)}
          >
            {ROLES.filter(r => r !== 'owner').map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <button type="submit" className="bg-primary hover:bg-primaryHover text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm">
            Invitar
          </button>
        </form>
      </div>

      {/* Members List */}
      <div>
        <div className="flex items-center justify-between mb-4 mt-2">
          <h2 className="text-base font-bold text-textMain flex items-center gap-2"><Users className="w-4 h-4" /> Miembros actuales</h2>
          <span className="bg-primary/20 text-primary px-2.5 py-1 rounded-full text-xs font-bold">{members.length} usuarios</span>
        </div>
        
        <div className="flex flex-col border border-border rounded-2xl bg-surface overflow-hidden">
          {members.map((m, i) => {
            const RoleIcon = ROLE_ICONS[m.role];
            return (
              <div key={m.id} className={`flex items-center justify-between p-4 ${i !== members.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-inner" style={{ backgroundColor: m.color }}>
                    {m.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-textMain">{m.email}</div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-textMuted uppercase tracking-wider font-semibold">
                      <RoleIcon className="w-3 h-3" /> {ROLE_LABELS[m.role]} • {ROLE_DESC[m.role]}
                    </div>
                  </div>
                </div>
                {m.role !== 'owner' && (
                  <button 
                    className="text-xs font-bold text-danger hover:text-white hover:bg-danger px-3 py-1.5 rounded-lg border border-danger/30 transition-all"
                    onClick={() => { setMembers(p => p.filter(x => x.id !== m.id)); toast.success('Colaborador removido'); }}
                  >
                    Quitar
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

export default SharedView;
