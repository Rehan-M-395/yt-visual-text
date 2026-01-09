from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ImageReq(BaseModel):
    image: str

@app.post("/frame")
def receive_frame(req: ImageReq):
    print("Image received, length:", len(req.image))
    return { "status": "received" }