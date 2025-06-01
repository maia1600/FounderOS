import { useState } from 'react';
import AtivarRegraButton from './AtivarRegraButton';

export default function RegraCard({ regra, onAtualizar }) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    categoria: regra.categoria,
    condicao: regra.condicao,
    acao: regra.acao,
    exemplo: regra.exemplo || ''
  });
  const [mensagem, setMensagem] = useState('');

  const aprovar = async () => {
    const res = await fetch('/api/regras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: regra.id })
    });
    if (res.ok) onAtualizar();
    else setMensagem('Erro ao aprovar');
  };

  const rejeitar = async () => {
    const res = await fetch('/api/regras/rejeitar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: regra.id })
    });
    if (res.ok) onAtualizar();
    else setMensagem('Erro ao rejeitar');
  };

  const editar = async () => {
    const res = await fetch('/api/regras', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: regra.id, ...form })
    });
    if (res.ok) {
      setEditando(false);
      onAtualizar();
    } else {
      setMensagem('Erro ao editar');
    }
  };

  const eliminar = async () => {
    if (!confirm('Tem a certeza que deseja eliminar esta regra?')) return;
    const res = await fetch('/api/regras/eliminar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: regra.id })
    });
    if (res.ok) onAtualizar();
    else setMensagem('Erro ao eliminar');
  };

  const alternarAtiva = async () => {
    const res = await fetch('/api/regras/alternar-ativa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: regra.id, ativa: !regra.ativa })
    });
    if (res.ok) onAtualizar();
    else setMensagem('Erro ao ativar/inativar');
  };

  return (
    <li style={{ marginBottom: '1.5rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
      {editando ? (
        <div>
          <input
            placeholder="Categoria"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          /><br />
          <input
            placeholder="Condição"
            value={form.condicao}
            onChange={(e) => setForm({ ...form, condicao: e.target.value })}
          /><br />
          <input
            placeholder="Ação"
            value={form.acao}
            onChange={(e) => setForm({ ...form, acao: e.target.value })}
          /><br />
          <input
            placeholder="Exemplo"
            value={form.exemplo}
            onChange={(e) => setForm({ ...form, exemplo: e.target.value })}
          /><br />
          <button onClick={editar}>Guardar</button>{' '}
          <button onClick={() => setEditando(false)}>Cancelar</button>
        </div>
      ) : (
        <div>
          <strong>Categoria:</strong> {regra.categoria}<br />
          <strong>Condição:</strong> {regra.condicao}<br />
          <strong>Ação:</strong> {regra.acao}<br />
          {regra.exemplo && (
            <><strong>Exemplo:</strong> {regra.exemplo}<br /></>
          )}
          <strong>Estado:</strong> {regra.ativa ? 'Ativa ✅' : 'Inativa ❌'}<br />
          <strong>Aprovada:</strong> {regra.aprovada ? 'Sim' : 'Não'}
        </div>
      )}

      {!editando && (
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={aprovar}>Aprovar</button>
          <button onClick={rejeitar}>Rejeitar</button>
          <button onClick={() => setEditando(true)}>Editar</button>
          <button onClick={eliminar}>Eliminar</button>
          <AtivarRegraButton ativa={regra.ativa} onClick={alternarAtiva} />
        </div>
      )}

      {mensagem && <div style={{ color: 'red', marginTop: '0.5rem' }}>{mensagem}</div>}
    </li>
  );
}



