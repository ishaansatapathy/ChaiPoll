import React from "react";
import { motion } from "framer-motion";

export function Skeleton({ className }) {
  return (
    <div className={`overflow-hidden rounded-md bg-white/5 relative ${className}`}>
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear",
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
      />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-[32px] border border-white/5 bg-white/[0.02] p-6 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-8 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 py-8">
      <div className="flex justify-between items-end mb-12">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-64 md:w-96" />
        </div>
        <Skeleton className="h-16 w-48 rounded-3xl" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <CardSkeleton key={`skeleton-card-${i}`} />
        ))}
      </div>
      <div className="grid gap-10 lg:grid-cols-2 mt-16">
        <Skeleton className="h-[400px] rounded-[40px]" />
        <Skeleton className="h-[400px] rounded-[40px]" />
      </div>
    </div>
  );
}
