import pandas as pd
import re
from sklearn.preprocessing import LabelEncoder

df = pd.read_csv("data/data_raw.csv")


def clean_text(text):
    text = text.lower()
    text = re.sub(r"http\S+|www\S+|https\S+", "", text)
    text = re.sub(r"[^a-zA-Z0-9\s,]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


df['clean_news'] = df['text'].apply(clean_text)

le = LabelEncoder()
df['label_encoded'] = le.fit_transform(df['label'])

df[['clean_news', 'label_encoded']].to_csv(
    "data/data_encoded.csv", index=False)

print("Data cleaned and labels encoded. Classes:",
      dict(zip(le.classes_, le.transform(le.classes_))))
