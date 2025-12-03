import { notFound } from 'next/navigation';
import Link from 'next/link';

async function getHotelConfig(slug: string) {
    try {
        const res = await fetch(`http://localhost:3000/api/public/config/${slug}`, {
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        return null;
    }
}

// Mock function to fetch rooms - in real app this would call API
async function getRooms(hotelId: string) {
    // This would typically fetch from /api/hotels/:hotelId/room-types
    return [
        { id: '1', name: 'Deluxe Room', price: 150, image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80' },
        { id: '2', name: 'Executive Suite', price: 250, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80' },
        { id: '3', name: 'Presidential Suite', price: 500, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80' }
    ];
}

export default async function RoomsPage({ params }: { params: { slug: string } }) {
    const config = await getHotelConfig(params.slug);

    if (!config) {
        notFound();
    }

    const rooms = await getRooms(config.hotelId);
    const { theme } = config;

    return (
        <div style={{ fontFamily: theme.font }} className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header style={{ backgroundColor: theme.primaryColor, color: theme.secondaryColor }} className="p-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">{config.slug.toUpperCase()}</h1>
                    <nav className="space-x-4">
                        <Link href={`/${params.slug}`} className="hover:underline">Home</Link>
                        <Link href={`/${params.slug}/rooms`} className="hover:underline font-bold">Rooms</Link>
                        <Link href={`/${params.slug}/contact`} className="hover:underline">Contact</Link>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto py-12 px-4">
                <h2 className="text-3xl font-bold mb-8 text-center">Our Rooms</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.map((room) => (
                        <div key={room.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="h-64 bg-gray-200 relative">
                                <img
                                    src={room.image}
                                    alt={room.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                                <p className="text-gray-600 mb-4">Starting from ${room.price}/night</p>
                                <button
                                    style={{ backgroundColor: theme.primaryColor, color: theme.secondaryColor }}
                                    className="w-full py-2 rounded font-medium hover:opacity-90 transition"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
