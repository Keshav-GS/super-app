@echo off

REM Start FastAPI service in a new terminal window
start "AI Service" cmd /k "cd ai-service && call venv\Scripts\activate.bat && uvicorn ai_service:app --reload --port 8000"

REM Run npm start in the current window (this will keep running here)
echo Starting React app...
npm start
