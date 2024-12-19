"use client";

import { useState, useEffect } from "react";
import { addPayment } from "@/app/services/payments";
import { uploadImage } from "@/app/services/imageUpload";
import { Payment, Stakeholder } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { showSuccessToast, showErrorToast } from "@/lib/taost-utils";

type PaymentFieldValue = string | number | Date | Stakeholder;

type CreatePaymentModalProps = {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CreatePaymentModal({
  isOpen,
  projectId,
  onClose,
  onSuccess,
}: CreatePaymentModalProps) {
  const [formData, setFormData] = useState<Partial<Payment>>({
    projectId,
    date: new Date().toISOString().split("T")[0],
    description: "",
    stakeholder: undefined,
    item: "",
    category: undefined,
    amount: 0,
    sentTo: "",
    from: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);

  // Fetch stakeholders when modal opens
  useEffect(() => {
    const fetchStakeholders = async () => {
      if (!projectId || !isOpen) return;
      try {
        const stakeholdersRef = collection(db, `projects/${projectId}/stakeholders`);
        const snapshot = await getDocs(stakeholdersRef);
        const stakeholderList: Stakeholder[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Stakeholder[];
        setStakeholders(stakeholderList);
      } catch (error) {
        console.error("Error fetching stakeholders:", error);
      }
    };

    fetchStakeholders();
  }, [projectId, isOpen]);

  const handleChange = (name: string, value: PaymentFieldValue) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitting with formData:", formData);

    if (!formData.category || !formData.amount) {
      alert("Category and Amount are required!");
      return;
    }
    if (!formData.stakeholder) {
      alert("Please select a stakeholder before submitting.");
      return;
    }

    setLoading(true);
    try {
      let screenshotUrl = formData.screenshotUrl;
      if (file) {
        screenshotUrl = await uploadImage(file, "screenshots");
      }

      const paymentData: Payment = {
        ...formData,
        projectId,
        amount: Number(formData.amount),
        screenshotUrl,
        timestamp: new Date().toISOString(),
        category: formData.category || "income",
        projectName: formData.projectName || "Unknown Project",
      } as Payment;

      console.log("Final paymentData:", paymentData);

      await addPayment(paymentData);
      showSuccessToast("Payment created successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating payment:", error);
      showErrorToast("Failed to create payment");
    } finally {
      setLoading(false);
    }
  };

  const selectedStakeholderId = formData.stakeholder?.id || "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Payment</DialogTitle>
          <DialogDescription>
            Add a new payment to your project. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">

            {/* Date Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(new Date(formData.date), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date ? new Date(formData.date) : new Date()}
                    onSelect={(date) => handleChange("date", date?.toISOString().split("T")[0] || "")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                className="col-span-3"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            {/* Stakeholder Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stakeholder" className="text-right">Stakeholder</Label>
              <Select
                onValueChange={(value) => {
                  console.log("Selected stakeholder ID:", value);
                  const selected = stakeholders.find(st => st.id === value);
                  if (selected) {
                    console.log("Selected stakeholder object:", selected);
                    handleChange("stakeholder", selected);
                  } else {
                    console.warn("No stakeholder found for the selected ID:", value);
                  }
                }}
                value={selectedStakeholderId}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder={stakeholders.length === 0 ? "No stakeholders available" : "Select a stakeholder"} />
                </SelectTrigger>
                <SelectContent>
                  {stakeholders.length === 0 ? (
                    <SelectItem value="none" disabled>No stakeholders found</SelectItem>
                  ) : (
                    stakeholders.map((st) => (
                      <SelectItem key={st.id} value={st.id!}>{st.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Item */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item" className="text-right">Item</Label>
              <Input
                id="item"
                className="col-span-3"
                value={formData.item || ""}
                onChange={(e) => handleChange("item", e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select
                onValueChange={(value) => handleChange("category", value)}
                value={formData.category || ""}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="deduction">Deduction</SelectItem>
                  <SelectItem value="extraExpense">Extra Expense</SelectItem>
                  <SelectItem value="clientExpense">Client Expense</SelectItem>
                  <SelectItem value="projectExpense">Project Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount</Label>
              <Input
                id="amount"
                type="number"
                className="col-span-3"
                value={formData.amount || 0}
                onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
              />
            </div>

            {/* Sent To */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sentTo" className="text-right">Sent To</Label>
              <Input
                id="sentTo"
                className="col-span-3"
                value={formData.sentTo || ""}
                onChange={(e) => handleChange("sentTo", e.target.value)}
              />
            </div>

            {/* From */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="from" className="text-right">From</Label>
              <Input
                id="from"
                className="col-span-3"
                value={formData.from || ""}
                onChange={(e) => handleChange("from", e.target.value)}
              />
            </div>

            {/* Screenshot */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="screenshot" className="text-right">Screenshot</Label>
              <Input
                id="screenshot"
                type="file"
                className="col-span-3"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
