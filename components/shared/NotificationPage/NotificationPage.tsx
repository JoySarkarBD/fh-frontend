"use client";

import { useState } from "react";
import { changePasswordAction, logoutAction } from "@/services/auth";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff, FiLock, FiEdit3 } from "react-icons/fi";

const notificationItems = [
  {
    id: "new-listing",
    title: "New Listing Alerts",
    description:
      "When a property matching their saved search criteria is listed.",
  },
  {
    id: "open-house",
    title: "Open House Reminders",
    description: "For upcoming open houses they registered for.",
  },
  {
    id: "favorites",
    title: "Favorites Activity",
    description: "When a favorites property is sold, rented, or desisted.",
  },
  {
    id: "listing-live",
    title: "Listing Live Notification",
    description: "When their property is published on the site/portal.",
  },
  {
    id: "market-updates",
    title: "Market Updates",
    description:
      "Weekly/monthly digest emails with new listings and market trends.",
  },
  {
    id: "document-submission",
    title: "Document Submission Reminders",
    description: "For lease agreements, inspection reports, etc.",
  },
  {
    id: "user-reports",
    title: "User Reports",
    description:
      "New user registrations, flagged accounts, suspicious activity.",
  },
  {
    id: "listing-moderation",
    title: "Listing Moderation",
    description: "New listings pending approval, flagged listings.",
  },
];

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
  const router = useRouter();
  // const [notifType, setNotifType] = useState<"email" | "push">("email");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg("All password fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await changePasswordAction({
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      });
      // Log out and redirect to login with notification
      await logoutAction();
      router.push("/login?passwordChanged=1");
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message || "Failed to update password.");
      } else {
        setErrorMsg("Failed to update password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className=''>
      {/* ── Notification Settings ── */}
      <h1 className='text-4xl mb-6'>Notification Settings</h1>

      {/* Notification Type */}
      {/* <div className='bg-gray-100 border border-gray-200 rounded-md px-5 py-4 mb-1'>
        <p className='font-semibold text-sm mb-2.5'>Notification Type</p>
        <div className='flex gap-6'>
          {(["email", "push"] as const).map((type) => (
            <label
              key={type}
              className='flex items-center gap-1.5 cursor-pointer text-sm'>
              <input
                type='radio'
                name='notifType'
                checked={notifType === type}
                onChange={() => setNotifType(type)}
                className='accent-[#4a7c5c]'
              />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>
      </div> */}

      {/* Notification List */}
      <div id='notifications' className='overflow-hidden'>
        {notificationItems.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center justify-between gap-4 px-5 py-3.5 border border-gray-200 rounded-md mb-2 hover:bg-gray-50 transition-colors ${
              index < notificationItems.length - 1
                ? "border-b border-gray-100"
                : ""
            }`}>
            <div className='flex-1 min-w-0'>
              <p className='text-[19px] mb-0.5 font-mono'>{item.title}</p>
              <p className='text-sm text-gray-500'>{item.description}</p>
            </div>
            <input
              type='checkbox'
              checked={!!checked[item.id]}
              onChange={() => toggleCheck(item.id)}
              className='w-4 h-4 cursor-pointer accent-[#4a7c5c] shrink-0'
            />
          </div>
        ))}
      </div>

      {/* ── Security Settings ── */}
      <div
        id='security'
        className='flex items-center justify-between mt-10 mb-4 flex-wrap gap-2'>
        <h2 className='text-4xl mb-6'>Security Settings</h2>
        <button className='flex items-center gap-1.5 bg-[#4a7c5c] hover:bg-[#3a6347] text-white text-[16px] px-4 py-2 rounded-md transition-colors'>
          <FiEdit3 size={15} />
          Edit
        </button>
      </div>

      {/* Auth Card */}
      <div className='border border-gray-200 rounded-md p-6'>
        <h3 className='text-2xl mb-5 border-b border-[#D1CEC6] pb-2'>
          Authentication &amp; Access Control
        </h3>
        <form onSubmit={handlePasswordChange}>
          <PasswordField
            label='Change Password'
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
          {errorMsg && <div className='text-red-600 mb-3'>{errorMsg}</div>}
          {successMsg && (
            <div className='text-green-600 mb-3'>{successMsg}</div>
          )}
          <div className='flex justify-end gap-3 flex-col-reverse sm:flex-row '>
            <button
              type='button'
              className='px-5 py-3 text-[16px] border border-gray-300 rounded-md text-(--primary-text-color) hover:bg-gray-50 transition-colors'
              onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              disabled={loading}>
              Cancel
            </button>
            <button
              type='submit'
              className='px-5 py-2 text-[16px] bg-[#3d6e50] hover:bg-[#2f5a41] text-white rounded-md transition-colors'
              disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
