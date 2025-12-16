# ImagifyAI: Image to Story Generator

<p align="center">
ImagifyAI is an innovative Flask web application that bridges the gap between visual content and creative writing. It leverages a cutting-edge Vision-Language model (BLIP) to transform your images into captivating stories, engaging captions, and poetic descriptions.
</p>

<p align="center">
  <img src="assets/images/01.Home.png" alt="ImagifyAI Screenshot" width="80%"/>
</p>

## ✨ Features

*   **AI-Powered Image Analysis**: Utilizes the state-of-the-art BLIP model from Salesforce to understand the content of your images.
*   **Multiple Generation Styles**: Choose from different output styles to match your needs:
    *   **Creative Story**: An immersive narrative that brings your image to life.
    *   **Poetic Description**: A beautiful, lyrical description with artistic flair.
    *   **Smart Caption**: A concise and engaging caption perfect for social media.
    *   **Direct Description**: A straightforward, present-tense sentence describing the scene.
*   **User-Friendly Web Interface**: A clean, modern, and responsive interface for uploading images and viewing results.
*   **Built with a Modern Tech Stack**: Powered by PyTorch, Transformers, and Flask.

## 🛠️ Technology Stack

*   **Backend**: Python, Flask
*   **ML/AI**:
    *   **PyTorch**: The deep learning framework powering the AI model.
    *   **Hugging Face Transformers**: For easy access to the pre-trained BLIP model.
    *   **BLIP (Bootstrapping Language-Image Pre-training)**: The specific vision-language model used for generating image captions.
*   **Frontend**: HTML, CSS, JavaScript
*   **Other Libraries**: Pillow (for image processing), NumPy.

## 🚀 Getting Started

### 🖼️ Project Showcase

Explore the `assets` directory to find a collection of images and videos that showcase the capabilities of ImagifyAI.
*   `assets/images`: Contains sample input images and corresponding output stories.
*   `assets/videos`: Features video demonstrations of the application in action.

Follow these steps to set up and run the project on your local machine.

### Prerequisites

*   Python 3.8 or higher
*   `pip` (Python package installer)
*   (Optional but Recommended) Git for version control.

### 1. Clone the Repository

Open your terminal or command prompt and clone the project repository.

```bash
git clone <your-repository-url>
cd ImageStoryAI(GenAI)-Imagify
```

### 2. Create and Activate a Virtual Environment

It is highly recommended to use a virtual environment to manage project dependencies and avoid conflicts with other Python projects.

**On Windows (Command Prompt):**

```bash
# Create the virtual environment (named .venv)
python -m venv .venv

# Activate the virtual environment
.venv\Scripts\activate
```

**On macOS/Linux (Bash):**

```bash
# Create the virtual environment (named .venv)
python3 -m venv .venv

# Activate the virtual environment
source .venv/bin/activate
```

After activation, your command prompt will be prefixed with `(.venv)`, indicating that the virtual environment is active.

### 3. Install Dependencies

With the virtual environment activated, install the required Python packages using the `requirements.txt` file.

```bash
pip install -r requirements.txt
```

*Note: If a `requirements.txt` file is not present, you can install the packages manually:*
`pip install flask torch transformers Pillow numpy`

### 4. Run the Application

Now you are ready to start the Flask server.

```bash
python app.py
```

You will see output in your terminal indicating that the server is running, including the local address. The BLIP model will be downloaded and loaded the first time you run it, which may take some time.

```
🚀 Starting ImagifyAI Server...
📍 Home: http://localhost:5000
📍 Health: http://localhost:5000/health
🔥 Debug mode: ON
 * Running on http://127.0.0.1:5000/
```

### 5. Access ImagifyAI

Open your web browser and navigate to the following URL:

**http://localhost:5000**

You can now upload an image and start generating stories!

## 📝 How It Works

1.  **Image Upload**: You upload an image through the web interface.
2.  **AI Analysis**: The backend receives the image and feeds it to the pre-trained **BLIP** model.
3.  **Caption Generation**: The BLIP model generates a descriptive caption for the image (e.g., "a dog is standing on the grass").
4.  **Text Processing**: This raw caption is then processed—converted to the present tense, shortened, and key subjects are extracted.
5.  **Template-based Generation**: Based on your chosen style (e.g., "Poetic"), the application selects a template and fills it with the processed caption phrases to create the final, stylized output.
6.  **Result Delivery**: The generated story and the original image are sent back to the frontend to be displayed.
