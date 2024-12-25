"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Payment } from "@/types";
import { Badge } from "@/components/ui/badge";

interface RenderPaymentsContentProps {
    loadingPayments: boolean;
    recentPayments: Payment[];
}

export const RenderPaymentsContent: React.FC<RenderPaymentsContentProps> = ({
    loadingPayments,
    recentPayments,
}) => {
    const getBadgeClass = (category: Payment["category"]) => {
        switch (category) {
            case "income":
                return "bg-green-500/20 text-green-700";
            case "clientExpense":
                return "bg-blue-500/20 text-blue-700";
            case "projectExpense":
                return "bg-yellow-500/20 text-yellow-700";
            case "deduction":
                return "bg-red-500/20 text-red-700";
            case "extraExpense":
                return "bg-purple-500/20 text-purple-700";
            default:
                return "bg-gray-500/20 text-gray-700";
        }
    };

    return (
        <>
            {loadingPayments ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div>
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-32 mt-1" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                        </div>
                    ))}
                </div>
            ) : recentPayments.length > 0 ? (
                <ScrollArea className="h-[300px] w-full">
                    <div className="space-y-4">
                        {recentPayments.map((payment) => (
                            <div className="flex items-start justify-between" key={payment.id}>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {new Date(payment.date ?? payment.timestamp ?? "").toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {payment.description ?? payment.stakeholder?.name}
                                    </p>
                                    <div className="flex gap-1 mt-1">
                                        {payment.category && (
                                            <span className={`px-2 py-0.5 rounded-md text-xs ${getBadgeClass(payment.category)}`}>
                                                {payment.category.charAt(0).toUpperCase() + payment.category.slice(1)}
                                            </span>
                                        )}
                                        {payment.from && (
                                            <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-700">
                                                From: {payment.from}
                                            </Badge>
                                        )}
                                        {payment.sentTo && (
                                            <Badge variant="secondary" className="text-xs">
                                                To: {payment.sentTo}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="font-medium whitespace-nowrap">
                                    <div className="flex items-center">
                                        Rs {new Intl.NumberFormat("en-PK").format(payment.amount)}
                                        {payment.category === "income" ? (
                                            <ArrowUpRight className="ml-1 h-4 w-4 text-green-500" />
                                        ) : (
                                            <ArrowDownRight className="ml-1 h-4 w-4 text-red-500" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            ) : (
                <p className="text-sm text-muted-foreground">No recent payments found.</p>
            )}
        </>
    );
};