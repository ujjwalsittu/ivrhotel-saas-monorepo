import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout, Palette, Globe, ExternalLink } from 'lucide-react';

interface WebsiteConfig {
    domain?: string;
    slug: string;
    theme: {
        primaryColor: string;
        secondaryColor: string;
        font: string;
    };
    content: {
        heroImage?: string;
        aboutText?: string;
        contactEmail?: string;
    };
}

const WebsiteBuilder: React.FC = () => {
    const { hotelId } = useParams();
    const [config, setConfig] = useState<WebsiteConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadConfig();
    }, [hotelId]);

    const loadConfig = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/website`);
            setConfig(response.data);
        } catch (error) {
            console.error('Error loading website config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        try {
            await api.put(`/hotels/${hotelId}/website`, config);
            alert('Website settings saved!');
        } catch (error) {
            console.error('Error saving config:', error);
            alert('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    const handlePreview = () => {
        if (!config) return;
        // Assuming hotel-site runs on port 3001
        window.open(`http://localhost:3001/${config.slug}`, '_blank');
    };

    if (loading) return <div>Loading...</div>;
    if (!config) return <div>Error loading configuration</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Website Builder</h1>
                    <p className="text-muted-foreground">Customize your public hotel website</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePreview}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Preview Site
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="general">
                <TabsList>
                    <TabsTrigger value="general">
                        <Globe className="h-4 w-4 mr-2" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="theme">
                        <Palette className="h-4 w-4 mr-2" />
                        Theme
                    </TabsTrigger>
                    <TabsTrigger value="content">
                        <Layout className="h-4 w-4 mr-2" />
                        Content
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Website Slug</Label>
                                <Input
                                    value={config.slug}
                                    onChange={(e) => setConfig({ ...config, slug: e.target.value })}
                                    placeholder="grand-hotel"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    Your site will be available at: http://localhost:3001/{config.slug}
                                </p>
                            </div>
                            <div>
                                <Label>Custom Domain (Optional)</Label>
                                <Input
                                    value={config.domain || ''}
                                    onChange={(e) => setConfig({ ...config, domain: e.target.value })}
                                    placeholder="www.grandhotel.com"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="theme">
                    <Card>
                        <CardHeader>
                            <CardTitle>Theme Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Primary Color</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input
                                            type="color"
                                            value={config.theme.primaryColor}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                theme: { ...config.theme, primaryColor: e.target.value }
                                            })}
                                            className="w-12 h-10 p-1"
                                        />
                                        <Input
                                            value={config.theme.primaryColor}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                theme: { ...config.theme, primaryColor: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Secondary Color</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input
                                            type="color"
                                            value={config.theme.secondaryColor}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                theme: { ...config.theme, secondaryColor: e.target.value }
                                            })}
                                            className="w-12 h-10 p-1"
                                        />
                                        <Input
                                            value={config.theme.secondaryColor}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                theme: { ...config.theme, secondaryColor: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Label>Font Family</Label>
                                <Input
                                    value={config.theme.font}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        theme: { ...config.theme, font: e.target.value }
                                    })}
                                    placeholder="Inter, Roboto, etc."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="content">
                    <Card>
                        <CardHeader>
                            <CardTitle>Homepage Content</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Hero Image URL</Label>
                                <Input
                                    value={config.content.heroImage || ''}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        content: { ...config.content, heroImage: e.target.value }
                                    })}
                                    placeholder="https://example.com/hero.jpg"
                                />
                            </div>
                            <div>
                                <Label>About Text</Label>
                                <Textarea
                                    value={config.content.aboutText || ''}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        content: { ...config.content, aboutText: e.target.value }
                                    })}
                                    rows={5}
                                    placeholder="Welcome to our hotel..."
                                />
                            </div>
                            <div>
                                <Label>Contact Email</Label>
                                <Input
                                    value={config.content.contactEmail || ''}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        content: { ...config.content, contactEmail: e.target.value }
                                    })}
                                    placeholder="info@hotel.com"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default WebsiteBuilder;
