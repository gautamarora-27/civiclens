import os
import cv2
from inference_sdk import InferenceHTTPClient
from inference_sdk.webrtc import WebcamSource, StreamConfig, VideoMetadata

API_KEY = os.getenv("ROBOFLOW_API_KEY")

if not API_KEY:
    raise RuntimeError("ROBOFLOW_API_KEY not found in environment")

client = InferenceHTTPClient.init(
    api_url="https://serverless.roboflow.com",
    api_key=API_KEY,
)

source = WebcamSource(resolution=(1280, 720))

config = StreamConfig(
    processing_timeout=3600,
    requested_plan="webrtc-gpu-medium",
    requested_region="us",
)

session = client.webrtc.stream(
    source=source,
    workflow="garbage-vgarbage-0q3db-bk0m2-1-yolo11n-t1-logic",
    workspace="motion-blink",
    image_input="image",
    config=config,
)

@session.on_frame
def show_frame(frame, metadata):
    cv2.imshow("CivicLens - Garbage Test", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        session.close()

@session.on_data()
def on_data(data: dict, metadata: VideoMetadata):
    print(f"Frame {metadata.frame_id}: {data}")

session.run()
