import os
import logging
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["*"])

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Load model globally
logger.info("Loading MobileNetV2 model from ImageNet...")
try:
    import tensorflow as tf
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.applications import mobilenet_v2
    from tensorflow.keras.preprocessing import image as keras_image

    preprocess_input   = mobilenet_v2.preprocess_input
    decode_predictions = mobilenet_v2.decode_predictions

    def load_img(path, target_size):
        return keras_image.load_img(path, target_size=target_size)

    def img_to_array(img):
        return keras_image.img_to_array(img)
    
    model = MobileNetV2(weights='imagenet')
    logger.info("✅ Model loaded successfully")
    MODEL_LOADED = True
except Exception as e:
    logger.error(f"❌ Model load error: {e}")
    MODEL_LOADED = False

# Extended keyword mapping to our 5 classes
CLASS_MAPPING = {
    'dog': [
        'dog', 'puppy', 'poodle', 'dachshund', 'beagle', 'golden_retriever',
        'labrador', 'retriever', 'bulldog', 'terrier', 'husky', 'dalmatian',
        'rottweiler', 'chihuahua', 'shih', 'doberman', 'collie', 'spaniel',
        'boxer', 'canine', 'hound', 'mastiff', 'shepherd'
    ],
    'cat': [
        'cat', 'kitten', 'persian', 'siamese', 'tabby', 'tomcat',
        'feline', 'lynx', 'cougar', 'cheetah', 'leopard', 'jaguar',
        'tiger', 'lion', 'panther'
    ],
    'house': [
        'house', 'building', 'mansion', 'cottage', 'villa', 'bungalow',
        'barn', 'church', 'castle', 'palace', 'temple', 'mosque', 'monastery',
        'lighthouse', 'silo', 'greenhouse', 'prison', 'library',
        'boathouse', 'farmhouse'
    ],
    'letter': [
        'letter', 'envelope', 'text', 'document', 'page', 'book',
        'typewriter', 'paper', 'manuscript', 'comic', 'menu', 'label',
        'banner', 'signboard', 'scoreboard', 'blackboard'
    ],
    'number': [
        'abacus', 'analog_clock', 'digital_clock', 'ruler', 'odometer',
        'speedometer', 'barometer', 'scale', 'thermometer', 'calculator'
    ],
}

CLASS_EMOJIS = {
    'dog': '🐕',
    'cat': '🐱',
    'house': '🏠',
    'letter': '🔤',
    'number': '🔢',
    'unknown': '❓'
}

CLASS_DESCRIPTIONS = {
    'dog': 'A canine/dog was detected in this image.',
    'cat': 'A feline/cat was detected in this image.',
    'house': 'A building or house structure was detected.',
    'letter': 'Text, letters or a document were detected.',
    'number': 'Numerical digits or a counting device were detected.',
    'unknown': 'The classifier could not confidently match a category.'
}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def classify_prediction(top_predictions):
    """Map top ImageNet predictions to our 5 custom classes."""
    scores = {cls: 0.0 for cls in CLASS_MAPPING}

    for label_id, label_name, confidence in top_predictions:
        label_lower = label_name.lower().replace(' ', '_')
        for custom_class, keywords in CLASS_MAPPING.items():
            for keyword in keywords:
                if keyword in label_lower:
                    scores[custom_class] += confidence
                    break

    best_class = max(scores, key=scores.get)
    if scores[best_class] == 0.0:
        return 'unknown', top_predictions[0][2]

    return best_class, scores[best_class]


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model_loaded': MODEL_LOADED,
        'message': 'Visual AI Classifier API is running'
    }), 200


@app.route('/classify', methods=['POST'])
def classify():
    if not MODEL_LOADED:
        return jsonify({'error': 'Model not loaded. Please check server logs.', 'success': False}), 503

    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided', 'success': False}), 400

        file = request.files['image']

        if file.filename == '':
            return jsonify({'error': 'No file selected', 'success': False}), 400

        if not allowed_file(file.filename):
            return jsonify({
                'error': 'File type not allowed. Supported: JPG, PNG, GIF, WebP, BMP',
                'success': False
            }), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        logger.info(f"Processing image: {filename}")

        try:
            img = load_img(filepath, target_size=(224, 224))
            x = img_to_array(img)
            x = np.expand_dims(x, axis=0)
            x = preprocess_input(x)
        except Exception as e:
            os.remove(filepath)
            logger.error(f"Image processing error: {e}")
            return jsonify({'error': 'Failed to process image. Ensure it is a valid image file.', 'success': False}), 400

        try:
            predictions = model.predict(x, verbose=0)
            decoded = decode_predictions(predictions, top=10)[0]

            custom_class, confidence = classify_prediction(decoded)

            raw_label = decoded[0][1].replace('_', ' ').title()

            os.remove(filepath)

            logger.info(f"Result: {custom_class} | confidence: {confidence:.4f} | raw: {raw_label}")

            return jsonify({
                'class': custom_class,
                'confidence': float(confidence),
                'raw_label': raw_label,
                'emoji': CLASS_EMOJIS.get(custom_class, '❓'),
                'description': CLASS_DESCRIPTIONS.get(custom_class, ''),
                'top_predictions': [
                    {'label': p[1].replace('_', ' ').title(), 'confidence': float(p[2])}
                    for p in decoded[:5]
                ],
                'success': True
            }), 200

        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            logger.error(f"Prediction error: {e}")
            return jsonify({'error': 'Error during classification', 'success': False}), 500

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({'error': 'Internal server error', 'success': False}), 500


@app.route('/info', methods=['GET'])
def info():
    return jsonify({
        'name': 'Visual AI Classifier API',
        'version': '2.0.0',
        'author': 'ANTHONY OLUEBUBECHUKWU STEPHEN',
        'department': 'CYBERSECURITY',
        'reg_number': '20231388422',
        'description': 'Deep learning CNN image classifier using TensorFlow & MobileNetV2',
        'classes': list(CLASS_MAPPING.keys()),
        'class_emojis': CLASS_EMOJIS,
        'model': 'MobileNetV2 (ImageNet pretrained)',
        'framework': 'TensorFlow 2.x',
        'model_loaded': MODEL_LOADED
    }), 200


@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'error': 'File too large. Maximum size is 10MB.', 'success': False}), 413


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found', 'success': False}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error', 'success': False}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    logger.info(f"🚀 Starting Visual AI Classifier on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
