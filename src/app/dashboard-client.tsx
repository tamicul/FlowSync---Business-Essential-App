"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { 
  Calendar, CheckCircle2, Clock, Plus, Mic, Bell, Settings,
  Zap, TrendingUp, Users, MapPin, Sun, CloudRain,
  ChevronRight, MoreHorizontal, BrainCircuit, Sparkles, Target, Timer,
  GripVertical, X, LogOut
} from "lucide-react";
import { format, addDays, startOfDay, addHours } from "date-fns";

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

export default function DashboardClient() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data from API
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

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle,
          priority: newTaskPriority,
          duration: 30,
          status: "TODO",
        }),
      });

      if (res.ok) {
        const newTask = await res.json();
        setTasks([...tasks, newTask]);
        setNewTaskTitle("");
        setShowAddTask(false);
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleDismissInsight = (index: number) => {
    setInsights(insights.filter((_, i) => i !== index));
  };

  const handleVoiceInput = () => {
    alert("Voice input coming in Phase 2!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Loading your workspace...
        </div>
      </div>
    );
  }

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
            
            {/* User Menu */}
            <div className="flex items-center gap-2 pl-3 border-l border-white/[0.06]">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-white font-medium">{user?.firstName || user?.username}</p>
                <p className="text-xs text-zinc-500">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
              <button 
                onClick={() => signOut()}
                className="p-2 bg-zinc-900/50 rounded-xl border border-white/[0.06] hover:bg-red-500/10 hover:border-red-500/30 group"
                title="Sign out"
              >
                <LogOut className="w-5 h-5 text-zinc-400 group-hover:text-red-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/[0.06]">
            <p className="text-xs text-zinc-500">Tasks Pending</p>
            <p className="text-2xl font-bold text-white mt-1">{tasks.filter(t => t.status !== "DONE").length}</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/[0.06]">
            <p className="text-xs text-zinc-500">Completed Today</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{tasks.filter(t => t.status === "DONE").length}</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/[0.06]">
            <p className="text-xs text-zinc-500">Today's Events</p>
            <p className="text-2xl font-bold text-white mt-1">{events.length}</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/[0.06]">
            <p className="text-xs text-zinc-500">High Priority</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{tasks.filter(t => t.priority === "HIGH" && t.status !== "DONE").length}</p>
          </div>
        </div>

        {/* Voice Input */}
        <div className="mb-6">
          <button 
            onClick={handleVoiceInput}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-zinc-900/50 border border-white/[0.06] hover:border-emerald-500/30 transition-all"
          >
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Mic className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-white">Voice Commands (Coming Soon)</p>
              <p className="text-xs text-zinc-500">Try saying: &quot;Add task: Review budget by Friday&quot;</p>
            </div>
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Calendar & Events */}
          <div className="space-y-6">
            {/* Today's Events */}
            <div className="bg-zinc-900/50 rounded-2xl p-5 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Today&apos;s Schedule
                </h3>
                <span className="text-xs text-zinc-500">{format(new Date(), "EEEE, MMM d")}</span>
              </div>
              
              <div className="space-y-3">
                {events.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-4">No events today</p>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                      event.type === "FOCUS_TIME" ? "bg-emerald-500/5 border-emerald-500/20" :
                      event.type === "MEETING" ? "bg-blue-500/5 border-blue-500/20" :
                      "bg-zinc-800/50 border-white/5"
                    }`}>
                      <div className="text-xs text-zinc-500 w-14">
                        {format(new Date(event.startTime), "h:mm a")}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{event.title}</p>
                        {event.location && <p className="text-xs text-zinc-500">📍 {event.location}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-zinc-900/50 rounded-2xl p-5 border border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white mb-4">This Week</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Tasks Created</span>
                  <span className="text-white">{tasks.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Completed</span>
                  <span className="text-emerald-400">{tasks.filter(t => t.status === "DONE").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">In Progress</span>
                  <span className="text-blue-400">{tasks.filter(t => t.status === "IN_PROGRESS").length}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Middle & Right - Task Board */}
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
                    <div key={col.id} className={`bg-zinc-900/30 rounded-xl p-3 border-t-2 ${col.color}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-white">{col.title}</span>
                        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                      </div>
                      <div className="space-y-2 min-h-[100px]">
                        {colTasks.map((task) => (
                          <div key={task.id} className="bg-zinc-800/50 rounded-lg p-3 group hover:bg-zinc-800 transition-colors">
                            <div className="flex items-start gap-2">
                              <GripVertical className="w-4 h-4 text-zinc-600 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{task.title}</p>
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
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {col.id !== "TODO" && (
                                <button onClick={() => handleTaskMove(task.id, "TODO")} className="text-[10px] px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-300">←</button>
                              )}
                              {col.id !== "IN_PROGRESS" && col.id !== "DONE" && (
                                <button onClick={() => handleTaskMove(task.id, "IN_PROGRESS")} className="text-[10px] px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded text-blue-400">Start</button>
                              )}
                              {col.id !== "REVIEW" && col.id !== "TODO" && col.id !== "DONE" && (
                                <button onClick={() => handleTaskMove(task.id, "REVIEW")} className="text-[10px] px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 rounded text-orange-400">Review</button>
                              )}
                              {col.id !== "DONE" && (
                                <button onClick={() => handleTaskMove(task.id, "DONE")} className="text-[10px] px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 rounded text-emerald-400">✓</button>
                              )}
                            </div>
                          </div>
                        ))}
                        {colTasks.length === 0 && (
                          <div className="text-center py-4 text-zinc-600 text-xs">Drop tasks here</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* AI Insights */}
            {insights.length > 0 && (
              <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl p-5 border border-violet-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-violet-400" />
                    <h3 className="text-sm font-semibold text-white">AI Insights</h3>
                  </div>
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
                        </div>
                        <button onClick={() => handleDismissInsight(index)} className="text-zinc-500 hover:text-zinc-300">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add New Task</h3>
              <button onClick={() => setShowAddTask(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Task Title</label>
                <input 
                  type="text" 
                  value={newTaskTitle} 
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white"
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Priority</label>
                <div className="flex gap-2">
                  {["LOW", "MEDIUM", "HIGH"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTaskPriority(p as any)}
                      className={`flex-1 py-2 rounded-lg text-sm ${
                        newTaskPriority === p 
                          ? p === "HIGH" ? "bg-red-500 text-white" : p === "MEDIUM" ? "bg-yellow-500 text-white" : "bg-zinc-600 text-white"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium">
                Add Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}