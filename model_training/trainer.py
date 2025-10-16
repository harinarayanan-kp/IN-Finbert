import pandas as pd
import torch
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from transformers import BertTokenizer, BertForSequenceClassification, get_linear_schedule_with_warmup
import numpy as np
from tqdm import tqdm


class NewsDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        encoding = self.tokenizer(
            self.texts[idx],
            truncation=True,
            padding='max_length',
            max_length=self.max_len,
            return_tensors='pt'
        )
        return {
            'input_ids': encoding['input_ids'].squeeze(),
            'attention_mask': encoding['attention_mask'].squeeze(),
            'labels': torch.tensor(self.labels[idx], dtype=torch.long)
        }


if __name__ == '__main__':
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    if device.type == 'cuda':
        print(f"Device name: {torch.cuda.get_device_name(0)}")

    df = pd.read_csv("data/data_encoded.csv")
    texts = df['clean_news'].tolist()
    labels = df['label_encoded'].tolist()

    train_texts, test_texts, train_labels, test_labels = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )

    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

    BATCH_SIZE = 32
    train_dataset = NewsDataset(train_texts, train_labels, tokenizer)
    test_dataset = NewsDataset(test_texts, test_labels, tokenizer)
    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=4,
        pin_memory=True
    )
    test_loader = DataLoader(
        test_dataset,
        batch_size=BATCH_SIZE,
        num_workers=4
    )

    num_labels = len(df['label_encoded'].unique())
    model = BertForSequenceClassification.from_pretrained(
        'bert-base-uncased', num_labels=num_labels)
    model.to(device)

    optimizer = AdamW(model.parameters(), lr=2e-5)

    EPOCHS = 4
    num_training_steps = len(train_loader) * EPOCHS
    num_warmup_steps = int(0.1 * num_training_steps)

    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=num_warmup_steps,
        num_training_steps=num_training_steps
    )

    best_accuracy = 0.0

    for epoch in range(EPOCHS):
        print(f"\n--- Epoch {epoch + 1}/{EPOCHS} ---")

        model.train()
        total_train_loss = 0
        train_iterator = tqdm(train_loader, desc=f"Training Epoch {epoch + 1}")

        for batch in train_iterator:
            optimizer.zero_grad()
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['labels'].to(device)

            outputs = model(
                input_ids, attention_mask=attention_mask, labels=labels)
            loss = outputs.loss
            total_train_loss += loss.item()

            loss.backward()
            optimizer.step()
            scheduler.step()

            train_iterator.set_postfix({'loss': loss.item()})

        avg_train_loss = total_train_loss / len(train_loader)

        model.eval()
        all_preds = []
        all_labels = []
        val_iterator = tqdm(test_loader, desc=f"Validating Epoch {epoch + 1}")

        with torch.no_grad():
            for batch in val_iterator:
                input_ids = batch['input_ids'].to(device)
                attention_mask = batch['attention_mask'].to(device)
                labels = batch['labels'].to(device)

                outputs = model(input_ids, attention_mask=attention_mask)
                preds = torch.argmax(outputs.logits, dim=1)

                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())

        accuracy = accuracy_score(all_labels, all_preds)

        print(
            f"Average Training Loss: {avg_train_loss:.4f} | Validation Accuracy: {accuracy:.4f}")

        if accuracy > best_accuracy:
            best_accuracy = accuracy
            # Save to mounted volume directory
            torch.save(model.state_dict(), "/app/model/indianFinbert.pt")
            print(f"New best model saved with accuracy: {best_accuracy:.4f}")

    print("\nTraining finished.")
    print(f"Best validation accuracy achieved: {best_accuracy:.4f}")
