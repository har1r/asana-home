"use client";

import React, { useState } from 'react';
import {
  X,
  Check,
  Calendar,
  Users,
  BookOpen,
  Plus,
  Trash2,
  CheckSquare,
  FolderSync,
  AlertCircle
} from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

export default function ProjectDetailsDrawer() {
  const {
    selectedProject,
    setSelectedProject,
    members,
    getTasksForProject,
    handleUpdateProject,
    handleAddTaskToProject,
    handleToggleTask
  } = useDashboard();

  const [subtaskTitle, setSubtaskTitle] = useState('');

  if (!selectedProject) return null;

  const projectTasks = getTasksForProject(selectedProject);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleUpdateProject(selectedProject.id, { status: e.target.value as any });
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleUpdateProject(selectedProject.id, { description: e.target.value });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskTitle.trim()) return;
    handleAddTaskToProject(subtaskTitle.trim(), selectedProject.id);
    setSubtaskTitle('');
  };

  const toggleProjectMember = (memberId: string) => {
    const isAlreadyMember = selectedProject.members.includes(memberId);
    let updatedMembersList = [...selectedProject.members];
    if (isAlreadyMember) {
      // Must have at least one member left
      if (updatedMembersList.length > 1) {
        updatedMembersList = updatedMembersList.filter(id => id !== memberId);
      }
    } else {
      updatedMembersList.push(memberId);
    }
    handleUpdateProject(selectedProject.id, { members: updatedMembersList });
  };

  const statusLabel = {
    'planning': { bg: 'bg-amber-100 text-amber-900 border-amber-200', text: 'Planning' },
    'in-progress': { bg: 'bg-indigo-100 text-indigo-900 border-indigo-200', text: 'In Progress' },
    'completed': { bg: 'bg-emerald-100 text-emerald-900 border-emerald-200', text: 'Completed' },
    'on-hold': { bg: 'bg-rose-100 text-rose-900 border-rose-200', text: 'On Hold' },
  }[selectedProject.status] || { bg: 'bg-neutral-100 text-neutral-800 border-neutral-200', text: 'In Work' };

  return (
    <div
      id="project-details-drawer"
      className="fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-2xl border-l border-gray-100 flex flex-col font-sans transition-transform transform duration-300 animate-slideInRight"
    >
      {/* Drawer Banner */}
      <div className={`p-5 text-white flex flex-col justify-between select-none relative h-28 ${selectedProject.iconBg}`}>
        <div className="absolute top-0 right-0 p-4 opacity-5 stroke-1">
          <FolderSync className="w-24 h-24 stroke-[1.5]" />
        </div>

        {/* Close button */}
        <button
          onClick={() => setSelectedProject(null)}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition-colors cursor-pointer animate-none"
        >
          <X className="w-4 h-4" />
        </button>

        <span className="text-[10px] bg-white/20 text-white font-bold tracking-widest capitalize rounded-lg px-2 py-0.5 w-fit border border-white/10 leading-none">
          {selectedProject.category}
        </span>

        <h2 className="text-lg font-bold truncate pr-8 mt-4 font-sans tracking-tight">
          {selectedProject.title}
        </h2>
      </div>

      {/* Main Drawer Body Scroll container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Project Status Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-gray-500 capitalize tracking-wider block">Project Status</label>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusLabel.bg}`}>
              {statusLabel.text}
            </span>
            <select
              value={selectedProject.status}
              onChange={handleStatusChange}
              className="text-xs bg-slate-50 border border-slate-200 text-gray-700 font-bold rounded-lg px-2.5 py-1 focus:outline-none filter-select cursor-pointer"
            >
              <option value="planning">Change: Planning</option>
              <option value="in-progress">Change: In Progress</option>
              <option value="completed">Change: Completed</option>
              <option value="on-hold">Change: On Hold</option>
            </select>
          </div>
        </div>

        {/* Target Due Date */}
        <div className="space-y-2 select-none">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Calendar className="w-4 h-4 text-gray-400" />
            <label className="text-[11px] font-bold capitalize tracking-wider block">Target Delivery</label>
          </div>
          <p className="text-xs font-semibold text-gray-700 pl-5.5">
            {selectedProject.dueDate || 'Thursday, 29 Jan'}
          </p>
        </div>

        {/* Description notes */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-gray-500 mb-1">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <label className="text-[11px] font-bold capitalize tracking-wider block">Brief & Description</label>
          </div>
          <textarea
            value={selectedProject.description}
            onChange={handleDescChange}
            placeholder="No description set yet. Write about guidelines, timelines, and deliverables..."
            className="w-full text-xs font-medium bg-slate-50/50 border border-slate-100 rounded-xl p-3 focus:outline-none focus:border-indigo-500 focus:bg-white min-h-[100px] text-gray-700 leading-relaxed transition-all"
          />
        </div>

        {/* Connected tasks tracker */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-1">
            <div className="flex items-center gap-1.5 text-gray-500">
              <CheckSquare className="w-4 h-4 text-gray-400" />
              <label className="text-[11px] font-bold capitalize tracking-wider block">Project Deliverables</label>
            </div>
            <span className="text-[10px] font-bold text-gray-400">
              {projectTasks.filter(t => t.completed).length}/{projectTasks.length} Done
            </span>
          </div>

          {/* Inline short form add task */}
          <form onSubmit={handleAddSubtask} className="flex gap-2">
            <input
              type="text"
              placeholder="Add sub-deliverable..."
              value={subtaskTitle}
              onChange={(e) => setSubtaskTitle(e.target.value)}
              className="flex-1 bg-slate-50 hover:bg-slate-100/50 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 shrink-0 shadow-sm transition-colors cursor-pointer"
            >
              Add
            </button>
          </form>

          {/* Subtask list */}
          <div className="space-y-2 pt-1 transition-all">
            {projectTasks.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic py-2 pl-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                No tasks linked yet. Type above to add!
              </p>
            ) : (
              projectTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-2 py-1.5 px-2 hover:bg-slate-50/50 rounded-lg transition-all ${task.completed ? 'opacity-55' : ''
                    }`}
                >
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${task.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-gray-300 bg-white hover:border-gray-400 cursor-pointer'
                      }`}
                  >
                    {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </button>
                  <span className={`text-xs font-medium text-gray-800 truncate ${task.completed ? 'line-through text-gray-400' : ''
                    }`}>
                    {task.nama_pemohon ? `${task.nopel} - ${task.nama_pemohon}` : (task.title || '')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Project Team Members */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-gray-500 border-b border-gray-100 pb-1 mb-1">
            <Users className="w-4 h-4 text-gray-400" />
            <label className="text-[11px] font-bold capitalize tracking-wider block">Project Circle Members</label>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {members.map((m) => {
              const isProjectMember = selectedProject.members.includes(m.id);
              return (
                <div
                  key={m.id}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all ${isProjectMember
                      ? 'bg-slate-50 border-slate-100'
                      : 'border-dashed border-gray-200/50 hover:bg-slate-50/30'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img src={m.avatarUrl} alt={m.name} className="w-7 h-7 rounded-full object-cover shrink-0 bg-gray-200 shadow-sm" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">{m.name}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold">{m.role}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleProjectMember(m.id)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${isProjectMember
                        ? 'bg-red-50 text-red-600 border border-transparent hover:border-red-200 hover:bg-red-100/30'
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100/50'
                      }`}
                  >
                    {isProjectMember ? 'Remove' : 'Add to Project'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
