import cv2
from ultralytics import YOLO

MODEL = r"D:\civiclens\runs\civiclens_hardneg_v1\weights\best.pt"

model = YOLO(MODEL)
cap = cv2.VideoCapture(1)

if not cap.isOpened():
    raise SystemExit("Could not open Camera 1")

print("=== CIVICLENS IPHONE LIVE TEST ===")
print("Camera 1 opened. Press Q to quit.")

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

    annotated = results[0].plot()

    cv2.imshow(
        "CivicLens - iPhone Live Detection",
        annotated,
    )

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

print("CivicLens live test finished.")