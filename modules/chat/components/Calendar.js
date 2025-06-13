'use client';

import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useState } from 'react';

export default function Calendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(event => ({
          title: `${event.nome} - ${event.servicos}`,
          start: new Date(event.start),
          end: new Date(event.end),
          extendedProps: {
            nome: event.nome,
            email: event.email,
            telefone: event.telefone,
            servicos: event.servicos
          }
        }));
        setEvents(formatted);
      });
  }, []);

  const handleDateSelect = async (info) => {
    const nome = prompt('Nome do cliente:');
    if (!nome) return;

    const telefone = prompt('Telefone:');
    const email = prompt('Email:');
    const servicos = prompt('Serviços pedidos:');
    if (!servicos) return;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          telefone,
          servicos,
          start: info.startStr,
          end: info.endStr,
          created_by: 'Utilizador'
        })
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro?.error || 'Erro ao gravar.');
      }

      window.location.reload();
    } catch (err) {
      console.error('Erro ao gravar:', err);
      alert('Erro ao gravar: ' + err.message);
    }
  };

  const handleEventClick = (clickInfo) => {
    const { extendedProps, start, end } = clickInfo.event;
    const detalhes = `
Cliente: ${extendedProps.nome}
Email: ${extendedProps.email}
Telefone: ${extendedProps.telefone}
Serviços: ${extendedProps.servicos}
Início: ${new Date(start).toLocaleString()}
Fim: ${new Date(end).toLocaleString()}
    `;
    alert(detalhes);
  };

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={true}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="auto"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay'
        }}
      />
    </div>
  );
}


