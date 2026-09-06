import cv2
import time

print("=== CIVICLENS CAMERA FRAME TEST ===")

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("ERROR: Could not open camera")
    raise SystemExit(1)

print("Camera opened successfully.")

frames = 0
start = time.perf_counter()

while frames < 10:
    ok, frame = cap.read()

    if not ok:
        print(f"Frame {frames + 1}: FAILED")
        continue

    frames += 1
    elapsed = time.perf_counter() - start

    height, width = frame.shape[:2]

    print(
        f"Frame {frames}: "
        f"{width}x{height}, "
        f"elapsed={elapsed:.2f}s"
    )

cap.release()

elapsed = time.perf_counter() - start

print("Camera released.")
print(f"Frames received: {frames}")
print(f"Elapsed: {elapsed:.2f}s")

if elapsed > 0:
    print(f"Approx FPS: {frames / elapsed:.2f}")
