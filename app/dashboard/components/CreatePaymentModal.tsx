"use client";

import { useState, useEffect } from "react";
import { addPayment } from "@/app/services/payments";
import { getStakeholdersByProject } from "@/app/services/stakeholders";

export default function CreatePaymentModal({
  isOpen,
  projectId,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    stakeholder: "",
    amount: "",
    screenshotUrl: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [stakeholders, setStakeholders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stakeholdersLoading, setStakeholdersLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadStakeholders();
    }
  }, [isOpen]);

  const loadStakeholders = async () => {
    try {
      const data = await getStakeholdersByProject(projectId);
      setStakeholders(data);
    } catch (error) {
      console.error("Error loading stakeholders:", error);
    } finally {
      setStakeholdersLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.stakeholder || !formData.amount || !file) {
      alert("All fields are required!");
      return;
    }

    setLoading(true);

    try {
      await addPayment({
        projectId,
        stakeholder: formData.stakeholder,
        amount: Number(formData.amount),
        screenshotUrl: URL.createObjectURL(file), // Replace with actual upload logic
        timestamp: new Date().toISOString(),
      });
      onSuccess();
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Failed to create payment.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create Payment</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Stakeholder</label>
            {stakeholdersLoading ? (
              <p>Loading stakeholders...</p>
            ) : (
              <select
              title="Stakeholder"
                name="stakeholder"
                className="w-full border rounded p-2"
                value={formData.stakeholder}
                onChange={handleChange}
              >
                <option value="">Select a stakeholder</option>
                {stakeholders.map((stakeholder: any) => (
                  <option key={stakeholder.id} value={stakeholder.name}>
                    {stakeholder.name} ({stakeholder.role})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Amount</label>
            <input
            title="Amount"
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
            title="Screenshot"
              type="file"
              className="w-full border rounded p-2"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
