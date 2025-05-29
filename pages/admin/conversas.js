import { useEffect, useState } from 'react';

export default function ConversasDashboard() {
  const [conversas, setConversas] = useState([]);

  useEffect(() => {
    const fetchConversas = async () => {
      try {
        const res = await fetch('/api/conversas', {
          headers: {
            'capri123': process.env.NEXT_PUBLIC_DASHBOARD_SECRET,
          },
        });

        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error('Resposta inesperada:', data);
          return;
        }

        // Ordenar por data (mais recente primeiro)
        const ordenadas = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setConversas(ordenadas);
      } catch (err) {
        console.error('Erro ao buscar conversas:', err);
      }
    };

    fetchConversas();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Conversas</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {conversas.map((conv) => (
          <li key={conv.id} style={{ marginBottom: '1rem' }}>
            <strong>{new Date(conv.timestamp).toLocaleString('pt-PT')}:</strong><br />
            <em>{conv.marca_carro} {conv.modelo_carro} ({conv.ano_carro})</em><br />
            <span><strong>Serviço:</strong> {conv.categoria_servico}</span><br />
            <span><strong>Mensagem:</strong> {conv.user_message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
