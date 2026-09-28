import threading
import time

import cv2
import requests
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

from cv.detection.detector import CivicLensDetector
from cv.gps.simulated_gps import SimulatedGPS


app = FastAPI()

detector = CivicLensDetector()
gps = SimulatedGPS()

API_URL = "http://127.0.0.1:8000/api/v1/detections"
VEHICLE_ID = 1
POST_COOLDOWN_SECONDS = 5

last_post_time = {}
latest_frame = None
frame_lock = threading.Lock()


def camera_loop():
    global latest_frame

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        raise RuntimeError("Could not open camera")

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
            previous_time = last_post_time.get(
                detection.issue_type,
                0,
            )

            if (
                current_time - previous_time
                >= POST_COOLDOWN_SECONDS
            ):
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

                    if response.ok:
                        last_post_time[
                            detection.issue_type
                        ] = current_time

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

        with frame_lock:
            latest_frame = frame.copy()


def generate_frames():
    while True:
        with frame_lock:
            if latest_frame is None:
                continue

            ok, buffer = cv2.imencode(
                ".jpg",
                latest_frame,
            )

        if not ok:
            continue

        frame_bytes = buffer.tobytes()

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n"
            + frame_bytes
            + b"\r\n"
        )

        time.sleep(0.03)


@app.on_event("startup")
def startup_event():
    thread = threading.Thread(
        target=camera_loop,
        daemon=True,
    )
    thread.start()


@app.get("/video")
def video():
    return StreamingResponse(
        generate_frames(),
        media_type=(
            "multipart/x-mixed-replace; "
            "boundary=frame"
        ),
    )


@app.get("/")
def root():
    return {
        "status": "CivicLens CV stream running"
    }