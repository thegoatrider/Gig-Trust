export interface FaceMatchResult {
  success: boolean;
  matchScore: number;
  message: string;
}

export const faceMatchService = {
  // Compare a live uploaded selfie with the ID document photo using AWS Rekognition / Azure Face API mock
  compareFaces: async (selfieUrl: string, idPhotoUrl: string): Promise<FaceMatchResult> => {
    // Simulate API round-trip delay
    await new Promise(r => setTimeout(r, 1000));

    // For demo purposes: if the selfie is uploaded, simulate a successful high-match score
    const randomScore = parseFloat((88 + Math.random() * 11).toFixed(2)); // 88% to 99%

    return {
      success: randomScore >= 90.0,
      matchScore: randomScore,
      message: randomScore >= 90.0 
        ? "Facial recognition verified. Match confidence exceeds 90% threshold."
        : "Facial recognition failed. Match confidence below 90% threshold."
    };
  }
};
