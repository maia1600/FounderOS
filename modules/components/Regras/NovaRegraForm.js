import { useState } from 'react';

export default function NovaRegraForm({ onCriar }) {
  const [form, setForm] = useState({
    categoria: '',
    condicao: '',
    acao: '',
    exemplo: ''
  });
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/regras/criar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      setForm({ categoria: '', condicao: '', acao: '', exemplo: '' });
      setMensagem('');
      onCriar(); // Atualiza a lista de regras
    } else {
      setMensagem('Erro ao criar a regra.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Nova Regra</h3>
      <input
        placeholder="Categoria"
        value={form.categoria}
        onChange={(e) => setForm({ ...form, categoria: e.target.value })}
        required
      /><br />
      <input
        placeholder="Condição"
        value={form.condicao}
        onChange={(e) => setForm({ ...form, condicao: e.target.value })}
        required
      /><br />
      <input
        placeholder="Ação"
        value={form.acao}
        onChange={(e) => setForm({ ...form, acao: e.target.value })}
        required
      /><br />
      <input
        placeholder="Exemplo (opcional)"
        value={form.exemplo}
        onChange={(e) => setForm({ ...form, exemplo: e.target.value })}
      /><br />
      <button type="submit">Criar Regra</button>
      {mensagem && <div style={{ color: 'red', marginTop: '0.5rem' }}>{mensagem}</div>}
    </form>
  );
}

