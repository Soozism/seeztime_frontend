import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg, EventDropArg, EventInput } from '@fullcalendar/core';
import { EventResizeDoneArg } from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { Calendar as CalendarType } from '@fullcalendar/core';

export interface PlannerCalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  allDay?: boolean;
}

interface PlannerCalendarProps {
  events: PlannerCalendarEvent[];
  onDateSelect?: (arg: DateSelectArg) => void;
  onEventClick?: (arg: EventClickArg) => void;
  onEventDrop?: (arg: EventDropArg) => void;
  onEventResize?: (arg: EventResizeDoneArg) => void;
}

const PlannerCalendar: React.FC<PlannerCalendarProps> = ({ events, onDateSelect, onEventClick,onEventDrop,onEventResize }) => {
  // Persian locale texts
  const locale = {
    code: 'fa',
    week: {
      dow: 6, // Saturday
      doy: 12,
    },
    buttonText: {
      today: 'امروز',
      month: 'ماه',
      week: 'هفته',
      day: 'روز',
      list: 'لیست',
    },
    allDayText: 'روز کامل',
    moreLinkText: 'بیشتر',
    noEventsText: 'رویدادی وجود ندارد',
  } as any;

  // Decide initial view based on screen width
  const initialView = window.innerWidth <= 576 ? 'listWeek' : 'dayGridMonth';

  React.useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{
      if(e.key==='ArrowLeft'){
        (document.querySelector('.fc-prev-button') as HTMLElement)?.click();
      }else if(e.key==='ArrowRight'){
        (document.querySelector('.fc-next-button') as HTMLElement)?.click();
      }else if(e.key==='t' || e.key==='T'){
        (document.querySelector('.fc-today-button') as HTMLElement)?.click();
      }else if(e.key==='n' || e.key==='N'){
        const fab=document.querySelector('.planner-fab') as HTMLElement;
        fab?.click();
      }
    };
    window.addEventListener('keydown',handler);
    return()=>window.removeEventListener('keydown',handler);
  },[]);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, bootstrap5Plugin]}
      initialView={initialView}
      headerToolbar={{
        start: 'prev,next today',
        center: 'title',
        end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
      }}
      locale={locale}
      direction="rtl"
      height="100%"
      selectable
      selectMirror
      editable
      eventResizableFromStart
      dayMaxEvents
      events={events as EventInput[]}
      select={onDateSelect}
      eventClick={onEventClick}
      eventDrop={onEventDrop}
      eventResize={onEventResize}
      themeSystem="bootstrap5"
      eventDisplay="block"
      windowResize={({ view })=>{
        const calendar=view.calendar;
        const width=window.innerWidth;
        if(width<=576 && view.type!=='listWeek'){
          calendar.changeView('listWeek');
        } else if(width>576 && view.type==='listWeek'){
          calendar.changeView('dayGridMonth');
        }
      }}
    />
  );
};

export default PlannerCalendar; 