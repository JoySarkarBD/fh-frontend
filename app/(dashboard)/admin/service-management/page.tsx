"use client";

import { useMemo, useState } from "react";
import {
  useCreateServiceMutation,
  useDeleteServiceMutation,
  useServices,
  useUpdateServiceMutation,
} from "@/actions/hooks/service.hooks";
import type { ICreateService, IServiceResponse } from "@/services/service";
import { FiTrash2, FiX } from "react-icons/fi";

const MAX_DESCRIPTION_POINTS = 4;

type DescriptionInput = {
  id?: string;
  text: string;
};

const ServiceModal = ({
  isOpen,
  onClose,
  mode,
  initialService,
  onSubmit,
  isSubmitting,
  onDelete,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialService?: IServiceResponse | null;
  onSubmit: (payload: ICreateService) => Promise<void>;
  isSubmitting: boolean;
  onDelete?: (service: IServiceResponse) => Promise<void>;
  isDeleting?: boolean;
}) => {
  const [serviceTitle, setServiceTitle] = useState(
    mode === "edit" && initialService ? (initialService.title ?? "") : "",
  );
  const [subTitle, setSubTitle] = useState(
    mode === "edit" && initialService ? (initialService.subTitle ?? "") : "",
  );
  const [descriptionPoints, setDescriptionPoints] = useState<
    DescriptionInput[]
  >(
    mode === "edit" &&
      initialService &&
      Array.isArray(initialService.description)
      ? initialService.description.map((item) => ({
          id: item.id,
          text: item.text ?? "",
        }))
      : [{ text: "" }],
  );

  const updatePoint = (index: number, value: string) => {
    setDescriptionPoints((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, text: value } : item,
      ),
    );
  };

  const addPoint = () => {
    setDescriptionPoints((prev) =>
      prev.length >= MAX_DESCRIPTION_POINTS ? prev : [...prev, { text: "" }],
    );
  };

  const removePoint = (index: number) => {
    setDescriptionPoints((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return next.length ? next : [{ text: "" }];
    });
  };

  const handleDone = async () => {
    const cleanTitle = serviceTitle.trim();
    const cleanSubTitle = subTitle.trim();
    const cleanDescription = descriptionPoints
      .map((item) => ({ id: item.id, text: item.text.trim() }))
      .filter((item) => item.text.length > 0);

    if (!cleanTitle || typeof cleanTitle !== "string") {
      window.alert("Service title is required and must be a string.");
      return;
    }
    if (!cleanSubTitle || typeof cleanSubTitle !== "string") {
      window.alert("Subtitle is required and must be a string.");
      return;
    }
    if (cleanDescription.length === 0) {
      window.alert("At least one description point is required.");
      return;
    }
    if (cleanDescription.length > 4) {
      window.alert("Maximum 4 description items are allowed.");
      return;
    }

    await onSubmit({
      title: cleanTitle,
      subTitle: cleanSubTitle,
      description: cleanDescription,
    });

    handleClose();
  };

  const handleDelete = async () => {
    if (!initialService || !onDelete) return;

    const shouldDelete = window.confirm(
      `Delete service "${initialService.title}"? This action cannot be undone.`,
    );
    if (!shouldDelete) return;

    await onDelete(initialService);
    handleClose();
  };

  const handleClose = () => {
    setServiceTitle("");
    setSubTitle("");
    setDescriptionPoints([{ text: "" }]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-xl border-2 border-[#D1CEC6] w-full max-w-2xl mx-4 shadow-xl'>
        <div className='flex items-center justify-between px-6 py-5 border-b border-[#D1CEC6]'>
          <h2 className='text-2xl font-semibold text-gray-800'>
            {mode === "add" ? "Add" : "Edit"} Service
          </h2>
          <div className='flex items-center gap-2'>
            {mode === "edit" && onDelete && (
              <button
                onClick={() => void handleDelete()}
                disabled={isDeleting}
                className='flex items-center gap-1 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-60'>
                <FiTrash2 size={16} />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            )}
            <button
              onClick={handleClose}
              className='text-gray-400 hover:text-gray-600'>
              <FiX size={22} />
            </button>
          </div>
        </div>

        <div className='px-6 py-5 space-y-5'>
          <div>
            <label className='block text-sm text-gray-600 mb-2'>
              Service Title
            </label>
            <input
              type='text'
              value={serviceTitle}
              onChange={(e) => setServiceTitle(e.target.value)}
              placeholder='Enter service title'
              className='w-full border border-[#D1CEC6] rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4A90B8]'
            />
          </div>

          <div>
            <label className='block text-sm text-gray-600 mb-2'>Subtitle</label>
            <input
              type='text'
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
              placeholder='Enter subtitle'
              className='w-full border border-[#D1CEC6] rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4A90B8]'
            />
          </div>

          <div>
            <div className='flex items-center justify-between mb-2'>
              <label className='block text-sm text-gray-600'>
                Description Points
              </label>
              <button
                type='button'
                onClick={addPoint}
                disabled={descriptionPoints.length >= MAX_DESCRIPTION_POINTS}
                className='text-sm text-[#5F8E7E] disabled:opacity-40'>
                + Add Point
              </button>
            </div>

            <div className='space-y-2'>
              {descriptionPoints.map((point, index) => (
                <div key={point.id || index} className='flex gap-2'>
                  <input
                    type='text'
                    value={point.text}
                    onChange={(e) => updatePoint(index, e.target.value)}
                    placeholder={`Point ${index + 1}`}
                    className='w-full border border-[#D1CEC6] rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4A90B8]'
                  />
                  <button
                    type='button'
                    onClick={() => removePoint(index)}
                    className='px-3 rounded-lg border border-[#D1CEC6] text-gray-500 hover:bg-gray-50'>
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='flex justify-end gap-3 px-6 py-4 border-t border-[#D1CEC6]'>
          <button
            onClick={handleClose}
            className='px-5 py-2 rounded-lg border border-[#D1CEC6] text-gray-600 text-sm hover:bg-gray-50'>
            Cancel
          </button>
          <button
            onClick={() => void handleDone()}
            disabled={isSubmitting}
            className='px-5 py-2 rounded-lg bg-[#5F8E7E] text-white text-sm hover:bg-[#4e7a6c] disabled:opacity-60'>
            {isSubmitting ? "Saving..." : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedService, setSelectedService] =
    useState<IServiceResponse | null>(null);

  const { data, isLoading, isError, error } = useServices();
  const createServiceMutation = useCreateServiceMutation();
  const updateServiceMutation = useUpdateServiceMutation();
  const deleteServiceMutation = useDeleteServiceMutation();

  const services = useMemo(() => data?.services ?? [], [data]);

  const openAddModal = () => {
    setSelectedService(null);
    setModalMode("add");
  };

  const openEditModal = (service: IServiceResponse) => {
    setSelectedService(service);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedService(null);
  };

  const handleSubmit = async (payload: ICreateService) => {
    if (modalMode === "edit" && selectedService) {
      const id = selectedService._id || selectedService.id;
      if (!id) {
        window.alert("Service id is missing.");
        return;
      }

      await updateServiceMutation.mutateAsync({
        id,
        data: payload,
      });
      return;
    }

    await createServiceMutation.mutateAsync(payload);
  };

  const handleDelete = async (service: IServiceResponse) => {
    const id = service._id || service.id;
    if (!id) {
      window.alert("Service id is missing.");
      return;
    }

    await deleteServiceMutation.mutateAsync(id);
  };

  const isSubmitting =
    createServiceMutation.isPending || updateServiceMutation.isPending;

  return (
    <div className='bg-white rounded-xl border border-[#D1CEC6]'>
      <div className='px-6 py-5'>
        <div className='flex md:flex-row flex-col items-center justify-between border-b border-[#D1CEC6] pb-3'>
          <div className='text-xl md:text-2xl mb-3 md:mb-0 text-center md:text-start'>
            Service Management
          </div>
          <div className='flex flex-row gap-2 '>
            <button
              onClick={openAddModal}
              className='px-6 py-2.5 bg-(--primary) text-base text-white rounded-lg hover:bg-(--primary-hover) transition-colors'>
              + Add Service
            </button>
          </div>
        </div>
      </div>

      <div className='p-6'>
        {isLoading && (
          <div className='text-center py-8'>Loading services...</div>
        )}

        {isError && (
          <div className='text-center py-8 text-red-600'>
            {error instanceof Error
              ? error.message
              : "Failed to load services."}
          </div>
        )}

        {!isLoading && !isError && (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6'>
            {services.map((service) => (
              <div
                onClick={() => openEditModal(service)}
                key={service._id || service.id}
                className='border border-gray-300 rounded-lg p-6 mb-1 flex flex-col h-full cursor-pointer hover:border-[#5F8E7E] transition-colors'>
                <div className='flex items-start justify-between gap-2 mb-2'>
                  <h3 className='text-xl font-semibold'>{service.title}</h3>
                </div>

                <p className='text-gray-700 mb-4'>{service.subTitle}</p>

                <ul className='list-disc mt-auto list-inside text-gray-600 marker:text-[#619B7F] space-y-1'>
                  {service.description?.map((item, idx) => (
                    <li key={item.id || idx}>{item.text}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalMode && (
        <ServiceModal
          isOpen={true}
          onClose={closeModal}
          mode={modalMode}
          initialService={selectedService}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onDelete={modalMode === "edit" ? handleDelete : undefined}
          isDeleting={deleteServiceMutation.isPending}
        />
      )}
    </div>
  );
};

export default Page;
