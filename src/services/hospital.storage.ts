/**
 * Hospital Image and Logo Storage Service
 * Supports simulated uploads converting files to Base64/Object URLs
 * for instantaneous local preview, along with real Firebase Storage patterns.
 */
export const hospitalStorageService = {
  /**
   * Uploads a hospital logo and returns its URL.
   */
  uploadLogo: async (file: File): Promise<string> => {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read logo file.'));
      };
      reader.readAsDataURL(file);
    });
  },

  /**
   * Uploads a hospital cover image and returns its URL.
   */
  uploadImage: async (file: File): Promise<string> => {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image file.'));
      };
      reader.readAsDataURL(file);
    });
  }
};
