"use client";

import { useState } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays 
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

export default function CalendarView({ tasks }: { tasks: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Domingo
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const dateFormat = "MMMM yyyy";
  const days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, "d");
      const cloneDay = day;
      
      // Filter tasks for this day
      const dayTasks = tasks.filter(task => 
        task.deadline && isSameDay(new Date(task.deadline), cloneDay)
      );

      days.push(
        <div
          key={day.toString()}
          className={`min-h-[100px] sm:min-h-[120px] p-2 border border-gray-100 dark:border-gray-800 transition-colors ${
            !isSameMonth(day, monthStart)
              ? "bg-gray-50/50 dark:bg-[#13131a]/50 text-gray-400 dark:text-gray-600"
              : isSameDay(day, new Date())
              ? "bg-purple-50/30 dark:bg-purple-900/10 text-[#8b5cf6] font-semibold"
              : "bg-white dark:bg-[#1a1a24] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f1f2e]"
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm w-7 h-7 flex items-center justify-center rounded-full ${isSameDay(day, new Date()) ? 'bg-[#8b5cf6] text-white' : ''}`}>
              {formattedDate}
            </span>
            {dayTasks.length > 0 && (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 rounded-md">
                {dayTasks.length}
              </span>
            )}
          </div>
          
          <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[80px] custom-scrollbar">
            {dayTasks.map((task) => (
              <div 
                key={task.id} 
                className={`text-xs p-1 px-1.5 rounded border-l-2 truncate cursor-pointer hover:opacity-80 transition-opacity ${
                  task.status === "COMPLETED" 
                    ? "bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-500"
                    : task.priority === "HIGH" || task.priority === "URGENT"
                    ? "bg-red-100/50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-500"
                    : "bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]"
                }`}
                title={`${task.title} - ${task.status}`}
              >
                {task.title}
              </div>
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
  }

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="card p-0 overflow-hidden bg-white dark:bg-[#1a1a24]">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6]">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
              {format(currentDate, dateFormat, { locale: ptBR })}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gerencie seus prazos e entregas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={goToToday} className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-0 mr-2">
            Hoje
          </button>
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button onClick={prevMonth} className="p-1.5 rounded-md text-gray-600 hover:bg-white dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextMonth} className="p-1.5 rounded-md text-gray-600 hover:bg-white dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="w-full">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#13131a]/50">
          {weekDays.map((dayName, i) => (
            <div key={i} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {dayName}
            </div>
          ))}
        </div>
        
        {/* Calendar body */}
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    </div>
  );
}
