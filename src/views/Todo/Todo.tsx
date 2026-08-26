"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageTemplate } from '../../components/templates/PageTemplate';
import { Text } from '../../components/atoms/Text';
import { Input } from '../../components/atoms/Input';
import { Textarea } from '../../components/atoms/Textarea';
import { ProgressBar } from '../../components/atoms/ProgressBar';
import { useMissionStore } from '../../store/missionStore';
import { 
  TrophyIcon, 
  CalendarIcon, 
  BoltIcon, 
  CheckIcon,
  PencilIcon,
  TrashIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const Todo = () => {
  const router = useRouter();
  const { 
    milestones, 
    error,
    isLoading,
    fetchMilestones,
    deleteMilestone, 
    toggleMilestone,
    updateMilestone,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  } = useMissionStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Inline Sub-quest creation state
  const [addingSubtaskForId, setAddingSubtaskForId] = useState<string | null>(null);
  const [inlineSubtaskTitle, setInlineSubtaskTitle] = useState('');

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdownId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  if (isLoading && milestones.length === 0) {
    return (
      <PageTemplate>
        <div className="flex flex-col min-h-screen pb-32">
          {/* Top Premium Welcome Header */}
          <div className="flex-shrink-0 mb-6 text-center">
            <Text size="2xl" weight="bold" className="text-gray-800 mb-1">
              Lifetime Objectives
            </Text>
            <Text size="sm" className="text-gray-500 font-medium">
              Define long-term goals and program daily routines to achieve them.
            </Text>
          </div>

          {/* Premium Skeleton Loading Cards */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center justify-between gap-3 animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageTemplate>
    );
  }

  const handleToggleMilestone = async (id: string) => {
    const milestone = milestones.find(m => m.id === id);
    if (!milestone) return;

    const isCompleted = milestone.status === 'completed';

    try {
      await toggleMilestone(id);
      if (!isCompleted) {
        toast.success(`Objective "${milestone.title}" completed!`);
      } else {
        toast.success(`Objective "${milestone.title}" marked as incomplete.`);
      }
    } catch (err: any) {
      toast.error('Connection error. Unable to update objective.');
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this objective?')) {
      try {
        await deleteMilestone(id);
        toast.success('Objective deleted.');
      } catch (err: any) {
        toast.error('Connection error. Unable to delete objective.');
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (!editTitle.trim()) {
      toast.error('Title is required.');
      return;
    }

    try {
      await updateMilestone(editingId, {
        title: editTitle,
        description: editDescription,
        deadline: editDeadline || undefined
      });
      toast.success('Objective updated successfully!');
      setEditingId(null);
    } catch (err: any) {
      toast.error('Connection error. Unable to update objective.');
    }
  };

  const handleToggleSubtask = async (subtaskId: string, title: string, currentStatus: boolean) => {
    try {
      await toggleSubtask(subtaskId);
      if (!currentStatus) {
        toast.success(`Sub-quest "${title}" completed! ✨`);
      }
    } catch (err: any) {
      toast.error('Failed to update sub-quest.');
    }
  };

  const handleAddInlineSubtask = async (milestoneId: string) => {
    const trimmed = inlineSubtaskTitle.trim();
    if (!trimmed) return;
    try {
      await addSubtask(milestoneId, trimmed);
      setInlineSubtaskTitle('');
      setAddingSubtaskForId(null);
      toast.success('Sub-quest added! 🎯');
    } catch (err: any) {
      toast.error('Failed to add sub-quest.');
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await deleteSubtask(subtaskId);
      toast.success('Sub-quest removed.');
    } catch (err: any) {
      toast.error('Failed to remove sub-quest.');
    }
  };

  const activeMilestones = milestones.filter(m => m.status !== 'completed');
  const completedMilestones = milestones.filter(m => m.status === 'completed');

  const renderEmptyState = () => (
    <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-12 text-center shadow-sm">
      <TrophyIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <Text size="lg" weight="bold" className="text-gray-800 mb-1">
        No Objectives Configured
      </Text>
      <Text size="sm" className="text-gray-400 max-w-xs mx-auto mb-6">
        Set long-term goals to organize your discipline.
      </Text>
      <button 
        onClick={() => router.push('/create')} 
        className="flex items-center justify-center bg-[#7DB8E0] hover:bg-[#6CA7CE] text-white px-6 py-2.5 rounded-2xl cursor-pointer text-sm font-bold transition-all mx-auto"
      >
        Create To Do
      </button>
    </div>
  );

  const renderMilestoneCard = (milestone: typeof milestones[0]) => {
    const isCompleted = milestone.status === 'completed';
    const isEditing = editingId === milestone.id;
    const subtasks = milestone.subtasks || [];
    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter(s => s.isCompleted).length;
    const progressPct = totalSubtasks > 0 
      ? Math.round((completedSubtasks / totalSubtasks) * 100) 
      : (isCompleted ? 100 : 0);

    return (
      <div 
        key={milestone.id}
        className={`bg-white rounded-3xl p-5 border border-gray-100 shadow-sm transition-all duration-200 ${
          isCompleted ? 'bg-gray-50/60 border-gray-100 opacity-80' : ''
        }`}
      >
        {/* Main Header / Edit Form */}
        <div className="flex items-start justify-between gap-4">
          {isEditing ? (
            <div className="flex-1 min-w-0 text-left space-y-3">
              <Input
                label="OBJECTIVE TITLE"
                placeholder="e.g. Complete a major project, Master a new skill"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                variant="noBorder"
              />
              <Textarea
                label="DESCRIPTION (OPTIONAL)"
                placeholder="Describe what success looks like..."
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                variant="noBorder"
                rows={2}
              />
              <Input
                label="DEADLINE TARGET (OPTIONAL)"
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {}
                }}
                variant="noBorder"
                className="w-full text-gray-800 cursor-pointer"
              />
              <div className="grid grid-cols-2 gap-3 w-full mt-4">
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center justify-center gap-1.5 bg-[#7DB8E0] hover:bg-[#6CA7CE] text-white px-4 py-2.5 rounded-2xl cursor-pointer text-xs font-bold transition-all"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-2xl cursor-pointer text-xs font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Left part: Title, Description, and Deadline */}
              <div className="flex-1 min-w-0 text-left">
                {milestone.deadline && (
                  <div className="flex items-center gap-1 mb-1.5 text-[11px] text-[#7DB8E0] font-bold bg-sky-50 px-2.5 py-0.5 rounded-full w-max border border-sky-100/50">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>Target: {new Date(milestone.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                
                <Text 
                  size="lg" 
                  weight="bold" 
                  className={`text-gray-800 break-words ${isCompleted ? 'line-through text-gray-400 font-medium' : ''}`}
                >
                  {milestone.title}
                </Text>
                
                {milestone.description && (
                  <Text size="sm" className={`mt-1 break-words ${isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
                    {milestone.description}
                  </Text>
                )}
              </div>

              {/* Right part: Checklist and Options Dropdown */}
              <div className="flex items-center gap-3 flex-shrink-0 mt-0.5">
                {/* Checklist button */}
                <button
                  onClick={() => handleToggleMilestone(milestone.id)}
                  className={`w-8 h-8 border-2 rounded-full cursor-pointer transition-all bg-white flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? 'border-[#7DB8E0] bg-[#7DB8E0]' : 'border-gray-300 hover:border-[#7DB8E0]'
                  }`}
                  title={isCompleted ? "Mark active" : "Mark achieved"}
                >
                  {isCompleted && <CheckIcon className="w-5 h-5 text-white stroke-[3]" />}
                </button>

                {/* Dropdown Menu (Three dots) */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdownId(activeDropdownId === milestone.id ? null : milestone.id);
                    }}
                    className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center"
                    title="Options"
                  >
                    <EllipsisVerticalIcon className="w-6 h-6" />
                  </button>
                  
                  {activeDropdownId === milestone.id && (
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-100 rounded-2xl shadow-lg py-1.5 z-30">
                      <button
                        onClick={() => {
                          setEditingId(milestone.id);
                          setEditTitle(milestone.title);
                          setEditDescription(milestone.description || '');
                          setEditDeadline(milestone.deadline ? milestone.deadline.substring(0, 10) : '');
                          setActiveDropdownId(null);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                      >
                        <PencilIcon className="w-4 h-4 text-gray-400" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteMilestone(milestone.id);
                          setActiveDropdownId(null);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <TrashIcon className="w-4 h-4 text-red-400" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sub-Quests Section (MMO Quest Line) */}
        {!isEditing && (
          <div className="mt-4 pt-3.5 border-t border-gray-100/80">
            {/* Progress Bar (Matching Mission Card) */}
            {totalSubtasks > 0 && (
              <div className="mb-3.5 w-full">
                <ProgressBar
                  current={completedSubtasks}
                  target={totalSubtasks}
                  variant={progressPct === 100 ? 'emerald' : 'blue'}
                >
                  <div className="text-xs font-bold whitespace-nowrap">
                    {completedSubtasks}/{totalSubtasks}
                  </div>
                </ProgressBar>
              </div>
            )}

            {/* Subtasks Quest Line Checklist */}
            {totalSubtasks > 0 && (
              <div className="relative pl-1 space-y-2 mb-3">
                {totalSubtasks > 1 && (
                  <div className="absolute left-[13px] top-3 bottom-3 w-0.5 bg-gray-100" />
                )}

                {subtasks.map((subtask) => {
                  const isSubDone = subtask.isCompleted;
                  return (
                    <div
                      key={subtask.id}
                      className="relative z-10 flex items-center justify-between gap-2.5 group py-0.5"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(subtask.id, subtask.title, isSubDone)}
                        className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                            isSubDone
                              ? 'bg-[#7DB8E0] border-[#7DB8E0] text-white shadow-xs'
                              : 'border-gray-300 bg-white group-hover:border-[#7DB8E0]'
                          }`}
                        >
                          {isSubDone && <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span
                          className={`text-xs break-words transition-all duration-200 ${
                            isSubDone
                              ? 'line-through text-gray-400 font-normal'
                              : 'text-gray-700 font-medium group-hover:text-gray-900'
                          }`}
                        >
                          {subtask.title}
                        </span>
                      </button>

                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => handleDeleteSubtask(subtask.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 p-1 transition-all cursor-pointer flex-shrink-0"
                          title="Delete sub-quest"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Inline Add Sub-Quest input for active milestones */}
            {!isCompleted && (
              <div className="mt-2">
                {addingSubtaskForId === milestone.id ? (
                  <div className="flex items-center gap-2 animate-fadeIn">
                    <input
                      type="text"
                      placeholder="Add quest milestone..."
                      value={inlineSubtaskTitle}
                      onChange={(e) => setInlineSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInlineSubtask(milestone.id);
                        } else if (e.key === 'Escape') {
                          setAddingSubtaskForId(null);
                          setInlineSubtaskTitle('');
                        }
                      }}
                      autoFocus
                      className="flex-1 text-xs py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-[#7DB8E0]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddInlineSubtask(milestone.id)}
                      className="bg-[#7DB8E0] hover:bg-[#6CA7CE] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingSubtaskForId(null);
                        setInlineSubtaskTitle('');
                      }}
                      className="text-gray-400 hover:text-gray-600 px-2 py-1.5 text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAddingSubtaskForId(milestone.id);
                      setInlineSubtaskTitle('');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-[#7DB8E0] hover:text-[#6CA7CE] font-bold py-1 px-2.5 rounded-xl hover:bg-sky-50/60 transition-all cursor-pointer"
                  >
                    <PlusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Sub-Quest</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <PageTemplate>
      <div className="flex flex-col min-h-screen pb-32">
        
        {/* Top Premium Welcome Header */}
        <div className="flex-shrink-0 mb-6 text-center">
          <Text size="2xl" weight="bold" className="text-gray-800 mb-1">
            Lifetime Objectives
          </Text>
          <Text size="sm" className="text-gray-500 font-medium">
            Define long-term goals and program daily routines to achieve them.
          </Text>
        </div>

        {/* Premium Offline Warning banner */}
        {error && (
          <div className="flex-shrink-0 mb-6 bg-amber-50 border border-amber-200 rounded-3xl p-4 flex items-center gap-3 max-w-md mx-auto shadow-sm animate-fadeIn">
            <BoltIcon className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <Text size="sm" weight="semibold" className="text-amber-800">
                Sync Connection Issue
              </Text>
              <Text size="xs" className="text-amber-600 mt-0.5">
                We are having trouble syncing your progress. Please check your network connection or try again later.
              </Text>
            </div>
          </div>
        )}

        <div className="space-y-6 animate-fadeIn">

          {/* Milestones List */}
          {milestones.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="space-y-6">
              
              {/* Active Goals Section */}
              {activeMilestones.length > 0 ? (
                <div className="space-y-3">
                  <div className="mb-1 text-left px-1">
                    <Text size="base" weight="bold" className="text-gray-600 uppercase tracking-wide">
                      Ongoing Objectives ({activeMilestones.length})
                    </Text>
                  </div>
                  <div className="space-y-4">
                    {activeMilestones.map(renderMilestoneCard)}
                  </div>
                </div>
              ) : (
                /* When there are no active goals but completed ones exist, show same beautiful empty state card */
                renderEmptyState()
              )}

              {/* Completed Goals Section */}
              {completedMilestones.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                    className="flex items-center justify-between w-full text-left px-2 py-2.5 cursor-pointer rounded-2xl"
                  >
                    <div>
                      <Text size="base" weight="bold" className="text-gray-600 uppercase tracking-wide">
                        Achieved Objectives ({completedMilestones.length})
                      </Text>
                    </div>
                    <ChevronRightIcon 
                      className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                        isCompletedExpanded ? 'rotate-90' : ''
                      }`} 
                    />
                  </button>
                  
                  {isCompletedExpanded && (
                    <div className="space-y-4 animate-fadeIn">
                      {completedMilestones.map(renderMilestoneCard)}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </PageTemplate>
  );
};

