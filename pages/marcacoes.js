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
    data_pretendida: '',
    data_prevista_conclusao: '',
    data_marcacao: '',
    marcado_por: '', // ← deixado vazio para o Formi preencher (ex: "TGPT")
  });

  const [estado, setEstado] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setEstado('sucesso');
      setForm({
        nome: '',
        email: '',
        telefone: '',
        marca: '',
        modelo: '',
        ano: '',
        servicos: '',
        data_pretendida: '',
        data_prevista_conclusao: '',
        data_marcacao: '',
        marcado_por: '',
      });
    } else {
      setEstado('erro');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Marcação de Serviço</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          'nome', 'email', 'telefone', 'marca', 'modelo', 'ano', 'servicos',
          'data_pretendida', 'data_prevista_conclusao', 'data_marcacao', 'marcado_por'
        ].map((field) => (
          <div key={field}>
            <label htmlFor={field} className="block capitalize">{field.replace(/_/g, ' ')}</label>
            <input
              type="text"
              name={field}
              id={field}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        ))}

        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
          Enviar
        </button>
      </form>

      {estado === 'sucesso' && <p className="mt-4 text-green-600">Marcação enviada com sucesso!</p>}
      {estado === 'erro' && <p className="mt-4 text-red-600">Erro ao enviar marcação.</p>}
    </div>
  );
}




