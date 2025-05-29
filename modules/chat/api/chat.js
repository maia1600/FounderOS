import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id, user_message, source_page } = req.body;

  if (!session_id || !user_message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Simular resposta (podes trocar depois por IA real)
  const ai_reply = `Simulação: baseado na sua mensagem, o serviço pode custar entre 100€ e 200€.`;

  // Simular extração de metadados (substituir por lógica GPT no futuro)
  const metadata = {
    categoria_servico: user_message.toLowerCase().includes("pintura") ? "pintura" : "geral",
    marca_carro: user_message.includes("Golf") ? "Volkswagen" : null,
    modelo_carro: user_message.includes("Golf") ? "Golf" : null,
    ano_carro: user_message.match(/\b(19|20)\d{2}\b/)?.[0] || null,
  };

  try {
    await pool.query(
      `INSERT INTO conversations 
        (session_id, user_message, ai_response, source_page, categoria_servico, marca_carro, modelo_carro, ano_carro)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        session_id,
        user_message,
        ai_reply,
        source_page || null,
        metadata.categoria_servico,
        metadata.marca_carro,
        metadata.modelo_carro,
        metadata.ano_carro,
      ]
    );

    return res.status(200).json({ response: ai_reply, metadata });
  } catch (error) {
    console.error('Erro ao gravar no Neon:', error);
    return res.status(500).json({ error: 'Erro interno ao gravar a conversa' });
  }
}
