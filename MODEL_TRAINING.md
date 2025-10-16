# Model Training Guide

This guide explains how to train the sentiment analysis model and run the complete application.

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB of available RAM for training
- Internet connection for downloading BERT base model

## Training Process

### Step 1: Train the Model

The model training is separated into its own Docker service to avoid rebuilding when model changes.

#### Option 1: Use PowerShell Script (Recommended for Windows)

```powershell
.\train-model.ps1
```

#### Option 2: Manual Docker Commands

```bash
# Build the training container
docker-compose --profile training build model-training

# Run the training
docker-compose --profile training up model-training
```

### Step 2: Verify Model Creation

Check if the model was created successfully:

```bash
docker run --rm -v sentiment-model-data:/data alpine ls -la /data/
```

You should see `indianFinbert.pt` file listed.

### Step 3: Start the Application

Once the model is trained, start the backend and frontend:

```bash
docker-compose up backend frontend
```

## Architecture

The training setup uses Docker volumes to share the trained model:

1. **model-training** service:

   - Builds the model using training data
   - Saves `indianFinbert.pt` to shared volume
   - Runs once and exits

2. **backend** service:

   - Mounts the shared volume to access the trained model
   - Loads the model for sentiment analysis API

3. **frontend** service:
   - Provides the web interface
   - Connects to backend API

## Training Data

The training uses data from `model_training/data/`:

- `data_encoded.csv`: Preprocessed news data with encoded labels
- `data_raw.csv`: Original raw news data

## Model Details

- **Base Model**: BERT (bert-base-uncased)
- **Task**: Sequence Classification (3 classes: positive, negative, neutral)
- **Training**: 4 epochs with learning rate 2e-5
- **Output**: PyTorch state dict saved as `indianFinbert.pt`

## Troubleshooting

### Model Not Found Error

If you see "Model file not found" error:

1. Run the training process first
2. Verify the model file exists in the volume
3. Restart the backend service

### Training Fails

- Check available memory (needs ~4GB)
- Ensure training data files exist in `model_training/data/`
- Check Docker logs: `docker-compose --profile training logs model-training`

### Memory Issues

If training runs out of memory:

- Reduce batch size in `trainer.py` (change `BATCH_SIZE = 32` to `BATCH_SIZE = 16`)
- Reduce `num_workers` in DataLoader

## File Structure

```
model_training/
├── Dockerfile          # Training container definition
├── trainer.py          # Main training script
├── requirements.txt    # Python dependencies
└── data/
    ├── data_encoded.csv # Training data
    └── data_raw.csv     # Raw data
```

## Next Steps

After successful training:

1. Access the application at http://localhost:3000
2. Backend API docs at http://localhost:8000/docs
3. Test sentiment analysis with real news data
