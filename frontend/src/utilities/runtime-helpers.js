export const useUpload = () => {
  const upload = async ({ file }) => {
    if (!file) {
      return { error: "No file provided" };
    }

    try {
      // Simulate a file upload
      const url = URL.createObjectURL(file);
      return { url };
    } catch (err) {
      return { error: err.message };
    }
  };

  return [upload, { loading: false }];
};
