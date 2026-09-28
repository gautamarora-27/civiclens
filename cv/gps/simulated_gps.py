class SimulatedGPS:
    def __init__(self):
        self.lat = 30.0367584
        self.lon = 77.1601796

    def get_location(self):
        return {
            "lat": self.lat,
            "lon": self.lon,
        }
