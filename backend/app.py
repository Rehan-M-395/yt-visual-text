from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import base64
import uuid
import os

app = FastAPI()

# CORS (already required for extension)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageReq(BaseModel):
    image: str

@app.post("/frame")
def receive_frame(req: ImageReq):
    # 1. Remove base64 header
    header, encoded = req.image.split(",", 1)

    # 2. Decode base64 → bytes
    image_bytes = base64.b64decode(encoded)

    # 3. Create images folder if not exists
    os.makedirs("images", exist_ok=True)

    # 4. Generate unique filename
    filename = f"images/frame_{uuid.uuid4().hex}.png"

    # 5. Save image
    with open(filename, "wb") as f:
        f.write(image_bytes)

    print("Image saved at:", filename)

    return {
        "status": "saved",
        "file": filename
    }