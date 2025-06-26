import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function parseData(val) {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/;
  const match = regex.exec(val.trim());
  if (match) {
    const [, dd, mm, yyyy, hh = '00', min = '00'] = match;
    const iso = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    return new Date(iso).toISOString();
  }
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d.toISOString();
  throw new Error(`Data inválida: ${val}`);
}

export default async function handler(req, res) {
  // cabeçalhos e OPTIONS…
  if (req.method === 'POST') {
    const {
      nome, email, telefone, marca, modelo, ano,
      servicos, data_pretendida, data_prevista_conclusao,
      data_marcacao, marcado_por
    } = req.body;

    if (![nome, email, telefone, marca, modelo, ano,
      servicos, data_pretendida, data_prevista_conclusao,
      data_marcacao, marcado_por].every(f => f && f.trim() !== '')
    ) {
      return res.status(400).json({ error: 'Campos obrigatórios em falta.' });
    }

    try {
      await pool.query(
        `INSERT INTO bookings (
          nome,email,telefone,marca,modelo,ano,servicos,
          data_pretendida,data_prevista_conclusao,data_marcacao,marcado_por
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
        )`,
        [
          nome, email, telefone, marca, modelo, ano, servicos,
          parseData(data_pretendida),
          parseData(data_prevista_conclusao),
          parseData(data_marcacao),
          marcado_por
        ]
      );
      return res.status(201).json({ success: true, message: 'Gravado!' });
    } catch (err) {
      console.error('❌ Erro ao gravar marcação:', err.message);
      return res.status(500).json({ error: 'Erro ao gravar marcação.', details: err.message });
    }
  }

  // GET e fallback…
}

