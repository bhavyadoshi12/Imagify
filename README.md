<h1 align="center">Imagify: AI Image to Story Generator 🖼️➡️📖</h1>

<p align="center">
  <img src="assets/images/01.Home.png" width="900" alt="Imagify Screenshot"/>
</p>

<p align="center">
  <b>Transform your images into captivating stories, poems, and captions with a single click.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue"/>
  <img src="https://img.shields.io/badge/Python-3.8%2B-green"/>
  <img src="https://img.shields.io/badge/Framework-Flask-lightblue"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow"/>
</p>

---

## 🎥 Demo Video

> A complete walkthrough of Imagify's image-to-story generation process.

**▶ Click to play the demo video:**

https://github.com/bhavyadoshi12/Imagify/raw/main/assets/video/Imagify.mp4

---

## ✨ Key Features

### 🎯 Core Capabilities
- **AI-Powered Image Analysis**: Utilizes the state-of-the-art BLIP model from Salesforce to understand image content.
- **Multiple Generation Styles**: Choose from different output styles:
  - **Creative Story**: An immersive narrative that brings your image to life.
  - **Poetic Description**: A beautiful, lyrical description with artistic flair.
  - **Smart Caption**: A concise and engaging caption perfect for social media.
- **User-Friendly Web Interface**: A clean, modern, and responsive interface for uploading images and viewing results.

### 🛠️ Tech Stack
- **Backend**: Python, Flask
- **ML/AI**: PyTorch, Hugging Face Transformers (BLIP)
- **Frontend**: HTML, CSS, JavaScript
- **Libraries**: Pillow, NumPy

---

## 🖥️ Application Screenshots

<details>
<summary><b>📸 Click to view application UI</b></summary>

### 💡 Main Interface
![Main Interface](assets/images/01.Home.png)

### 🖼️ Generated Story Example 1
!Example 1

### 🖼️ Generated Story Example 2
!Example 2

</details>

---

## 🚀 Quick Start

### ✅ Prerequisites
- Python 3.8+
- 4GB+ RAM (8GB+ Recommended for smoother performance)
- 2GB+ free disk space (for model download)

### ⚙️ Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/bhavyadoshi12/Imagify.git
    cd Imagify
    ```

2.  **Create and Activate a Virtual Environment**
    - **On Windows:**
      ```bash
      python -m venv .venv
      .venv\Scripts\activate
      ```
    - **On macOS/Linux:**
      ```bash
      python3 -m venv .venv
      source .venv/bin/activate
      ```

3.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the Application**
    ```bash
    python app.py
    ```

5.  **Access Imagify**
    Open your browser and go to: **http://localhost:5000**

---

## 📝 How It Works

1.  **Image Upload**: You upload an image through the web interface.
2.  **AI Analysis**: The backend receives the image and feeds it to the pre-trained **BLIP** model.
3.  **Caption Generation**: The BLIP model generates a descriptive caption for the image (e.g., "a dog is standing on the grass").
4.  **Text Processing**: This raw caption is then processed to extract key subjects and phrases.
5.  **Template-based Generation**: Based on your chosen style (e.g., "Poetic"), the application selects a template and fills it with the processed caption phrases to create the final, stylized output.
6.  **Result Delivery**: The generated story and the original image are sent back to the frontend to be displayed.
