export interface OCRResult {
  success: boolean;
  docType: 'Aadhaar' | 'Driving Licence' | 'Voter ID' | 'Passport';
  idNumber: string;
  name: string;
  dob: string;
  gender: string;
  address: string;
  confidence: number;
}

export const ocrService = {
  // Simulate DigiLocker authentication
  verifyWithDigiLocker: async (phoneNumber: string): Promise<OCRResult> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));

    // Return verified Aadhaar info mock
    return {
      success: true,
      docType: 'Aadhaar',
      idNumber: 'XXXXXXXX4892',
      name: 'Rohan Sharma',
      dob: '1995-11-20',
      gender: 'Male',
      address: 'H-202, Sector 63, Noida, Uttar Pradesh - 201301',
      confidence: 100.00
    };
  },

  // Fallback OCR scan using Google Vision/AWS Textract mock
  scanDocument: async (docType: 'Aadhaar' | 'Driving Licence' | 'Voter ID' | 'Passport', fileUrl: string): Promise<OCRResult> => {
    await new Promise(r => setTimeout(r, 1200));

    // Return mock parsed OCR details based on document type
    const names = ['Amit Patel', 'Priya Nair', 'Sandeep Singh', 'Karan Johar'];
    const mockName = names[Math.floor(Math.random() * names.length)];

    let idNumber = 'MH-2019-0028491';
    if (docType === 'Aadhaar') idNumber = 'XXXX-XXXX-9841';
    if (docType === 'Voter ID') idNumber = 'WPK' + Math.floor(Math.random() * 9000000 + 1000000);
    if (docType === 'Passport') idNumber = 'Z' + Math.floor(Math.random() * 9000000 + 1000000);

    return {
      success: true,
      docType,
      idNumber,
      name: mockName,
      dob: '1996-08-14',
      gender: Math.random() > 0.4 ? 'Male' : 'Female',
      address: 'Flat 402, Royal Residency, Indiranagar, Bangalore, Karnataka - 560038',
      confidence: 94.5
    };
  }
};
