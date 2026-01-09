from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import base64
import uuid
import os
import easyocr
from PIL import Image

app = FastAPI()

# CORS (already required for extension)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 Load EasyOCR ONCE (IMPORTANT)
reader = easyocr.Reader(['en'], gpu=False)

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

    # 6. OCR with EasyOCR
    results = reader.readtext(filename, detail=0, paragraph=True)
    print("OCR raw results:", results)
    text = " ".join(results)

    print("Image saved at:", filename)
    print("OCR text:", text)

    return {
        "status": "success",
        "file": filename,
        "text": text
    }