// "use client";

// import React, { useState } from "react";

// const FileUploadComponent = () => {
//   const [selectedProperty, setSelectedProperty] = useState("");
//   const [file, setFile] = useState<File | null>(null);

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.files) {
//       setFile(event.target.files[0]);
//     }
//   };

//   return (
//     <div className='p-6 border border-[#D1CEC6] rounded-md shadow-md'>
//       <h3 className='text-[22px] border-b border-[#D1CEC6] font-semibold mb-4'>
//         Document
//       </h3>

//       <div className='mb-4'>
//         <label
//           htmlFor='property-select'
//           className='block text-sm font-medium text-gray-700'>
//           Select Property
//         </label>
//         <select
//           id='property-select'
//           value={selectedProperty}
//           onChange={(e) => setSelectedProperty(e.target.value)}
//           className='mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#619B7F]'>
//           <option value=''>Select your property</option>
//           <option value='property1'>Property 1</option>
//           <option value='property2'>Property 2</option>
//           <option value='property3'>Property 3</option>
//         </select>
//       </div>

//       <div
//         className='border-dashed border-2 border-gray-300 p-6 flex items-center justify-center'
//         style={{ minHeight: "150px" }}>
//         <div className='text-center'>
//           <input
//             type='file'
//             accept='image/png, image/jpeg'
//             onChange={handleFileChange}
//             className='hidden'
//             id='file-input'
//           />
//           <label htmlFor='file-input' className='cursor-pointer'>
//             <div className='text-[#619B7F] font-semibold'>
//               Click to upload document
//             </div>
//             <div className='text-xs text-gray-500'>PNG, JPG up to 10MB</div>
//           </label>
//           {file && (
//             <div className='mt-4 text-sm text-green-500'>
//               File Selected: {file.name}
//             </div>
//           )}
//         </div>
//       </div>

//       <div className='mt-4 flex justify-end space-x-4'>
//         <button className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer'>
//           Cancel
//         </button>
//         <button className='px-4 py-2 text-sm font-medium text-white bg-[#619B7F] rounded-md cursor-pointer'>
//           Done
//         </button>
//       </div>
//     </div>
//   );
// };

// export default FileUploadComponent;

"use client";

import React, { useState } from "react";
import { useUserOwnProperties } from "@/actions/hooks/property.hooks";
import {
  useCreateDocumentMutation,
  useDocuments,
} from "@/actions/hooks/document.hooks";
import type { IPropertyResponse } from "@/services/property";

type DocumentFile = {
  _id?: string;
  key?: string;
  documentUrl?: string;
};

type UserDocument = {
  _id?: string;
  id?: string;
  propertyId?: string;
  propertyName?: string;
  docs?: DocumentFile[];
  createdAt?: string;
};

const extractDocuments = (raw: unknown): UserDocument[] => {
  const candidate = raw as
    | {
        data?:
          | UserDocument[]
          | { data?: UserDocument[]; pagination?: unknown }
          | undefined;
      }
    | undefined;

  const firstData = candidate?.data;
  if (Array.isArray(firstData)) return firstData;

  const nestedData =
    firstData && typeof firstData === "object"
      ? (firstData as { data?: UserDocument[] }).data
      : undefined;

  if (Array.isArray(nestedData)) return nestedData;
  return [];
};

const FileUploadComponent = () => {
  const [selectedProperty, setSelectedProperty] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const { data: propertiesData, isLoading: propertiesLoading } =
    useUserOwnProperties({
      page: 1,
      limit: 100,
    });

  const {
    data: documentsData,
    isLoading: documentsLoading,
    isError: documentsError,
  } = useDocuments({ page: 1, limit: 50 });

  const createDocumentMutation = useCreateDocumentMutation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incomingFiles = event.target.files
      ? Array.from(event.target.files)
      : [];
    if (!incomingFiles.length) return;

    setFiles((prev) => {
      const existing = new Set(
        prev.map((file) => `${file.name}-${file.size}-${file.lastModified}`),
      );

      const next = [...prev];
      for (const file of incomingFiles) {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (!existing.has(key)) {
          next.push(file);
          existing.add(key);
        }
      }
      return next;
    });

    // Allow picking the same file again after removing it.
    event.target.value = "";
  };

  const removeSelectedFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!selectedProperty) {
      alert("Please select a property");
      return;
    }

    if (files.length === 0) {
      alert("Please select at least one file");
      return;
    }

    try {
      await createDocumentMutation.mutateAsync({
        propertyId: selectedProperty,
        docs: files,
      });

      // Reset form on success
      setSelectedProperty("");
      setFiles([]);
      alert("Document uploaded successfully");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to upload document",
      );
    }
  };

  const properties = propertiesData?.data?.data || [];
  const documents = extractDocuments(documentsData);

  return (
    <div className='p-6 border border-[#D1CEC6] rounded-md shadow-md'>
      <h3 className='text-[22px] border-b border-[#D1CEC6] font-semibold mb-4'>
        Upload Document
      </h3>

      <div className='mb-4'>
        <label
          htmlFor='property-select'
          className='block text-sm font-medium text-gray-700'>
          Select Property
        </label>
        <select
          id='property-select'
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className='mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#619B7F]'>
          <option value=''>Select your property</option>
          {propertiesLoading ? (
            <option disabled>Loading properties...</option>
          ) : properties.length === 0 ? (
            <option disabled>No properties found</option>
          ) : (
            properties.map((property: IPropertyResponse) => (
              <option
                key={property.id || property._id}
                value={property.id || property._id}>
                {property.propertyName}
              </option>
            ))
          )}
        </select>
      </div>

      <div
        className='border-dashed border-2 border-gray-300 p-6 flex items-center justify-center'
        style={{ minHeight: "150px" }}>
        <div className='text-center'>
          <input
            type='file'
            accept='image/png, image/jpeg, .pdf, .docx, .pptx, .xlsx'
            onChange={handleFileChange}
            className='hidden'
            id='file-input'
            multiple
          />
          <label htmlFor='file-input' className='cursor-pointer'>
            <div className='text-[#619B7F] font-semibold'>
              Click to upload documents
            </div>
            <div className='text-xs text-gray-500'>
              PNG, JPG, PDF, DOCX, PPTX, XLSX up to 10MB each (max 8 per upload)
            </div>
          </label>
          {files.length > 0 && (
            <div className='mt-4 text-sm text-green-500 text-left'>
              <p>{files.length} file(s) selected:</p>
              <ul className='mt-2 space-y-1 text-gray-600'>
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${file.lastModified}`}
                    className='flex items-center justify-between gap-3'>
                    <span className='truncate'>{file.name}</span>
                    <button
                      type='button'
                      onClick={() => removeSelectedFile(index)}
                      className='text-xs text-red-600 underline cursor-pointer whitespace-nowrap'>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className='mt-4 flex justify-end space-x-4'>
        <button
          onClick={() => {
            setSelectedProperty("");
            setFiles([]);
          }}
          className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer'>
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={createDocumentMutation.isPending || files.length === 0}
          className='px-4 py-2 text-sm font-medium text-white bg-[#619B7F] rounded-md cursor-pointer disabled:opacity-50'>
          {createDocumentMutation.isPending ? "Uploading..." : "Done"}
        </button>
      </div>

      <div className='mt-8 border-t border-[#D1CEC6] pt-5'>
        <h3 className='text-[22px] font-semibold mb-4'>Uploaded Documents</h3>

        {documentsLoading ? (
          <p className='text-sm text-gray-500'>Loading documents...</p>
        ) : documentsError ? (
          <p className='text-sm text-red-500'>Failed to load documents.</p>
        ) : documents.length === 0 ? (
          <p className='text-sm text-gray-500'>No documents uploaded yet.</p>
        ) : (
          <div className='space-y-4'>
            {documents.map((document) => {
              const documentId = document.id || document._id || "unknown";
              const propertyLabel = document.propertyName || "Unnamed property";
              const filesInDoc = Array.isArray(document.docs)
                ? document.docs
                : [];

              return (
                <div
                  key={documentId}
                  className='border border-[#D1CEC6] rounded-md p-4 bg-[#FAFAF8]'>
                  <div className='flex items-center justify-between mb-2'>
                    <p className='font-medium text-[#2F2F2F]'>
                      {propertyLabel}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {filesInDoc.length} file(s)
                    </p>
                  </div>

                  {filesInDoc.length === 0 ? (
                    <p className='text-sm text-gray-500'>No files found.</p>
                  ) : (
                    <ul className='space-y-2'>
                      {filesInDoc.map((doc, index) => {
                        const href = doc.documentUrl || "#";
                        const fileLabel = doc.key
                          ? doc.key.split("/").pop() || `File ${index + 1}`
                          : `File ${index + 1}`;

                        return (
                          <li
                            key={doc._id || `${documentId}-${index}`}
                            className='text-sm flex items-center justify-between gap-3'>
                            <span className='truncate text-gray-700'>
                              {fileLabel}
                            </span>
                            <a
                              href={href}
                              target='_blank'
                              rel='noreferrer'
                              className='text-[#0284C7] underline whitespace-nowrap'>
                              Open
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadComponent;
