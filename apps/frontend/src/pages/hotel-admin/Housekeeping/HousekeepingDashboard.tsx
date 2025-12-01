import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const HousekeepingDashboard: React.FC = () => {
    const { hotelId } = useParams();
    const [stats, setStats] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);

    // Create Task Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newTask, setNewTask] = useState({
        roomId: "",
        type: "CLEANING",
        description: "",
        priority: "MEDIUM",
        assignedTo: ""
    });

    useEffect(() => {
        fetchData();
    }, [hotelId]);

    const fetchData = async () => {
        try {
            const [statsRes, tasksRes, roomsRes, staffRes] = await Promise.all([
                api.get(`/hotels/${hotelId}/housekeeping/stats`),
                api.get(`/hotels/${hotelId}/housekeeping/tasks`),
                api.get(`/hotels/${hotelId}/rooms`),
                api.get(`/hotels/${hotelId}/staff`)
            ]);
            setStats(statsRes.data);
            setTasks(tasksRes.data);
            setRooms(roomsRes.data.data || roomsRes.data);
            setStaff(staffRes.data.data || staffRes.data);
        } catch (error) {
            console.error('Error fetching housekeeping data:', error);
        }
    };

    const handleCreateTask = async () => {
        try {
            await api.post(`/hotels/${hotelId}/housekeeping/tasks`, newTask);
            setIsCreateOpen(false);
            setNewTask({ roomId: "", type: "CLEANING", description: "", priority: "MEDIUM", assignedTo: "" });
            fetchData();
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Failed to create task');
        }
    };

    const updateTaskStatus = async (taskId: string, status: string) => {
        try {
            await api.put(`/hotels/${hotelId}/housekeeping/tasks/${taskId}`, { status });
            fetchData();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    if (!stats) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Housekeeping & Maintenance</h1>
                <Button onClick={() => setIsCreateOpen(true)}>Create Task</Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Clean Rooms</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-600">{stats.clean}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Dirty Rooms</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-yellow-600">{stats.dirty}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Maintenance</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{stats.maintenance}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Occupied</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-600">{stats.occupied}</div></CardContent>
                </Card>
            </div>

            {/* Tasks List */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Room</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.map((task: any) => (
                                <TableRow key={task._id}>
                                    <TableCell className="font-medium">{task.roomId?.number}</TableCell>
                                    <TableCell>{task.type}</TableCell>
                                    <TableCell>{task.description}</TableCell>
                                    <TableCell>
                                        <Badge variant={task.priority === 'HIGH' ? 'destructive' : task.priority === 'MEDIUM' ? 'secondary' : 'outline'}>
                                            {task.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{task.assignedTo?.name || 'Unassigned'}</TableCell>
                                    <TableCell>
                                        <Badge variant={task.status === 'COMPLETED' ? 'default' : 'outline'}>
                                            {task.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            defaultValue={task.status}
                                            onValueChange={(val) => updateTaskStatus(task._id, val)}
                                        >
                                            <SelectTrigger className="w-[130px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Task Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Room</Label>
                                <Select onValueChange={(val) => setNewTask({ ...newTask, roomId: val })} value={newTask.roomId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Room" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rooms.map((room) => (
                                            <SelectItem key={room._id} value={room._id}>
                                                {room.number} ({room.status})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select onValueChange={(val) => setNewTask({ ...newTask, type: val })} value={newTask.type}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CLEANING">Cleaning</SelectItem>
                                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Details about the task..."
                                value={newTask.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTask({ ...newTask, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select onValueChange={(val) => setNewTask({ ...newTask, priority: val })} value={newTask.priority}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Assign To (Optional)</Label>
                                <Select onValueChange={(val) => setNewTask({ ...newTask, assignedTo: val })} value={newTask.assignedTo}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Staff" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {staff.map((s) => (
                                            <SelectItem key={s._id} value={s._id}>
                                                {s.name} ({s.role})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateTask}>Create Task</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HousekeepingDashboard;
