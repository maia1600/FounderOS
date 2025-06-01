import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'modules', 'data', 'rules.json');

export default function handler(req, res) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const regras = JSON.parse(raw);

  if (req.method === 'GET') {
    return res.status(200).json(regras);
  }

  if (req.method === 'POST') {
    const { id } = req.body;
    const index = regras.findIndex((r) => r.id === id);
    if (index !== -1) regras[index].aprovada = true;
    fs.writeFileSync(filePath, JSON.stringify(regras, null, 2));
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    const novas = regras.filter((r) => r.id !== id);
    fs.writeFileSync(filePath, JSON.stringify(novas, null, 2));
    return res.status(200).json({ success: true });
  }

  if (req.method === 'PUT') {
    const { id, categoria, condicao, acao, exemplo } = req.body;
    const index = regras.findIndex((r) => r.id === id);
    if (index === -1) return res.status(404).json({ error: 'Regra não encontrada' });

    regras[index] = { ...regras[index], categoria, condicao, acao, exemplo };
    fs.writeFileSync(filePath, JSON.stringify(regras, null, 2));
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
}

