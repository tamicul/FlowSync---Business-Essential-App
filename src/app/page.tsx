"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, CheckCircle2, Clock, Plus, Mic, Bell, Settings,
  Zap, TrendingUp, Users, MapPin, Sun, CloudRain,
  ChevronRight, MoreHorizontal, BrainCircuit, Sparkles, Target, Timer,
  GripVertical, X, ChevronLeft, Check
} from "lucide-react";
import { format, addDays, startOfDay, addHours, isSameDay } from "date-fns";

// Types
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  duration: number;
  energyRequired?: number;
  completed: boolean;
  category?: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
}

interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: "MEETING" | "FOCUS_TIME" | "TASK_BLOCK" | "BREAK" | "APPOINTMENT";
  attendees?: number;
  location?: string;
}

interface AIInsight {
  type: "tip" | "warning" | "suggestion";
  message: string;
  action?: string;
}

// Initial Mock Data
const initialTasks: Task[] = [
  { id: "1", title: "Review Q4 Budget Proposal", priority: "HIGH", duration: 60, energyRequired: 4, completed: false, category: "Finance", status: "TODO" },
  { id: "2", title: "Prepare Client Presentation", priority: "HIGH", duration: 90, energyRequired: 5, completed: false, category: "Sales", status: "IN_PROGRESS" },
  { id: "3", title: "Team Standup Notes", priority: "MEDIUM", duration: 15, energyRequired: 2, completed: true, category: "Operations", status: "DONE" },
  { id: "4", title: "Email Campaign Review", priority: "MEDIUM", duration: 45, energyRequired: 3, completed: false, category: "Marketing", status: "TODO" },
  { id: "5", title: "Update Documentation", priority: "LOW", duration: 30, energyRequired: 2, completed: false, category: "Product", status: "REVIEW" },
];

const today = new Date();
const initialEvents: Event[] = [
  { id: "1", title: "Deep Work: Strategy Planning", startTime: addHours(startOfDay(today), 9).toISOString(), endTime: addHours(startOfDay(today), 11).toISOString(), type: "FOCUS_TIME", description: "High-focus work block" },
  { id: "2", title: "Client Call - TechCorp", startTime: addHours(startOfDay(today), 14).toISOString(), endTime: addHours(startOfDay(today), 15).toISOString(), type: "MEETING", attendees: 4, location: "Zoom" },
  { id: "3", title: "Lunch Break", startTime: addHours(startOfDay(today), 12).toISOString(), endTime: addHours(startOfDay(today), 13).toISOString(), type: "BREAK" },
  { id: "4", title: "Team Standup", startTime: addHours(startOfDay(today), 16).toISOString(), endTime: addHours(startOfDay(today), 16.5).toISOString(), type: "MEETING", attendees: 8, location: "Conference Room B" },
];

const initialInsights: AIInsight[] = [
  { type: "tip", message: "Your peak focus time is 9-11 AM. Perfect for deep work!", action: "Schedule important tasks" },
  { type: "warning", message: "You have 3 back-to-back meetings this afternoon. Consider adding buffers.", action: "Auto-fix schedule" },
  { type: "suggestion", message: "Based on traffic, leave by 1:45 PM for your 2:00 PM meeting.", action: "Set reminder" },
];

// Voice Input Component
function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      onTranscript("Schedule meeting with John tomorrow at 2pm");
    }, 2000);
  };

  return (
    <div className="relative">
      <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
        isListening ? "bg-red-500/10 border-red-500/30" : "bg-zinc-900/50 border-white/[0.06] hover:border-white/10"
      }`}>
        <button
          onClick={startListening}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            isListening ? "bg-red-500 text-white" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
          }`}
        >
          {isListening ? (
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 bg-white rounded-full animate-pulse" style={{ height: "12px", animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
        <div className="flex-1">
          {isListening ? (
            <span className="text-sm text-red-400">Listening...</span>
          ) : (
            <p className="text-sm text-zinc-400">Click to speak: &quot;Schedule a meeting with John tomorrow at 2pm&quot;</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Energy Map Component
function EnergyMap() {
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);
  
  const getEnergyLevel = (hour: number) => {
    if (hour >= 9 && hour <= 11) return { color: "bg-emerald-500" };
    if (hour >= 14 && hour <= 16) return { color: "bg-yellow-500" };
    if (hour >= 20) return { color: "bg-red-500" };
    return { color: "bg-blue-500" };
  };

  return (
    <div className="bg-zinc-900/50 rounded-2xl p-5 border border-white/[0.06]">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-yellow-400" />
        Energy Map
      </h3>
      <div className="flex gap-1">
        {hours.map((hour) => {
          const energy = getEnergyLevel(hour);
          return (
            <div key={hour} className="flex-1 group cursor-pointer">
              <div className={`h-12 rounded-lg ${energy.color} opacity-80 hover:opacity-100 transition-opacity`} />
              <p className="text-[10px] text-zinc-500 text-center mt-1">{hour}</p>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500" /><span className="text-zinc-400">Peak</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-500" /><span className="text-zinc-400">Good</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500" /><span className="text-zinc-400">Moderate</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500" /><span className="text-zinc-400">Low</span></div>
      </div>
    </div>
  );
}

// AI Insights Panel
function AIInsightsPanel({ insights, onDismiss }: { insights: AIInsight[], onDismiss: (index: number) => void }) {
  return (
    <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl p-5 border border-violet-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">AI Insights</h3>
        </div>
        <Sparkles className="w-4 h-4 text-violet-400" />
      </div>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className={`p-3 rounded-xl border ${
            insight.type === "warning" ? "bg-red-500/5 border-red-500/20" :
            insight.type === "suggestion" ? "bg-blue-500/5 border-blue-500/20" :
            "bg-emerald-500/5 border-emerald-500/20"
          }`}>
            <div className="flex items-start gap-3">
              {insight.type === "warning" ? <CloudRain className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /> :
               insight.type === "suggestion" ? <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" /> :
               <Sun className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />}
              <div className="flex-1">
                <p className="text-sm text-white">{insight.message}</p>
                {insight.action && (
                  <button className="text-xs text-emerald-400 hover:text-emerald-300 mt-2 flex items-center gap-1">
                    {insight.action} <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <button onClick={() => onDismiss(index)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Today's Timeline
function TodayTimeline({ events, onAddEvent }: { events: Event[], onAddEvent: () => void }) {
  return (
    <div className="bg-zinc-900/50 rounded-2xl p-5 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          Today&apos;s Flow
        </h3>
        <button onClick={onAddEvent} className="text-xs text-emerald-400 hover:text-emerald-300">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity ${
            event.type === "FOCUS_TIME" ? "bg-emerald-500/5 border-emerald-500/20" :
            event.type === "MEETING" ? "bg-blue-500/5 border-blue-500/20" :
            "bg-zinc-800/50 border-white/5"
          }`}>
            <div className="text-xs text-zinc-500 w-16">{format(new Date(event.startTime), "h:mm a")}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-white">{event.title}</h4>
                {event.type === "FOCUS_TIME" && <Target className="w-3 h-3 text-emerald-400" />}
                {event.type === "MEETING" && <Users className="w-3 h-3 text-blue-400" />}
              </div>
              {event.description && <p className="text-xs text-zinc-500 mt-0.5">{event.description}</p>}
              {event.location && <p className="text-xs text-zinc-600 mt-0.5">📍 {event.location}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add Task Modal
function AddTaskModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (task: Partial<Task>) => void }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [duration, setDuration] = useState(30);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ title, priority, duration, status: "TODO" });
    setTitle("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Add New Task</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Task Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white"
              placeholder="What needs to be done?"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Priority</label>
            <div className="flex gap-2">
              {["LOW", "MEDIUM", "HIGH"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p as any)}
                  className={`flex-1 py-2 rounded-lg text-sm ${
                    priority === p 
                      ? p === "HIGH" ? "bg-red-500 text-white" : p === "MEDIUM" ? "bg-yellow-500 text-white" : "bg-zinc-600 text-white"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Duration (minutes)</label>
            <input 
              type="number" 
              value={duration} 
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white"
              min={5}
              step={5}
            />
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium">
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
}

// Main Dashboard
export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [insights, setInsights] = useState<AIInsight[]>(initialInsights);
  const [showAddTask, setShowAddTask] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleTaskMove = (taskId: string, newStatus: Task["status"]) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleAddTask = (newTask: Partial<Task>) => {
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title!,
      priority: newTask.priority!,
      duration: newTask.duration!,
      status: "TODO",
      completed: false,
      energyRequired: 3,
      category: "General",
    };
    setTasks([...tasks, task]);
  };

  const handleDismissInsight = (index: number) => {
    setInsights(insights.filter((_, i) => i !== index));
  };

  const handleVoiceInput = (text: string) => {
    alert(`Voice command received: "${text}"`);
  };

  const columns = [
    { id: "TODO", title: "To Do", color: "border-zinc-500/20" },
    { id: "IN_PROGRESS", title: "In Progress", color: "border-blue-500/20" },
    { id: "REVIEW", title: "Review", color: "border-orange-500/20" },
    { id: "DONE", title: "Done", color: "border-emerald-500/20" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between py-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FlowSync</h1>
              <p className="text-xs text-zinc-500">Where Work Flows Effortlessly</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 rounded-xl border border-white/[0.06]">
              <Timer className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white">{format(currentTime, "h:mm a")}</span>
            </div>
            <button className="p-2 bg-zinc-900/50 rounded-xl border border-white/[0.06] hover:bg-zinc-800">
              <Bell className="w-5 h-5 text-zinc-400" />
            </button>
            <button className="p-2 bg-zinc-900/50 rounded-xl border border-white/[0.06] hover:bg-zinc-800">
              <Settings className="w-5 h-5 text-zinc-400" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold cursor-pointer hover:opacity-80">
              JD
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/[0.06] hover:border-emerald-500/30 transition-colors cursor-pointer">
            <p className="text-xs text-zinc-500">FlowScore™</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">87</p>
            <p className="text-xs text-emerald-400/70">+5% today</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/[0.06] hover:border-white/20 transition-colors cursor-pointer">
            <p className="text-xs text-zinc-500">Focus Time</p>
            <p className="text-2xl font-bold text-white mt-1">4.5h</p>
            <p className="text-xs text-zinc-500">of 6h goal</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/[0.06] hover:border-white/20 transition-colors cursor-pointer">
            <p className="text-xs text-zinc-500">Tasks Done</p>
            <p className="text-2xl font-bold text-white mt-1">{tasks.filter(t => t.status === "DONE").length}/{tasks.length}</p>
            <p className="text-xs text-zinc-500">{Math.round((tasks.filter(t => t.status === "DONE").length / tasks.length) * 100)}% complete</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/[0.06] hover:border-white/20 transition-colors cursor-pointer">
            <p className="text-xs text-zinc-500">Meetings</p>
            <p className="text-2xl font-bold text-white mt-1">{events.filter(e => e.type === "MEETING").length}</p>
            <p className="text-xs text-yellow-400">{events.filter(e => e.type === "MEETING" && new Date(e.startTime) > new Date()).length} upcoming</p>
          </div>
        </div>

        {/* Voice Input */}
        <div className="mb-6">
          <VoiceInput onTranscript={handleVoiceInput} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <TodayTimeline events={events} onAddEvent={() => alert("Add event feature coming soon!")} />
            <EnergyMap />
          </div>
          
          {/* Middle & Right Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Board */}
            <div className="bg-zinc-900/50 rounded-2xl p-5 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  Task Board
                </h3>
                <button 
                  onClick={() => setShowAddTask(true)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 rounded-lg"
                >
                  <Plus className="w-3 h-3" /> Add Task
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {columns.map((col) => {
                  const colTasks = tasks.filter((t) => t.status === col.id);
                  return (
                    <div key={col.id} className={`bg-zinc-900/30 rounded-xl p-3 border-t-2 ${col.color} min-h-[300px]`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-white">{col.title}</span>
                        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                      </div>
                      <div className="space-y-2">
                        {colTasks.map((task) => (
                          <div key={task.id} className="bg-zinc-800/50 rounded-lg p-3 group hover:bg-zinc-800 transition-colors">
                            <div className="flex items-start gap-2">
                              <GripVertical className="w-4 h-4 text-zinc-600 mt-0.5 cursor-move" />
                              <div className="flex-1">
                                <p className="text-sm text-white">{task.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                    task.priority === "HIGH" ? "bg-red-500/10 text-red-400" :
                                    task.priority === "MEDIUM" ? "bg-yellow-500/10 text-yellow-400" :
                                    "bg-zinc-500/10 text-zinc-400"
                                  }`}>{task.priority}</span>
                                  <span className="text-[10px] text-zinc-500">{task.duration}m</span>
                                  {task.energyRequired && <span className="text-[10px] text-zinc-500">{"⚡".repeat(task.energyRequired)}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {col.id !== "TODO" && (
                                <button onClick={() => handleTaskMove(task.id, "TODO")} className="text-[10px] px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-300">← Todo</button>
                              )}
                              {col.id !== "IN_PROGRESS" && col.id !== "DONE" && (
                                <button onClick={() => handleTaskMove(task.id, "IN_PROGRESS")} className="text-[10px] px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded text-blue-400">Start →</button>
                              )}
                              {col.id !== "REVIEW" && col.id !== "TODO" && col.id !== "DONE" && (
                                <button onClick={() => handleTaskMove(task.id, "REVIEW")} className="text-[10px] px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 rounded text-orange-400">Review</button>
                              )}
                              {col.id !== "DONE" && (
                                <button onClick={() => handleTaskMove(task.id, "DONE")} className="text-[10px] px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 rounded text-emerald-400">✓ Done</button>
                              )}
                            </div>
                          </div>
                        ))}
                        {colTasks.length === 0 && (
                          <div className="text-center py-8 text-zinc-600 text-xs">No tasks</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-6">
              <AIInsightsPanel insights={insights} onDismiss={handleDismissInsight} />
              
              {/* Quick Actions */}
              <div className="bg-zinc-900/50 rounded-2xl p-5 border border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => setShowAddTask(true)} className="w-full flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                      <Plus className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">Add Task</p>
                      <p className="text-xs text-zinc-500">Create a new task</p>
                    </div>
                  </button>
                  <button onClick={() => alert("Schedule meeting feature coming soon!")} className="w-full flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">Schedule Meeting</p>
                      <p className="text-xs text-zinc-500">Book a new meeting</p>
                    </div>
                  </button>
                  <button onClick={() => alert("Focus mode coming soon!")} className="w-full flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">Start Focus Mode</p>
                      <p className="text-xs text-zinc-500">Block distractions for deep work</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal 
        isOpen={showAddTask} 
        onClose={() => setShowAddTask(false)} 
        onAdd={handleAddTask}
      />
    </div>
  );
}