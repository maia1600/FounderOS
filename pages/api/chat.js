// /pages/api/chat.js
import { Pool } from 'pg';
import OpenAI from 'openai';
import rules from '/modules/data/rules';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://tamai.pt');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') return res.status(405).end();

  const { user_message, session_id, source_page } = req.body;
  if (!user_message) return res.status(400).json({ error: 'Mensagem do utilizador em falta.' });

  // 🧠 Formatar regras em linguagem natural
  const regrasFormatadas = rules.map((r) => {
    if (!r.regras) return '';
    return r.regras.map((regra) =>
      `Se o cliente ${regra.condicao.toLowerCase()}, a TAMAI deve ${regra.acao.toLowerCase()}.`
    ).join('\n');
  }).join('\n');

  const systemPrompt = `Responde como assistente da TAMAI. Se possível, baseia a tua resposta nas regras abaixo, mas responde sempre em linguagem natural, adaptada ao cliente.

${regrasFormatadas}

Se não encontrares nenhuma regra aplicável, propõe uma nova sugestão de regra com o seguinte formato:
Categoria: [categoria]
Condição: [condição]
Ação: [ação]
Exemplo: [exemplo, se aplicável]
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: user_message }
      ],
      temperature: 0.4
    });

    const ai_response = completion.choices[0].message.content;

    await pool.query(
      `INSERT INTO conversations (session_id, user_message, ai_response, source_page, timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [session_id, user_message, ai_response, source_page || null]
    );

    await sugerirRegraAPartirDaResposta(ai_response);
    return res.status(200).json({ response: ai_response });

  } catch (err) {
    console.error('Erro no chat:', err);
    return res.status(500).json({ error: 'Erro no servidor.', detalhe: err.message });
  }
}

async function sugerirRegraAPartirDaResposta(resposta) {
  try {
    const regex = /categoria[:\-\u00e0]?\s*(.+?)\s*(?:\n|,)\s*condi[c\u00e7][a\u00e3]o[:\-\u00e0]?\s*(.+?)\s*(?:\n|,)\s*a[c\u00e7][a\u00e3]o[:\-\u00e0]?\s*(.+?)\s*(?:\n|,)?(?:exemplo[:\-\u00e0]?\s*(.+))?/i;
    const match = resposta.match(regex);

    if (!match) return;

    const categoria = match[1]?.trim();
    const condicao = match[2]?.trim();
    const acao = match[3]?.trim();
    const exemplo = match[4]?.trim() || '';

    if (!categoria || !condicao || !acao) return;

    await pool.query(
      `INSERT INTO regras (categoria, condicao, acao, exemplo, ativa, aprovada, sugerida_por_ia)
       VALUES ($1, $2, $3, $4, true, false, true)`,
      [categoria, condicao, acao, exemplo]
    );
  } catch (err) {
    console.error('Erro ao sugerir regra automaticamente:', err);
  }
}






