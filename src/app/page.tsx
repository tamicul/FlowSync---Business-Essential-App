"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, CheckCircle2, Clock, Plus, Mic, Bell, Settings,
  Zap, TrendingUp, Users, Briefcase, MapPin, Sun, CloudRain,
  ChevronRight, MoreHorizontal, Phone, Video, MapPinned,
  BrainCircuit, Sparkles, Target, Timer, GripVertical
} from "lucide-react";
import { format, addHours, startOfDay, addDays, isSameDay } from "date-fns";

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
  attendees?: any[];
  location?: string;
}

interface AIInsight {
  type: "tip" | "warning" | "suggestion";
  message: string;
  action?: string;
}

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
        isListening ? "bg-red-500/10 border-red-500/30" : "bg-zinc-900/50 border-white/[0.06]"
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
    if (hour >= 9 && hour <= 11) return { level: "high", color: "bg-emerald-500" };
    if (hour >= 14 && hour <= 16) return { level: "medium", color: "bg-yellow-500" };
    if (hour >= 20) return { level: "low", color: "bg-red-500" };
    return { level: "medium", color: "bg-blue-500" };
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
            <div key={hour} className="flex-1">
              <div className={`h-12 rounded-lg ${energy.color} opacity-80`} />
              <p className="text-[10px] text-zinc-500 text-center mt-1">{hour}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// AI Insights Panel
function AIInsightsPanel({ insights }: { insights: AIInsight[] }) {
  return (
    <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl p-5 border border-violet-500/20">
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit className="w-5 h-5 text-violet-400" />
        <h3 className="text-sm font-semibold text-white">AI Insights</h3>
      </div>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className={`p-3 rounded-xl border ${
            insight.type === "warning" ? "bg-red-500/5 border-red-500/20" :
            insight.type === "suggestion" ? "bg-blue-500/5 border-blue-500/20" :
            "bg-emerald-500/5 border-emerald-500/20"
          }`}>
            <div className="flex items-start gap-3">
              {insight.type === "warning" ? <CloudRain className="w-4 h-4 text-red-400 mt-0.5" /> :
               insight.type === "suggestion" ? <Sparkles className="w-4 h-4 text-blue-400 mt-0.5" /> :
               <Sun className="w-4 h-4 text-emerald-400 mt-0.5" />}
              <div className="flex-1">
                <p className="text-sm text-white">{insight.message}</p>
                {insight.action && (
                  <button className="text-xs text-emerald-400 hover:text-emerald-300 mt-2 flex items-center gap-1">
                    {insight.action} <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Today's Timeline
function TodayTimeline({ events }: { events: Event[] }) {
  const today = new Date();
  
  return (
    <div className="bg-zinc-900/50 rounded-2xl p-5 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          Today&apos;s Flow
        </h3>
        <span className="text-xs text-zinc-500">{format(today, "EEEE, MMMM d")}</span>
      </div>
      
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className={`flex items-center gap-4 p-3 rounded-xl border ${
            event.type === "FOCUS_TIME" ? "bg-emerald-500/5 border-emerald-500/20" :
            event.type === "MEETING" ? "bg-blue-500/5 border-blue-500/20" :
            "bg-zinc-800/50 border-white/5"
          }`}>
            <div className="text-xs text-zinc-500 w-16">
              {format(new Date(event.startTime), "h:mm a")}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-white">{event.title}</h4>
              {event.description && <p className="text-xs text-zinc-500 mt-0.5">{event.description}</p>}
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-sm text-zinc-500 text-center py-4">No events today</p>
        )}
      </div>
    </div>
  );
}

// Priority Tasks with Kanban
function PriorityTasks({ tasks, onTaskMove }: { tasks: Task[], onTaskMove: (taskId: string, newStatus: Task["status"]) => void }) {
  const columns = [
    { id: "TODO", title: "To Do", color: "border-zinc-500/20" },
    { id: "IN_PROGRESS", title: "In Progress", color: "border-blue-500/20" },
    { id: "REVIEW", title: "Review", color: "border-orange-500/20" },
    { id: "DONE", title: "Done", color: "border-emerald-500/20" },
  ];

  return (
    <div className="bg-zinc-900/50 rounded-2xl p-5 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          Task Board
        </h3>
        <button className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add Task
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className={`bg-zinc-900/30 rounded-xl p-3 border-t-2 ${col.color}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-white">{col.title}</span>
                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map((task) => (
                  <div key={task.id} className="bg-zinc-800/50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-4 h-4 text-zinc-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-white">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            task.priority === "HIGH" ? "bg-red-500/10 text-red-400" :
                            task.priority === "MEDIUM" ? "bg-yellow-500/10 text-yellow-400" :
                            "bg-zinc-500/10 text-zinc-400"
                          }`}>{task.priority}</span>
                          <span className="text-[10px] text-zinc-500">{task.duration}m</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {columns.filter(c => c.id !== task.status).map(targetCol => (
                        <button
                          key={targetCol.id}
                          onClick={() => onTaskMove(task.id, targetCol.id as Task["status"])}
                          className="text-[10px] px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-300"
                        >
                          {targetCol.id === "DONE" ? "✓" : "→"}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Booking Widget
function BookingWidget() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isSubmitted) {
    return (
      <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/[0.06] text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Booking Confirmed!</h3>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 rounded-2xl border border-white/[0.06] overflow-hidden">
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-emerald-500" : "bg-zinc-800"}`} />
          ))}
        </div>
      </div>
      <div className="p-4">
        {step === 1 && (
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Select Service</h3>
            {["Initial Consultation", "Strategy Session", "Quick Call"].map((service) => (
              <button key={service} onClick={() => setStep(2)} className="w-full text-left p-3 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 mb-2">
                <p className="text-sm text-white">{service}</p>
              </button>
            ))}
          </div>
        )}
        {step === 2 && (
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Select Date</h3>
            <button onClick={() => setStep(3)} className="w-full p-3 bg-emerald-500 text-white rounded-xl">
              Continue
            </button>
          </div>
        )}
        {step === 3 && (
          <button onClick={() => setIsSubmitted(true)} className="w-full p-3 bg-emerald-500 text-white rounded-xl">
            Confirm
          </button>
        )}
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="mt-2 text-zinc-400 text-sm">Back</button>
        )}
      </div>
    </div>
  );
}

// Main Dashboard
export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, eventsRes, insightsRes] = await Promise.all([
          fetch("/api/tasks"),
          fetch("/api/events"),
          fetch("/api/insights"),
        ]);

        if (tasksRes.ok) setTasks(await tasksRes.json());
        if (eventsRes.ok) setEvents(await eventsRes.json());
        if (insightsRes.ok) setInsights(await insightsRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTaskMove = async (taskId: string, newStatus: Task["status"]) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      
      if (res.ok) {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleVoiceInput = (text: string) => {
    console.log("Voice input:", text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

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
              <span className="text-sm text-white">{format(new Date(), "h:mm a")}</span>
            </div>
            <button className="p-2 bg-zinc-900/50 rounded-xl border border-white/[0.06]">
              <Bell className="w-5 h-5 text-zinc-400" />
            </button>
            <button className="p-2 bg-zinc-900/50 rounded-xl border border-white/[0.06]">
              <Settings className="w-5 h-5 text-zinc-400" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold">
              JD
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/[0.06]">
            <p className="text-xs text-zinc-500">FlowScore™</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">87</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/[0.06]">
            <p className="text-xs text-zinc-500">Focus Time</p>
            <p className="text-2xl font-bold text-white mt-1">4.5h</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/[0.06]">
            <p className="text-xs text-zinc-500">Tasks Done</p>
            <p className="text-2xl font-bold text-white mt-1">{tasks.filter(t => t.status === "DONE").length}/{tasks.length}</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/[0.06]">
            <p className="text-xs text-zinc-500">Meetings</p>
            <p className="text-2xl font-bold text-white mt-1">{events.length}</p>
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
            <TodayTimeline events={events} />
            <EnergyMap />
          </div>
          
          {/* Middle Column */}
          <div className="lg:col-span-2 space-y-6">
            <PriorityTasks tasks={tasks} onTaskMove={handleTaskMove} />
            
            <div className="grid grid-cols-2 gap-6">
              <AIInsightsPanel insights={insights.length > 0 ? insights : [{type: "tip", message: "Welcome to FlowSync! Start by adding tasks and events.", action: "Get started"}]} />
              <BookingWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}