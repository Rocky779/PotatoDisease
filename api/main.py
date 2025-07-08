from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
import uvicorn
from io import BytesIO
from PIL import Image
from keras.layers import TFSMLayer

# Create the FastAPI app
app = FastAPI()

# Add CORS middleware (adjust origins in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # e.g., ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the SavedModel as a Keras TFSMLayer
MODEL = TFSMLayer("../saved_models/1", call_endpoint="serve")

# Define class labels
CLASS_NAMES = ['Early Blight', 'Late Blight', 'Healthy']

# Image preprocessing function
def read_file_as_image(data) -> np.ndarray:
    image = Image.open(BytesIO(data)).convert("RGB")
    image = image.resize((256, 256))  # match model input shape
    return np.array(image)

# Health check route
@app.get("/ping")
def ping():
    return {"message": "Model API is alive and kicking!"}

# Prediction route
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image = read_file_as_image(await file.read())
        img_batch = np.expand_dims(image, axis=0).astype(np.float32)

        prediction = MODEL(img_batch).numpy()
        predicted_class = CLASS_NAMES[np.argmax(prediction[0])]
        confidence = float(np.max(prediction[0]))

        return {
            "class": predicted_class,
            "confidence": confidence
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Prediction failed: {str(e)}"}
        )

# Run the app
if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
