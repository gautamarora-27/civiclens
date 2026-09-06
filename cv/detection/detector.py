from dataclasses import dataclass
from pathlib import Path

from ultralytics import YOLO


@dataclass
class CivicDetection:
    issue_type: str
    confidence: float


class CivicLensDetector:
    """
    CivicLens trained YOLO detector.

    Class mapping:
        0 -> pothole
        1 -> garbage
        2 -> waterlogging
        3 -> encroachment
    """

    CLASS_TO_ISSUE = {
        0: "pothole",
        1: "garbage",
        2: "waterlogging",
        3: "encroachment",
    }

    def __init__(
        self,
        model_path: str = str(Path(__file__).resolve().parents[2] / "model" / "best.pt"),
        confidence: float = 0.40,
    ):
        self.model = YOLO(model_path)
        self.confidence = confidence

    def detect(self, frame) -> list[CivicDetection]:
        results = self.model.predict(
            frame,
            imgsz=640,
            conf=self.confidence,
            verbose=False,
        )

        detections: list[CivicDetection] = []

        if not results:
            return detections

        boxes = results[0].boxes

        if boxes is None:
            return detections

        for box in boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            issue_type = self.CLASS_TO_ISSUE.get(class_id)

            if issue_type is None:
                continue

            detections.append(
                CivicDetection(
                    issue_type=issue_type,
                    confidence=confidence,
                )
            )

        return detections
