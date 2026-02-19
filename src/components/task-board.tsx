"use client";

import { useState } from "react";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  GripVertical, 
  Clock, 
  Zap, 
  Calendar,
  MoreHorizontal,
  Plus,
  CheckCircle2,
  Circle,
  ArrowRightCircle
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  estimatedMinutes?: number;
  energyRequired?: number;
  dueDate?: string;
  category?: string;
}

interface TaskCardProps {
  task: Task;
}

function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    LOW: "bg-zinc-500/10 text-zinc-400",
    MEDIUM: "bg-blue-500/10 text-blue-400",
    HIGH: "bg-orange-500/10 text-orange-400",
    URGENT: "bg-red-500/10 text-red-400",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-zinc-800/50 rounded-xl p-4 border border-white/[0.06] hover:border-white/[0.1] group cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="mt-1 text-zinc-600 hover:text-zinc-400"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-white truncate">{task.title}</h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          
          {task.description && (
            <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{task.description}</p>
          )}
          
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {task.estimatedMinutes && (
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.estimatedMinutes}m
              </span>
            )}
            {task.energyRequired && (
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {"⚡".repeat(task.energyRequired)}
              </span>
            )}
            {task.dueDate && (
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
            {task.category && (
              <span className="text-xs px-2 py-0.5 bg-zinc-700/50 text-zinc-400 rounded-full">
                {task.category}
              </span>
            )}
          </div>
        </div>
        
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded transition-all">
          <MoreHorizontal className="w-4 h-4 text-zinc-500" />
        </button>
      </div>
    </div>
  );
}

interface Column {
  id: string;
  title: string;
  status: Task["status"];
  icon: React.ReactNode;
  color: string;
}

const columns: Column[] = [
  { 
    id: "todo", 
    title: "To Do", 
    status: "TODO", 
    icon: <Circle className="w-4 h-4" />,
    color: "border-zinc-500/20"
  },
  { 
    id: "in-progress", 
    title: "In Progress", 
    status: "IN_PROGRESS", 
    icon: <ArrowRightCircle className="w-4 h-4" />,
    color: "border-blue-500/20"
  },
  { 
    id: "review", 
    title: "Review", 
    status: "REVIEW", 
    icon: <Clock className="w-4 h-4" />,
    color: "border-orange-500/20"
  },
  { 
    id: "done", 
    title: "Done", 
    status: "DONE", 
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "border-emerald-500/20"
  },
];

interface TaskBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: Task["status"]) => void;
}

export function TaskBoard({ tasks, onTaskMove }: TaskBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    const overColumn = columns.find((c) => c.id === over.id);

    if (activeTask && overColumn && activeTask.status !== overColumn.status) {
      onTaskMove(activeTask.id, overColumn.status);
    }

    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.status);
          
          return (
            <div
              key={column.id}
              className={`bg-zinc-900/30 rounded-2xl p-4 border-t-4 ${column.color}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">{column.icon}</span>
                  <h3 className="text-sm font-semibold text-white">{column.title}</h3>
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <button className="p-1 hover:bg-white/5 rounded">
                  <Plus className="w-4 h-4 text-zinc-500" />
                </button>
              </div>

              <SortableContext
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3 min-h-[200px]">
                  {columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-zinc-600 text-sm">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>
    </DndContext>
  );
}