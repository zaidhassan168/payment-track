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
  // const {toast} = useToast();
  useEffect(() => {
    if (stakeholder) {
      setName(stakeholder.name);
      setRole(stakeholder.role);
      setContact(stakeholder.contact);
    }
  }, [stakeholder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeholder) return;
  
    setLoading(true);
    try {
      const { updateStakeholder } = await import("@/app/services/stakeholders");
      await updateStakeholder(projectId, stakeholder.id!, { name, role, contact });
      showSuccessToast("Stakeholder updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      showErrorToast("Failed to update stakeholder");
      console.error("Error updating stakeholder:", error);

    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Stakeholder</DialogTitle>
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
              {loading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
