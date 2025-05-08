import { Suspense } from "react";

import { HydrateClient } from "~/trpc/server";

// import { ProfileTable } from "./_components/linkedin";

export default function HomePage() {
  return (
    <HydrateClient>
      <main className="container h-screen py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Lyra <span className="text-primary">Extension</span> Dashboard
          </h1>
          <div className="w-full max-w-4xl">
            <Suspense
              fallback={
                <div className="flex w-full flex-col gap-4">
                  <div className="h-20 w-full animate-pulse rounded-md bg-muted" />
                  <div className="h-20 w-full animate-pulse rounded-md bg-muted" />
                  <div className="h-20 w-full animate-pulse rounded-md bg-muted" />
                </div>
              }
            >
              <div>
                <h1>Hello</h1>
              </div>
              {/* <ProfileTable /> */}
            </Suspense>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
