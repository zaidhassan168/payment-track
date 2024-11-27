"use client";

import { useEffect, useState } from "react";
import { getPaymentsByProject } from "@/app/services/payments";
import { addPayment } from "@/app/services/payments";
import { Payment } from "@/types";
import CreatePaymentModal from "../../components/CreatePaymentModal";

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    // Unwrap params.id and set it in state
    const unwrapParams = async () => {
      const unwrappedParams =  await params;
      setProjectId(unwrappedParams.id);
    };

    unwrapParams();
  }, [params])
  const fetchPayments = async () => {
    try {
      setLoading(true);
        const pid = await params
      const data = await getPaymentsByProject(pid.id);
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAdded = () => {
    fetchPayments(); // Refresh payments list after adding a payment
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <nav className="mb-4">
        <a href="/dashboard/projects" className="text-blue-500 hover:underline">
          ← Back to Projects
        </a>
      </nav>
      <h1 className="text-2xl font-bold mb-6">Project Payments</h1>
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Payment
      </button>
      {loading ? (
        <p>Loading payments...</p>
      ) : payments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-lg shadow-md p-4 border"
            >
              <p>
                <strong>Stakeholder:</strong> {payment.stakeholder}
              </p>
              <p>
                <strong>Amount:</strong> ${payment.amount}
              </p>
              <p>
                <strong>Timestamp:</strong> {new Date(payment.timestamp).toLocaleString()}
              </p>
              <img
                src={payment.screenshotUrl}
                alt="Payment Screenshot"
                className="mt-4 w-full rounded-lg"
              />
            </div>
          ))}
        </div>
      )}
      <CreatePaymentModal
        isOpen={isModalOpen}
        projectId={projectId || ""}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handlePaymentAdded}
      />
    </div>
  );
}
