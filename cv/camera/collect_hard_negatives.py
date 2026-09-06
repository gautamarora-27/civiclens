import cv2
from pathlib import Path
from cv.detection.detector import CivicLensDetector

OUT = Path(r"D:\civiclens\runs\hard_negatives")
OUT.mkdir(parents=True, exist_ok=True)

detector = CivicLensDetector()
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    raise SystemExit("Could not open camera")

saved = 0
frames = 0

print("=== CIVICLENS HARD NEGATIVE COLLECTOR ===")
print("Show the normal scene/person that is being wrongly detected.")
print("Press Q to stop.")

while saved < 30:
    ok, frame = cap.read()

    if not ok:
        continue

    frames += 1
    detections = detector.detect(frame)

    civic = [
        d for d in detections
        if d.issue_type in {
            "pothole",
            "garbage",
            "waterlogging",
            "encroachment",
        }
    ]

    if civic:
        path = OUT / f"negative_{saved + 1:03d}.jpg"

        if cv2.imwrite(str(path), frame):
            saved += 1
            print(
                f"SAVED {saved}: "
                + ", ".join(
                    f"{d.issue_type}={d.confidence:.2f}"
                    for d in civic
                )
            )

    cv2.imshow("Hard Negative Collection", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

print(f"Frames processed: {frames}")
print(f"Hard negatives saved: {saved}")
print(f"Output: {OUT}")
