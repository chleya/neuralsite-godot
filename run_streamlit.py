# -*- coding: utf-8 -*-
"""
启动Streamlit的脚本
"""
import os
import sys

# 禁用统计收集
os.environ['STREAMLIT_GATHER_USAGE_STATS'] = 'false'

# 启动Streamlit
import subprocess
result = subprocess.run([
    sys.executable, '-m', 'streamlit', 'run', 'streamlit_app.py',
    '--server.port', '8501',
    '--server.headless', 'true'
], cwd='F:/NeuralSite-Godot')
