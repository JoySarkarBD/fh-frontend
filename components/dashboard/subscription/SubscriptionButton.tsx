"use client";

import { useSubscriptionMutations } from "@/actions/hooks/subscripiton.hooks";
import React, { useEffect } from "react";

interface SubscriptionButtonProps {
  status: string
  text: string;
}

const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({
  status,
  text,
}) => {
  const { createMutation } = useSubscriptionMutations();

  const { isPending, data, isError, error, isSuccess } = createMutation;

  //  redirect inside useEffect
  useEffect(() => {
    if (isSuccess && data?.data?.checkoutSessionUrl) {
      window.location.href = data.data.checkoutSessionUrl;
    }
  }, [isSuccess, data]);

  const handleClick = () => {

    if(text === 'Get Started'){
          createMutation.mutate();

    }

  };

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`w-full mt-4 px-6 py-2 text-xl border border-[#D1CEC6] rounded-md transition-colors duration-200
        ${
          status === "active"
            ? "bg-white text-[#0F3B2A] hover:bg-[#0F3B2A] hover:text-white"
            : "bg-[#0F3B2A] hover:bg-[#226142] text-white"
        }
        ${isPending ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
        `}
      >
        {isPending ? "Processing..." : text}
      </button>

      {/* Error Message */}
      {isError && (
        <p className="text-red-500 text-sm mt-2" role="alert">
          {error instanceof Error && error.message === "Unauthorized"
            ? "Please Login First"
            : error instanceof Error
            ? error.message
            : "Something went wrong!"}
        </p>
      )}
    </div>
  );
};

export default SubscriptionButton;