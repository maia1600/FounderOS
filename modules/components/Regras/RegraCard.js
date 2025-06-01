import { useState } from 'react';

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
    else setMensagem('Falha ao aprovar');
  };

  const rejeitar = async () => {
    const res = await fetch('/api/regras', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: regra.id })
    });
    if (res.ok) onAtualizar();
    else setMensagem('Falha ao rejeitar');
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
      setMensagem('Falha ao editar');
    }
  };

  const eliminar = async () => {
    if (!confirm('Tem a certeza que deseja eliminar esta regra?')) return;
    const res = await fetch('/api/rules/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: regra.id })
    });
    if (res.ok) onAtualizar();
    else setMensagem('Erro ao eliminar');
  };

  const alternarAtiva = async () => {
    const res = await fetch('/api/rules/toggleAtiva', {
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


