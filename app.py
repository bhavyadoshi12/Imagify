from flask import Flask, render_template, request, jsonify
from PIL import Image
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration
import io
import base64
import os
import numpy as np
from datetime import datetime
import random
import re

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size

# Load models
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"🚀 Using device: {device}")

processor = None
blip_model = None
try:
    print("📥 Loading BLIP model...")
    processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
    blip_model.to(device)
    blip_model.eval()
    print("✅ BLIP loaded successfully!")
except Exception as e:
    print(f"❌ Error loading BLIP model: {e}")
    processor = None
    blip_model = None

# --- Templates for different styles (kept short so direct descriptions are copy/paste ready) ---
DIRECT_TEMPLATES = [
    "{caption_sentence}",
    "{subject} stands by the water.",
    "A {subject} stands near the water's edge.",
    "{subject} is standing in front of a body of water."
]

POETIC_TEMPLATES = [
    "Where light and shadow dance in harmony, {caption_phrase}. Nature's poetry unfolds in silent verses that only the heart can hear.",
    "In the gentle embrace of this serene moment, {caption_phrase}. Time stands still as beauty reveals its timeless secrets.",
    "A poetic vision unfolds where {caption_phrase}. Each element whispers its own lyrical story to the soul."
]

CREATIVE_TEMPLATES = [
    "In this captivating scene, {caption_phrase}. The atmosphere is filled with a sense of wonder that sparks the imagination.",
    "As you gaze upon this view, {caption_phrase}. It feels like the beginning of a small, gentle story.",
    "This moment captures {caption_phrase}. The world seems to pause and listen."
]

CAPTION_TEMPLATES = [
    "✨ {caption_short} | A moment worth remembering",
    "📸 {caption_short} - Capturing life's beautiful moments",
    "🌟 {caption_short} | Where every detail tells a story"
]

ADJECTIVES = ["gentle", "calm", "majestic", "quiet", "serene", "stoic"]


# Utility: sanitize and shorten caption for short usage
def shorten_caption(caption, max_words=7):
    if not caption:
        return ""
    # remove parentheses and extra whitespace
    s = re.sub(r"[\(\)\[\]]", "", caption).strip()
    words = s.split()
    if len(words) <= max_words:
        return s
    return " ".join(words[:max_words]) + "..."

# Utility: convert BLIP caption to a present-tense single sentence
def caption_to_present_sentence(caption):
    if not caption:
        return ""
    text = caption.strip()
    # remove trailing punctuation
    text = re.sub(r"[\.!?]+$", "", text).strip()
    # Try to simplify the caption:
    # If caption contains "standing", "sitting", "running" -> change to "stands", "sits", "runs"
    # naive substitution for common gerunds -> present tense
    subs = {
        r'\bstanding\b': 'stands',
        r'\bsitting\b': 'sits',
        r'\brunning\b': 'runs',
        r'\bwalking\b': 'walks',
        r'\bflying\b': 'flies',
        r'\blying\b': 'lies',
        r'\bplaying\b': 'plays'
    }
    s = text.lower()
    for patt, rep in subs.items():
        s = re.sub(patt, rep, s)
    # Capitalize first letter
    s = s.strip()
    if not s:
        return ""
    s = s[0].upper() + s[1:]
    # add period if missing
    if not re.search(r'[\.!?]$', s):
        s = s + '.'
    # Basic fix: if starts with 'an ' or 'a ' keep it
    return s

# Helper: extract a short subject noun phrase (very naive fallback; replace with real detector if available)
def extract_subject_from_caption(caption):
    if not caption:
        return "subject"
    # look for pattern like "a/an <noun>" or first noun-like word
    caption = caption.lower()
    m = re.search(r'\b(an|a)\s+([a-z\-]+)', caption)
    if m:
        return m.group(2)
    # else take first word
    first_word = caption.split()[0]
    # strip adjectives if common
    first_word = re.sub(r'^(the|this|that|these|those)\s+', '', first_word)
    return first_word

# Core generator: given an image and style plus seeds/temperature, return caption & story
def generate_story_from_image(image_pil, style="creative", variation_seed=None, request_id=None, temperature=0.7):
    # Seed RNG deterministically so repeated calls with same seed yield same output
    if variation_seed is not None:
        try:
            seed = int(variation_seed) & 0x7fffffff
        except:
            seed = int(datetime.utcnow().timestamp() * 1000) ^ (hash(request_id) & 0xffffffff)
    else:
        seed = int(datetime.utcnow().timestamp() * 1000) ^ (hash(request_id) & 0xffffffff)
    rnd = random.Random(seed)

    # 1) Generate caption using BLIP (if available); otherwise fallback to a placeholder
    caption = ""
    try:
        if processor is not None and blip_model is not None:
            inputs = processor(image_pil, return_tensors="pt").to(device)
            with torch.no_grad():
                out_ids = blip_model.generate(**inputs, max_length=50, num_beams=5, early_stopping=True)
            caption = processor.decode(out_ids[0], skip_special_tokens=True)
        else:
            caption = "an object near water"
    except Exception as e:
        print("❌ BLIP captioning failed:", e)
        caption = "an object near water"

    # Prepare variants for template filling
    caption_short = shorten_caption(caption, max_words=6)
    caption_phrase = caption_short
    caption_sentence = caption_to_present_sentence(caption)  # single present-tense sentence

    # subject extraction for direct templates
    subject = extract_subject_from_caption(caption)
    if not subject:
        subject = "subject"

    # Choose template list based on style
    style_key = (style or "creative").lower()
    if style_key in ("direct", "direct_description", "description"):
        templates = DIRECT_TEMPLATES
        # For direct we prefer the caption_sentence as highest priority
        # But still vary templates using seed
    elif style_key == "poetic":
        templates = POETIC_TEMPLATES
    elif style_key == "caption":
        templates = CAPTION_TEMPLATES
    elif style_key == "creative":
        templates = CREATIVE_TEMPLATES
    else:
        templates = CREATIVE_TEMPLATES

    # Use rnd to pick template (ensures variations)
    chosen_template = rnd.choice(templates)

    # For direct: ensure we prefer the short present sentence if template contains {caption_sentence}
    try:
        story = chosen_template.format(
            caption=caption,
            caption_short=caption_short,
            caption_phrase=caption_phrase,
            caption_sentence=caption_sentence,
            subject=subject
        )
    except Exception as e:
        # fallback simple composition
        story = caption_sentence if style_key.startswith("direct") else caption

    # Slight random adjective insertion for non-caption styles (keeps direct minimal)
    if style_key not in ("caption", "direct"):
        if rnd.random() < 0.35:
            adj = rnd.choice(ADJECTIVES)
            # insert adjective before first noun/subject if possible
            if "{subject}" in chosen_template:
                story = story.replace(subject, f"{adj} {subject}", 1)

    # Final cleanup
    story = story.strip()
    # Ensure story ends with punctuation
    if not re.search(r'[\.!?]$', story):
        story = story + '.'

    return caption, story, seed

# Routes
@app.route('/')
def home():
    print("🏠 Home page accessed")
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/working')
def working():
    return render_template('working.html')

@app.route('/generate', methods=['POST'])
def generate():
    try:
        print("🔄 /generate called")
        if 'image' not in request.files:
            print("❌ No image in request")
            return jsonify({'success': False, 'error': 'No image uploaded'})

        image_file = request.files['image']
        style = request.form.get('style', 'creative')
        variation_seed = request.form.get('variation_seed') or request.form.get('seed') or None
        request_id = request.form.get('request_id') or ''
        temperature = request.form.get('temperature')
        try:
            temperature = float(temperature) if temperature is not None else 0.7
        except:
            temperature = 0.7

        print(f"📁 Received file: {image_file.filename}")
        print(f"🎨 Style requested: {style}")
        print(f"🔑 variation_seed: {variation_seed}  request_id: {request_id}  temp:{temperature}")

        if image_file.filename == '':
            print("❌ Empty filename")
            return jsonify({'success': False, 'error': 'No image selected'})

        # load image
        image = Image.open(image_file.stream).convert('RGB')
        print("✅ Image loaded into PIL.Image")

        # Generate caption/story with deterministic variation
        caption, story, seed_used = generate_story_from_image(
            image_pil=image,
            style=style,
            variation_seed=variation_seed,
            request_id=request_id,
            temperature=temperature
        )

        # Convert image to base64 for display
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG", quality=85)
        img_str = base64.b64encode(buffered.getvalue()).decode()

        response_data = {
            'success': True,
            'caption': caption,
            'story': story,
            'style': style,
            'image_data': f"data:image/jpeg;base64,{img_str}",
            'timestamp': datetime.now().isoformat(),
            'seed_used': seed_used
        }

        print("✅ /generate response prepared:", response_data.get('story')[:120], "...")
        return jsonify(response_data)

    except Exception as e:
        print("❌ Error in /generate:", e)
        return jsonify({'success': False, 'error': str(e)})


@app.route('/health')
def health():
    models_loaded = (processor is not None and blip_model is not None)
    return jsonify({
        'status': 'healthy' if models_loaded else 'models_missing',
        'models_loaded': models_loaded,
        'device': str(device)
    })


if __name__ == '__main__':
    print("🚀 Starting ImagifyAI Server...")
    print("📍 Home: http://localhost:5000")
    print("📍 Health: http://localhost:5000/health")
    print("🔥 Debug mode: ON")
    app.run(debug=True, host='0.0.0.0', port=5000)
