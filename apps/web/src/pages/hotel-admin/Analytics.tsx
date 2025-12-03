import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Calendar, Users, RefreshCw } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface AnalyticsData {
    summary: {
        totalRevenue: number;
        totalBookings: number;
        avgBookingValue: number;
        period: { start: Date; end: Date };
    };
    sourceBreakdown: Record<string, number>;
    dailyRevenue: Array<{ date: string; revenue: number }>;
}

interface OccupancyData {
    currentOccupancy: number;
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    trend: Array<{ date: string; occupancy: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Analytics: React.FC = () => {
    const { hotelId } = useParams();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [occupancy, setOccupancy] = useState<OccupancyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange] = useState({
        start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });

    useEffect(() => {
        loadAnalytics();
        loadOccupancy();
    }, [hotelId, dateRange]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/hotels/${hotelId}/analytics/dashboard`, {
                params: {
                    startDate: dateRange.start,
                    endDate: dateRange.end
                }
            });
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadOccupancy = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/analytics/occupancy`);
            setOccupancy(response.data);
        } catch (error) {
            console.error('Error loading occupancy:', error);
        }
    };

    const handleRefresh = () => {
        loadAnalytics();
        loadOccupancy();
    };

    // Transform source breakdown for pie chart
    const sourceChartData = analytics?.sourceBreakdown
        ? Object.entries(analytics.sourceBreakdown).map(([name, value]) => ({
            name,
            value
        }))
        : [];

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    if (loading && !analytics) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                    <p className="text-muted-foreground">Performance metrics and insights</p>
                </div>
                <Button onClick={handleRefresh} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(analytics?.summary.totalRevenue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Last {Math.ceil((new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.summary.totalBookings || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Confirmed reservations
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(analytics?.summary.avgBookingValue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Per reservation
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{occupancy?.currentOccupancy || 0}%</div>
                        <p className="text-xs text-muted-foreground">
                            {occupancy?.occupiedRooms || 0} of {occupancy?.totalRooms || 0} rooms
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Revenue Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analytics?.dailyRevenue || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    name="Revenue"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Booking Sources */}
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Sources</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={sourceChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {sourceChartData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Occupancy Trend */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Occupancy Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={occupancy?.trend || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `${value}%`} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="occupancy"
                                    stroke="#10b981"
                                    fill="#10b981"
                                    fillOpacity={0.6}
                                    name="Occupancy %"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Dynamic Pricing Section */}
            <Card className="mt-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Dynamic Pricing Rules</CardTitle>
                        <Button size="sm">Add Rule</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        No active pricing rules. Add rules to automatically adjust rates based on demand.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
export default Analytics;
