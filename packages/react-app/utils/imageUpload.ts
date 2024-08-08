export async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Image upload failed');
      }
  
      const data = await response.json();
      
      if (!data.url) {
        throw new Error('Image upload failed');
      }
  
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }