"use client";

import { useState } from "react";
import { 
  Calendar, CheckCircle2, Clock, Plus, Mic, Bell, Settings,
  Zap, TrendingUp, Users, Briefcase, MapPin, Sun, CloudRain,
  ChevronRight, MoreHorizontal, Phone, Video, MapPinned,
  BrainCircuit, Sparkles, Target, Timer
} from "lucide-react";
import { format, addHours, startOfDay, addDays } from "date-fns";

// Types
interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  duration: number; // minutes
  energy: 1 | 2 | 3 | 4 | 5; // 1=low, 5=high
  completed: boolean;
  category: string;
}

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "meeting" | "focus" | "task" | "break" | "appointment";
  attendees?: number;
  location?: string;
  description?: string;
}

interface AIInsight {
  type: "tip" | "warning" | "suggestion";
  message: string;
  action?: string;
}

// Mock Data
const today = new Date();

const tasks: Task[] = [
  { id: "1", title: "Review Q4 Budget Proposal", priority: "high", duration: 60, energy: 4, completed: false, category: "Finance" },
  { id: "2", title: "Prepare Client Presentation", priority: "high", duration: 90, energy: 5, completed: false, category: "Sales" },
  { id: "3", title: "Team Standup Notes", priority: "medium", duration: 15, energy: 2, completed: true, category: "Operations" },
  { id: "4", title: "Email Campaign Review", priority: "medium", duration: 45, energy: 3, completed: false, category: "Marketing" },
  { id: "5", title: "Update Project Documentation", priority: "low", duration: 30, energy: 2, completed: false, category: "Product" },
];

const events: Event[] = [
  { 
    id: "1", 
    title: "Deep Work: Strategy Planning", 
    start: addHours(startOfDay(today), 9), 
    end: addHours(startOfDay(today), 11), 
    type: "focus",
    description: "High-focus work block - no interruptions"
  },
  { 
    id: "2", 
    title: "Client Call - TechCorp", 
    start: addHours(startOfDay(today), 14), 
    end: addHours(startOfDay(today), 15), 
    type: "meeting",
    attendees: 4,
    location: "Zoom"
  },
  { 
    id: "3", 
    title: "Lunch Break", 
    start: addHours(startOfDay(today), 12), 
    end: addHours(startOfDay(today), 13), 
    type: "break" 
  },
  { 
    id: "4", 
    title: "Team Standup", 
    start: addHours(startOfDay(today), 16), 
    end: addHours(startOfDay(today), 16.5), 
    type: "meeting",
    attendees: 8,
    location: "Conference Room B"
  },
];

const aiInsights: AIInsight[] = [
  { type: "tip", message: "Your peak focus time is 9-11 AM. Perfect for deep work!", action: "Schedule important tasks" },
  { type: "warning", message: "You have 3 back-to-back meetings this afternoon. Consider adding buffers.", action: "Auto-fix schedule" },
  { type: "suggestion", message: "Based on traffic, leave by 1:45 PM for your 2:00 PM meeting.", action: "Set reminder" },
];

// Energy Map Component
const EnergyMap = () => {
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 8 PM
  
  const getEnergyLevel = (hour: number) => {
    if (hour >= 9 && hour <= 11) return { level: "high", color: "bg-emerald-500" };
    if (hour >= 14 && hour <= 16) return { level: "medium", color: "bg-yellow-500" };
    if (hour >= 20) return { level: "low", color: "bg-red-500" };
    return { level: "medium", color: "bg-blue-500" };
  };

  return (
    <div className="bg-zinc-900/50 rounded-2xl p-5 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          Energy Map
        </h3>
        <span className="text-xs text-zinc-500">Based on your patterns</span>
      </div>
      <div className="flex gap-1">
        {hours.map((hour) => {
          const energy = getEnergyLevel(hour);
          return (
            <div key={hour} className="flex-1">
              <div 
                className={`h-12 rounded-lg ${energy.color} opacity-80 hover:opacity-100 transition-opacity cursor-pointer relative group`}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                  {hour}:00 - {energy.level} energy
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 text-center mt-1">{hour}</p>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-zinc-400">Peak</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-zinc-400">Good</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span className="text-zinc-400">Moderate</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-zinc-400">Low</span>
        </div>
      </div>
    </div>
  );
};

// AI Insights Panel
const AIInsightsPanel = () => {
  return (
    <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl p-5 border border-violet-500/20">
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit className="w-5 h-5 text-violet-400" />
        <h3 className="text-sm font-semibold text-white">AI Insights</h3>
      </div>
      <div className="space-y-3">
        {aiInsights.map((insight, index) => (
          <div 
            key={index} 
            className={`p-3 rounded-xl border ${
              insight.type === "warning" ? "bg-red-500/5 border-red-500/20" :
              insight.type === "suggestion" ? "bg-blue-500/5 border-blue-500/20" :
              "bg-emerald-500/5 border-emerald-500/20"
            }`}
          >
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
};

// Today's Timeline
const TodayTimeline = () => {
  return (
    <div className="bg-zinc-900/50 rounded-2xl p-5 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          Today's Flow
        </h3>
        <span className="text-xs text-zinc-500">{format(today, "EEEE, MMMM d")}</span>
      </div>
      
      <div className="space-y-3">
        {events.map((event) => (
          <div 
            key={event.id} 
            className={`flex items-center gap-4 p-3 rounded-xl border ${
              event.type === "focus" ? "bg-emerald-500/5 border-emerald-500/20" :
              event.type === "meeting" ? "bg-blue-500/5 border-blue-500/20" :
              event.type === "break" ? "bg-zinc-800/50 border-white/5" :
              "bg-violet-500/5 border-violet-500/20"
            }`}
          >
            <div className="text-xs text-zinc-500 w-16">
              {format(event.start, "h:mm a")}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-white">{event.title}</h4>
                {event.type === "focus" && <Target className="w-3 h-3 text-emerald-400" />}
                {event.type === "meeting" && <Users className="w-3 h-3 text-blue-400" />}
              </div>
              {event.description && (
                <p className="text-xs text-zinc-500 mt-0.5">{event.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                {event.location && (
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {event.location}
                  </span>
                )}
                {event.attendees && (
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {event.attendees} attendees
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-white/5 rounded-lg">
                <Video className="w-4 h-4 text-zinc-400" />
              </button>
              <button className="p-1.5 hover:bg-white/5 rounded-lg">
                <MoreHorizontal className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Priority Tasks
const PriorityTasks = () => {
  return (
    <div className="bg-zinc-900/50 rounded-2xl p-5 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          Priority Tasks
        </h3>
        <button className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add Task
        </button>
      </div>
      
      <div className="space-y-2">
        {tasks.filter(t => !t.completed).map((task) => (
          <div 
            key={task.id} 
            className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl group hover:bg-zinc-800 transition-colors"
          >
            <button className="w-5 h-5 rounded-full border-2 border-zinc-600 hover:border-emerald-500 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <div className="flex-1">
              <p className="text-sm text-white">{task.title}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  task.priority === "high" ? "bg-red-500/10 text-red-400" :
                  task.priority === "medium" ? "bg-yellow-500/10 text-yellow-400" :
                  "bg-zinc-500/10 text-zinc-400"
                }`}>
                  {task.priority}
                </span>
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {task.duration} min
                </span>
                <span className="text-xs text-zinc-500">
                  Energy: {"⚡".repeat(task.energy)}
                </span>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-lg hover:bg-emerald-500/20 transition-colors">
              Schedule
            </button>
          </div>
        ))}
      </div>
      
      {tasks.filter(t => t.completed).length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <p className="text-xs text-zinc-500 mb-2">Completed ({tasks.filter(t => t.completed).length})</p>
          {tasks.filter(t => t.completed).map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-2 opacity-50">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <p className="text-sm text-white line-through">{task.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Quick Actions
const QuickActions = () => {
  return (
    <div className="grid grid-cols-4 gap-3">
      <button className="flex flex-col items-center gap-2 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
        <Plus className="w-5 h-5 text-emerald-400" />
        <span className="text-xs text-white">Task</span>
      </button>
      <button className="flex flex-col items-center gap-2 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
        <Calendar className="w-5 h-5 text-blue-400" />
        <span className="text-xs text-white">Meeting</span>
      </button>
      <button className="flex flex-col items-center gap-2 p-4 bg-violet-500/10 rounded-xl border border-violet-500/20 hover:bg-violet-500/20 transition-colors">
        <Briefcase className="w-5 h-5 text-violet-400" />
        <span className="text-xs text-white">Booking</span>
      </button>
      <button className="flex flex-col items-center gap-2 p-4 bg-zinc-800 rounded-xl border border-white/10 hover:bg-zinc-700 transition-colors group">
        <Mic className="w-5 h-5 text-zinc-400 group-hover:text-white" />
        <span className="text-xs text-zinc-400 group-hover:text-white">Voice</span>
      </button>
    </div>
  );
};

// Stats Overview
const StatsOverview = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/[0.06]">
        <p className="text-xs text-zinc-500">FlowScore™</p>
        <p className="text-2xl font-bold text-emerald-400 mt-1">87</p>
        <p className="text-xs text-emerald-400/70">+5% today</p>
      </div>
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/[0.06]">
        <p className="text-xs text-zinc-500">Focus Time</p>
        <p className="text-2xl font-bold text-white mt-1">4.5h</p>
        <p className="text-xs text-zinc-500">of 6h goal</p>
      </div>
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/[0.06]">
        <p className="text-xs text-zinc-500">Tasks Done</p>
        <p className="text-2xl font-bold text-white mt-1">8/12</p>
        <p className="text-xs text-zinc-500">67% complete</p>
      </div>
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/[0.06]">
        <p className="text-xs text-zinc-500">Meetings</p>
        <p className="text-2xl font-bold text-white mt-1">4</p>
        <p className="text-xs text-yellow-400">3 today</p>
      </div>
    </div>
  );
};

// Header
const Header = () => {
  return (
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
          <span className="text-sm text-white">2:34 PM</span>
        </div>
        <button className="p-2 bg-zinc-900/50 rounded-xl border border-white/[0.06] hover:bg-zinc-800 transition-colors">
          <Bell className="w-5 h-5 text-zinc-400" />
        </button>
        <button className="p-2 bg-zinc-900/50 rounded-xl border border-white/[0.06] hover:bg-zinc-800 transition-colors">
          <Settings className="w-5 h-5 text-zinc-400" />
        </button>
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold">
          JD
        </div>
      </div>
    </header>
  );
};

// Main Dashboard
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-[1600px] mx-auto">
        <Header />
        
        <StatsOverview />
        
        <div className="mt-6">
          <QuickActions />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column */}
          <div className="space-y-6">
            <TodayTimeline />
            <EnergyMap />
          </div>
          
          {/* Middle Column */}
          <div className="space-y-6">
            <PriorityTasks />
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <AIInsightsPanel />
            
            {/* Weather & Context */}
            <div className="bg-zinc-900/50 rounded-2xl p-5 border border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                <MapPinned className="w-4 h-4 text-blue-400" />
                Context Awareness
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Sun className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-sm text-white">72°F Sunny</p>
                      <p className="text-xs text-zinc-500">San Francisco, CA</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-sm text-white">Light Traffic</p>
                      <p className="text-xs text-zinc-500">15 min to downtown</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Upcoming Bookings */}
            <div className="bg-zinc-900/50 rounded-2xl p-5 border border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                <Phone className="w-4 h-4 text-violet-400" />
                Appointment Requests
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
                  <div>
                    <p className="text-sm text-white">Sarah Johnson</p>
                    <p className="text-xs text-zinc-500">Consultation • 30 min</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-lg">Accept</button>
                    <button className="px-3 py-1 bg-zinc-700 text-zinc-400 text-xs rounded-lg">Decline</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}