# Super App

A modular AI-powered analytics dashboard with the following modules:

- **ProductCatalog**
- **OrderProcurement**
- **InventoryManagement**
- **AnalyticsDashboard**

Developed and maintained by [priyanshuranjan03](https://github.com/priyanshuranjan03).

------

## Getting Started

Follow these steps to set up and run the app locally.

### 1. Clone the repository

git clone https://github.com/priyanshuranjan03/super-app.git
cd super-app

### 2. Install frontend dependencies

npm install

### 3. Setup the AI service environment

cd ai-service

Create virtual environment
python -m venv venv

Activate virtual environment
Windows:
venv\Scripts\activate

macOS/Linux:
source venv/bin/activate

Install Python dependencies
pip install -r requirements.txt

Deactivate virtual environment after installation
deactivate

cd ..


### 4. Configure environment variables

Create a `.env` file in the root of the project (`super-app/.env`) with the following content:

HUGGINGFACE_TOKEN=your_huggingface_api_token_here
NODE_ENV=development
PORT=5000

- Replace `your_huggingface_api_token_here` with your actual Hugging Face API token.
- `NODE_ENV` and `PORT` are used by the React frontend and backend.

---

### 5. Start the application

Run the provided batch script to start both the frontend and AI backend services concurrently:

start.bat

This will:

- Start the React frontend on the port specified in `.env` (default 5000).
- Start the FastAPI AI service in a separate terminal window.

---

## Usage

- Open your browser and navigate to `http://localhost:5000` (or the port you configured).
- Use the UI to interact with the modules:
  - **ProductCatalog**
  - **OrderProcurement**
  - **InventoryManagement**
  - **AnalyticsDashboard**

---

## Notes

- The `venv` folder is **not** committed to Git. Do **not** commit your virtual environment.
- Make sure your `.env` file is **not** committed to Git as it contains sensitive API tokens.
- If you update Python dependencies, run `pip freeze > requirements.txt` inside `ai-service` to update the lock file.

---

## Troubleshooting

- If the React app does not start, ensure Node.js and npm are installed.
- If the AI service fails, verify your Python version (3.8+) and that dependencies are installed in the virtual environment.
- Ensure your Hugging Face token is valid and has sufficient quota.

---

## Contributing

Feel free to fork the repo and submit pull requests.  
Please follow the existing module structure and coding conventions.

---

## License

MIT License

---

## Contact

For issues or questions, please open an issue on GitHub:  
[https://github.com/priyanshuranjan03/super-app/issues](https://github.com/priyanshuranjan03/super-app/issues)

---

**Happy coding!**  
— Priyanshu Ranjan

