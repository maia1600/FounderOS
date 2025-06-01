// /pages/api/chat.js
import { Pool } from 'pg';
import OpenAI from 'openai';
import path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Importar regras aprovadas
import rules from '/modules/data/rules';

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
    const systemPrompt = `
Responde como assistente da TAMAI com simpatia e profissionalismo.
Tens acesso às seguintes regras de negócio aprovadas, usa-as se fizerem sentido e se encontrares as keywords nos campos exemplo, condição ou categoria:

${rules
  .filter((r) => r.ativa && r.aprovada)
  .map((r) => `Categoria: ${r.categoria}\nCondição: ${r.condicao}\nAção: ${r.acao}${r.exemplo ? `\nExemplo: ${r.exemplo}` : ''}`)
  .join('\n\n')}

Caso nenhuma regra se aplique, responde com base na política geral da TAMAI, em Portugues de Portugal, trata o cliente por você e não por tu, sempre com foco em valor, qualidade e confiança.
Nunca inventes regras se não tiveres informação suficiente e o que não souberes, diz que é melhor perguntar ao colega humano.
Exemplo de tom desejado:
"Olá! Com orçamentos acima de 500€, temos o prazer de oferecer carro de substituição gratuito. É uma forma de garantir o seu conforto enquanto cuidamos do seu carro com todo o detalhe!"
`.trim();

    console.log('[DEBUG] systemPrompt aplicado ao modelo:', systemPrompt);

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








