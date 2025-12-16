# generate_server.py
from flask import Flask, request, jsonify
import random, base64
from datetime import datetime
import io

app = Flask(__name__)

# Simple variation helpers
DIRECT_TEMPLATES = [
    "{subject} stands in front of a body of water.",
    "{subject} is standing by the water, facing the camera.",
    "An {subject} stands near the water's edge, looking calm.",
    "{subject} stands at the bank of a water body under the sky.",
    "A lone {subject} stands before a reflective body of water."
]

POETIC_TEMPLATES = [
    "Where light and shadow meet, {subject} stands before the mirrored water.",
    "Sunset breathes over the water while {subject} stands, a quiet poem in motion.",
    "By the water's hush, {subject} waits as nature hums its soft verses.",
    "Beneath the dwindling sun, {subject} becomes a silhouette of patient grace before the water."
]

CREATIVE_TEMPLATES = [
    "In a quiet moment, {subject} pauses by the water — as if listening to old stories.",
    "{subject} and the water share a secret under the wide sky.",
    "An ordinary day turns gentle as {subject} meets the horizon of the water.",
]

CAPTION_TEMPLATES = [
    "{subject} at the water — nature's calm moment.",
    "{subject} by the water. #serene #nature",
    "{subject} — a peaceful scene."
]

# small function to pick a subject phrase by simple heuristics (could be replaced by image captioner)
def quick_detect_subject_from_image(file_bytes):
    # QUICK fallback: don't try heavy vision here. For demo, return 'elephant' if filename hints or default 'subject'
    # If the request includes a filename you can inspect request.files['image'].filename
    return "elephant"  # change if you have image caption code; keep simple for demo

@app.route('/generate', methods=['POST'])
def generate():
    # read fields
    style = request.form.get('style', 'direct').lower()
    variation = request.form.get('variation', 'false').lower() == 'true'
    request_id = request.form.get('request_id', '')  # optional
    variation_seed = request.form.get('variation_seed')
    temperature = request.form.get('temperature')  # optional hint

    # read uploaded image (optional: return it back as data-uri)
    image_data_uri = ""
    if 'image' in request.files:
        f = request.files['image']
        raw = f.read()
        # return the uploaded image back as base64 so client can display it (not required)
        try:
            image_data_uri = "data:image/jpeg;base64," + base64.b64encode(raw).decode('utf-8')
        except Exception:
            image_data_uri = ""

    # choose seed
    if variation_seed:
        try:
            seed = int(variation_seed) % (2**31 - 1)
        except:
            seed = int(datetime.utcnow().timestamp() * 1000) ^ (hash(request_id) & 0xffffffff)
    else:
        seed = int(datetime.utcnow().timestamp() * 1000) ^ (hash(request_id) & 0xffffffff)

    rnd = random.Random(seed)

    # Quick subject detection (replace with your model if available)
    subject = quick_detect_subject_from_image(raw if 'raw' in locals() else None)

    # Pick template set
    templates = DIRECT_TEMPLATES
    if style == 'poetic':
        templates = POETIC_TEMPLATES
    elif style == 'creative':
        templates = CREATIVE_TEMPLATES
    elif style == 'caption':
        templates = CAPTION_TEMPLATES
    else:
        templates = DIRECT_TEMPLATES

    # Variation: if variation requested, change selection logic to ensure different template often
    # Use rnd.choice to vary; because rnd seeded differently on each request, choice will differ
    chosen = rnd.choice(templates)

    # Small extra variation: maybe add an adjective randomly (for direct style keep minimal)
    adjectives = ["majestic", "gentle", "calm", "quiet", "stoic", "grand"]
    adj = ""
    if style != 'caption' and rnd.random() < 0.3:
        adj = rnd.choice(adjectives)
        # insert adjective if template supports
        if "{subject}" in chosen:
            chosen = chosen.replace("{subject}", f"{adj} {subject}")
    else:
        chosen = chosen.format(subject=subject)

    # ensure if any leftover placeholder exists
    try:
        story = chosen.format(subject=subject)
    except:
        story = chosen

    # Return JSON
    return jsonify({
        "success": True,
        "story": story,
        "image_data": image_data_uri,
        "request_id": request_id,
        "seed_used": seed
    })

if __name__ == '__main__':
    app.run(debug=True, port=8000)
