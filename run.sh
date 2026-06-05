#!/bin/bash

echo "🚀 Levantando book-whisper..."

# Levanta el backend en segundo plano
uv run uvicorn backend.main:app --reload &

# Espera un segundo a que el backend levante
sleep 1

# Levanta el frontend con Python HTTP server
cd frontend && python3 -m http.server 5500 &

# Abre el browser
sleep 1
open http://127.0.0.1:5500

echo "✅ Backend corriendo en http://127.0.0.1:8000"
echo "✅ Frontend corriendo en http://127.0.0.1:5500"
echo "Para detener todo: Ctrl+C"

wait