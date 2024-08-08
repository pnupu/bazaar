import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCategories, useCreateItem } from '@/utils/api';
import PrimaryButton from '@/components/Button';
import { useWeb3 } from "@/contexts/useWeb3";
import { uploadImage } from '@/utils/imageUpload';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!address) {
      console.log("No address");
      return;
    }

    setIsUploading(true);

    try {
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
          disabled={createItem.isLoading || isUploading || !title || !description || !price || !categoryId}
          className="mt-4"
        />
      </form>
    </div>
  );
}