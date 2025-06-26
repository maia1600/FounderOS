import { useEffect, useState } from 'react';

export default function MarcacoesFormi() {
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
    marcado_por: '',
  });

  const [estado, setEstado] = useState(null);
  const [submetido, setSubmetido] = useState(false);

  // Verifica se todos os campos estão preenchidos e ainda não foi submetido
  useEffect(() => {
    const tudoPreenchido = Object.values(form).every((val) => val && val.trim() !== '');
    if (tudoPreenchido && !submetido) {
      handleSubmit();
    }
  }, [form]);

  const handleSubmit = async () => {
    setSubmetido(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setEstado('sucesso');
      } else {
        setEstado('erro');
      }
    } catch (err) {
      console.error('Erro ao submeter:', err);
      setEstado('erro');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Marcação Automática (Formi)</h1>
      <form className="space-y-4">
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
      </form>

      {estado === 'sucesso' && <p className="mt-4 text-green-600">Marcação enviada automaticamente!</p>}
      {estado === 'erro' && <p className="mt-4 text-red-600">Erro ao enviar marcação automaticamente.</p>}
    </div>
  );
}

