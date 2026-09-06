import cv2

print("=== CIVICLENS CAMERA TEST ===")

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("ERROR: Could not open camera")
    raise SystemExit(1)

print("Camera opened successfully.")
print("Press Q to quit.")

while True:
    ok, frame = cap.read()

    if not ok:
        print("ERROR: Could not read frame")
        break

    cv2.imshow("CivicLens Camera Test", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

print("Camera released.")
