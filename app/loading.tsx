import Loader from "@/components/Loader"; // import your existing component

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader />
    </div>
  );
}