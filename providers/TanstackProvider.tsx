"use client";

import { getQueryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export default function TanstackProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}