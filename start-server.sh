#!/bin/bash
echo "啟動本地伺服器..."
echo "請在瀏覽器中開啟 http://localhost:8000"
echo "按 Ctrl+C 停止伺服器"
python3 -m http.server 8000
