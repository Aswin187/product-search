"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SearchInput from "@/components/search-item";

// Create a QueryClient instance
const queryClient = new QueryClient();

function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <SearchInput />
      </div>
    </QueryClientProvider>
  );
}

export default Page;
