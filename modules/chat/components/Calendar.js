
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
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
        setEvents(formatted);
      });
  }, []);

  const handleDateSelect = async (info) => {
    const title = prompt('Título da marcação:');
    if (!title) return;

    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        start: info.startStr,
        end: info.endStr,
        created_by: 'Utilizador'
      })
    });

    window.location.reload(); // simples por agora
  };

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={true}
        events={events}
        select={handleDateSelect}
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
