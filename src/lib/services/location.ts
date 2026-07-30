export interface LocationCoords {
  lat: number;
  lng: number;
}

export const locationService = {
  // Haversine formula to calculate distance in meters between two coordinates
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  },

  // Verify if worker is within standard geofence boundary of job site
  isWithinGeofence: (
    workerLat: number,
    workerLng: number,
    jobLat: number,
    jobLng: number,
    maxDistanceMeters = 200
  ): boolean => {
    const distance = locationService.calculateDistance(workerLat, workerLng, jobLat, jobLng);
    return distance <= maxDistanceMeters;
  },

  // Mock geocoding service (Address to Coordinates)
  geocodeAddress: async (address: string): Promise<LocationCoords> => {
    await new Promise(r => setTimeout(r, 400));
    
    // Default coordinates (MG Road, Bangalore) with a small random jitter
    const jitterLat = (Math.random() - 0.5) * 0.01;
    const jitterLng = (Math.random() - 0.5) * 0.01;
    
    return {
      lat: 12.9716 + jitterLat,
      lng: 77.5946 + jitterLng
    };
  }
};
