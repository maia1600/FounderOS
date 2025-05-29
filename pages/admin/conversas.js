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

        setConversas(data);
      } catch (err) {
        console.error('Erro ao buscar conversas:', err);
      }
    };

    fetchConversas();
  }, []);

  return (
    <div>
      <h1>Conversas</h1>
      <ul>
        {conversas.map((conv) => (
          <li key={conv.id}>
            {conv.timestamp} - {conv.user_message}
          </li>
        ))}
      </ul>
    </div>
  );
}
