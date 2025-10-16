import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import logging

logging.basicConfig(level=logging.INFO)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
logging.info(f"Using device: {device}")


try:
    model_path = "model/indianFinbert.pt"

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model file not found at {model_path}. Please train the model first using 'docker-compose --profile training up model-training'")

    logging.info("Loading custom BERT model...")

    tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

    model = AutoModelForSequenceClassification.from_pretrained(
        "bert-base-uncased", num_labels=3)

    model.load_state_dict(torch.load(model_path, map_location=device))

    model = model.to(device)
    model.eval()

    logging.info(f"Custom BERT model loaded successfully on {device}!")
except Exception as e:
    logging.error(f"Error loading model: {e}")
    model = None
    tokenizer = None

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SentimentRequest(BaseModel):
    text: str


@app.get("/health")
def health_check():
    """Health check endpoint"""
    model_status = "loaded" if model is not None and tokenizer is not None else "not_loaded"
    return {
        "status": "healthy",
        "model_status": model_status,
        "device": str(device)
    }


@app.post("/analyze")
def analyze_sentiment(request: SentimentRequest):
    """
    Accepts text and returns sentiment analysis from the custom trained BERT model.
    """
    if model is None or tokenizer is None:
        return {
            "error": "Model is not available. Please train the model first using 'docker-compose --profile training up model-training'",
            "model_status": "not_loaded"
        }

    logging.info(f"Analyzing text: {request.text[:50]}...")

    try:
        inputs = tokenizer(
            request.text,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=512
        )

        inputs = {key: value.to(device) for key, value in inputs.items()}

        with torch.no_grad():
            outputs = model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            predicted_class = torch.argmax(predictions, dim=-1).item()
            confidence = torch.max(predictions).item()

        label_map = {0: "negative", 1: "neutral", 2: "positive"}
        predicted_label = label_map.get(predicted_class, "unknown")

        result = {
            "label": predicted_label,
            "score": confidence,
            "all_scores": {
                label_map[i]: predictions[0][i].item()
                for i in range(len(label_map))
            }
        }

        logging.info(f"Analysis result: {result}")
        return result

    except Exception as e:
        logging.error(f"Error during prediction: {e}")
        return {"error": "Prediction failed"}
