import cv2
import random
from pathlib import Path

ROOT = Path(r"D:\civiclens_dataset_combined\valid")
OUT = Path(r"D:\civiclens\runs\weak_class_inspection")
OUT.mkdir(parents=True, exist_ok=True)

CLASSES = {
    1: "garbage",
    2: "waterlogging",
}

random.seed(42)

for class_id, class_name in CLASSES.items():

    candidates = []

    for image_path in (ROOT / "images").glob("*"):
        label_path = ROOT / "labels" / (image_path.stem + ".txt")

        if not label_path.exists():
            continue

        lines = label_path.read_text(errors="ignore").splitlines()

        if any(
            line.strip() and int(line.split()[0]) == class_id
            for line in lines
        ):
            candidates.append(image_path)

    selected = random.sample(
        candidates,
        min(10, len(candidates))
    )

    for i, image_path in enumerate(selected, 1):

        image = cv2.imread(str(image_path))

        if image is None:
            continue

        h, w = image.shape[:2]

        label_path = ROOT / "labels" / (image_path.stem + ".txt")

        for line in label_path.read_text(errors="ignore").splitlines():

            parts = line.split()

            if len(parts) != 5:
                continue

            cls, xc, yc, bw, bh = map(float, parts)

            if int(cls) != class_id:
                continue

            x1 = int((xc - bw / 2) * w)
            y1 = int((yc - bh / 2) * h)
            x2 = int((xc + bw / 2) * w)
            y2 = int((yc + bh / 2) * h)

            cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 3)

            cv2.putText(
                image,
                class_name,
                (x1, max(30, y1 - 10)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.9,
                (0, 255, 0),
                2,
            )

        output = OUT / f"{class_name}_{i:02d}.jpg"
        cv2.imwrite(str(output), image)

    print(f"{class_name}: saved {len(selected)} images")

print("DONE")
print("Output:", OUT)
