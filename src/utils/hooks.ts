import { useState, useEffect } from "react";

export interface Location {
  latitude: number;
  longitude: number;
}

export function useGeolocation(): {
  location: Location | null;
  error: string | null;
  isLoading: boolean;
} {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported by your browser");
        }

        await new Promise<void>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (isMounted) {
                setLocation({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
              }
              resolve();
            },
            (err) => {
              console.error(err);
              if (isMounted) {
                setError(err.message || "Unable to retrieve location");
              }
              reject(err);
            },
          ),
        );
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError((err as Error)?.message || "An unknown error occurred");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void getLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return { location, error, isLoading };
}
