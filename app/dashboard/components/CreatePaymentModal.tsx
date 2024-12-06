'use client'

import { useState } from "react"
import { addPayment } from "@/app/services/payments"
import { uploadImage } from "@/app/services/imageUpload"
import { Payment } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
    stakeholder: "",
    item: "",
    category: undefined,
    amount: 0,
    sentTo: "",
    from: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    name: string,
    value: string | number | Date
  ) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.amount) {
      alert("Category and Amount are required!");
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
        category: formData.category || "",
      };

      await addPayment(paymentData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Failed to create payment.");
    } finally {
      setLoading(false);
    }
  };

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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
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
                    selected={new Date(formData.date || "")}
                    onSelect={(date) => handleChange("date", date?.toISOString().split("T")[0] || "")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                className="col-span-3"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="head" className="text-right">
                Head
              </Label>
              <Select onValueChange={(value) => handleChange("stakeholder", value)} value={formData.stakeholder}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a head" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Client">Client</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>

                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item" className="text-right">
                Item
              </Label>
              <Input
                id="item"
                className="col-span-3"
                value={formData.item}
                onChange={(e) => handleChange("item", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select onValueChange={(value) => handleChange("category", value)} value={formData.category}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="deduction">Deduction</SelectItem>
                  <SelectItem value="extraExpense">Extra Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                className="col-span-3"
                value={formData.amount}
                onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sentTo" className="text-right">
                Sent To
              </Label>
              <Input
                id="sentTo"
                className="col-span-3"
                value={formData.sentTo}
                onChange={(e) => handleChange("sentTo", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="from" className="text-right">
                From
              </Label>
              <Input
                id="from"
                className="col-span-3"
                value={formData.from}
                onChange={(e) => handleChange("from", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="screenshot" className="text-right">
                Screenshot
              </Label>
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
  )
}

