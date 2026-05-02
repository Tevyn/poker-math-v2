import { Suspense } from "react";
import { ExerciseScreen } from "@/components/exercise";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen flex-col items-center justify-center p-6">
          <p className="text-zinc-500">loading…</p>
        </main>
      }
    >
      <ExerciseScreen />
    </Suspense>
  );
}
