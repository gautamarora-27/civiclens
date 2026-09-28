from dataclasses import dataclass
from pathlib import Path

from ultralytics import YOLO


@dataclass
class CivicDetection:
    issue_type: str
    confidence: float
    bbox: tuple[int, int, int, int]


class CivicLensDetector:
    """
    CivicLens detector using:

    1. Main multi-class model:
       0 -> pothole
       1 -> garbage
       2 -> waterlogging
       3 -> encroachment

    2. Garbage specialist model:
       0 -> garbage
    """

    MAIN_CLASS_MAP = {
        0: "pothole",
        1: "garbage",
        2: "waterlogging",
        3: "encroachment",
    }

    def __init__(
        self,
        confidence: float = 0.40,
        garbage_confidence: float = 0.70,
        waterlogging_confidence: float = 0.65,
    ):
        root = Path(__file__).resolve().parents[2]

        main_model_path = root / "model" / "best.pt"
        garbage_model_path = root / "model" / "garbage_best.pt"

        self.main_model = YOLO(str(main_model_path))
        self.garbage_model = YOLO(str(garbage_model_path))

        self.confidence = confidence
        self.garbage_confidence = garbage_confidence

    def detect(self, frame) -> list[CivicDetection]:
        detections: list[CivicDetection] = []

        # ---------------------------------
        # Main CivicLens model
        # ---------------------------------
        main_results = self.main_model.predict(
            frame,
            imgsz=640,
            conf=self.confidence,
            verbose=False,
        )

        if main_results and main_results[0].boxes is not None:
            for box in main_results[0].boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])

                issue_type = self.MAIN_CLASS_MAP.get(class_id)

                if issue_type is None:
                    continue

                x1, y1, x2, y2 = map(
                    int,
                    box.xyxy[0].tolist(),
                )

                detections.append(
                    CivicDetection(
                        issue_type=issue_type,
                        confidence=confidence,
                        bbox=(x1, y1, x2, y2),
                    )
                )

        # ---------------------------------
        # Garbage specialist model
        # ---------------------------------
        garbage_results = self.garbage_model.predict(
            frame,
            imgsz=640,
            conf=self.garbage_confidence,
            verbose=False,
        )

        if garbage_results and garbage_results[0].boxes is not None:
            for box in garbage_results[0].boxes:
                confidence = float(box.conf[0])

                x1, y1, x2, y2 = map(
                    int,
                    box.xyxy[0].tolist(),
                )

                detections.append(
                    CivicDetection(
                        issue_type="garbage",
                        confidence=confidence,
                        bbox=(x1, y1, x2, y2),
                    )
                )

        return detections