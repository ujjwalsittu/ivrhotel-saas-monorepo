import React from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Clock, XCircle, CreditCard, User, LogIn, LogOut } from 'lucide-react';
import { ScrollArea } from '@ivrhotel/ui';

interface Activity {
    _id: string;
    action: string;
    details: any;
    timestamp: string;
    userId?: {
        name: string;
        email: string;
    };
}

interface BookingTimelineProps {
    activities: Activity[];
}

const getIcon = (action: string) => {
    switch (action) {
        case 'CREATED': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        case 'CHECKED_IN': return <LogIn className="h-4 w-4 text-blue-500" />;
        case 'CHECKED_OUT': return <LogOut className="h-4 w-4 text-orange-500" />;
        case 'CANCELLED': return <XCircle className="h-4 w-4 text-red-500" />;
        case 'UPDATED': return <Clock className="h-4 w-4 text-gray-500" />;
        default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
};

const getTitle = (action: string) => {
    switch (action) {
        case 'CREATED': return 'Booking Created';
        case 'CHECKED_IN': return 'Guest Checked In';
        case 'CHECKED_OUT': return 'Guest Checked Out';
        case 'CANCELLED': return 'Booking Cancelled';
        case 'UPDATED': return 'Booking Updated';
        default: return action;
    }
};

export const BookingTimeline: React.FC<BookingTimelineProps> = ({ activities }) => {
    return (
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <div className="space-y-8">
                {activities.map((activity, index) => (
                    <div key={activity._id} className="flex gap-4">
                        <div className="mt-1">
                            {getIcon(activity.action)}
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium leading-none">
                                    {getTitle(activity.action)}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                    {format(new Date(activity.timestamp), 'PP p')}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {activity.userId ? `by ${activity.userId.name}` : 'System'}
                            </p>
                            {activity.details && Object.keys(activity.details).length > 0 && (
                                <div className="mt-2 rounded-md bg-muted p-2 text-xs">
                                    <pre className="whitespace-pre-wrap">
                                        {JSON.stringify(activity.details, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {activities.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground">
                        No activity recorded.
                    </div>
                )}
            </div>
        </ScrollArea>
    );
};
