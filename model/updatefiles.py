import pandas as pd

# Load the dataset
file_path = '/home/ahmedabdullahi/NLP590/NLPJobsFinder/Data/modelData.csv'  # Replace with your actual file path
data = pd.read_csv(file_path)

# Define a list of normal words to include with 'O' label
normal_words = [
    "intro-call", "technical-round", "take-home-project", "in-person-interview",
    "HR-round", "values-round", "real-world-problems", "screening",
    "coding-test", "behavioral-interview", "case-study", "panel-interview",
    "remote-interview", "onsite-interview", "technical-discussion",
    "problem-solving-round", "system-design", "cultural-fit",
    "skills-assessment", "phone-screen", "video-call", "mock-project",
    "whiteboarding-session", "portfolio-review", "aptitude-test",
    "team-collaboration", "project-discussion", "coding-challenge",
    "experience-evaluation", "background-check", "final-round",
    "feedback-session", "live-coding", "role-specific-round",
    "scenario-based-questions", "cognitive-assessment", "structured-interview",
    "project-presentation", "leadership-round", "peer-discussion",
    "competency-assessment", "problem-analysis", "technical-assessment",
    "engineering-challenge", "code-review", "technical-fit",
    "role-alignment", "interaction-round", "decision-making-round",
    "offer-discussion", "reference-check"
]

# Define a function to convert rows into BIO format for NER
def generate_ner_data(row):
    ner_data = []
    # Process city name
    for i, token in enumerate(row['city'].split()):
        label = 'B-City' if i == 0 else 'I-City'
        ner_data.append((token, label))
    # Process country name
    for i, token in enumerate(row['country'].split()):
        label = 'B-Country' if i == 0 else 'I-Country'
        ner_data.append((token, label))
    # Process iso3 as state
    if 'iso3' in row:
        for i, token in enumerate(row['iso3'].split()):
            label = 'B-State' if i == 0 else 'I-State'
            ner_data.append((token, label))
    # Treat "remote" as a country
    ner_data.append(("remote", "B-Country"))
    return ner_data

# Apply the function to generate the NER data
ner_training_data = []
for _, row in data.iterrows():
    ner_training_data.extend(generate_ner_data(row))

# Add normal words with 'O' label at the end
ner_training_data.extend([(word, "O") for word in normal_words])

# Convert to a DataFrame for easier handling
ner_training_df = pd.DataFrame(ner_training_data, columns=['Token', 'Label'])

# Save the result to a new CSV file
output_path = 'ner_training_data_with_normal_words_once.csv'  # Replace with your desired output path
ner_training_df.to_csv(output_path, index=False)

print(f"NER training data saved to {output_path}")
