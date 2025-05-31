// modules/components/Regras/AprovarRegraButton.js
import { useState } from 'react'

export default function AprovarRegraButton({ regraId, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)

  const aprovar = async () => {
    setLoading(true)
    setErro(null)
    try {
      const res = await fetch('/api/regras/aprovar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: regraId })
      })

      if (!res.ok) throw new Error('Erro na aprovação')
      onSuccess?.()
    } catch (e) {
      setErro('Falha ao aprovar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={aprovar}
      disabled={loading}
      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
    >
      {loading ? 'A aprovar...' : 'Aprovar'}
      {erro && <span className="text-red-500 ml-2 text-sm">{erro}</span>}
    </button>
  )
}

