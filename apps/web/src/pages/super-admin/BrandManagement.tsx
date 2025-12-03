import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ivrhotel/ui';
import { Button } from '@ivrhotel/ui';
import { Input } from '@ivrhotel/ui';
import { Label } from '@ivrhotel/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ivrhotel/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@ivrhotel/ui";
import { Badge } from '@ivrhotel/ui';
import { Plus, Building2, Settings } from 'lucide-react';
import { Textarea } from '@ivrhotel/ui';

interface Brand {
    _id: string;
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    settings: any;
    isActive: boolean;
    createdAt: string;
}

const BrandManagement: React.FC = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        logo: '',
        description: '',
        settings: {
            branding: {
                primaryColor: '#000000',
                secondaryColor: '#6B7280',
                accentColor: '#3B82F6'
            },
            policies: {
                cancellation: {
                    freeCancellationHours: 24,
                    cancellationFeePercentage: 20
                },
                checkIn: {
                    defaultTime: '14:00',
                    earlyCheckInFee: 0
                },
                checkOut: {
                    defaultTime: '12:00',
                    lateCheckOutFee: 0
                }
            }
        }
    });

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const response = await api.get('/brands');
            setBrands(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            if (editingBrand) {
                await api.put(`/brands/${editingBrand._id}`, formData);
            } else {
                await api.post('/brands', formData);
            }
            setIsDialogOpen(false);
            resetForm();
            fetchBrands();
        } catch (error) {
            console.error('Error saving brand:', error);
            alert('Failed to save brand');
        }
    };

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setFormData({
            name: brand.name,
            slug: brand.slug,
            logo: brand.logo || '',
            description: brand.description || '',
            settings: brand.settings
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this brand?')) return;

        try {
            await api.delete(`/brands/${id}`);
            fetchBrands();
        } catch (error: any) {
            console.error('Error deleting brand:', error);
            alert(error.response?.data?.message || 'Failed to delete brand');
        }
    };

    const resetForm = () => {
        setEditingBrand(null);
        setFormData({
            name: '',
            slug: '',
            logo: '',
            description: '',
            settings: {
                branding: {
                    primaryColor: '#000000',
                    secondaryColor: '#6B7280',
                    accentColor: '#3B82F6'
                },
                policies: {
                    cancellation: {
                        freeCancellationHours: 24,
                        cancellationFeePercentage: 20
                    },
                    checkIn: {
                        defaultTime: '14:00',
                        earlyCheckInFee: 0
                    },
                    checkOut: {
                        defaultTime: '12:00',
                        lateCheckOutFee: 0
                    }
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Brand Management</h1>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Create Brand
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Brands</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {brands.map((brand) => (
                                <TableRow key={brand._id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            {brand.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{brand.slug}</TableCell>
                                    <TableCell>
                                        <Badge variant={brand.isActive ? 'default' : 'secondary'}>
                                            {brand.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(brand.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(brand)}>
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(brand._id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingBrand ? 'Edit Brand' : 'Create Brand'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Brand Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug</Label>
                                <Input
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="brand-slug"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Logo URL</Label>
                            <Input
                                value={formData.logo}
                                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3">Brand Colors</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Primary Color</Label>
                                    <Input
                                        type="color"
                                        value={formData.settings.branding.primaryColor}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            settings: {
                                                ...formData.settings,
                                                branding: { ...formData.settings.branding, primaryColor: e.target.value }
                                            }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Secondary Color</Label>
                                    <Input
                                        type="color"
                                        value={formData.settings.branding.secondaryColor}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            settings: {
                                                ...formData.settings,
                                                branding: { ...formData.settings.branding, secondaryColor: e.target.value }
                                            }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Accent Color</Label>
                                    <Input
                                        type="color"
                                        value={formData.settings.branding.accentColor}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            settings: {
                                                ...formData.settings,
                                                branding: { ...formData.settings.branding, accentColor: e.target.value }
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>{editingBrand ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BrandManagement;
