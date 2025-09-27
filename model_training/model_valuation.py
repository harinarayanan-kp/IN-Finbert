import matplotlib.pyplot as plt
import torch
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.metrics import roc_curve, auc, precision_recall_curve
from sklearn.preprocessing import label_binarize
from itertools import cycle
from torch.utils.data import Dataset, DataLoader
from transformers import BertTokenizer, BertForSequenceClassification
from tqdm import tqdm
import seaborn as sns
import matplotlib
matplotlib.use('Agg')


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
    MODEL_PATH = "model/indianFinbert.pt"
    DATA_PATH = "data/data_encoded.csv"

    print(f"Using device: {device}")

    df = pd.read_csv(DATA_PATH)
    texts = df['clean_news'].tolist()
    labels = df['label_encoded'].tolist()

    _, test_texts, _, test_labels = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )

    num_labels = len(df['label_encoded'].unique())
    label_names = ['Negative', 'Neutral', 'Positive']

    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
    model = BertForSequenceClassification.from_pretrained(
        'bert-base-uncased', num_labels=num_labels)
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model.to(device)
    model.eval()
    print("Model loaded successfully.")

    test_dataset = NewsDataset(test_texts, test_labels, tokenizer)
    test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)

    all_preds = []
    all_true_labels = []
    all_pred_scores = []

    with torch.no_grad():
        for batch in tqdm(test_loader, desc="Evaluating"):
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)

            outputs = model(input_ids, attention_mask=attention_mask)
            preds = torch.argmax(outputs.logits, dim=1)

            scores = torch.softmax(outputs.logits, dim=1)

            all_preds.extend(preds.cpu().numpy())
            all_true_labels.extend(batch['labels'].cpu().numpy())
            all_pred_scores.extend(scores.cpu().numpy())

    accuracy = accuracy_score(all_true_labels, all_preds)
    print(f"\nOverall Test Accuracy: {accuracy:.4f}")

    print("\nClassification Report:")
    report = classification_report(
        all_true_labels, all_preds, target_names=label_names)
    print(report)

    print("Generating confusion matrix plot...")
    cm = confusion_matrix(all_true_labels, all_preds)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=label_names, yticklabels=label_names)
    plt.title('Confusion Matrix for Sentiment Analysis')
    plt.xlabel('Predicted Label')
    plt.ylabel('True Label')
    plt.savefig('confusion_matrix.png')
    print("Plot saved as 'confusion_matrix.png'")
    plt.close()

    y_true_bin = label_binarize(all_true_labels, classes=range(num_labels))
    y_scores = np.array(all_pred_scores)

    print("Generating ROC curve plot...")
    fpr = dict()
    tpr = dict()
    roc_auc = dict()
    for i in range(num_labels):
        fpr[i], tpr[i], _ = roc_curve(y_true_bin[:, i], y_scores[:, i])
        roc_auc[i] = auc(fpr[i], tpr[i])

    plt.figure(figsize=(8, 6))
    colors = cycle(['aqua', 'darkorange', 'cornflowerblue'])
    for i, color in zip(range(num_labels), colors):
        plt.plot(fpr[i], tpr[i], color=color, lw=2,
                 label='ROC curve of class {0} (area = {1:0.2f})'
                 ''.format(label_names[i], roc_auc[i]))
    plt.plot([0, 1], [0, 1], 'k--', lw=2)
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Receiver Operating Characteristic (ROC) Curve')
    plt.legend(loc="lower right")
    plt.savefig('roc_curve.png')
    print("Plot saved as 'roc_curve.png'")
    plt.close()

    print("Generating Precision-Recall curve plot...")
    precision = dict()
    recall = dict()
    for i in range(num_labels):
        precision[i], recall[i], _ = precision_recall_curve(
            y_true_bin[:, i], y_scores[:, i])

    plt.figure(figsize=(8, 6))
    for i, color in zip(range(num_labels), colors):
        plt.plot(recall[i], precision[i], color=color, lw=2,
                 label='P-R curve of class {0}'.format(label_names[i]))
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title('Precision-Recall Curve')
    plt.legend(loc="lower left")
    plt.savefig('precision_recall_curve.png')
    print("Plot saved as 'precision_recall_curve.png'")
    plt.close()
