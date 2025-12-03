export const HANDLING_TYPES = [
    { value: 'ROOMS', label: 'Rooms Only' },
    { value: 'ROOMS_KITCHEN', label: 'Rooms + Kitchen' },
    { value: 'ROOMS_RESTAURANT_KITCHEN', label: 'Rooms + Restaurant + Kitchen' },
    { value: 'FULL', label: 'Full Service' }
] as const;

export const BUSINESS_STRUCTURES = [
    { value: 'PRIVATE_LIMITED', label: 'Private Limited' },
    { value: 'LLP', label: 'LLP' },
    { value: 'INDIVIDUAL', label: 'Individual' }
] as const;
