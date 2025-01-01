"use client";

import { useState, useEffect } from "react";
import { addPayment } from "@/app/services/payments";
import { uploadImage } from "@/app/services/imageUpload";
import { Payment, Stakeholder, Item, PaymentCategory } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { showSuccessToast, showErrorToast } from "@/lib/taost-utils";

type PaymentFieldValue = string | number | Date | Stakeholder | Item[keyof Item];

type CreatePaymentModalProps = {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
};
type PaymentFormData = Omit<Payment, 'item'> & {
  item?: {
    name: string;
    measurementType?: 'weight' | 'volume' | 'quantity';
    quantity: number;
    unitPrice: number;
  };
};
export default function CreatePaymentModal({
  isOpen,
  projectId,
  onClose,
  onSuccess,
}: CreatePaymentModalProps) {
  const [formData, setFormData] = useState<Partial<PaymentFormData>>({
    projectId,
    date: new Date().toISOString().split("T")[0],
    description: "",
    stakeholder: {} as Stakeholder,
    item: {
      name: "",
      measurementType: 'quantity',
      quantity: 0,
      unitPrice: 0,
    },
    category: "income" as PaymentCategory,
    amount: 0,
    sentTo: "",
    from: "",
  });


  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [isItemSectionOpen, setIsItemSectionOpen] = useState(false);

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
    setFormData((prev) => {
      if (name.startsWith("item.")) {
        const itemField = name.split(".")[1] as keyof Item;
        return {
          ...prev,
          item: {
            ...prev.item,
            [itemField]: value,
          } as PaymentFormData['item'],
        };
      }
      return { ...prev, [name]: value };
    });
  };
  const validateItemFields = () => {
    if (formData.item?.name && !formData.item.quantity) {
      return "Please enter a quantity";
    }
    if (formData.item?.quantity && !formData.item.name) {
      return "Please enter an item name";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!formData.category || !formData.amount) {
      alert("Category and Amount are required!");
      return;
    }
    if (!formData.stakeholder || !formData.stakeholder.id) {
      alert("Please select a stakeholder before submitting.");
      return;
    }

    validateItemFields();
  
    setLoading(true);
    try {
      let screenshotUrl = formData.screenshotUrl;
      if (file) {
        screenshotUrl = await uploadImage(file, "screenshots");
      }
  
      // Create a copy of the payment data
      const paymentData: Payment= {
        ...formData,
        projectId,
        amount: Number(formData.amount),
        screenshotUrl,
        timestamp: new Date().toISOString(),
        category: formData.category as PaymentCategory,
        projectName: formData.projectName || "Unknown Project",
        stakeholder: formData.stakeholder as Stakeholder,
      };
  
      // Only include item if it has valid data
      if (formData.item && 
          formData.item.name && 
          formData.item.name.trim() !== '' && 
          formData.item.quantity > 0) {
        paymentData.item = {
          name: formData.item.name,
          measurementType: formData.item.measurementType || 'quantity',
          quantity: formData.item.quantity,
          unitPrice: formData.item.unitPrice || 0,
        };
      
      }
      else {
        delete paymentData.item;
      }
  
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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto bg-white shadow-lg rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">Create Payment</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Add a new payment to your project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="font-medium text-gray-700">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(new Date(formData.date), "yyyy-MM-dd") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date ? new Date(formData.date) : undefined}
                    onSelect={(date) => handleChange("date", date ? format(date, "yyyy-MM-dd") : "")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stakeholder" className="font-medium text-gray-700">Stakeholder</Label>
              <Select
                onValueChange={(value) => {
                  const selected = stakeholders.find(st => st.id === value);
                  if (selected) {
                    handleChange("stakeholder", selected);
                  }
                }}
                value={formData.stakeholder?.id || ""}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={stakeholders.length === 0 ? "No stakeholders" : "Select"} />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium text-gray-700">Description</Label>
            <Textarea
              id="description"
              className="w-full"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="font-medium text-gray-700">Category</Label>
              <Select
                onValueChange={(value) => handleChange("category", value)}
                value={formData.category || ""}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="extraIncome">Extra Income</SelectItem>
                  <SelectItem value="clientExpense">Client Expense</SelectItem>
                  <SelectItem value="projectExpense">Project Expense</SelectItem>
                  <SelectItem value="deduction">Deduction</SelectItem>
                  <SelectItem value="extraExpense">Extra Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-medium text-gray-700">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount || ""}
                onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
              />
            </div>
          </div>

          <Collapsible
            open={isItemSectionOpen}
            onOpenChange={setIsItemSectionOpen}
            className="space-y-2 bg-gray-50 p-4 rounded-md"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-700">Item Details</h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {isItemSectionOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle item details</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item.name" className="font-medium text-gray-700">Item Name</Label>
                  <Input
                    id="item.name"
                    value={formData.item?.name || ""}
                    onChange={(e) => handleChange("item.name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item.measurementType" className="font-medium text-gray-700">Measurement</Label>
                  <Select
                    onValueChange={(value) => handleChange("item.measurementType", value)}
                    value={formData.item?.measurementType || "quantity"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                      <SelectItem value="quantity">Quantity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item.quantity" className="font-medium text-gray-700">Quantity</Label>
                  <Input
                    id="item.quantity"
                    type="number"
                    value={formData.item?.quantity || ""}
                    onChange={(e) => handleChange("item.quantity", parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item.unitPrice" className="font-medium text-gray-700">Unit Price</Label>
                  <Input
                    id="item.unitPrice"
                    type="number"
                    value={formData.item?.unitPrice || ""}
                    onChange={(e) => handleChange("item.unitPrice", parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sentTo" className="font-medium text-gray-700">Sent To</Label>
              <Input
                id="sentTo"
                value={formData.sentTo || ""}
                onChange={(e) => handleChange("sentTo", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from" className="font-medium text-gray-700">From</Label>
              <Select
                onValueChange={(value) => handleChange("from", value)}
                value={formData.from || ""}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot" className="font-medium text-gray-700">Screenshot</Label>
            <Input
              id="screenshot"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-primary text-white hover:bg-primary-dark">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Submitting..." : "Create Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

