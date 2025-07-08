from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import uvicorn
from io import BytesIO
from PIL import Image
import tensorflow as tf
from keras.layers import TFSMLayer

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins; change to list of allowed origins if needed
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

MODEL = TFSMLayer("../saved_models/1", call_endpoint="serve")
CLASS_NAMES = ['Early Blight', 'Late Blight', 'Healthy']

def read_file_as_image(data) -> np.ndarray:
    image = Image.open(BytesIO(data))
    return np.array(image)

@app.get("/ping")
def ping():
    return "Hello  World"

@app.post("/predict")
async def predict(file: UploadFile = File(...)):  
    image = read_file_as_image(await file.read()) 
    img_batch = np.expand_dims(image, axis=0).astype(np.float32)
    
    prediction = MODEL(img_batch).numpy()
    predicted_class = CLASS_NAMES[np.argmax(prediction[0])]
    
    return {
        "class": predicted_class,
        "confidence": float(np.max(prediction[0]))
    }

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
