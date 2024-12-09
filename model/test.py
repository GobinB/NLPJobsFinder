from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline

# Load the trained model and tokenizer
model_path = "ner_model1"  # Path to the saved model
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForTokenClassification.from_pretrained(model_path)

# Create a NER pipeline
ner_pipeline = pipeline("ner", model=model, tokenizer=tokenizer, aggregation_strategy="simple")

# Test inputs
test_inputs = ["Louisville", "Kentucky", "Louisville is in Kentucky.", "United Stetes"]

# Perform predictions
for sentence in test_inputs:
    print(f"Input: {sentence}")
    predictions = ner_pipeline(sentence)
    print("Predictions:", predictions)
    print("-" * 50)
