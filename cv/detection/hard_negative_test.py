from pathlib import Path
import cv2
from ultralytics import YOLO

root = Path(r"D:\civiclens\runs\hard_negatives")
model_path = r"D:\civiclens\runs\civiclens_hardneg_v1\weights\best.pt"

model = YOLO(model_path)
files = sorted(root.glob("*.jpg"))

print(f"Testing {len(files)} hard negatives...")
false_detections = 0

for p in files:
    frame = cv2.imread(str(p))
    result = model.predict(frame, imgsz=640, conf=0.40, verbose=False)[0]

    if result.boxes is None or len(result.boxes) == 0:
        print(f"{p.name}: NOTHING")
    else:
        false_detections += len(result.boxes)
        detections = []

        for box in result.boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            detections.append(f"{model.names[cls]}={conf:.3f}")

        print(f"{p.name}: " + ", ".join(detections))

print()
print(f"Total false detections: {false_detections}")
print("DONE")
