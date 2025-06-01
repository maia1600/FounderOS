import { useState } from 'react';

export default function NovaRegraForm({ onCriar }) {
  const [form, setForm] = useState({
    categoria: '',
    condicao: '',
    acao: '',
    exemplo: ''
  });
  const [mensagem, setMensagem] = useState('');

  const criar = async () => {
    if (!form.categoria || !form.condicao || !form.acao) {
      setMensagem('Preencha os campos obrigatórios.');
      return;
    }

    try {
      const res = await fetch('/api/regras/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Erro do servidor:', data.error || data.detalhe || data);
        setMensagem(data.detalhe || data.error || 'Erro desconhecido.');
        return;
      }

      setForm({ categoria: '', condicao: '', acao: '', exemplo: '' });
      setMensagem('');
      onCriar();
    } catch (err) {
      console.error('Erro na requisição:', err);
      setMensagem(err.message || 'Erro inesperado.');
    }
  };

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '2rem',
      maxWidth: '480px'
    }}>
      <h3><strong>Nova Regra</strong></h3>
      <input
        type="text"
        placeholder="Categoria"
        value={form.categoria}
        onChange={(e) => setForm({ ...form, categoria: e.target.value })}
        style={{ width: '100%', marginBottom: '0.5rem' }}
      />
      <input
        type="text"
        placeholder="Condição"
        value={form.condicao}
        onChange={(e) => setForm({ ...form, condicao: e.target.value })}
        style={{ width: '100%', marginBottom: '0.5rem' }}
      />
      <input
        type="text"
        placeholder="Ação"
        value={form.acao}
        onChange={(e) => setForm({ ...form, acao: e.target.value })}
        style={{ width: '100%', marginBottom: '0.5rem' }}
      />
      <input
        type="text"
        placeholder="Exemplo (opcional)"
        value={form.exemplo}
        onChange={(e) => setForm({ ...form, exemplo: e.target.value })}
        style={{ width: '100%', marginBottom: '0.5rem', fontStyle: 'italic' }}
      />
      <button onClick={criar}>Criar Regra</button>
      {mensagem && (
        <div style={{ color: 'red', marginTop: '0.5rem' }}>{mensagem}</div>
      )}
    </div>
  );
}


