import time

import cv2
import requests

from cv.detection.detector import CivicLensDetector
from cv.gps.simulated_gps import SimulatedGPS


print("=== CIVICLENS LIVE DETECTOR TEST ===")
print("Press Q to quit.")

detector = CivicLensDetector()
gps = SimulatedGPS()

API_URL = "http://127.0.0.1:8000/api/v1/detections"
VEHICLE_ID = 1

POST_COOLDOWN_SECONDS = 5
last_post_time = {}

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    raise SystemExit("Could not open camera")

while True:
    ok, frame = cap.read()

    if not ok:
        continue

    detections = detector.detect(frame)
    location = gps.get_location()

    for detection in detections:
        x1, y1, x2, y2 = detection.bbox

        cv2.rectangle(
            frame,
            (x1, y1),
            (x2, y2),
            (0, 255, 0),
            2,
        )

        cv2.putText(
            frame,
            f"{detection.issue_type} {detection.confidence:.2f}",
            (x1, max(y1 - 10, 20)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2,
        )

        current_time = time.time()
        previous_time = last_post_time.get(detection.issue_type, 0)

        if current_time - previous_time >= POST_COOLDOWN_SECONDS:
            payload = {
                "vehicle_id": VEHICLE_ID,
                "issue_type": detection.issue_type,
                "confidence": detection.confidence,
                "severity": 5,
                "latitude": location["lat"],
                "longitude": location["lon"],
                "image_url": None,
            }

            try:
                response = requests.post(
                    API_URL,
                    json=payload,
                    timeout=3,
                )

                print(
                    f"DETECTION: {detection.issue_type} "
                    f"{detection.confidence:.2f}"
                )

                print(
                    f"GPS: {location['lat']}, "
                    f"{location['lon']}"
                )

                print(
                    "API:",
                    response.status_code,
                    response.text,
                )

                if response.ok:
                    last_post_time[detection.issue_type] = current_time

            except requests.RequestException as error:
                print("API ERROR:", error)

    cv2.putText(
        frame,
        f"JMIT GPS: {location['lat']:.5f}, {location['lon']:.5f}",
        (20, 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (0, 255, 255),
        2,
    )

    cv2.imshow("CivicLens Live Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()