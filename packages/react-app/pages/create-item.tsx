import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCategories, useCreateItem } from '@/utils/api';
import PrimaryButton from '@/components/Button';
import { useWeb3 } from "@/contexts/useWeb3";
import { uploadImage } from '@/utils/imageUpload';
import { LatLngExpression } from 'leaflet';

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
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [position, setPosition] = useState<LatLngExpression | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

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

    const { lat, lon, display_name } = data[0];
    const [city, country] = display_name.split(', ').reverse();
    const position: LatLngExpression = [parseFloat(lat), parseFloat(lon)];

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

      const locationData = await fetchLocationData(location);

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
        /* location: {
              latitude: locationData.position[0],
              longitude: locationData.position[1],
         }, */
      });
      router.push('/');
    } catch (error) {
      console.error('Error creating item:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (categoriesLoading) return <div>Loading categories...</div>;

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
          </div>
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
    </div>
  );
}