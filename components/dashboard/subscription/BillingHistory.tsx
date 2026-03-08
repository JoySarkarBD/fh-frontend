"use client";

import { useMemo } from "react";
import { type PaymentHistoryItem } from "@/services/subscription";
import { useMyPaymentHistory } from "@/actions/hooks/subscripiton.hooks";

function formatDate(value?: string): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString();
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount);
}

function getPlanLabel(item: PaymentHistoryItem): string {
  if (item.lifetimeAccessGranted || item.amount >= 99) {
    return "Premium (Lifetime)";
  }

  return "Unknown Plan";
}

export default function BillingHistory() {
  const { data, isLoading, isError, error } = useMyPaymentHistory();
  const items = useMemo(() => data ?? [], [data]);

  const completedCount = useMemo(
    () => items.filter((item) => item.status === "COMPLETED").length,
    [items],
  );

  if (isLoading) {
    return <p className='text-[#70706C]'>Loading billing history...</p>;
  }

  if (isError) {
    return (
      <p className='text-red-500' role='alert'>
        {error?.message || "Failed to load payment history"}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className='text-[#70706C]'>
        No payment records yet. Once you subscribe, payment details will appear
        here.
      </p>
    );
  }

  return (
    <div className='space-y-4'>
      <p className='text-sm text-[#70706C]'>
        {completedCount} completed payment{completedCount === 1 ? "" : "s"}
      </p>

      <div className='overflow-x-auto border border-[#E7E9E8] rounded-lg'>
        <table className='min-w-full text-sm'>
          <thead className='bg-[#F6F8F7] text-left'>
            <tr>
              <th className='px-4 py-3 font-semibold'>Plan</th>
              <th className='px-4 py-3 font-semibold'>Amount</th>
              <th className='px-4 py-3 font-semibold'>Status</th>
              <th className='px-4 py-3 font-semibold'>Transaction</th>
              <th className='px-4 py-3 font-semibold'>Paid At</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className='border-t border-[#EEF1EF]'>
                <td className='px-4 py-3'>{getPlanLabel(item)}</td>
                <td className='px-4 py-3'>
                  {formatAmount(item.amount, item.currency)}
                </td>
                <td className='px-4 py-3'>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.status === "COMPLETED"
                        ? "bg-[#E7F5EC] text-[#0F7A3D]"
                        : item.status === "PENDING"
                          ? "bg-[#FFF7E5] text-[#9A6A00]"
                          : "bg-[#FDECEC] text-[#B42318]"
                    }`}>
                    {item.status}
                  </span>
                </td>
                <td
                  className='px-4 py-3 max-w-60 truncate'
                  title={item.transactionId}>
                  {item.transactionId}
                </td>
                <td className='px-4 py-3'>
                  {formatDate(item.paidAt ?? item.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
