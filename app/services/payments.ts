import { Payment } from "@/types";

export async function createPayment(paymentData: Payment) {
  const response = await fetch("/api/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    throw new Error("Failed to create payment");
  }

  return response.json();
}

export async function getPayments(): Promise<Payment[]> {
  const response = await fetch("/api/payments");
  if (!response.ok) {
    throw new Error("Failed to fetch payments");
  }

  return response.json();
}

export async function updatePayment(id: string, paymentData: Payment){
    const response = await fetch(`/api/payments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });
  
    if (!response.ok) {
      throw new Error("Failed to update payment");
    }
  
    return response.json();
  }
  
  export async function deletePayment(id: string) {
    const response = await fetch(`/api/payments/${id}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Failed to delete payment");
    }
  
    return response.json();
  }


 