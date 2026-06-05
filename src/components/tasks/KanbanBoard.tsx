"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import type { TaskPriority, TaskStatus } from "@prisma/client";

interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: Date | null;
  createdAt: Date;
  client: { name: string } | null;
  assignedTo: { id: string; name: string } | null;
  _count: { comments: number; attachments: number };
}

interface KanbanBoardProps {
  initialTasks: Task[];
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "OPEN", title: "Abertas" },
  { id: "IN_PROGRESS", title: "Em Andamento" },
  { id: "DONE", title: "Concluídas" },
  { id: "FAILED", title: "Falhou / Canceladas" },
];

export default function KanbanBoard({ initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    if (active.data.current?.type === "Task") {
      setActiveTask(active.data.current.task);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    setTasks((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeId);
      
      // Dropping task over another task
      if (isOverTask) {
        const overIndex = prev.findIndex((t) => t.id === overId);
        
        if (prev[activeIndex].status !== prev[overIndex].status) {
          const newTasks = [...prev];
          newTasks[activeIndex] = { ...newTasks[activeIndex], status: prev[overIndex].status };
          return arrayMove(newTasks, activeIndex, overIndex);
        }
        return arrayMove(prev, activeIndex, overIndex);
      }

      // Dropping task over an empty column area
      if (isOverColumn) {
        const newStatus = overId as TaskStatus;
        if (prev[activeIndex].status !== newStatus) {
          const newTasks = [...prev];
          newTasks[activeIndex] = { ...newTasks[activeIndex], status: newStatus };
          return arrayMove(newTasks, activeIndex, activeIndex);
        }
      }

      return prev;
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    
    if (taskIndex !== -1) {
      const currentTask = tasks[taskIndex];
      // In a real implementation we might also want to save the new order if we support custom ordering.
      // For now, we mainly want to save the status change.
      // We will perform a PATCH request to update the status.
      fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: currentTask.status }),
      }).catch((err) => {
        console.error("Failed to update task status:", err);
        // Optionally revert state here if the API call fails
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        style={{
          display: "flex",
          gap: "24px",
          overflowX: "auto",
          paddingBottom: "16px",
          height: "100%",
        }}
      >
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={tasks.filter((t) => t.status === col.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
