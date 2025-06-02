// /pages/api/chat.js
import { Pool } from 'pg';
import OpenAI from 'openai';
import path from 'path';
import fs from 'fs';

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
    const regrasFormatadas = rules
      .filter((r) => r.ativa && r.aprovada)
      .map((r) => `Categoria: ${r.categoria}\nCondição: ${r.condicao}\nAção: ${r.acao}${r.exemplo ? `\nExemplo: ${r.exemplo}` : ''}`)
      .join('\n\n');

    const systemPrompt = `
És o assistente oficial da TAMAI. Responde sempre com simpatia, clareza e profissionalismo — e usa apenas português de Portugal.

Tens acesso às regras de negócio aprovadas pela TAMAI, descritas abaixo. Se alguma delas se aplicar à pergunta do cliente, deves sempre basear a tua resposta nessa regra. Adapta a linguagem para parecer natural e fluida, como se fosses humano.

Se não houver nenhuma correspondência clara, responde com base na política geral da TAMAI: qualidade, confiança, transparência e foco no cliente. Não inventes regras novas.



Estas são as regras disponíveis:
${regrasFormatadas}`.trim();

    console.log('[DEBUG] systemPrompt aplicado ao modelo:', systemPrompt);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: user_message }
      ],
      temperature: 0.3
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





// 👇 Carregar ficheiros de conhecimento
const loadAllKnowledge = () => {
  const dirPath = path.join(process.cwd(), 'modules', 'knowledge');
  if (!fs.existsSync(dirPath)) return [];
  const files = fs.readdirSync(dirPath);
  return files
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
      return JSON.parse(content);
    });
};

// 👇 Extrair serviços mencionados na mensagem
const extrairServicosDaMensagem = (mensagem, knowledgeBase) => {
  const encontrados = [];

  for (const categoria of knowledgeBase) {
    for (const servico of categoria.servicos || []) {
      const match = servico.keywords.every(palavra =>
        mensagem.toLowerCase().includes(palavra)
      );
      if (match) encontrados.push(servico);
    }
  }

  return encontrados;
};



try {
  // 1. Tentar responder com base no conhecimento
  const knowledgeBase = loadAllKnowledge();
  const servicosEncontrados = extrairServicosDaMensagem(user_message, knowledgeBase);

  if (servicosEncontrados.length > 0) {
    let resposta = 'Aqui vai uma estimativa:\n\n';
    let total = 0;

    servicosEncontrados.forEach((s) => {
      resposta += `• ${s.nome}: ${s.preco}€ + IVA\n`;
      total += s.preco;
    });

    resposta += `\n💰 Total estimado: ${total}€ + IVA\n`;
    resposta += `\nEstes valores são indicativos e sujeitos a avaliação presencial.`;

    await pool.query(
      `INSERT INTO conversations (session_id, user_message, ai_response, source_page, timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [session_id, user_message, resposta, source_page || null]
    );

    return res.status(200).json({ response: resposta });
  }

  // 2. Preparar regras para o modelo
  const regrasFormatadas = rules
    .filter((r) => r.ativa && r.aprovada)
    .map((r) =>
      `Categoria: ${r.categoria}\nCondição: ${r.condicao}\nAção: ${r.acao}${r.exemplo ? `\nExemplo: ${r.exemplo}` : ''}`
    )
    .join('\n\n');

  const systemPrompt = `
És o assistente oficial da TAMAI. Responde sempre com simpatia, clareza e profissionalismo — e usa apenas português de Portugal.

Tens acesso às regras de negócio aprovadas pela TAMAI, descritas abaixo. Se alguma delas se aplicar à pergunta do cliente, deves sempre basear a tua resposta nessa regra. Adapta a linguagem para parecer natural e fluida, como se fosses humano.

Se não houver nenhuma correspondência clara, responde com base na política geral da TAMAI: qualidade, confiança, transparência e foco no cliente. Não inventes regras novas.

Estas são as regras disponíveis:
${regrasFormatadas}`.trim();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: user_message }
    ],
    temperature: 0.3
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

// 👇 Função de sugestão de regras automáticas com regex
async function sugerirRegraAPartirDaResposta(resposta) {
  try {
    console.log('[DEBUG] Resposta do AI:', resposta);

    const regex = /categoria[:\-\u00e0]?\s*(.+?)\s*(?:\n|,)\s*condi[cç][aã]o[:\-\u00e0]?\s*(.+?)\s*(?:\n|,)\s*a[cç][aã]o[:\-\u00e0]?\s*(.+?)\s*(?:\n|,)?(?:exemplo[:\-\u00e0]?\s*(.+))?/i;
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

  }








