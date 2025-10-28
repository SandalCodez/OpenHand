const API_BASE_URL = 'http://localhost:8000';

export const aiService = {
  async predictSign(imageBlob: Blob, targetLabel: string) {
    const formData = new FormData();
    formData.append('file', imageBlob, 'hand-sign.jpg');
    formData.append('target_label', targetLabel);

    const response = await fetch(`${API_BASE_URL}/api/predict/lesson`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend error:', errorData);
      throw new Error(errorData.detail || 'Prediction failed');
    }

    return await response.json();
  }
};