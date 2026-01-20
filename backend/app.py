from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import base64
import easyocr
from PIL import Image
import io

app = FastAPI()

# CORS for extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load EasyOCR only once
reader = easyocr.Reader(['en'], gpu=False)

class ImageReq(BaseModel):
    image: str

@app.post("/frame")
def receive_frame(req: ImageReq):
    try:
        # 1) Remove base64 header
        header, encoded = req.image.split(",", 1)

        # 2) Decode base64 → bytes
        image_bytes = base64.b64decode(encoded)

        # 3) Convert bytes → PIL Image (in memory)
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # 4) OCR directly from image (no saving)
        results = reader.readtext(image_bytes, detail=0, paragraph=True)
        text = " ".join(results)

        return {
            "status": "success",
            "text": text
        }

    except Exception as e:
        return {
            "status": "failed",
            "error": str(e)
        }
