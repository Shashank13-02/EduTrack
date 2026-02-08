/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters
    return distance;
}

/**
 * Check if a location is within acceptable range
 * @param studentLat Student's latitude
 * @param studentLon Student's longitude
 * @param teacherLat Teacher's latitude
 * @param teacherLon Teacher's longitude
 * @param maxDistance Maximum allowed distance in meters (default: 50)
 * @returns true if within range, false otherwise
 */
export function isWithinRange(
    studentLat: number,
    studentLon: number,
    teacherLat: number,
    teacherLon: number,
    maxDistance: number = 50
): boolean {
    const distance = calculateDistance(studentLat, studentLon, teacherLat, teacherLon);
    return distance <= maxDistance;
}
