"use client";

import { useState } from "react";
import { FiX, FiEdit3, FiTrash2 } from "react-icons/fi";
import type {
  IMaintenanceResponse,
  MaintenanceStatus,
  ICreateMaintenance,
} from "@/services/maintenance";

const MAINTENANCE_STATUS: Array<{ value: MaintenanceStatus; label: string }> = [
  { value: "PENDING" as MaintenanceStatus, label: "Pending" },
  { value: "DONE" as MaintenanceStatus, label: "Done" },
];

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit" | "view";
  initialData?: IMaintenanceResponse | null;
  onSubmit: (data: ICreateMaintenance) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onEdit?: (data: IMaintenanceResponse) => void;
  isSubmitting?: boolean;
  isDeleting?: boolean;
}

const MaintenanceModal = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
  onDelete,
  onEdit,
  isSubmitting = false,
  isDeleting = false,
}: MaintenanceModalProps) => {
  // Initialize state directly from props
  const [amenities, setAmenities] = useState(() => {
    if (mode !== "add" && initialData) return initialData.amenities || "";
    return "";
  });

  const [task, setTask] = useState(() => {
    if (mode !== "add" && initialData) return initialData.task || "";
    return "";
  });

  const [reminderDate, setReminderDate] = useState(() => {
    if (mode !== "add" && initialData) {
      const date = new Date(initialData.reminderDate);
      return date.toISOString().split("T")[0];
    }
    return "";
  });

  const [description, setDescription] = useState(() => {
    if (mode !== "add" && initialData) return initialData.description || "";
    return "";
  });

  const [status, setStatus] = useState<MaintenanceStatus>(() => {
    if (mode !== "add" && initialData)
      return initialData.status || ("PENDING" as MaintenanceStatus);
    return "PENDING" as MaintenanceStatus;
  });

  // If modal is closed, don't render
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    if (mode === "view") return; // Can't submit in view mode

    // Validation
    if (!amenities.trim()) {
      alert("Amenities is required");
      return;
    }
    if (!task.trim()) {
      alert("Task is required");
      return;
    }
    if (!reminderDate) {
      alert("Reminder date is required");
      return;
    }
    if (!description.trim()) {
      alert("Description is required");
      return;
    }

    await onSubmit({
      amenities: amenities.trim(),
      task: task.trim(),
      reminderDate,
      description: description.trim(),
      status: mode === "edit" ? status : undefined,
    });

    handleClose();
  };

  const handleDelete = async () => {
    if (!initialData?._id && !initialData?.id) return;

    const shouldDelete = window.confirm(
      `Delete maintenance request for "${initialData.amenities}"? This action cannot be undone.`,
    );
    if (!shouldDelete) return;

    const id = initialData._id || initialData.id;
    if (onDelete) {
      await onDelete(id);
    }
  };

  const handleEdit = () => {
    if (initialData && onEdit) {
      onEdit(initialData);
    }
  };

  const isViewMode = mode === "view";
  const title =
    mode === "add"
      ? "Add Maintenance"
      : mode === "edit"
        ? "Edit Maintenance"
        : "Maintenance Details";

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-xl border-2 border-[#D1CEC6] w-full max-w-2xl mx-4 shadow-xl'>
        <div className='flex items-center justify-between px-6 py-5 border-b border-[#D1CEC6]'>
          <h2 className='text-2xl font-semibold text-gray-800'>{title}</h2>
          <div className='flex items-center gap-2'>
            {/* In view mode, show Edit and Delete buttons */}
            {isViewMode && (
              <>
                {onEdit && (
                  <button
                    onClick={handleEdit}
                    className='flex items-center gap-1 px-3 py-1.5 text-sm border border-[#D1CEC6] rounded-lg hover:bg-[#f7f7f5]'>
                    <FiEdit3 size={16} />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className='flex items-center gap-1 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-60'>
                    <FiTrash2 size={16} />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                )}
              </>
            )}
            <button
              onClick={handleClose}
              className='text-gray-400 hover:text-gray-600'>
              <FiX size={22} />
            </button>
          </div>
        </div>

        <div className='px-6 py-5 space-y-5'>
          {/* Amenities */}
          <div>
            <label className='block text-sm text-gray-600 mb-2'>
              Amenities {!isViewMode && <span className='text-red-500'>*</span>}
            </label>
            <input
              type='text'
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              disabled={isViewMode}
              placeholder='Enter amenities name'
              className='w-full border border-[#D1CEC6] rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4A90B8] disabled:bg-gray-50 disabled:text-gray-500'
            />
          </div>

          {/* Task */}
          <div>
            <label className='block text-sm text-gray-600 mb-2'>
              Task {!isViewMode && <span className='text-red-500'>*</span>}
            </label>
            <input
              type='text'
              value={task}
              onChange={(e) => setTask(e.target.value)}
              disabled={isViewMode}
              placeholder='Enter task'
              className='w-full border border-[#D1CEC6] rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4A90B8] disabled:bg-gray-50 disabled:text-gray-500'
            />
          </div>

          {/* Reminder Date */}
          <div>
            <label className='block text-sm text-gray-600 mb-2'>
              Reminder Date{" "}
              {!isViewMode && <span className='text-red-500'>*</span>}
            </label>
            <input
              type='date'
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              disabled={isViewMode}
              className='w-full border border-[#D1CEC6] rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#4A90B8] disabled:bg-gray-50 disabled:text-gray-500'
            />
          </div>

          {/* Description */}
          <div>
            <label className='block text-sm text-gray-600 mb-2'>
              Description{" "}
              {!isViewMode && <span className='text-red-500'>*</span>}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isViewMode}
              placeholder='Enter detailed description'
              rows={4}
              className='w-full border border-[#D1CEC6] rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4A90B8] disabled:bg-gray-50 disabled:text-gray-500 resize-none'
            />
          </div>

          {/* Status - Only show in edit/view mode */}
          {(mode === "edit" || mode === "view") && (
            <div>
              <label className='block text-sm text-gray-600 mb-2'>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                disabled={isViewMode}
                className='w-full border border-[#D1CEC6] rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#4A90B8] disabled:bg-gray-50 disabled:text-gray-500'>
                {MAINTENANCE_STATUS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className='flex justify-end gap-3 px-6 py-4 border-t border-[#D1CEC6]'>
          <button
            onClick={handleClose}
            className='px-5 py-2 rounded-lg border border-[#D1CEC6] text-gray-600 text-sm hover:bg-gray-50'>
            Close
          </button>
          {!isViewMode && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className='px-5 py-2 rounded-lg bg-[#5F8E7E] text-white text-sm hover:bg-[#4e7a6c] disabled:opacity-60'>
              {isSubmitting ? "Saving..." : mode === "add" ? "Add" : "Update"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceModal;
