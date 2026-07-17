/**
 * Building Image Storage Service
 * Supports simulated uploads converting files to Base64 data URLs
 * for instantaneous local preview, along with real Firebase Storage patterns.
 */
export const buildingStorageService = {
  /**
   * Uploads a building cover image and returns its URL.
   */
  uploadImage: async (file: File): Promise<string> => {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read building image file.'));
      };
      reader.readAsDataURL(file);
    });
  }
};
