import { Pool } from 'pg';
import OpenAI from 'openai';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id, user_message, source_page } = req.body;

  if (!session_id || !user_message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let ai_reply = "Não consegui entender a sua questão.";

  try {
    // GERA RESPOSTA COM IA
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "És um assistente da TAMAI, um centro automóvel que oferece serviços como pintura automóvel, estofador, detalhe e restauro de plásticos. Responde de forma clara, profissional e curta, incluindo simulação de preço quando possível. Nunca inventes dados técnicos.",
        },
        {
          role: "user",
          content: user_message,
        },
      ],
      temperature: 0.7,
    });

    ai_reply = chatCompletion.choices[0]?.message?.content || ai_reply;

    const metadata = {
      categoria_servico: user_message.toLowerCase().includes("pintura") ? "pintura" : "geral",
      marca_carro: user_message.includes("Golf") ? "Volkswagen" : null,
      modelo_carro: user_message.includes("Golf") ? "Golf" : null,
      ano_carro: user_message.match(/\b(19|20)\d{2}\b/)?.[0] || null,
    };

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
    console.error("Erro ao processar mensagem com IA:", error);
    return res.status(500).json({ error: 'Erro ao gerar resposta com IA' });
  }
}



