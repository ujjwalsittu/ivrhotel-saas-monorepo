import React, { useState, useEffect } from 'react';
import {
    Tabs, TabsContent, TabsList, TabsTrigger,
    Card, CardContent, CardHeader, CardTitle, CardDescription,
    Button, Input, Label,
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@ivrhotel/ui';
import { Plus, Settings, Check, X } from 'lucide-react';
import { getAmenities, getPropertyTypes, createAmenity, createPropertyType } from '@/services/api';
import { toast } from 'sonner';

const GlobalConfiguration: React.FC = () => {
    const [amenities, setAmenities] = useState<any[]>([]);
    const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [isAmenityDialogOpen, setIsAmenityDialogOpen] = useState(false);
    const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);

    const [newAmenity, setNewAmenity] = useState({
        name: '',
        code: '',
        category: 'General',
        icon: 'Circle'
    });

    const [newType, setNewType] = useState({
        name: '',
        code: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [amenitiesData, typesData] = await Promise.all([
                getAmenities(),
                getPropertyTypes()
            ]);
            setAmenities(amenitiesData);
            setPropertyTypes(typesData);
        } catch (error) {
            console.error('Error fetching config:', error);
            toast.error('Failed to load configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAmenity = async () => {
        try {
            await createAmenity(newAmenity);
            toast.success('Amenity created successfully');
            setIsAmenityDialogOpen(false);
            setNewAmenity({ name: '', code: '', category: 'General', icon: 'Circle' });
            fetchData();
        } catch (error) {
            console.error('Error creating amenity:', error);
            toast.error('Failed to create amenity');
        }
    };

    const handleCreateType = async () => {
        try {
            await createPropertyType(newType);
            toast.success('Property Type created successfully');
            setIsTypeDialogOpen(false);
            setNewType({ name: '', code: '', description: '' });
            fetchData();
        } catch (error) {
            console.error('Error creating property type:', error);
            toast.error('Failed to create property type');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Global Configuration</h1>
                    <p className="text-muted-foreground">Manage platform-wide settings and dynamic data.</p>
                </div>
            </div>

            <Tabs defaultValue="amenities" className="w-full">
                <TabsList>
                    <TabsTrigger value="amenities">Amenities</TabsTrigger>
                    <TabsTrigger value="property-types">Property Types</TabsTrigger>
                </TabsList>

                <TabsContent value="amenities" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Hotel Amenities</CardTitle>
                                <CardDescription>Manage the list of available facilities for hotels.</CardDescription>
                            </div>
                            <Dialog open={isAmenityDialogOpen} onOpenChange={setIsAmenityDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Amenity
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Amenity</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input
                                                value={newAmenity.name}
                                                onChange={(e) => setNewAmenity({ ...newAmenity, name: e.target.value })}
                                                placeholder="e.g. Swimming Pool"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Code</Label>
                                            <Input
                                                value={newAmenity.code}
                                                onChange={(e) => setNewAmenity({ ...newAmenity, code: e.target.value.toUpperCase() })}
                                                placeholder="e.g. POOL"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select
                                                value={newAmenity.category}
                                                onValueChange={(val) => setNewAmenity({ ...newAmenity, category: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="General">General</SelectItem>
                                                    <SelectItem value="Services">Services</SelectItem>
                                                    <SelectItem value="Wellness">Wellness</SelectItem>
                                                    <SelectItem value="F&B">F&B</SelectItem>
                                                    <SelectItem value="Events">Events</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Icon (Lucide Name)</Label>
                                            <Input
                                                value={newAmenity.icon}
                                                onChange={(e) => setNewAmenity({ ...newAmenity, icon: e.target.value })}
                                                placeholder="e.g. Waves"
                                            />
                                        </div>
                                        <Button onClick={handleCreateAmenity} className="w-full">Create Amenity</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Icon</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {amenities.map((amenity) => (
                                        <TableRow key={amenity._id}>
                                            <TableCell className="font-medium">{amenity.name}</TableCell>
                                            <TableCell>{amenity.code}</TableCell>
                                            <TableCell>{amenity.category}</TableCell>
                                            <TableCell>{amenity.icon}</TableCell>
                                            <TableCell>
                                                {amenity.isActive ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        Inactive
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="property-types" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Property Types</CardTitle>
                                <CardDescription>Define the types of properties supported by the platform.</CardDescription>
                            </div>
                            <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Property Type
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Property Type</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input
                                                value={newType.name}
                                                onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                                                placeholder="e.g. Resort"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Code</Label>
                                            <Input
                                                value={newType.code}
                                                onChange={(e) => setNewType({ ...newType, code: e.target.value.toUpperCase() })}
                                                placeholder="e.g. RESORT"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Input
                                                value={newType.description}
                                                onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                                                placeholder="Brief description"
                                            />
                                        </div>
                                        <Button onClick={handleCreateType} className="w-full">Create Type</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {propertyTypes.map((type) => (
                                        <TableRow key={type._id}>
                                            <TableCell className="font-medium">{type.name}</TableCell>
                                            <TableCell>{type.code}</TableCell>
                                            <TableCell>{type.description}</TableCell>
                                            <TableCell>
                                                {type.isActive ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        Inactive
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default GlobalConfiguration;
