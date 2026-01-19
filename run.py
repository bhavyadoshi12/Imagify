#!/usr/bin/env python3
"""
ImagifyAI - Image to Story Generator
Startup script for the application
"""

import os
import sys
from app import app

def main():
    print("🎨 ImagifyAI - Image to Story Generator")
    print("=" * 50)
    
    # Check if models directory exists
    if not os.path.exists('models'):
        print("⚠️  Models directory not found.")
        print("📥 Please make sure you have the trained models in the 'models' folder")
        print("💡 You can download pre-trained models or train your own")
    
    # Check requirements
    try:
        import torch
        import transformers
        import flask
        print("✅ All dependencies are available")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("💡 Run: pip install -r requirements.txt")
        sys.exit(1)
    
    print("\n🚀 Starting server...")
    print("📍 Local: http://localhost:5000")
    print("📍 Network: http://0.0.0.0:5000")
    print("⏹️  Press Ctrl+C to stop the server\n")
    
    # Start Flask app
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)

if __name__ == '__main__':
    main()
