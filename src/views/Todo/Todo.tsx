import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '../../components/templates/PageTemplate';
import { Text } from '../../components/atoms/Text';
import { Input } from '../../components/atoms/Input';
import { Textarea } from '../../components/atoms/Textarea';
import { useMissionStore } from '../../store/missionStore';
import { 
  TrophyIcon, 
  CalendarIcon, 
  BoltIcon, 
  CheckIcon,
  PencilIcon,
  TrashIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const Todo = () => {
  const navigate = useNavigate();
  const { 
    milestones, 
    error,
    isLoading,
    fetchMilestones,
    deleteMilestone, 
    toggleMilestone,
    updateMilestone
  } = useMissionStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

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
              <div key={i} className="bg-white rounded-3xl p-5 border border-gray-200 shadow-md flex items-start gap-3 animate-pulse">
                {/* Circle checkbox skeleton */}
                <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-3">
                  {/* Target pill skeleton */}
                  <div className="h-5 bg-sky-50 rounded-full w-28" />
                  {/* Title skeleton */}
                  <div className="h-5 bg-gray-100 rounded-md w-1/2" />
                  {/* Desc skeleton */}
                  <div className="h-3 bg-gray-50 rounded-md w-2/3" />
                  {/* Buttons skeleton */}
                  <div className="grid grid-cols-2 gap-3 w-full pt-2">
                    <div className="h-9 bg-gray-100 rounded-2xl" />
                    <div className="h-9 bg-gray-100 rounded-2xl" />
                  </div>
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
        onClick={() => navigate('/create')} 
        className="flex items-center justify-center bg-[#7DB8E0] hover:bg-[#6CA7CE] text-white px-6 py-2.5 rounded-2xl cursor-pointer text-sm font-bold transition-all mx-auto"
      >
        Create To Do
      </button>
    </div>
  );

  const renderMilestoneCard = (milestone: typeof milestones[0]) => {
    const isCompleted = milestone.status === 'completed';
    const isEditing = editingId === milestone.id;

    return (
      <div 
        key={milestone.id}
        className={`bg-white rounded-3xl p-5 border border-gray-200 shadow-md transition-all duration-300 ${
          isCompleted ? 'bg-green-50/20 border-green-100 opacity-80' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          
          {!isEditing && (
            /* Checkbox button */
            <button
              onClick={() => handleToggleMilestone(milestone.id)}
              className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                isCompleted
                  ? 'bg-green-500 border-green-600 text-white'
                  : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
              }`}
              title={isCompleted ? "Mark active" : "Mark achieved"}
            >
              {isCompleted && <CheckIcon className="w-5 h-5 stroke-[3]" />}
            </button>
          )}

          {isEditing ? (
            /* Editing Form */
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
            /* Title & Desc display */
            <div className="flex-1 min-w-0 text-left">
              {milestone.deadline && (
                <div className="flex items-center gap-1 mb-1.5 text-[11px] text-[#7DB8E0] font-bold bg-sky-50 px-2 py-0.5 rounded-full w-max border border-sky-100/50">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Target: {new Date(milestone.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
              
              <Text 
                size="lg" 
                weight="bold" 
                className={`text-gray-800 break-words ${isCompleted ? 'line-through text-gray-400' : ''}`}
              >
                {milestone.title}
              </Text>
              
              {milestone.description && (
                <Text size="sm" className="text-gray-500 mt-1 break-words">
                  {milestone.description}
                </Text>
              )}

              {/* Premium Action Pill Buttons Grid */}
              <div className="mt-4 grid grid-cols-2 gap-3 w-full">
                <button 
                  onClick={() => {
                    setEditingId(milestone.id);
                    setEditTitle(milestone.title);
                    setEditDescription(milestone.description || '');
                    setEditDeadline(milestone.deadline ? milestone.deadline.substring(0, 10) : '');
                  }}
                  className="flex items-center justify-center gap-1.5 bg-[#7DB8E0] hover:bg-[#6CA7CE] text-white px-4 py-2.5 rounded-2xl cursor-pointer text-xs font-bold transition-all"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteMilestone(milestone.id)}
                  className="flex items-center justify-center gap-1.5 bg-[#FF6565] hover:bg-[#E55B5B] text-white px-4 py-2.5 rounded-2xl cursor-pointer text-xs font-bold transition-all"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          )}

        </div>
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
