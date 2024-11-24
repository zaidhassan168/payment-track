"use client";

import { useState } from "react";
import { createPayment } from "@/app/services/payments";
import { Payment } from "@/types";

export default function PaymentForm({ onPaymentAddedAction }: { onPaymentAddedAction: () => void }) {
  const [formData, setFormData] = useState<Partial<Payment>>({
    projectId: "",
    stakeholder: "",
    amount: 0,
    screenshotUrl: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.stakeholder || !formData.amount || !file) {
      alert("All fields are required!");
      return;
    }

    setLoading(true);

    try {
      const payment: Payment = {
        projectId: formData.projectId,
        stakeholder: formData.stakeholder,
        amount: Number(formData.amount),
        screenshotUrl: "https://example.com/screenshot.jpg", // Replace with file upload logic later
        timestamp: new Date().toISOString(),
      };

      await createPayment(payment);
      alert("Payment added successfully!");
      onPaymentAddedAction();
      setFormData({
        projectId: "",
        stakeholder: "",
        amount: 0,
        screenshotUrl: "",
      });
      setFile(null);

    } catch (error) {
      console.error(error);
      alert("Failed to add payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="p-4 bg-white shadow-md rounded" onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold mb-4">Add Payment</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium">Project ID</label>
        <input
        aria-label="projectId"
          type="text"
          name="projectId"
          className="w-full border rounded p-2"
          value={formData.projectId}
          onChange={handleChange}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Stakeholder</label>
        <input
        aria-label="stakeholder"
          type="text"
          name="stakeholder"
          className="w-full border rounded p-2"
          value={formData.stakeholder}
          onChange={handleChange}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Amount</label>
        <input
        aria-label="amount"
          type="number"
          name="amount"
          className="w-full border rounded p-2"
          value={formData.amount}
          onChange={handleChange}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Screenshot</label>
        <input
        aria-label="screenshotUrl"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border rounded p-2"
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
