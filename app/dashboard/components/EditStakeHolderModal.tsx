"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stakeholder } from "@/types";
import { showSuccessToast, showErrorToast } from "@/lib/taost-utils";

type EditStakeholderModalProps = {
  isOpen: boolean;
  projectId: string;
  stakeholder: Stakeholder | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditStakeholderModal({
  isOpen,
  projectId,
  stakeholder,
  onClose,
  onSuccess
}: EditStakeholderModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stakeholder) {
      setName(stakeholder.name);
      setRole(stakeholder.role);
      setContact(stakeholder.contact);
    } else {
      // Reset fields when adding a new stakeholder
      setName("");
      setRole("");
      setContact("");
    }
  }, [stakeholder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    setLoading(true);
    try {
      if (stakeholder) {
        // Update existing stakeholder
        const { updateStakeholder } = await import("@/app/services/stakeholders");
        await updateStakeholder(projectId, stakeholder.id!, { name, role, contact });
        showSuccessToast("Stakeholder updated successfully");
      } else {
        // Add new stakeholder
        const { addStakeholder } = await import("@/app/services/stakeholders");
        await addStakeholder(projectId, { name, role, contact });
        showSuccessToast("Stakeholder added successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      showErrorToast(stakeholder ? "Failed to update stakeholder" : "Failed to add stakeholder");
      console.error("Error with stakeholder operation:", error);
    } finally {
      setLoading(false);
    }
  };

  const isAddMode = !stakeholder;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isAddMode ? "Add Stakeholder" : "Edit Stakeholder"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="flex flex-col space-y-1">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} required />
            </div>
            <div className="flex flex-col space-y-1">
              <Label htmlFor="contact">Contact</Label>
              <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (isAddMode ? "Adding..." : "Updating...") : (isAddMode ? "Add" : "Update")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

