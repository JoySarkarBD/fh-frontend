"use client";


import { useNotificationSettings, useToggleNotificationSettingMutation } from "@/actions/hooks/notificaton-settings.hooks";
import { startTransition, useEffect, useState } from "react";
import { FiEdit3, FiEye, FiEyeOff, FiLock } from "react-icons/fi";

interface PasswordFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  show,
  onToggle,
}: PasswordFieldProps) {
  return (
    <div className='mb-4'>
      <label className='block text-sm text-(--primary-text-color) mb-1.5'>
        {label}
      </label>
      <div className='relative'>
        <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center pointer-events-none'>
          <FiLock size={15} className='text-(--primary-text-color)' />
        </span>
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-md text-sm outline-none focus:border-gray-400 placeholder:text-gray-400 text-gray-700'
        />
        <button
          type='button'
          onClick={onToggle}
          className='absolute right-3 top-1/2 -translate-y-1/2 text-(--primary-text-color) hover:text-gray-600 flex items-center'>
          {show ? <FiEye size={16} /> : <FiEyeOff size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function NotificationPage() {
  // ============================================================================
  // React Query Hooks
  // ============================================================================
  
  // Get all notification settings
  const { 
    data: settings, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useNotificationSettings();

  console.log(settings, 'kire settngs');
  
  // Toggle mutation
  const { 
    toggleSetting, 
    isLoading: isToggling 
  } = useToggleNotificationSettingMutation();

  // ============================================================================
  // Local State
  // ============================================================================
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  
  // Password states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);


  // Sync backend data with local state (using _id as key)

useEffect(() => {
  if (settings) {
    // Create a map of notification _id -> isActive
    const backendState: Record<string, boolean> = {};
    
    settings.forEach(setting => {
      // Check if _id exists before using it as index
      if (setting._id) {
        backendState[setting._id] = setting.isActive;
      }
    });
    
    startTransition(() => {
      setChecked(backendState);
    });
  }
}, [settings]);


  // Handlers


  const toggleCheck = async (id: string) => {
    // Find the setting by _id
    const setting = settings?.find(s => s._id === id);
    if (!setting) {
      alert("Setting not found in database");
      return;
    }

    const newState = !checked[id];
    
    // Optimistically update UI
    setChecked(prev => ({ ...prev, [id]: newState }));

    // Call API to toggle
   if(setting._id){
     toggleSetting(
      { id: setting._id, isActive: newState },
      {
        // onSuccess: () => {
        //   alert(
        //     newState 
        //       ? `${setting.title} enabled successfully` 
        //       : `${setting.title} disabled successfully`
        //   );
        // },
        onError: (error) => {
          // Revert on error
          setChecked(prev => ({ ...prev, [id]: !newState }));
          alert(`Failed to update: ${error.message}`);
        },
      }
    );
   }
  };

  const handleUpdatePassword = () => {
    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    // TODO: Implement password update API call
    alert("Password updated successfully");
    
    // Clear form
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditing(false);
  };

  // ============================================================================
  // Loading & Error States
  // ============================================================================

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-100'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a7c5c]'></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='text-center py-12'>
        <p className='text-red-600 mb-4'>Error loading settings: {error?.message}</p>
        <button 
          onClick={() => refetch()}
          className='px-4 py-2 bg-[#4a7c5c] text-white rounded-md hover:bg-[#3a6347]'
        >
          Try Again
        </button>
      </div>
    );
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className=''>
      {/* ── Notification Settings ── */}
      <h1 className='text-4xl mb-6'>Notification Settings</h1>

      {/* Notification List */}
      <div id='notifications' className='overflow-hidden'>
        {settings?.map((setting, index) => {
          const isLoading = isToggling && Boolean(setting._id);
          
          return (
      <div
  key={setting._id || setting.id} // fallback হিসেবে id ব্যবহার করুন
  className={`flex items-center justify-between gap-4 px-5 py-3.5 border border-gray-200 rounded-md mb-2 hover:bg-gray-50 transition-colors ${
    index < settings.length - 1
      ? "border-b border-gray-100"
      : ""
  } ${isLoading ? 'opacity-50' : ''}`}>
  <div className='flex-1 min-w-0'>
    <p className='text-[19px] mb-0.5 font-mono'>{setting.title}</p>
    <p className='text-sm text-gray-500'>{setting.description}</p>
  </div>
  
  {/* Simple Checkbox (as originally designed) */}
  <input
    type='checkbox'
    checked={setting._id ? (checked[setting._id] || false) : false}
    onChange={() => setting._id && toggleCheck(setting._id)}
    disabled={isLoading || !setting._id}
    className='w-5 h-5 cursor-pointer accent-[#4a7c5c] shrink-0'
  />
</div>
          );
        })}
      </div>

      {/* ── Security Settings ── */}
      <div
        id='security'
        className='flex items-center justify-between mt-10 mb-4 flex-wrap gap-2'>
        <h2 className='text-4xl mb-6'>Security Settings</h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className='flex items-center gap-1.5 bg-[#4a7c5c] hover:bg-[#3a6347] text-white text-[16px] px-4 py-2 rounded-md transition-colors'>
            <FiEdit3 size={15} />
            Edit
          </button>
        )}
      </div>

      {/* Auth Card */}
      <div className='border border-gray-200 rounded-md p-6'>
        <h3 className='text-2xl mb-5 border-b border-[#D1CEC6] pb-2'>
          Authentication &amp; Access Control
        </h3>

        {isEditing ? (
          <>
            <PasswordField
              label='Current Password'
              placeholder='Enter current password'
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrent}
              onToggle={() => setShowCurrent((v) => !v)}
            />
            <PasswordField
              label='New Password'
              placeholder='Enter new password'
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggle={() => setShowNew((v) => !v)}
            />
            <div className='mb-6'>
              <PasswordField
                label='Confirm New Password'
                placeholder='Confirm new password'
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
              />
            </div>

            <div className='flex justify-end gap-3 flex-col-reverse sm:flex-row'>
              <button 
                onClick={handleCancel}
                className='px-5 py-3 text-[16px] border border-gray-300 rounded-md text-(--primary-text-color) hover:bg-gray-50 transition-colors'>
                Cancel
              </button>
              <button 
                onClick={handleUpdatePassword}
                className='px-5 py-2 text-[16px] bg-[#3d6e50] hover:bg-[#2f5a41] text-white rounded-md transition-colors'>
                Update Password
              </button>
            </div>
          </>
        ) : (
          <div className='text-center py-8 text-gray-500'>
            <p className="mb-2">Your password is securely stored.</p>
            <p className="text-sm">{`Click "Edit" to change your password.`}</p>
          </div>
        )}
      </div>

    
    </div>
  );
}