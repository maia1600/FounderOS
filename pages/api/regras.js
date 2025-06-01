
// Endpoint: /pages/api/regras.js

import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { filtro } = req.query;
  const filePath = path.join(process.cwd(), 'modules', 'data', 'rules-embeddings.mjs');

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const jsonStr = content.replace('export const regras =', '').trim();
    const regras = eval(jsonStr); // Simples, mas cuidado com segurança

    let filtradas = regras.map((r, index) => ({ id: index, ...r, ativa: true }));
    if (filtro === 'sugestoes') filtradas = filtradas.filter(r => r.categoria === 'ia');
    if (filtro === 'ativas') filtradas = filtradas.filter(r => r.ativa);

    res.status(200).json(filtradas);
  } catch (err) {
    console.error('Erro ao ler regras:', err);
    res.status(500).json({ error: 'Erro ao carregar regras.' });
  }
}
