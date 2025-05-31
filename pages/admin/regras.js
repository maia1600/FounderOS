
// Layout simplificado do Dashboard de Regras TAMAI (React + Tailwind + shadcn/ui)

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function DashboardRegras() {
  const [regras, setRegras] = useState([])
  const [filtro, setFiltro] = useState("ativas")

  useEffect(() => {
    fetch(`/api/regras?filtro=${filtro}`)
      .then((res) => res.json())
      .then(setRegras)
  }, [filtro])

  const aprovarSugestao = async (id) => {
    await fetch(`/api/regras/aprovar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setRegras((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Painel de Regras TAMAI</h1>

      <Tabs defaultValue="ativas" onValueChange={setFiltro}>
        <TabsList>
          <TabsTrigger value="ativas">Regras Ativas</TabsTrigger>
          <TabsTrigger value="sugestoes">Sugestões da IA</TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {regras.map((r) => (
          <Card key={r.id}>
            <CardContent className="space-y-2 p-4">
              <div className="text-sm text-muted-foreground">Categoria: {r.categoria}</div>
              <div className="font-semibold">Condição: {r.condicao}</div>
              <div className="">Ação: {r.acao}</div>
              {r.exemplo && <div className="text-sm italic">Ex: {r.exemplo}</div>}

              {filtro === "sugestoes" ? (
                <Button onClick={() => aprovarSugestao(r.id)}>✅ Aprovar e Ativar</Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Ativa</span>
                  <Switch defaultChecked={r.ativa} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
