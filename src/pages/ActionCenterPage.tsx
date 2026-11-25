import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Edit2,
  X,
  ChevronDown,
  ChevronUp,
  Building,
  Quote,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { ActionItem } from '../types';
import { NOVA_TECH_PRODUCTS } from '../data/mockReviews';

const DEPARTMENTS = [
  'Engineering',
  'Customer Support',
  'Product Design',
  'Quality Assurance',
  'Operations',
  'Marketing',
] as const;

export const ActionCenterPage: React.FC = () => {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [expandedEvidence, setExpandedEvidence] = useState<Record<string, boolean>>({});

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionItem | null>(null);
  const [deletingActionId, setDeletingActionId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formProduct, setFormProduct] = useState(NOVA_TECH_PRODUCTS[0]);
  const [formDepartment, setFormDepartment] = useState<ActionItem['department']>('Engineering');
  const [formPriority, setFormPriority] = useState<ActionItem['priority']>('High');
  const [formSuggestedAction, setFormSuggestedAction] = useState('');
  const [formEvidence, setFormEvidence] = useState('');

  const loadActions = async () => {
    setLoading(true);
    try {
      const data = await api.getActions();
      setActions(data);
    } catch (e) {
      console.error('Failed to load actions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, []);

  const toggleEvidence = (id: string) => {
    setExpandedEvidence((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    try {
      const created = await api.createAction({
        title: formTitle.trim(),
        description: formDescription.trim(),
        affectedProduct: formProduct,
        department: formDepartment,
        priority: formPriority,
        suggestedAction: formSuggestedAction.trim(),
        supportingEvidence: formEvidence.trim() ? [formEvidence.trim()] : [],
        status: 'Open',
      });
      setActions([created, ...actions]);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (e) {
      console.error('Failed to create action:', e);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ActionItem['status']) => {
    try {
      const updated = await api.updateAction(id, { status: newStatus });
      if (updated) {
        setActions(actions.map((a) => (a.id === id ? updated : a)));
      }
    } catch (e) {
      console.error('Failed to update action status:', e);
    }
  };

  const handleUpdatePriority = async (id: string, newPriority: ActionItem['priority']) => {
    try {
      const updated = await api.updateAction(id, { priority: newPriority });
      if (updated) {
        setActions(actions.map((a) => (a.id === id ? updated : a)));
      }
    } catch (e) {
      console.error('Failed to update action priority:', e);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAction) return;

    try {
      const updated = await api.updateAction(editingAction.id, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        affectedProduct: formProduct,
        department: formDepartment,
        priority: formPriority,
        suggestedAction: formSuggestedAction.trim(),
      });
      if (updated) {
        setActions(actions.map((a) => (a.id === editingAction.id ? updated : a)));
      }
      setEditingAction(null);
      resetForm();
    } catch (e) {
      console.error('Failed to update action:', e);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingActionId) return;
    try {
      await api.deleteAction(deletingActionId);
      setActions(actions.filter((a) => a.id !== deletingActionId));
      setDeletingActionId(null);
    } catch (e) {
      console.error('Failed to delete action:', e);
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormProduct(NOVA_TECH_PRODUCTS[0]);
    setFormDepartment('Engineering');
    setFormPriority('High');
    setFormSuggestedAction('');
    setFormEvidence('');
  };

  const startEdit = (action: ActionItem) => {
    setEditingAction(action);
    setFormTitle(action.title);
    setFormDescription(action.description);
    setFormProduct(action.affectedProduct);
    setFormDepartment(action.department);
    setFormPriority(action.priority);
    setFormSuggestedAction(action.suggestedAction);
  };

  const filteredActions = actions.filter((a) => {
    if (statusFilter !== 'All' && a.status !== statusFilter) return false;
    if (departmentFilter !== 'All' && a.department !== departmentFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-14 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1.5">
            <CheckSquare className="w-3 h-3 text-[#635BFF]" />
            Closed-Loop Resolution Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Smart Action Center
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Convert customer complaints into prioritized business tasks, assign departments, and track resolution.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Action Item</span>
        </button>
      </div>

      {/* Filter and Status Counter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['All', 'Open', 'In Progress', 'Resolved'] as const).map((st) => {
            const count = st === 'All' ? actions.length : actions.filter((a) => a.status === st).length;
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Item Cards */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading action items...</p>
        </div>
      ) : filteredActions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Action Items in this Filter</h3>
          <p className="text-xs text-slate-400">All customer issues in this cohort have been reviewed or resolved.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActions.map((action) => {
            const isExpanded = expandedEvidence[action.id];
            return (
              <div
                key={action.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Priority Selector Badge */}
                      <select
                        value={action.priority}
                        onChange={(e) => handleUpdatePriority(action.id, e.target.value as any)}
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border cursor-pointer focus:outline-hidden ${
                          action.priority === 'High'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : action.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="High">High Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="Low">Low Priority</option>
                      </select>

                      {/* Status Selector Badge */}
                      <select
                        value={action.status}
                        onChange={(e) => handleUpdateStatus(action.id, e.target.value as any)}
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border cursor-pointer focus:outline-hidden ${
                          action.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : action.status === 'In Progress'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>

                      <span className="text-xs font-semibold text-slate-400">•</span>
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50/60 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {action.department}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 pt-0.5">{action.title}</h3>
                    <p className="text-xs text-slate-500">{action.description}</p>
                  </div>

                  {/* Actions & Buttons */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    {action.status !== 'Resolved' && (
                      <button
                        onClick={() => handleUpdateStatus(action.id, 'Resolved')}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Mark as Resolved"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}

                    <button
                      onClick={() => startEdit(action)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Action"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeletingActionId(action.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Action"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Suggested Action Box */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Suggested Business Remedy:</span>
                  </div>
                  <p>{action.suggestedAction}</p>
                </div>

                {/* Supporting Review Evidence Toggle */}
                {action.supportingEvidence.length > 0 && (
                  <div>
                    <button
                      onClick={() => toggleEvidence(action.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      <Quote className="w-3.5 h-3.5" />
                      <span>{isExpanded ? 'Hide Supporting Review Evidence' : `View Evidence (${action.supportingEvidence.length} Quotes)`}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-1.5 text-xs animate-in fade-in">
                        {action.supportingEvidence.map((ev, i) => (
                          <div key={i} className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-200/60 text-slate-700 italic">
                            {ev}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE ACTION MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Create New Action Item</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAction} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Issue Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Audit NovaBook Ultra Hinge Torque"
                  className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Affected Product
                  </label>
                  <select
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value)}
                    className="w-full text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg p-2.5"
                  >
                    {NOVA_TECH_PRODUCTS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value as any)}
                    className="w-full text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg p-2.5"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Priority
                </label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as any)}
                  className="w-full text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg p-2.5"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Suggested Remedy / Action
                </label>
                <textarea
                  rows={2}
                  value={formSuggestedAction}
                  onChange={(e) => setFormSuggestedAction(e.target.value)}
                  placeholder="Recommended business action to eliminate defect..."
                  className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Supporting Customer Quote / Evidence
                </label>
                <input
                  type="text"
                  value={formEvidence}
                  onChange={(e) => setFormEvidence(e.target.value)}
                  placeholder="e.g. 'Hinge cracked after two weeks and trackpad rattled' - Customer"
                  className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save Action Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ACTION MODAL */}
      {editingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Edit Action Item</h3>
              <button onClick={() => setEditingAction(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Issue Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Affected Product</label>
                  <select
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value)}
                    className="w-full text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg p-2.5"
                  >
                    {NOVA_TECH_PRODUCTS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Department</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value as any)}
                    className="w-full text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg p-2.5"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Suggested Remedy</label>
                <textarea
                  rows={2}
                  value={formSuggestedAction}
                  onChange={(e) => setFormSuggestedAction(e.target.value)}
                  className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingAction(null)} className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs">
                  Update Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingActionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Delete Action Item?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will remove this task from the Smart Action Center and database.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingActionId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
