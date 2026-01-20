from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import base64
import easyocr
import numpy as np
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

reader = easyocr.Reader(["en"], gpu=False)

class ImageReq(BaseModel):
    image: str

@app.post("/frame")
def receive_frame(req: ImageReq):
    try:
        if "," in req.image:
            _, encoded = req.image.split(",", 1)
        else:
            encoded = req.image

        image_bytes = base64.b64decode(encoded)

        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_np = np.array(img)

        results = reader.readtext(img_np, detail=0, paragraph=True)
        text = " ".join(results)

        return {"status": "success", "text": text}

    except Exception as e:
        return {"status": "failed", "error": str(e)}