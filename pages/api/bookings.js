// pages/api/bookings.js
import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const {
    nome,
    email,
    telefone,
    servicos,
    marca,
    modelo,
    ano,
    start,
    end,
    data_marcacao,
    marcado_por
  } = req.body;

  if (!nome || !email || !telefone || !servicos || !marca || !modelo || !ano || !start || !end || !data_marcacao || !marcado_por) {
    return res.status(400).json({ error: "Campos obrigatórios em falta" });
  }

  try {
    await sql`
      INSERT INTO bookings (
        nome, email, telefone, servicos, marca, modelo, ano, start, end, data_marcacao, marcado_por, created_at
      ) VALUES (
        ${nome}, ${email}, ${telefone}, ${servicos}, ${marca}, ${modelo}, ${ano}, ${start}, ${end}, ${data_marcacao}, ${marcado_por}, NOW()
      )
    `;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro ao inserir marcação:", error);
    return res.status(500).json({ error: "Erro ao inserir marcação" });
  }
}
