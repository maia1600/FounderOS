// /pages/admin/regras.js
import { useEffect, useState } from 'react'

export default function PainelRegras() {
  const [regras, setRegras] = useState([])
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    fetch('/api/regras?filtro=sugestoes')
      .then(res => res.json())
      .then(setRegras)
  }, [])

  async function aprovar(id) {
    setLoading(true)
    setMensagem('')
    try {
      const res = await fetch('/api/regras/aprovar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro desconhecido')

      setMensagem('✅ Regra aprovada com sucesso!')
      setRegras(r => r.filter(regra => regra.id !== id))
    } catch (err) {
      setMensagem('❌ ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Sugestões de Regras por IA</h1>
      {mensagem && <p>{mensagem}</p>}
      {regras.length === 0 && <p>Sem sugestões por aprovar.</p>}
      <ul>
        {regras.map(r => (
          <li key={r.id} style={{ margin: '1rem 0' }}>
            <strong>{r.categoria}</strong>: {r.condicao} → <em>{r.acao}</em>
            <br />
            <button onClick={() => aprovar(r.id)} disabled={loading}>Aprovar</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

