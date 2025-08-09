"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getProcurementStats, getRecentProcurementRequests } from '@/app/services/procurement';
import { ProcurementRequest, ProcurementStats } from '@/types/procurement';
import { format } from 'date-fns';
import { Package, Clock, CheckCircle, Truck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    quantity_checked: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    ordered: 'bg-purple-100 text-purple-800',
    arrived: 'bg-indigo-100 text-indigo-800',
    processing: 'bg-orange-100 text-orange-800',
    shipped: 'bg-cyan-100 text-cyan-800',
};

export default function ProcurementOverview() {
    const [stats, setStats] = useState<ProcurementStats | null>(null);
    const [recentRequests, setRecentRequests] = useState<ProcurementRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, requestsData] = await Promise.all([
                getProcurementStats(),
                getRecentProcurementRequests(),
            ]);

            setStats(statsData);
            setRecentRequests(requestsData);
        } catch (error) {
            console.error('Error loading procurement data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="grid grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Procurement Stats */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Procurement Overview
                    </CardTitle>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/dashboard/procurement">
                            View All
                            <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {stats && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Total</p>
                                    <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                                </div>
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-yellow-600">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-600" />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Approved</p>
                                    <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-purple-600">Ordered</p>
                                    <p className="text-2xl font-bold text-purple-800">{stats.ordered}</p>
                                </div>
                                <Truck className="h-8 w-8 text-purple-600" />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Requests */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Procurement Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentRequests.length > 0 ? (
                            recentRequests.slice(0, 5).map(request => (
                                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3 flex-1">
                                        {request.imageUrl && (
                                            <img
                                                src={request.imageUrl}
                                                alt={request.materialName}
                                                className="w-10 h-10 rounded object-cover"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium">{request.materialName}</p>
                                            <p className="text-sm text-gray-500">
                                                {request.quantity} • {request.projectName}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge className={statusColors[request.status]}>
                                            {request.status.replace('_', ' ')}
                                        </Badge>
                                        <span className="text-sm text-gray-500">
                                            {format(new Date(request.createdAt), 'MMM dd')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>No procurement requests found</p>
                            </div>
                        )}
                    </div>

                    {recentRequests.length > 5 && (
                        <div className="mt-4 text-center">
                            <Button asChild variant="outline" size="sm">
                                <Link href="/dashboard/procurement">
                                    View All Requests
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
