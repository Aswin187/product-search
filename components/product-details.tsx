"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

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

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{product.title}</CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="outline" className="mr-2">
                {product.category}
              </Badge>
              <span className="inline-flex items-center">
                <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                {product.rating.rate} ({product.rating.count} reviews)
              </span>
            </CardDescription>
          </div>
          <div className="text-xl font-bold">${product.price}</div>
        </div>
      </CardHeader>
      <CardContent className="grid md:grid-cols-[1fr_3fr] gap-4">
        <div className="flex justify-center">
          <div className="h-40 w-40 overflow-hidden rounded-md border relative">
            <Image
              src={
                product.image.startsWith("http")
                  ? product.image
                  : `/placeholder.svg?height=160&width=160`
              }
              alt={product.title}
              fill
              className="object-contain p-2"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.currentTarget.src = `/placeholder.svg?height=160&width=160`;
              }}
            />
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground line-clamp-4">
            {product.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
