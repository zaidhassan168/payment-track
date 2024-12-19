"use client";

import { useEffect, useState } from "react";
import { getPayments } from "@/app/services/payments";
import { Payment } from "@/types";

export default function PaymentTable() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await getPayments();
      setPayments(data);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded mt-4">
      <h2 className="text-lg font-bold mb-4">Payments</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Project ID</th>
              <th className="border border-gray-300 p-2">Stakeholder</th>
              <th className="border border-gray-300 p-2">Amount</th>
              <th className="border border-gray-300 p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="border border-gray-300 p-2">{payment.projectId}</td>
                <td className="border border-gray-300 p-2">
                  {payment.stakeholder?.name || 'Unknown Stakeholder'}
                </td>
                <td className="border border-gray-300 p-2">{payment.amount}</td>
                <td className="border border-gray-300 p-2">{new Date(payment.timestamp || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
