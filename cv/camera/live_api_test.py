import time

import cv2
import requests

from cv.detection.detector import CivicLensDetector


API_URL = "http://127.0.0.1:8000/api/v1/detections"

VEHICLE_ID = 1

# Temporary test coordinates.
# Replace with real GPS integration later.
LATITUDE = 28.6139
LONGITUDE = 77.2090

CONFIRMATION_INTERVAL = 5.0


print("=== CIVICLENS AI -> API INTEGRATION TEST ===")

detector = CivicLensDetector()

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    raise SystemExit("Could not open camera")

print("Camera opened.")
print("Press Q to quit.")

last_sent = {}

try:
    while True:
        ok, frame = cap.read()

        if not ok:
            print("ERROR: Failed to read camera frame")
            break

        detections = detector.detect(frame)

        for detection in detections:
            issue_type = detection.issue_type
            confidence = detection.confidence

            now = time.monotonic()
            previous = last_sent.get(issue_type, 0.0)

            if now - previous < CONFIRMATION_INTERVAL:
                continue

            payload = {
                "vehicle_id": VEHICLE_ID,
                "issue_type": issue_type,
                "confidence": confidence,
                "severity": 5,
                "latitude": LATITUDE,
                "longitude": LONGITUDE,
                "image_url": "test://live-camera",
            }

            try:
                response = requests.post(
                    API_URL,
                    json=payload,
                    timeout=5,
                )

                response.raise_for_status()

                print(
                    f"POST OK | "
                    f"{issue_type}={confidence:.3f} | "
                    f"status={response.status_code} | "
                    f"response={response.json()}"
                )

                last_sent[issue_type] = now

            except requests.RequestException as exc:
                print(f"API ERROR: {exc}")

        annotated = detector.model.predict(
            frame,
            imgsz=640,
            conf=detector.confidence,
            verbose=False,
        )[0].plot()

        cv2.imshow("CivicLens AI -> API", annotated)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

finally:
    cap.release()
    cv2.destroyAllWindows()

print("Integration test finished.")
