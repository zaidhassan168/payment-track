"use client"
import CreatePaymentModal from "../components/CreatePaymentModal";
import PaymentTable from "../components/PaymentTable";

export default function PaymentsPage() {
  const projects = [
    { id: "1", name: "Project A" },
    { id: "2", name: "Project B" },
  ]; // Replace with dynamic fetching
  const stakeholders = [
    { id: "1", projectId: "1", name: "John", role: "Plumber" },
    { id: "2", projectId: "1", name: "Jane", role: "Client" },
  ]; // Replace with dynamic fetching

  const handlePaymentAdded = () => {
    window.location.reload(); // Temporary refresh logic
  };

  return (
    <div className="p-6">
      <CreatePaymentModal
        projects={projects}
        stakeholders={stakeholders}
        onPaymentAdded={handlePaymentAdded}
      />
      <PaymentTable />
    </div>
  );
}
