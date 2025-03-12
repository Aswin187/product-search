"use client";

import type React from "react";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Search, Loader2, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Input } from "@/components/ui/input";
import ProductDetails from "./product-details";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Types
interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export default function SearchInput() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const popularSearches = useMemo(
    () => ["Electronics", "Jewelry", "Men's Clothing", "Women's Clothing"],
    []
  );

  // Debounce the search query
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timerId);
  }, [query]);

  // Fetch products based on debounced query
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];

      // Create an AbortController for request cancellation
      const controller = new AbortController();
      const signal = controller.signal;

      try {
        const response = await fetch(
          `https://fakestoreapi.com/products?limit=15`,
          { signal }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        // Filter products based on query
        return data.filter(
          (product: Product) =>
            product.title
              .toLowerCase()
              .includes(debouncedQuery.toLowerCase()) ||
            product.category
              .toLowerCase()
              .includes(debouncedQuery.toLowerCase())
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          console.log("Request was aborted");
        } else {
          throw error;
        }
        return [];
      }
    },
    enabled: debouncedQuery.length > 0,
    staleTime: 60000, // Cache for 1 minute
  });

  // Setup virtualized list for performance
  const rowVirtualizer = useVirtualizer({
    count: products?.length || popularSearches.length || 0,
    getScrollElement: () => listRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  // Handle product selection
  const handleSelectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setQuery(product.title);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = products?.length ? products : popularSearches;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < items.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && products?.[highlightedIndex]) {
            handleSelectProduct(products[highlightedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
        case "Tab":
          setIsOpen(false);
          break;
      }
    },
    [highlightedIndex, products, popularSearches, handleSelectProduct]
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setIsOpen(value.length > 0);
      setHighlightedIndex(-1);
      if (!value) {
        setSelectedProduct(null);
      }
    },
    []
  );

  // Clear search input
  const handleClearInput = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setSelectedProduct(null);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }, []);

  // Determine what to display in the dropdown
  const renderDropdownContent = useCallback(() => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Searching products...</span>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex items-center justify-center py-4 text-destructive">
          <span>Error loading products. Please try again.</span>
        </div>
      );
    }

    if (debouncedQuery && products?.length === 0) {
      return (
        <div className="flex items-center justify-center py-4 text-muted-foreground">
          <span>No products found for &quot;{debouncedQuery}&quot;</span>
        </div>
      );
    }

    const items = products?.length ? products : popularSearches;
    const virtualItems = rowVirtualizer.getVirtualItems();

    return (
      <div
        ref={listRef}
        className="overflow-auto max-h-[300px]"
        style={{
          height: `${Math.min(items.length * 60, 300)}px`,
        }}
      >
        <div
          className="relative w-full"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {virtualItems.map((virtualRow) => {
            const item = items[virtualRow.index];
            const isProduct = !!products?.length;

            return (
              <div
                key={virtualRow.index}
                className={cn(
                  "absolute top-0 left-0 w-full p-3 cursor-pointer",
                  highlightedIndex === virtualRow.index ? "bg-muted" : "",
                  "hover:bg-muted transition-colors"
                )}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => {
                  if (isProduct) {
                    handleSelectProduct(item as Product);
                  } else {
                    setQuery(item);
                    setIsOpen(true);
                    inputRef.current?.focus();
                  }
                }}
                onMouseEnter={() => setHighlightedIndex(virtualRow.index)}
              >
                {isProduct ? (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border relative">
                      <Image
                        src={
                          (item as Product).image &&
                          (item as Product).image.startsWith("http")
                            ? (item as Product).image
                            : `/placeholder.svg?height=40&width=40`
                        }
                        alt={(item as Product).title}
                        fill
                        className="object-cover object-center"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.currentTarget.src = `/placeholder.svg?height=40&width=40`;
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="line-clamp-1 font-medium">
                        {(item as Product).title}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {(item as Product).category}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{item}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [
    isLoading,
    isError,
    debouncedQuery,
    products,
    popularSearches,
    highlightedIndex,
    rowVirtualizer,
    handleSelectProduct,
  ]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 p-12">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            className="w-full rounded-lg border bg-background px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="search-suggestions"
          />
          {query && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleClearInput}
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && (
          <div
            id="search-suggestions"
            className="absolute z-10 mt-2 w-full rounded-lg border bg-background shadow-lg"
            role="listbox"
          >
            <div className="p-2">
              {!debouncedQuery && !isLoading && (
                <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
                  Popular Searches
                </div>
              )}
              {renderDropdownContent()}
            </div>
          </div>
        )}
      </div>

      {/* Selected Product Details */}
      {selectedProduct && <ProductDetails product={selectedProduct} />}
    </div>
  );
}
