// Caminho: modules/components/Regras/AprovarRegraButton.js
import { useState } from 'react'

export default function AprovarRegraButton({ id, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)

  const aprovar = async () => {
    setLoading(true)
    setErro(null)
    try {
      const res = await fetch('/api/regras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (!res.ok) throw new Error('Erro ao aprovar')
      onSuccess()
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={aprovar} disabled={loading} className="px-3 py-1 bg-green-600 text-white rounded">
      {loading ? 'Aprovar...' : '✅ Aprovar'}
      {erro && <p className="text-red-500 text-sm">{erro}</p>}
    </button>
  )
}
