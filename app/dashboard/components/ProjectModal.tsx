"use client";

import { useState, useEffect } from "react";
import { Project, Stakeholder } from "@/types";
import { createProject, updateProject } from "@/app/services/projects";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: Project; // If provided, edit mode is enabled
}

export default function ProjectModal({ isOpen, onClose, onSuccess, project }: ProjectModalProps) {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: "",
    budget: 0,
    client: "",
    deadline: "",
  });
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [newStakeholder, setNewStakeholder] = useState<Stakeholder>({ name: "", role: "", contact: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData(project);
      setStakeholders(project.stakeholders || []);
    }
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddStakeholder = () => {
    if (newStakeholder.name && newStakeholder.role && newStakeholder.contact) {
      setStakeholders([...stakeholders, newStakeholder]);
      setNewStakeholder({ name: "", role: "", contact: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, budget, client } = formData;

    if (!name || !budget || !client) {
      alert("All fields are required!");
      return;
    }

    setLoading(true);

    try {
      const projectData: Project = {
        ...formData,
        budget: Number(budget),
        spent: project?.spent || 0, // Default for new projects
        paymentTransferred: project?.paymentTransferred || 0,
        stakeholders,
      };

      if (project?.id) {
        await updateProject(project.id, projectData);
        alert("Project updated successfully!");
      } else {
        await createProject(projectData);
        alert("Project created successfully!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving project:", error);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{project ? "Edit Project" : "Create Project"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Project Name"
            className="w-full mb-4 border rounded p-2"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="number"
            name="budget"
            placeholder="Budget"
            className="w-full mb-4 border rounded p-2"
            value={formData.budget}
            onChange={handleChange}
          />
          <input
            type="text"
            name="client"
            placeholder="Client Name"
            className="w-full mb-4 border rounded p-2"
            value={formData.client}
            onChange={handleChange}
          />
          <input
          placeholder="Deadline"
            type="date"
            name="deadline"
            className="w-full mb-4 border rounded p-2"
            value={formData.deadline || ""}
            onChange={handleChange}
          />

          <div className="mb-4">
            <h3 className="text-sm font-bold">Stakeholders</h3>
            <input
              type="text"
              placeholder="Name"
              className="w-full mb-2 border rounded p-2"
              value={newStakeholder.name}
              onChange={(e) => setNewStakeholder({ ...newStakeholder, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Role"
              className="w-full mb-2 border rounded p-2"
              value={newStakeholder.role}
              onChange={(e) => setNewStakeholder({ ...newStakeholder, role: e.target.value })}
            />
            <input
              type="text"
              placeholder="Contact"
              className="w-full mb-2 border rounded p-2"
              value={newStakeholder.contact}
              onChange={(e) => setNewStakeholder({ ...newStakeholder, contact: e.target.value })}
            />
            <button
              type="button"
              onClick={handleAddStakeholder}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Stakeholder
            </button>
          </div>

          <ul className="list-disc ml-6 text-sm mb-4">
            {stakeholders.map((stakeholder, index) => (
              <li key={index}>
                {stakeholder.name} ({stakeholder.role}) - {stakeholder.contact}
              </li>
            ))}
          </ul>

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
