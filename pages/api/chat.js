// /pages/api/chat.js
import { Pool } from 'pg';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Ler conteúdo do ficheiro JS como texto e fazer eval seguro
const loadRules = async () => {
  const rulesPath = path.join(process.cwd(), 'modules/data/rules.js');
  const fileContent = await fs.readFile(rulesPath, 'utf-8');
  const rules = eval(fileContent + '\nrules;'); // ← cuidado: só funciona se o último export for `export const rules = [...]`
  return rules;
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://tamai.pt');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { user_message, session_id, source_page } = req.body;
  if (!user_message) return res.status(400).json({ error: 'Mensagem do utilizador em falta.' });

  try {
    const rules = await loadRules();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Responde como assistente da TAMAI. Se possível, extrai regras de negócio úteis no seguinte formato: categoria: ..., condicao: ..., acao: ..., exemplo: ...' },
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
    const regex = /categoria:\s*(.+?),\s*condicao:\s*(.+?),\s*acao:\s*(.+?)(?:,\s*exemplo:\s*(.*))?\.?$/i;
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


