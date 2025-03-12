"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SearchInput from "@/components/search-item";

const queryClient = new QueryClient();

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Product Search</h1>
        <SearchInput />
      </div>
    </QueryClientProvider>
  );
}
