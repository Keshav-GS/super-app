# Super App

A modular AI-powered analytics dashboard featuring:
- **ProductCatalog**
- **OrderProcurement**
- **InventoryManagement**
- **AnalyticsDashboard**

Developed and maintained by [Priyanshu Ranjan](https://github.com/priyanshuranjan03).

---

## Overview

Super App integrates a React frontend with a FastAPI-powered AI service. This README provides clear instructions to set up and run the application locally.

---

## Prerequisites

Ensure you have the following installed:
- [Git](https://git-scm.com/)
- [Node.js & npm](https://nodejs.org/)
- [Python 3.8+](https://www.python.org/downloads/)
- (Optional) A code editor like [VSCode](https://code.visualstudio.com/)

---

## Setup Instructions

### 1. Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/priyanshuranjan03/super-app.git
cd super-app
```

### 2. Install frontend dependencies:
```bash
npm install
```
### 3. Setup the AI service environment:
```bash
cd ai-service
```
Create virtual environment:
```bash
python -m venv venv
```
Activate virtual environment:
```bash
Windows:
venv\Scripts\activate

macOS/Linux:
source venv/bin/activate
```
Install Python dependencies:
```bash
pip install -r requirements.txt
```
Deactivate virtual environment after installation
```bash
deactivate
cd ..
```

### 4. Configure environment variables

Create a `.env` file in the root of the project (`super-app/.env`) with the following content:
```bash
HUGGINGFACE_TOKEN=your_huggingface_api_token_here
NODE_ENV=development
PORT=5000
```

- Replace `your_huggingface_api_token_here` with your actual Hugging Face API token.
- `NODE_ENV` and `PORT` are used by the React frontend and backend.

---

### 5. Start the application

Run the provided batch script to start both the frontend and AI backend services concurrently:
```bash
start.bat
```
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

