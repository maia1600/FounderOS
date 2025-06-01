// /pages/api/chat.js
import { Pool } from 'pg';
import OpenAI from 'openai';

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

  try {
    const regrasExistentes = await carregarRegrasAprovadas();
    const regrasFormatadas = regrasExistentes.map(r =>
      `Categoria: ${r.categoria}\nCondição: ${r.condicao}\nAção: ${r.acao}${r.exemplo ? `\nExemplo: ${r.exemplo}` : ''}`
    ).join('\n\n');

    const systemPrompt = `Responde como assistente da TAMAI. Se possível, usa ou extrai regras de negócio neste formato:\n\nCategoria: [categoria]\nCondição: [condição]\nAção: [ação]\nExemplo: [exemplo, se aplicável]\n\nRegras já existentes:\n${regrasFormatadas}\n\nEvita explicações longas.`;

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

async function carregarRegrasAprovadas() {
  try {
    const result = await pool.query(
      `SELECT categoria, condicao, acao, exemplo FROM regras WHERE ativa = true AND aprovada = true`
    );
    return result.rows;
  } catch (err) {
    console.error('Erro ao carregar regras existentes:', err);
    return [];
  }
}

async function sugerirRegraAPartirDaResposta(resposta) {
  try {
    console.log('[DEBUG] Resposta do AI:', resposta);

    const regex = /categoria[:\-\u00e0]?\s*(.+?)\s*(?:\n|,)\s*condi[c\u00e7][a\u00e3]o[:\-\u00e0]?\s*(.+?)\s*(?:\n|,)\s*a[c\u00e7][a\u00e3]o[:\-\u00e0]?\s*(.+?)\s*(?:\n|,)?(?:exemplo[:\-\u00e0]?\s*(.+))?/i;
    const match = resposta.match(regex);

    if (!match) {
      console.log('[INFO] Nenhuma correspondência de regra encontrada.');
      return;
    }

    const categoria = match[1]?.trim();
    const condicao = match[2]?.trim();
    const acao = match[3]?.trim();
    const exemplo = match[4]?.trim() || '';

    if (!categoria || !condicao || !acao) {
      console.log('[INFO] Dados insuficientes para criar regra.');
      return;
    }

    await pool.query(
      `INSERT INTO regras (categoria, condicao, acao, exemplo, ativa, aprovada, sugerida_por_ia)
       VALUES ($1, $2, $3, $4, true, false, true)`,
      [categoria, condicao, acao, exemplo]
    );

    console.log('[INFO] Regra sugerida com sucesso:', { categoria, condicao, acao, exemplo });
  } catch (err) {
    console.error('Erro ao sugerir regra automaticamente:', err);
  }
}





