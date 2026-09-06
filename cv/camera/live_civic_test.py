import cv2
from cv.detection.detector import CivicLensDetector

print("=== CIVICLENS LIVE CIVIC DETECTION ===")

detector = CivicLensDetector()

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    raise SystemExit("ERROR: Could not open camera")

print("Camera opened.")
print("Detecting: pothole | garbage | waterlogging | encroachment")
print("Press Q to quit.")

while True:
    ok, frame = cap.read()

    if not ok:
        continue

    results = detector.model.predict(
        frame,
        imgsz=640,
        conf=detector.confidence,
        verbose=False,
    )

    result = results[0]

    annotated = result.plot()

    cv2.imshow("CivicLens - Live Civic Detection", annotated)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

print("Live Civic Detection finished.")
