from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ ADD CORS MIDDLEWARE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow chrome-extension://*
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageReq(BaseModel):
    image: str

@app.post("/frame")
def receive_frame(req: ImageReq):
    print("Image received, length:", len(req.image))
    return {"status": "received"}
