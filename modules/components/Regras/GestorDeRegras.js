import { useEffect, useState } from 'react';
import NovaRegraForm from './NovaRegraForm';
import RegraCard from './RegraCard';

export default function GestorDeRegras() {
  const [regras, setRegras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarPendentes, setMostrarPendentes] = useState(false);

  const carregarRegras = async () => {
    setCarregando(true);
    const res = await fetch('/api/regras');
    const data = await res.json();
    setRegras(data);
    setCarregando(false);
  };

  useEffect(() => {
    carregarRegras();
  }, []);

  const regrasFiltradas = mostrarPendentes
    ? regras.filter((r) => !r.aprovada)
    : regras;

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Gestor de Regras</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={mostrarPendentes}
            onChange={() => setMostrarPendentes(!mostrarPendentes)}
          />{' '}
          Mostrar apenas pendentes
        </label>
      </div>

      <NovaRegraForm onCria

