"use client";

import Pagination from "@/components/pagination/Pagination";
import {
  useMaintenances,
  useCreateMaintenanceMutation,
  useUpdateMaintenanceMutation,
  useDeleteMaintenanceMutation,
} from "@/actions/hooks/maintenance.hooks";
import type {
  IMaintenanceResponse,
  ICreateMaintenance,
} from "@/services/maintenance";
import MaintenanceModal from "@/components/dashboard/modal/MaintenanceModal";
import { useState } from "react";

const PER_PAGE = 9;

export default function MaintenanceManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | null>(
    null,
  );
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<IMaintenanceResponse | null>(null);

  const { data, isLoading, isError, error, refetch } = useMaintenances({
    page: currentPage,
    limit: PER_PAGE,
  });

  const createMutation = useCreateMaintenanceMutation();
  const updateMutation = useUpdateMaintenanceMutation();
  const deleteMutation = useDeleteMaintenanceMutation();

  const maintenances = data?.maintenances || [];
  const pagination = data?.pagination;

  const openAddModal = () => {
    setSelectedMaintenance(null);
    setModalMode("add");
  };

  const openViewModal = (maintenance: IMaintenanceResponse) => {
    setSelectedMaintenance(maintenance);
    setModalMode("view");
  };

  const openEditModal = (maintenance: IMaintenanceResponse) => {
    setSelectedMaintenance(maintenance);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedMaintenance(null);
  };

  const handleSubmit = async (data: ICreateMaintenance) => {
    if (modalMode === "edit" && selectedMaintenance) {
      const id = selectedMaintenance._id || selectedMaintenance.id;
      if (!id) {
        alert("Maintenance ID is missing");
        return;
      }

      await updateMutation.mutateAsync({ id, data });
      alert("Maintenance updated successfully");
      refetch();
      closeModal();
    } else if (modalMode === "add") {
      await createMutation.mutateAsync(data);
      alert("Maintenance created successfully");
      refetch();
      closeModal();
    }
  };

  const handleDelete = async (id: string) => {
    // Remove the confirm alert completely
    await deleteMutation.mutateAsync(id);
    alert("Maintenance deleted successfully");
    refetch();
    closeModal();
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <div className='bg-white rounded-xl border border-[#D1CEC6]'>
      {/* Page title */}
      <div className='px-6 py-5'>
        <div className='flex md:flex-row flex-col items-center justify-between border-b border-[#D1CEC6] pb-3'>
          <h1 className='text-xl md:text-2xl mb-3 md:mb-0'>Maintenance List</h1>
          <button
            onClick={openAddModal}
            className='px-6 py-2.5 bg-[#619B7F] text-base text-white rounded-lg hover:bg-[#4e7a6c] transition-colors cursor-pointer'>
            + Add Maintenance
          </button>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto px-5'>
        {isLoading && (
          <div className='text-center py-8'>
            Loading maintenance requests...
          </div>
        )}

        {isError && (
          <div className='text-center py-8 text-red-600'>
            {error instanceof Error
              ? error.message
              : "Failed to load maintenance requests."}
          </div>
        )}

        {!isLoading && !isError && (
          <table className='w-full text-sm text-left'>
            <thead>
              <tr className='border border-[#D1CEC6]'>
                <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                  Amenities
                </th>
                <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                  Task
                </th>
                <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                  Reminder Date
                </th>
                <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                  Description
                </th>
                <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                  Status
                </th>
                <th className='px-4 py-3 text-left font-medium border border-[#E8E5DD]'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='border border-[#D1CEC6]'>
              {maintenances.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-4 py-8 text-center text-gray-500'>
                    No maintenance requests found
                  </td>
                </tr>
              ) : (
                maintenances.map((item: IMaintenanceResponse) => (
                  <tr
                    key={item._id || item.id}
                    className='hover:bg-gray-50 transition-colors'>
                    <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                      {item.amenities}
                    </td>
                    <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                      {item.task}
                    </td>
                    <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                      {formatDate(item.reminderDate)}
                    </td>
                    <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD] max-w-xs truncate'>
                      {item.description}
                    </td>
                    <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-2xl text-[12px] whitespace-nowrap ${
                          item.status === "PENDING"
                            ? "bg-[#FFF6ED] text-[#EA6A2F]"
                            : "bg-[#E8F4EF] text-[#619B7F]"
                        }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-[#70706C] border border-[#E8E5DD]'>
                      <button
                        onClick={() => openViewModal(item)}
                        className='text-sm text-[#1B1B1A] underline underline-offset-2 hover:opacity-70 transition-opacity whitespace-nowrap cursor-pointer'>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className='px-4 py-4'>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            perPage={pagination.limit}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modals */}
      {modalMode && (
        <MaintenanceModal
          key={selectedMaintenance?._id || selectedMaintenance?.id || "new"}
          isOpen={true}
          onClose={closeModal}
          mode={modalMode}
          initialData={selectedMaintenance}
          onSubmit={handleSubmit}
          onDelete={modalMode === "view" ? handleDelete : undefined}
          onEdit={modalMode === "view" ? openEditModal : undefined} // Pass edit function
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
