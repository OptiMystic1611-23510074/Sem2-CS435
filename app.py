from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS  # Import Flask-CORS

import spacy

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

nlp = spacy.load("en_core_web_sm")

@app.route('/process_text', methods=['POST'])
def process_text():
    data = request.json
    text = data['text']
    
    # Perform NLP tasks (e.g., POS tagging and lemmatization)
    doc = nlp(text)
    processed_data = []
    for token in doc:
        processed_data.append({
            'text': token.text,
            'lemma': token.lemma_,
            'pos': token.pos_
        })
    
    # Return processed data as JSON response
    return jsonify(processed_data)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(app.root_path, 'favicon.ico', mimetype='image/vnd.microsoft.icon')

if __name__ == '__main__':
    app.run(debug=True)
