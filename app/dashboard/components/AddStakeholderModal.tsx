"use client";

import { useState } from "react";
import { addStakeholder } from "@/app/services/projects";
import { Stakeholder } from "@/types";
import { showSuccessToast, showErrorToast } from "@/lib/taost-utils"

export default function AddStakeholderModal({ projectId, onStakeholderAddedAction }: { projectId: string; onStakeholderAddedAction: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [stakeholder, setStakeholder] = useState<Stakeholder>({
    name: "",
    role: "",
    contact: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStakeholder({ ...stakeholder, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeholder.name || !stakeholder.role || !stakeholder.contact) {
      alert("All fields are required!");
      return;
    }

    setLoading(true);

    try {
      await addStakeholder(projectId, stakeholder);
      showSuccessToast("Stakeholder added successfully");
      onStakeholderAddedAction();
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding stakeholder:", error);
      showErrorToast("Failed to add stakeholder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Stakeholder
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Stakeholder</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Name</label>
                <input
                aria-label="Name"
                  type="text"
                  name="name"
                  className="w-full border rounded p-2"
                  value={stakeholder.name}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">Role</label>
                <input
                aria-label="Role"
                  type="text"
                  name="role"
                  className="w-full border rounded p-2"
                  value={stakeholder.role}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">Contact</label>
                <input
                aria-label="Contact"
                  type="text"
                  name="contact"
                  className="w-full border rounded p-2"
                  value={stakeholder.contact}
                  onChange={handleChange}
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
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
