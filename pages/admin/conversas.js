
// pages/admin/conversas.js
import { useEffect, useState } from 'react';

export default function DashboardConversas() {
  const [conversas, setConversas] = useState([]);

  useEffect(() => {
    async function fetchConversas() {
      try {
        const res = await fetch('/api/conversas', {
          headers: {
            'x-dashboard-secret': process.env.NEXT_PUBLIC_DASHBOARD_SECRET,
          },
        });
        const data = await res.json();
        setConversas(data);
      } catch (error) {
        console.error('Erro ao buscar conversas:', error);
      }
    }

    fetchConversas();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Conversas dos Clientes</h1>
      {conversas.map((conv, index) => (
        <div key={index} style={{ borderBottom: '1px solid #ccc', marginBottom: 10, paddingBottom: 10 }}>
          <strong>{new Date(conv.timestamp).toLocaleString()}</strong>
          <p><strong>Cliente:</strong> {conv.user_message}</p>
          <p><strong>TAMAI:</strong> {conv.ai_response}</p>
          <p><strong>Serviço:</strong> {conv.categoria_servico || '-'} | <strong>{conv.marca_carro || '-'}</strong> <strong>{conv.modelo_carro || '-'}</strong> <strong>{conv.ano_carro || '-'}</strong></p>
          <p style={{ color: '#999' }}>Origem: {conv.source_page}</p>
        </div>
      ))}
    </div>
  );
}
