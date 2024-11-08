import spacy
import pycountry

class LocationParser:
    def __init__(self):
        # Load spaCy's NER model
        self.nlp = spacy.load("en_core_web_sm")
        
        # Define custom keywords to filter terms like "remote" or "hybrid"
        self.custom_keywords = {
            "remote": "Remote",
            "hybrid": "Hybrid",
            "on-site": "On-site",
            "onsite": "On-site"
        }

    # Helper function to identify if a term is a country
    def is_country(self, name):
        try:
            pycountry.countries.lookup(name)
            return True
        except LookupError:
            return False

    # Core location parsing function
    def parse_location(self, text):
        doc = self.nlp(text)
        locations = {
            "countries": [],
            "cities": [],
            "custom_terms": []
        }

        for ent in doc.ents:
            if ent.label_ == "GPE":  # GPE captures countries and cities
                if ent.text.lower() in self.custom_keywords:
                    locations["custom_terms"].append(self.custom_keywords[ent.text.lower()])
                elif self.is_country(ent.text):
                    locations["countries"].append(ent.text)
                else:
                    locations["cities"].append(ent.text)

        # Add custom keyword filtering
        for keyword in self.custom_keywords.keys():
            if keyword in text.lower():
                locations["custom_terms"].append(self.custom_keywords[keyword])

        return locations
