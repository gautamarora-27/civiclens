import cv2

from cv.detection.detector import CivicLensDetector


print("=== CIVICLENS LIVE DETECTOR TEST ===")
print("Press Q to quit.")

detector = CivicLensDetector()

cap = cv2.VideoCapture(1)

if not cap.isOpened():
    raise SystemExit("Could not open camera")

while True:
    ok, frame = cap.read()

    if not ok:
        continue

    detections = detector.detect(frame)

    for detection in detections:
        cv2.putText(
            frame,
            f"{detection.issue_type} {detection.confidence:.2f}",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2,
        )

    cv2.imshow("CivicLens Live Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

print("Camera released.")
print("Live detector test finished.")
