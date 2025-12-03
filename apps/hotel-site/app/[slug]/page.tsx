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

export default async function HotelPage({ params }: { params: { slug: string } }) {
    const config = await getHotelConfig(params.slug);

    if (!config) {
        notFound();
    }

    const { theme, content } = config;

    return (
        <div style={{ fontFamily: theme.font }} className="min-h-screen flex flex-col">
            {/* Header */}
            <header style={{ backgroundColor: theme.primaryColor, color: theme.secondaryColor }} className="p-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">{config.slug.toUpperCase()}</h1>
                    <nav className="space-x-4">
                        <Link href={`/${params.slug}`} className="hover:underline">Home</Link>
                        <Link href={`/${params.slug}/rooms`} className="hover:underline">Rooms</Link>
                        <Link href={`/${params.slug}/contact`} className="hover:underline">Contact</Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative h-[500px] flex items-center justify-center text-white">
                {content.heroImage && (
                    <div
                        className="absolute inset-0 bg-cover bg-center z-0"
                        style={{ backgroundImage: `url(${content.heroImage})` }}
                    />
                )}
                <div className="absolute inset-0 bg-black/50 z-10" />
                <div className="relative z-20 text-center p-8">
                    <h2 className="text-5xl font-bold mb-4">Welcome to Our Hotel</h2>
                    <p className="text-xl max-w-2xl mx-auto">{content.aboutText}</p>
                    <Link
                        href={`/${params.slug}/rooms`}
                        style={{ backgroundColor: theme.primaryColor, color: theme.secondaryColor }}
                        className="inline-block mt-8 px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
                    >
                        Book Now
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 mt-auto">
                <div className="container mx-auto text-center">
                    <p>&copy; {new Date().getFullYear()} {config.slug}. All rights reserved.</p>
                    {content.contactEmail && (
                        <p className="mt-2 text-gray-400">Contact: {content.contactEmail}</p>
                    )}
                </div>
            </footer>
        </div>
    );
}
