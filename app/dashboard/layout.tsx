import DashboardLayout from "@/components/DashboardLayout";
import DashboardClientProviders from "./DashboardClientProviders";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <DashboardClientProviders>
        {children}
      </DashboardClientProviders>
    </DashboardLayout>
  );
}
