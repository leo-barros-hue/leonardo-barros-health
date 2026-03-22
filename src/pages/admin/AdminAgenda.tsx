import React, { useState, useEffect } from 'react';
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
  addDays, 
  subDays,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Circle, 
  Loader2,
  X,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskStatus, STATUS_COLORS, STATUS_CONFIG } from '@/components/agenda/types';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'patient_calendar_tasks';

export default function AdminAgenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState<TaskStatus>('pendente');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (savedTasks) {
      try { setTasks(JSON.parse(savedTasks)); } catch (e) { console.error('Failed to load tasks', e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const nextPeriod = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const prevPeriod = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const onDateClick = (day: Date) => setSelectedDate(day);

  const handleAddTask = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setTime('');
    setStatus('pendente');
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setTime(task.time || '');
    setStatus(task.status);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsStatusDropdownOpen(false);
  };

  const handleDeleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    const taskData: Task = {
      id: editingTask?.id || crypto.randomUUID(),
      title,
      description,
      time,
      date: format(selectedDate, 'yyyy-MM-dd'),
      status,
    };
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? taskData : t));
    } else {
      setTasks([...tasks, taskData]);
    }
    closeModal();
  };

  const toggleStatus = (task: Task) => {
    const statusOrder: TaskStatus[] = ['pendente', 'em-andamento', 'concluido'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
  };

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row items-center justify-between px-4 py-6 bg-card border-b border-border gap-4">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-foreground capitalize">
          {viewMode === 'day' 
            ? format(currentDate, "d 'de' MMMM yyyy", { locale: ptBR })
            : format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <p className="text-sm text-muted-foreground">Organização de rotina e consultas</p>
      </div>

      <div className="flex bg-muted p-1 rounded-xl">
        {(['month', 'week', 'day'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={cn(
              "px-4 py-1.5 text-sm font-bold rounded-lg transition-all capitalize",
              viewMode === mode 
                ? "bg-card text-primary shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {mode === 'month' ? 'Mês' : mode === 'week' ? 'Semana' : 'Dia'}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={prevPeriod} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors border border-border"
        >
          Hoje
        </button>
        <button onClick={nextPeriod} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return (
      <div className="grid grid-cols-7 border-b border-border bg-muted/50">
        {days.map((day, i) => (
          <div key={i} className="py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const rows: React.ReactNode[] = [];
    let days: React.ReactNode[] = [];

    calendarDays.forEach((day, i) => {
      const formattedDate = format(day, 'yyyy-MM-dd');
      const dayTasks = tasks.filter(t => t.date === formattedDate);
      const isSelected = isSameDay(day, selectedDate);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = isSameDay(day, new Date());

      days.push(
        <div
          key={day.toString()}
          className={cn(
            "min-h-[120px] h-full p-2 border-r border-b border-border transition-all cursor-pointer group relative pb-10",
            !isCurrentMonth ? "bg-muted/30 text-muted-foreground/50" : "bg-card text-foreground hover:bg-muted/30",
            isSelected && "bg-primary/5 ring-2 ring-primary ring-inset z-10"
          )}
          onClick={() => onDateClick(day)}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={cn(
              "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors",
              isToday ? "bg-primary text-primary-foreground" : "",
              isSelected && !isToday ? "text-primary" : ""
            )}>
              {format(day, 'd')}
            </span>
            {dayTasks.length > 0 && (
              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {dayTasks.length}
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            {dayTasks.map(task => (
              <div 
                key={task.id}
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 border transition-all",
                  STATUS_COLORS[task.status],
                  task.status === 'concluido' && "opacity-60 line-through"
                )}
              >
                <div className={cn("w-1 h-1 rounded-full shrink-0", STATUS_CONFIG[task.status].dot)} />
                {task.time && <span className="opacity-80 text-[8px] shrink-0 font-bold">{task.time}</span>}
                <span className="truncate font-medium">{task.title}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); onDateClick(day); handleAddTask(); }}
            className="absolute bottom-2 right-2 p-1 bg-primary text-primary-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          >
            <Plus size={14} />
          </button>
        </div>
      );

      if ((i + 1) % 7 === 0) {
        rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>);
        days = [];
      }
    });

    return <div className="bg-card">{rows}</div>;
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate);
    const endDate = endOfWeek(currentDate);
    const weekDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 h-full bg-card">
        {weekDays.map((day) => {
          const formattedDate = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks.filter(t => t.date === formattedDate)
            .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-[calc(100vh-200px)] p-4 border-r border-border transition-all cursor-pointer group relative pb-16",
                isSelected && "bg-primary/5 ring-2 ring-primary ring-inset z-10"
              )}
              onClick={() => onDateClick(day)}
            >
              <div className="flex flex-col items-center mb-6">
                <span className="text-xs font-bold uppercase text-muted-foreground mb-1">
                  {format(day, 'EEE', { locale: ptBR })}
                </span>
                <span className={cn(
                  "text-xl font-bold w-10 h-10 flex items-center justify-center rounded-full transition-colors",
                  isToday ? "bg-primary text-primary-foreground" : "text-foreground",
                  isSelected && !isToday ? "text-primary" : ""
                )}>
                  {format(day, 'd')}
                </span>
              </div>

              <div className="space-y-2">
                {dayTasks.map(task => (
                  <div 
                    key={task.id}
                    className={cn(
                      "text-xs p-2 rounded-lg flex flex-col gap-1 shadow-sm border transition-all",
                      STATUS_COLORS[task.status],
                      task.status === 'concluido' && "opacity-60 line-through"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      {task.time && <span className="text-[10px] font-bold opacity-70">{task.time}</span>}
                      <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_CONFIG[task.status].dot)} />
                    </div>
                    <span className="font-bold leading-tight truncate">{task.title}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); onDateClick(day); handleAddTask(); }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 bg-primary text-primary-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <Plus size={18} />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayTasks = tasks.filter(t => t.date === format(currentDate, 'yyyy-MM-dd'))
      .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

    return (
      <div className="bg-card min-h-full p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                <span className="text-xs font-bold uppercase opacity-80">{format(currentDate, 'EEE', { locale: ptBR })}</span>
                <span className="text-2xl font-bold">{format(currentDate, 'd')}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Agenda do Dia</h3>
                <p className="text-muted-foreground">{dayTasks.length} tarefas programadas</p>
              </div>
            </div>
            <button 
              onClick={handleAddTask}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Adicionar
            </button>
          </div>

          <div className="space-y-4">
            {dayTasks.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl">
                <p className="text-muted-foreground font-medium">Nenhum compromisso para hoje.</p>
              </div>
            ) : (
              dayTasks.map((task, idx) => (
                <div key={task.id} className="flex gap-6 group">
                  <div className="w-16 pt-2 flex flex-col items-center">
                    <span className="text-sm font-bold text-muted-foreground">{task.time || '--:--'}</span>
                    {idx !== dayTasks.length - 1 && <div className="w-0.5 flex-1 bg-border my-2" />}
                  </div>
                  <div className={cn(
                    "flex-1 p-5 rounded-2xl border transition-all flex items-start justify-between",
                    task.status === 'concluido' ? "bg-muted border-border" : "bg-card border-border shadow-sm hover:shadow-md"
                  )}>
                    <div className="flex gap-4">
                      <div className={cn("w-1.5 h-12 rounded-full", STATUS_CONFIG[task.status].dot)} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-tighter flex items-center gap-1.5",
                            STATUS_COLORS[task.status]
                          )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_CONFIG[task.status].dot)} />
                            {STATUS_CONFIG[task.status].label}
                          </span>
                        </div>
                        <h4 className={cn(
                          "text-lg font-bold text-foreground",
                          task.status === 'concluido' && "line-through text-muted-foreground"
                        )}>{task.title}</h4>
                        {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditTask(task)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const selectedDayTasks = tasks
    .filter(t => t.date === format(selectedDate, 'yyyy-MM-dd'))
    .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col border-r border-border">
        {renderHeader()}
        <div className="flex-1 overflow-auto">
          <div className={cn(viewMode === 'month' ? "min-w-[800px]" : "min-w-full")}>
            {viewMode === 'month' && (
              <>
                {renderDays()}
                {renderMonthView()}
              </>
            )}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}
          </div>
        </div>
      </div>

      {/* Side Panel: Day Details */}
      <div className="w-full md:w-96 bg-card flex flex-col h-full sticky top-0 shadow-xl z-20">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h3>
          <p className="text-sm text-muted-foreground">Tarefas agendadas para este dia</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedDayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="text-muted-foreground" size={32} />
              </div>
              <p className="text-muted-foreground font-medium">Nenhuma tarefa para este dia.</p>
              <button onClick={handleAddTask} className="mt-4 text-primary font-semibold text-sm hover:underline">
                Adicionar primeira tarefa
              </button>
            </div>
          ) : (
            selectedDayTasks.map(task => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={task.id}
                className={cn(
                  "p-4 rounded-xl border transition-all group relative",
                  task.status === 'concluido' ? "bg-muted border-border" : "bg-card border-border shadow-sm hover:shadow-md"
                )}
              >
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => toggleStatus(task)}
                    className={cn("mt-1 transition-colors", STATUS_CONFIG[task.status].color)}
                  >
                    {task.status === 'concluido' ? <CheckCircle2 size={20} /> : 
                     task.status === 'em-andamento' ? <Loader2 size={20} className="animate-spin" /> : 
                     <Circle size={20} />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {task.time && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                          <Clock size={12} />
                          {task.time}
                        </span>
                      )}
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-tighter flex items-center gap-1.5",
                        STATUS_COLORS[task.status]
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_CONFIG[task.status].dot)} />
                        {STATUS_CONFIG[task.status].label}
                      </span>
                    </div>
                    
                    <h4 className={cn(
                      "font-bold text-foreground break-words",
                      task.status === 'concluido' && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </h4>
                    
                    {task.description && (
                      <p className={cn(
                        "text-sm text-muted-foreground mt-1 line-clamp-2",
                        task.status === 'concluido' && "opacity-60"
                      )}>
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditTask(task)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="p-6 bg-muted/50 border-t border-border">
          <button 
            onClick={handleAddTask}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Plus size={20} />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden border border-border"
            >
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="text-xl font-bold text-foreground">
                  {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Título da Tarefa
                  </label>
                  <input 
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Horário (Opcional)
                    </label>
                    <input 
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                      className={cn(
                        "w-full px-4 py-2 rounded-lg border flex items-center justify-between transition-all text-sm font-medium",
                        STATUS_COLORS[status]
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[status].dot)} />
                        {STATUS_CONFIG[status].label}
                      </div>
                      <ChevronDown size={16} className={cn("transition-transform", isStatusDropdownOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {isStatusDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setIsStatusDropdownOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden"
                          >
                            {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => { setStatus(s); setIsStatusDropdownOpen(false); }}
                                className={cn(
                                  "w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-sm font-medium border-b border-border/50 last:border-0",
                                  status === s ? "bg-muted" : ""
                                )}
                              >
                                <div className={cn("w-2.5 h-2.5 rounded-full", STATUS_CONFIG[s].dot)} />
                                <span className={STATUS_CONFIG[s].color}>{STATUS_CONFIG[s].label}</span>
                                {status === s && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Descrição (Opcional)
                  </label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhes adicionais..."
                    rows={3}
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 border border-border text-muted-foreground font-bold rounded-xl hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg transition-all"
                  >
                    Salvar Tarefa
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
