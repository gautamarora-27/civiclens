from pathlib import Path
import cv2
from ultralytics import YOLO

root = Path(r"D:\civiclens_dataset_combined\test\images")

general = YOLO("yolo11n.pt")
civic = YOLO(r"D:\civiclens\runs\civiclens_final_v1\weights\best.pt")

files = list(root.glob("*.jpg"))

selected = []

for keyword in ["pothole", "encroachment"]:
    matches = [p for p in files if keyword in p.name.lower()]
    if matches:
        selected.append(matches[0])

print("SELECTED:")
for p in selected:
    print(" ", p.name)

print()

for p in selected:
    frame = cv2.imread(str(p))

    g = general.predict(
        frame,
        imgsz=640,
        conf=0.40,
        verbose=False,
    )[0]

    c = civic.predict(
        frame,
        imgsz=640,
        conf=0.40,
        verbose=False,
    )[0]

    print("IMAGE:", p.name)

    print("GENERAL:")
    for b in g.boxes:
        cls = general.names[int(b.cls[0])]
        conf = float(b.conf[0])
        box = [round(float(x), 1) for x in b.xyxy[0]]
        print(f"  {cls} conf={conf:.3f} box={box}")

    print("CIVIC:")
    for b in c.boxes:
        cls = civic.names[int(b.cls[0])]
        conf = float(b.conf[0])
        box = [round(float(x), 1) for x in b.xyxy[0]]
        print(f"  {cls} conf={conf:.3f} box={box}")

    print()
