import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function ChatWidget() {
  const [sessionId, setSessionId] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://founder-os-psi.vercel.app/api/chat';

  useEffect(() => {
    let id = localStorage.getItem('session_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('session_id', id);
    }
    setSessionId(id);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || input.trim().length < 5) {
      alert('Por favor, descreva melhor o problema.');
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: input, // <- Este nome precisa bater com o backend
          source_page: 'index2.html',

          // Dados adicionais (podem estar vazios para já)
          categoria_servico: '',
          marca_carro: '',
          modelo_carro: '',
          ano_carro: '',
        }),
      });

      const data = await res.json();
      if (data.response) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (err) {
      console.error('Erro ao comunicar com API:', err);
    }

    setInput('');
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h3>Chat TAMAI</h3>
      <div style={{ border: '1px solid #ccc', padding: 10, minHeight: 300 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', margin: '10px 0' }}>
            <strong>{msg.role === 'user' ? 'Cliente' : 'TAMAI'}:</strong> {msg.content}
          </div>
        ))}
        {loading && <div><em>A escrever…</em></div>}
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escreve a tua pergunta..."
          style={{ flex: 1, padding: 8 }}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
}
