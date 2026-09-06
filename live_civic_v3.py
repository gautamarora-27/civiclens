import cv2
from ultralytics import YOLO

MODEL = r"D:\civiclens\runs\civiclens_water_v3\weights\best.pt"

model = YOLO(MODEL)

cap = cv2.VideoCapture(1)

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

print("Camera opened:", cap.isOpened())
print("Press Q to quit")

while True:
    ret, frame = cap.read()

    if not ret:
        print("Failed to read camera frame")
        break

    results = model.predict(
        frame,
        conf=0.45,
        verbose=False
    )

    annotated = results[0].plot()

    cv2.imshow(
        "CivicLens Live - iPhone Camo",
        annotated
    )

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
