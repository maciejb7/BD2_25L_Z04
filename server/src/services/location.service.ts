import { UserLocation } from "../db/models/user_location";
import { User } from "../db/models/user";

interface LocationData {
    latitude: number;
    longitude: number;
    address?: string;
}

export class LocationService {
    /**
     * Add or update a user's location
     * @param userId User ID
     * @param locationData Location data including latitude, longitude, and (optionally) address
     * @returns Created or updated location
     */
    static async setUserLocation(
        userId: string,
        locationData: LocationData
    ): Promise<UserLocation> {
        // Check if user already has a location
        const existingLocation = await UserLocation.findOne({
            where: { user_id: userId },
        });

        if (existingLocation) {
            // Update existing location
            existingLocation.latitude = locationData.latitude;
            existingLocation.longitude = locationData.longitude;
            existingLocation.address = locationData.address || existingLocation.address;
            await existingLocation.save();
            return existingLocation;
        } else {
            // Create new location
            return await UserLocation.create({
                user_id: userId,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                address: locationData.address,
            });
        }
    }

    /**
     * Get user's location
     * @param userId User ID
     * @returns User's location or null if not found
     */
    static async getUserLocation(userId: string): Promise<UserLocation | null> {
        return await UserLocation.findOne({
            where: { user_id: userId },
        });
    }

    /**
     * Delete user's location
     * @param userId User ID
     * @returns true if location was deleted, false if not found
     */
    static async deleteUserLocation(userId: string): Promise<boolean> {
        const result = await UserLocation.destroy({
            where: { user_id: userId },
        });
        return result > 0;
    }

    /**
     * Calculate distance between two points
     * @param lat1 Latitude of first point
     * @param lon1 Longitude of first point
     * @param lat2 Latitude of second point
     * @param lon2 Longitude of second point
     * @returns Distance in kilometers
     */
    static calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        // Haversine distance formula (based on thealmarques/haversine-distance-typescript)
        const radius = 6371; // km
        const dLat = this.deg2rad(lat2 - lat1);
        const deltaLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = radius * c; // distance in km
        return Math.round(distance * 10) / 10; // round to 1 decimal place
    }

    /**
     * Convert degrees to radians
     * @param deg Degrees
     * @returns Radians
     */
    private static deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    /**
     * Calculate distance between two users
     * @param userId1 First user ID
     * @param userId2 Second user ID
     * @returns Distance in kilometers, or null if one or both locations not found
     */
    static async getDistanceBetweenUsers(
        userId1: string,
        userId2: string
    ): Promise<number | null> {
        const location1 = await this.getUserLocation(userId1);
        const location2 = await this.getUserLocation(userId2);

        if (!location1 || !location2) {
            return null;
        }

        return this.calculateDistance(
            location1.latitude,
            location1.longitude,
            location2.latitude,
            location2.longitude
        );
    }
}