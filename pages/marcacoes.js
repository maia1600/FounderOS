import { useState } from 'react';

export default function Marcacoes() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    marca: '',
    modelo: '',
    ano: '',
    servicos: '',
    observacoes: '',
    created_by: 'Tânia', // Valor fixo e invisível
  });

  const [estado, setEstado] = useState(null);

const handleSubmit = async (e) => {
  e.preventDefault();
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: form.nome || 'teste',
      email: form.email,
      telefone: form.telefone,
      servicos: form.servicos || 'revisao geral',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3600000).toISOString(), // +1h
      created_by: 'Tânia',
    }),
  });

  if (res.ok) {
    setEstado('sucesso');
    setForm({ nome: '', email: '', telefone: '', marca: '', modelo: '', ano: '', servicos: '', observacoes: '' });
  } else {
    setEstado('erro');
  }
};


  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Marcação de Serviço</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {['nome', 'email', 'telefone', 'marca', 'modelo', 'ano', 'servicos', 'observacoes'].map((field) => (
          <div key={field}>
            <label className="block capitalize">{field}</label>
            <input
              type="text"
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        ))}

        {/* Campo hidden com o valor "Tânia" */}
        <input type="hidden" value="Tânia" />

        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
          Enviar
        </button>
      </form>
      {estado === 'sucesso' && <p className="mt-4 text-green-600">Marcação enviada com sucesso!</p>}
      {estado === 'erro' && <p className="mt-4 text-red-600">Erro ao enviar marcação.</p>}
    </div>
  );
}

