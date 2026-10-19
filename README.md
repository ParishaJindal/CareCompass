# CareCompass Machine Learning Workflow

This directory contains the end-to-end Machine Learning pipeline for healthcare facility tier classification, data completeness scoring, and duplicate entity detection.

## Structure

```
ml/
├── README.md               # Pipeline instructions and reproducibility guide
├── prepare_dataset.py      # Feature engineering and district-grouped split
├── train_example.py        # Model training, evaluation, and artifact export
├── feature_schema.md       # Feature dictionary and encoding specifications
├── evaluation_report.md    # Empirical metrics, classification report & confusion matrix
├── data/
│   ├── train.csv           # 28,309 records (65.9%)
│   ├── val.csv             # 6,708 records (15.6%)
│   └── test.csv            # 7,923 records (18.5%)
└── models/
    └── facility_tier_classifier.joblib  # Trained model pipeline artifact
```

## How to Run

### 1. Prepare Features & Partition Dataset
```bash
python3 ml/prepare_dataset.py
```
This reads `data/hospitals_master.csv`, engineers the 12 tabular and text features, and partitions the records into Train, Validation, and Test sets using `GroupShuffleSplit` on `State::District` to ensure zero spatial leakage.

### 2. Train & Evaluate Model
```bash
python3 ml/train_example.py
```
This fits a multi-modal pipeline (TF-IDF N-Gram Vectorizer + Scaled Tabular Features + Random Forest Classifier) and evaluates on the completely held-out test partition, producing:
- **Test Accuracy:** **99.03%**
- **Macro F1-Score:** **0.9722**
- **Inference Speed:** > 100,000 predictions / second
- **Saved Model:** `ml/models/facility_tier_classifier.joblib`
- **Detailed Report:** `ml/evaluation_report.md`
