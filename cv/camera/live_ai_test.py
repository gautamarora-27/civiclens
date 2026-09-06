import cv2
from ultralytics import YOLO

print("=== CIVICLENS LIVE CIVIC DETECTION ===")
print("Classes: pothole, garbage, waterlogging, encroachment")
print("Press Q in the camera window to quit.")

MODEL_PATH = r"D:\civiclens\runs\civiclens_hardneg_v1\weights\best.pt"

model = YOLO(MODEL_PATH)

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    raise SystemExit("ERROR: Could not open camera")

print("Camera opened.")

while True:
    ok, frame = cap.read()

    if not ok:
        continue

    results = model.predict(
        frame,
        imgsz=640,
        conf=0.40,
        verbose=False,
    )

    result = results[0]

    annotated = result.plot()

    cv2.imshow("CivicLens - Live Detection", annotated)

    key = cv2.waitKey(1) & 0xFF

    if key == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

print("Camera released.")
print("Live CivicLens test finished.")
