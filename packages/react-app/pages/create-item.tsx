import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCategories, useCreateItem } from '@/utils/api';
import PrimaryButton from '@/components/Button';
import { useWeb3 } from "@/contexts/useWeb3";
import { uploadImage } from '@/utils/imageUpload';
import { LatLngExpression } from 'leaflet';
import Map from '@/components/Map'

interface LocationData {
  city: string;
  country: string;
  position: LatLngExpression;
}

export default function CreateItemPage() {
  const router = useRouter();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createItem = useCreateItem();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('')

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number]>([0, 0]);

  const {
    address,
    getUserAddress
  } = useWeb3();

  useEffect(() => {
    getUserAddress();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const fetchLocationData = async (locationInput: string): Promise<LocationData> => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}`);
    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error('Location not found. Please check your input and try again.');
    }

    const { lat, lon, display_name, address } = data[0];
    const components = display_name.split(', ').reverse();
 
    const firstComponent = components[0];
    const ninthOrLastComponent = components[8] || components[components.length - 1];
  
    const country = firstComponent;
    const city = ninthOrLastComponent;
    const position: [number, number] = [parseFloat(lat), parseFloat(lon)];

    setCoordinates(position);
    setLocationName(city + ", " + country)
    return { city, country, position };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!address) {
      console.log("No address");
      return;
    }

    setIsUploading(true);

    try {

      await fetchLocationData(location);

      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      await createItem.mutateAsync({
        title,
        description,
        price: parseFloat(price),
        categoryId,
        imageUrl,
        address,
        latitude: coordinates[0],
        longitude: coordinates[1],
        placeName: locationName
      });
      router.push('/');
    } catch (error) {
      console.error('Error creating item:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (categoriesLoading) return <div>Loading categories...</div>;

  const handleShowMap = async () => {
    if (location) {
      try {
        await fetchLocationData(location);
        setIsMapModalOpen(true);
      } catch (error) {
        setLocationError('Failed to load location data. Please try again.');
      }
    } else {
      setLocationError('Please enter a location first.');
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Item</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="title" className="block mb-2">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block mb-2">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block mb-2">Price</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            step="0.01"
            min="0"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="category" className="block mb-2">Category</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select a category</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="image" className="block mb-2">Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="location" className="block mb-2">Location</label>
          <div className="flex">
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city and country (e.g., London, UK)"
              className="flex-grow p-2 border rounded"
            />
            <button
              type="button"
              onClick={handleShowMap}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Show Map
            </button>
          </div>
          {locationError && <p className="text-red-500 mt-1">{locationError}</p>}
        </div>
        {imagePreview && (
          <div className="mb-4">
            <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded" />
          </div>
        )}
        <PrimaryButton
          title="Create Item"
          onClick={() => handleSubmit}
          widthFull
          loading={createItem.isLoading || isUploading}
          disabled={createItem.isLoading || isUploading || !title || !description || !price || !categoryId } //|| !location}
          className="mt-4"
        />
      </form>
      <Map
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        locationName={locationName}
        coordinates={coordinates}
      />
    </div>
  );
}