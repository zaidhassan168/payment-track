"use client";

import { useState } from "react";
import { createPayment } from "@/app/services/payments";
import { Payment } from "@/types";

export default function CreatePaymentModal({ projects, stakeholders, onPaymentAdded }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedStakeholder, setSelectedStakeholder] = useState("");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !selectedStakeholder || !amount || !file) {
      alert("All fields are required!");
      return;
    }

    try {
      const payment: Payment = {
        projectId: selectedProject,
        stakeholder: selectedStakeholder,
        amount: Number(amount),
        screenshotUrl: "https://example.com/screenshot.jpg", // Replace with upload logic
        timestamp: new Date().toISOString(),
      };

      await createPayment(payment);
      alert("Payment created successfully!");
      onPaymentAdded();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create payment:", error);
      alert("An error occurred.");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Payment
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Create Payment</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Project</label>
                <select
                title="project"
                  className="w-full border rounded p-2"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  <option value="">Select a project</option>
                  {projects.map((project: any) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">Stakeholder</label>
                <select
                title="Stakeholder"
                  className="w-full border rounded p-2"
                  value={selectedStakeholder}
                  onChange={(e) => setSelectedStakeholder(e.target.value)}
                  disabled={!selectedProject}
                >
                  <option value="">Select a stakeholder</option>
                  {stakeholders
                    .filter((stakeholder: any) => stakeholder.projectId === selectedProject)
                    .map((stakeholder: any) => (
                      <option key={stakeholder.id} value={stakeholder.name}>
                        {stakeholder.name} ({stakeholder.role})
                      </option>
                    ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">Amount</label>
                <input
                aria-label="amount"
                  type="number"
                  className="w-full border rounded p-2"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">Screenshot</label>
                <input
                aria-label="ScreenShot"
                  type="file"
                  className="w-full border rounded p-2"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
