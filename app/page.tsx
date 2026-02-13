import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans">
      <main className="text-text-primary flex min-h-screen w-full max-w-3xl flex-col items-center justify-between sm:items-start">
        AgentsFactory
      </main>
    </div>
  );
}
