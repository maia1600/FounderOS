
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { categoria, condicao, acao, exemplo } = req.body;

  if (!categoria || !condicao || !acao) {
    return res.status(400).json({ error: 'Campos obrigatórios em falta.' });
  }

  const filePath = path.join(process.cwd(), 'modules', 'data', 'rules.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const regras = JSON.parse(raw);

  const novaRegra = {
    id: uuidv4(),
    categoria,
    condicao,
    acao,
    exemplo: exemplo || '',
    ativa: true
  };

  regras.push(novaRegra);
  fs.writeFileSync(filePath, JSON.stringify(regras, null, 2));

  return res.status(201).json({ success: true, regra: novaRegra });
}
