import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export const createHotel = async (data: any) => {
    const response = await api.post('/hotels', data);
    return response.data;
};

export const uploadDocuments = async (hotelId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('documents', file);
    });

    const response = await api.post(`/hotels/${hotelId}/documents`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getAmenities = async () => {
    const response = await api.get('/config/amenities');
    return response.data;
};

export const getPropertyTypes = async () => {
    const response = await api.get('/config/property-types');
    return response.data;
};

export const createAmenity = async (data: any) => {
    const response = await api.post('/config/amenities', data);
    return response.data;
};

export const createPropertyType = async (data: any) => {
    const response = await api.post('/config/property-types', data);
    return response.data;
};

export default api;
