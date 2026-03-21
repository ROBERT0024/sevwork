// SharedView.jsx — Colaboración: workspaces compartidos, roles, invitar
import React, { useState } from 'react';

const MOCK_MEMBERS = [{ id:1, email:'tu@email.com', role:'owner', initials:'TU', color:'#6366f1' }];
const ROLES = ['owner','editor','viewer'];
const ROLE_LABELS = { owner:'👑 Dueño', editor:'✏️ Editor', viewer:'👁 Lector' };
const ROLE_DESC   = { owner:'Control total del workspace', editor:'Puede crear y editar notas y tareas', viewer:'Solo puede ver el contenido' };

function SharedView() {
  const [members, setMembers]       = useState(MOCK_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole]   = useState('editor');
  const [sent, setSent]   = useState(false);
  const [error, setError] = useState('');

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.includes('@')) { setError('Email inválido'); return; }
    const initials = inviteEmail.slice(0,2).toUpperCase();
    const colors   = ['#10b981','#f59e0b','#3b82f6','#8b5cf6','#ec4899'];
    setMembers(prev => [...prev, { id:Date.now(), email:inviteEmail, role:inviteRole, initials, color:colors[members.length % colors.length] }]);
    setInviteEmail(''); setSent(true); setError('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="view-shared">
      <div className="shared-info-block">
        <div className="shared-info-icon">🔒</div>
        <div><h3>Colaboración segura</h3><p>Invita compañeros a tu workspace con roles específicos. Los colaboradores acceden con su propia cuenta JWT.</p></div>
      </div>
      <div className="shared-section">
        <h2>Invitar colaborador</h2>
        <form onSubmit={handleInvite} className="invite-form">
          <input className="invite-email-input" type="email" placeholder="correo@ejemplo.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
          <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="invite-role-select">
            {ROLES.filter(r => r !== 'owner').map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <button type="submit" className="btn-invite">Invitar</button>
        </form>
        {error && <p className="error-bar">{error}</p>}
        {sent && <p className="invite-sent">✅ Invitación enviada</p>}
      </div>
      <div className="shared-section">
        <h2>Roles disponibles</h2>
        <div className="roles-grid">
          {ROLES.map(r => <div key={r} className="role-card"><span className="role-label">{ROLE_LABELS[r]}</span><p className="role-desc">{ROLE_DESC[r]}</p></div>)}
        </div>
      </div>
      <div className="shared-section">
        <h2>Miembros del workspace ({members.length})</h2>
        <div className="members-list">
          {members.map(m => (
            <div key={m.id} className="member-row">
              <div className="member-avatar" style={{ background: m.color }}>{m.initials}</div>
              <div className="member-info">
                <span className="member-email">{m.email}</span>
                <span className="member-role-badge">{ROLE_LABELS[m.role]}</span>
              </div>
              {m.role !== 'owner' && <button className="member-remove" onClick={() => setMembers(p => p.filter(x => x.id !== m.id))}>Quitar</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SharedView;
