"use client";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaCamera } from "react-icons/fa6";
import {
  FiEdit2,
  FiEdit3,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

import type { UserProfile, UserAddress } from "@/types/user";
import {
  useUserProfile,
  useUpdateProfileMutation,
  useAddAddressMutation,
} from "@/actions/hooks/auth.hooks";

type ProfilePageProps = {
  initialProfile?: UserProfile | null;
};

const ProfilePage: React.FC<ProfilePageProps> = ({ initialProfile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedProfileImageFile, setSelectedProfileImageFile] =
    useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null,
  );

  // TanStack Query hooks
  const { data: profileData } = useUserProfile({
    initialData: initialProfile,
  });

  const updateProfileMutation = useUpdateProfileMutation({
    onSuccess: () => {
      setIsEditing(false);
      setSelectedProfileImageFile(null);
      setProfileImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  const addAddressMutation = useAddAddressMutation({
    onSuccess: () => {
      setShowAddModal(false);
      setAddLine1("");
      setAddPhone("");
      setAddType("home");
    },
  });

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<"home" | "office">("home");
  const [addLine1, setAddLine1] = useState<string>("");
  const [addPhone, setAddPhone] = useState<string>("");
  const [addError, setAddError] = useState<string>("");

  const memberSince = (() => {
    if (!profileData?.createdAt) return "-";
    const date = new Date(profileData.createdAt);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  })();

  const addresses = useMemo<UserAddress[]>(() => {
    const list: UserAddress[] = [];

    if (
      (profileData?.homeAddress ?? "").trim() ||
      (profileData?.homePhone ?? "").trim()
    ) {
      list.push({
        id: 1,
        type: "Home",
        isDefault: true,
        line1: profileData?.homeAddress ?? "",
        phone: profileData?.homePhone ?? "",
      });
    }

    if (
      (profileData?.officeAddress ?? "").trim() ||
      (profileData?.officePhone ?? "").trim()
    ) {
      list.push({
        id: 2,
        type: "Office",
        isDefault: list.length === 0,
        line1: profileData?.officeAddress ?? "",
        phone: profileData?.officePhone ?? "",
      });
    }

    return list;
  }, [
    profileData?.homeAddress,
    profileData?.homePhone,
    profileData?.officeAddress,
    profileData?.officePhone,
  ]);

  useEffect(() => {
    return () => {
      if (profileImagePreview && profileImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;

    const file = e.target.files?.[0];
    if (!file) return;

    if (profileImagePreview && profileImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(profileImagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedProfileImageFile(file);
    setProfileImagePreview(previewUrl);
    setAddError("");
  };

  // Edit profile (name + phone)
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState<string>(profileData?.name ?? "");
  const [editPhone, setEditPhone] = useState<string>(profileData?.phone ?? "");
  const [editFacebook, setEditFacebook] = useState<string>(
    profileData?.facebookLink ?? "",
  );
  const [editInstagram, setEditInstagram] = useState<string>(
    profileData?.instagramLink ?? "",
  );
  const [editTwitter, setEditTwitter] = useState<string>(
    profileData?.twitterLink ?? "",
  );
  const [editLinkedin, setEditLinkedin] = useState<string>(
    profileData?.linkedinLink ?? "",
  );
  const isAdmin = String(profileData?.role ?? "").toUpperCase() === "ADMIN";

  const startEdit = () => {
    setEditName(profileData?.name ?? "");
    setEditPhone(profileData?.phone ?? "");
    setEditFacebook(profileData?.facebookLink ?? "");
    setEditInstagram(profileData?.instagramLink ?? "");
    setEditTwitter(profileData?.twitterLink ?? "");
    setEditLinkedin(profileData?.linkedinLink ?? "");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditName(profileData?.name ?? "");
    setEditPhone(profileData?.phone ?? "");
    setEditFacebook(profileData?.facebookLink ?? "");
    setEditInstagram(profileData?.instagramLink ?? "");
    setEditTwitter(profileData?.twitterLink ?? "");
    setEditLinkedin(profileData?.linkedinLink ?? "");
    setSelectedProfileImageFile(null);
    setProfileImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setAddError("");
  };

  const saveProfile = async () => {
    try {
      setAddError("");
      updateProfileMutation.mutate({
        name: editName,
        phone: editPhone,
        ...(selectedProfileImageFile
          ? { profileImage: selectedProfileImageFile }
          : {}),
        ...(isAdmin
          ? {
              facebookLink: editFacebook,
              instagramLink: editInstagram,
              twitterLink: editTwitter,
              linkedinLink: editLinkedin,
            }
          : {}),
      });
    } catch (err) {
      setAddError(
        err instanceof Error ? err.message : "Failed to save profile",
      );
    }
  };

  const clearAddressField = async (type: "home" | "office") => {
    try {
      addAddressMutation.mutate({ type, address: "", phone: "" });
    } catch (error) {
      setAddError(
        error instanceof Error ? error.message : "Failed to remove address",
      );
    }
  };

  const handleAddDone = async () => {
    try {
      setAddError("");

      addAddressMutation.mutate({
        type: addType,
        address: addLine1,
        phone: addPhone,
      });
    } catch (error) {
      setAddError(
        error instanceof Error ? error.message : "Failed to add address",
      );
    }
  };

  const isLoading =
    updateProfileMutation.isPending || addAddressMutation.isPending;
  const isProfileSaving = updateProfileMutation.isPending;
  const hasProfileImage = Boolean((profileData?.profileImage ?? "").trim());
  const avatarText = (profileData?.name ?? "U").trim().charAt(0).toUpperCase();

  if (!profileData) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-gray-500'>No profile data available.</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen'>
      <div className='mx-auto flex flex-col gap-5'>
        {/* ── Profile Overview Card ── */}
        <div className='bg-white rounded-lg border border-[#D1CEC6] overflow-hidden'>
          {/* Header */}
          <div className='flex items-center justify-between px-5 py-3.5'>
            <p className='font-medium text-[28px] text-gray-800'>
              Profile Overview
            </p>
            {!isEditing ? (
              <button
                onClick={startEdit}
                className='flex items-center gap-1.5 text-sm font-medium px-6 py-3 rounded transition-colors bg-[#619B7F] hover:bg-[#3d6b4a] text-white'>
                <FiEdit3 size={15} />
                <span className='text-white'>Edit</span>
              </button>
            ) : (
              <div className='flex items-center gap-2'>
                <button
                  onClick={saveProfile}
                  disabled={isLoading}
                  className='flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded bg-[#619B7F] text-white disabled:opacity-50'>
                  {isProfileSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={isLoading}
                  className='flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded bg-gray-200 text-[#1B1B1A] disabled:opacity-50'>
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Body */}
          <div className='p-5'>
            {/* Avatar */}
            <div className='mb-5'>
              <div
                onClick={() => {
                  if (isEditing) fileInputRef.current?.click();
                }}
                className={`w-34 h-34 rounded-full overflow-hidden border-2 border-[#D1CEC6] mb-1.5 ${
                  isEditing ? "cursor-pointer" : "cursor-default"
                }`}>
                <div className='relative w-full h-full'>
                  {profileImagePreview ? (
                    <Image
                      src={profileImagePreview}
                      alt={profileData?.name ?? "Profile"}
                      width={400}
                      height={400}
                      unoptimized
                      className='w-full h-full object-cover'
                    />
                  ) : hasProfileImage ? (
                    <Image
                      src={profileData?.profileImage as string}
                      alt={profileData?.name ?? "Profile"}
                      width={500}
                      height={500}
                      unoptimized
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center bg-[#e8f0ec] text-[#3d6b4a] text-4xl font-semibold'>
                      {avatarText || "U"}
                    </div>
                  )}
                  {isEditing && (
                    <div className='absolute bottom-0 right-0 bg-white rounded-full p-1 border border-[#D1CEC6]'>
                      <FaCamera size={12} />
                    </div>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleImageChange}
              />
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className='text-black text-xl font-medium hover:underline'>
                  Change Photo
                </button>
              )}
            </div>

            {/* Fields Grid */}
            <div className='grid grid-cols-2 gap-x-6 gap-y-3.5'>
              <div>
                <label className='block text-sm text-[#1B1B1A] font-medium mb-1.5'>
                  Full Name
                </label>
                {!isEditing ? (
                  <input
                    value={profileData?.name ?? ""}
                    readOnly
                    className='w-full border border-[#D1CEC6] rounded-lg px-3 py-2 text-sm text-[#70706C] focus:outline-none focus:border-[#619B7F]'
                  />
                ) : (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className='w-full border border-[#D1CEC6] rounded-lg px-3 py-2 text-sm text-[#70706C] focus:outline-none focus:border-[#619B7F]'
                  />
                )}
              </div>

              <div>
                <label className='block text-sm text-[#1B1B1A] font-medium mb-1.5'>
                  Email Address
                </label>
                <div className='relative'>
                  <FiMail
                    className='absolute left-2.5 top-1/2 -translate-y-1/2 text-[#70706C] pointer-events-none'
                    size={13}
                  />
                  <input
                    value={profileData?.email ?? ""}
                    readOnly
                    className='w-full border border-[#D1CEC6] rounded-lg pl-7 pr-3 py-2 text-sm text-[#70706C] focus:outline-none focus:border-[#619B7F]'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm text-[#1B1B1A] font-medium mb-1.5'>
                  Phone Number
                </label>
                <div className='relative'>
                  <FiPhone
                    className='absolute left-2.5 top-1/2 -translate-y-1/2 text-[#70706C] pointer-events-none'
                    size={13}
                  />
                  {!isEditing ? (
                    <input
                      value={profileData?.phone ?? ""}
                      readOnly
                      className='w-full border border-[#D1CEC6] rounded-lg pl-7 pr-3 py-2 text-sm text-[#70706C] focus:outline-none focus:border-[#619B7F]'
                    />
                  ) : (
                    <input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className='w-full border border-[#D1CEC6] rounded-lg pl-7 pr-3 py-2 text-sm text-[#70706C] focus:outline-none focus:border-[#619B7F]'
                    />
                  )}
                </div>
              </div>

              <div>
                <label className='block text-sm text-[#1B1B1A] font-medium mb-1.5'>
                  Member Since
                </label>
                <input
                  value={memberSince}
                  readOnly
                  className='w-full border border-[#D1CEC6] rounded-lg px-3 py-2 text-sm text-[#70706C] focus:outline-none'
                />
              </div>

              {isAdmin && (
                <>
                  <div>
                    <label className='block text-sm text-[#1B1B1A] font-medium mb-1.5'>
                      Facebook
                    </label>
                    <input
                      value={
                        isEditing
                          ? editFacebook
                          : (profileData?.facebookLink ?? "")
                      }
                      onChange={(e) => setEditFacebook(e.target.value)}
                      readOnly={!isEditing}
                      className='w-full border border-[#D1CEC6] rounded-lg px-3 py-2 text-sm text-[#70706C] focus:outline-none focus:border-[#619B7F]'
                      placeholder='Facebook profile link'
                    />
                  </div>

                  <div>
                    <label className='block text-sm text-[#1B1B1A] font-medium mb-1.5'>
                      Instagram
                    </label>
                    <input
                      value={
                        isEditing
                          ? editInstagram
                          : (profileData?.instagramLink ?? "")
                      }
                      onChange={(e) => setEditInstagram(e.target.value)}
                      readOnly={!isEditing}
                      className='w-full border border-[#D1CEC6] rounded-lg px-3 py-2 text-sm text-[#70706C] focus:outline-none focus:border-[#619B7F]'
                      placeholder='Instagram profile link'
                    />
                  </div>

                  <div>
                    <label className='block text-sm text-[#1B1B1A] font-medium mb-1.5'>
                      Twitter
                    </label>
                    <input
                      value={
                        isEditing
                          ? editTwitter
                          : (profileData?.twitterLink ?? "")
                      }
                      onChange={(e) => setEditTwitter(e.target.value)}
                      readOnly={!isEditing}
                      className='w-full border border-[#D1CEC6] rounded-lg px-3 py-2 text-sm text-[#70706C] focus:outline-none focus:border-[#619B7F]'
                      placeholder='Twitter profile link'
                    />
                  </div>

                  <div>
                    <label className='block text-sm text-[#1B1B1A] font-medium mb-1.5'>
                      LinkedIn
                    </label>
                    <input
                      value={
                        isEditing
                          ? editLinkedin
                          : (profileData?.linkedinLink ?? "")
                      }
                      onChange={(e) => setEditLinkedin(e.target.value)}
                      readOnly={!isEditing}
                      className='w-full border border-[#D1CEC6] rounded-lg px-3 py-2 text-sm text-[#70706C] focus:outline-none focus:border-[#619B7F]'
                      placeholder='LinkedIn profile link'
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Address Card ── */}
        <div
          id='profileAddress'
          className='bg-white font-medium text-[28px] rounded-lg border border-[#D1CEC6] overflow-hidden'>
          {/* Header */}
          <div className='flex items-center justify-between px-5 py-3.5'>
            <span className='font-semibold text-[28px] text-gray-800'>
              Address
            </span>
            <button
              onClick={() => {
                setShowAddModal(true);
                setAddError("");
              }}
              disabled={addresses.length >= 2 || isLoading}
              className={`flex items-center gap-1.5 text-sm font-medium px-6 py-3 rounded transition-colors ${
                addresses.length >= 2 || isLoading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[#619B7F] hover:bg-[#3d6b4a] text-white"
              }`}>
              <FiPlus size={15} />
              Add
            </button>
          </div>

          {/* Address List */}
          <div>
            {addresses.length === 0 ? (
              <div className='px-5 py-6 text-sm text-gray-500'>
                No addresses yet.
              </div>
            ) : (
              addresses.map((addr, idx) => (
                <div
                  key={String(addr.id) + idx}
                  className={`px-5 py-2 ${idx < addresses.length - 1 ? " border-[#e8e5de]" : ""}`}>
                  <div className='flex items-start justify-between hover:bg-[#f0f8f5] rounded-md p-3 border border-[#D1CEC6]'>
                    <div>
                      <div className='flex items-center gap-2 mb-2'>
                        <span className='font-semibold text-xl text-gray-800'>
                          {addr.type}
                        </span>
                      </div>
                      <div className='flex items-start gap-1.5 mb-1.5'>
                        <FiMapPin
                          className='text-(--primary-text-color) mt-0.5 shrink-0'
                          size={15}
                        />
                        <span className='text-sm text-[#70706C]'>
                          {addr.line1 || "-"}
                        </span>
                      </div>
                      <div className='flex items-center gap-1.5'>
                        <FiPhone
                          className='text-(--primary-text-color) shrink-0'
                          size={15}
                        />
                        <span className='text-sm text-[#70706C]'>
                          {addr.phone || "-"}
                        </span>
                      </div>
                    </div>
                    <div className='flex flex-col items-end gap-2'>
                      <div className='flex gap-1.5'>
                        <button
                          onClick={() => {
                            const t =
                              (addr.type || "").toLowerCase() === "home"
                                ? "home"
                                : "office";
                            setAddType(t as "home" | "office");
                            setAddLine1(addr.line1 ?? "");
                            setAddPhone(addr.phone ?? "");
                            setAddError("");
                            setShowAddModal(true);
                          }}
                          disabled={isLoading}
                          className='flex items-center justify-center rounded-md p-1.5 text-[#1B1B1A] hover:bg-gray-50 transition-colors disabled:opacity-50'>
                          <FiEdit2 size={13} />
                        </button>

                        <button
                          onClick={() =>
                            clearAddressField(
                              (addr.type || "").toLowerCase() === "home"
                                ? "home"
                                : "office",
                            )
                          }
                          disabled={isLoading}
                          className='flex items-center justify-center rounded-md p-1.5 text-[#E24949] hover:border-red-200 hover:text-red-500 transition-colors disabled:opacity-50'>
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Address Modal */}
        {showAddModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
            <div className='bg-white rounded-lg p-6 w-full max-w-md'>
              <h3 className='text-lg font-semibold mb-4'>Add Address</h3>

              {/* Tab bar */}
              <div className='flex border border-[#D1CEC6] rounded-md overflow-hidden mb-4'>
                <button
                  onClick={() => setAddType("home")}
                  disabled={isLoading}
                  className={`flex-1 py-2 text-sm ${
                    addType === "home"
                      ? "bg-[#619B7F] text-white"
                      : "bg-white text-[#1B1B1A]"
                  } disabled:opacity-50`}>
                  Home
                </button>
                <button
                  onClick={() => setAddType("office")}
                  disabled={isLoading}
                  className={`flex-1 py-2 text-sm ${
                    addType === "office"
                      ? "bg-[#619B7F] text-white"
                      : "bg-white text-[#1B1B1A]"
                  } disabled:opacity-50`}>
                  Office
                </button>
              </div>

              <div className='flex flex-col gap-3'>
                <label className='text-sm text-[#1B1B1A]'>
                  {addType === "home" ? "Home Address" : "Office Address"}{" "}
                  (optional)
                </label>
                <input
                  value={addLine1}
                  onChange={(e) => setAddLine1(e.target.value)}
                  disabled={isLoading}
                  className='border border-[#D1CEC6] p-2 rounded disabled:opacity-50'
                  placeholder='Address line'
                />

                <label className='text-sm text-[#1B1B1A]'>
                  {addType === "home"
                    ? "Home Phone Number"
                    : "Office Phone Number"}{" "}
                  (optional)
                </label>
                <input
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  disabled={isLoading}
                  className='border border-gray-200 p-2 rounded disabled:opacity-50'
                  placeholder='Phone number'
                />
              </div>

              {addError && (
                <p className='text-sm text-red-500 mt-3'>{addError}</p>
              )}

              <div className='flex justify-end gap-2 mt-5'>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setAddLine1("");
                    setAddPhone("");
                    setAddError("");
                  }}
                  className='px-3 py-1.5 text-sm'
                  disabled={isLoading}>
                  Cancel
                </button>
                <button
                  onClick={handleAddDone}
                  className='px-4 py-2 bg-[#619B7F] text-white rounded text-sm disabled:opacity-50'
                  disabled={isLoading}>
                  {isLoading ? "Saving..." : "Done"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
