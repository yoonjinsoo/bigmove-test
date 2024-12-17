import os
from dotenv import load_dotenv

# .env 파일 경로 설정
dotenv_path = os.path.join(os.path.dirname(__file__), '../.env')
load_dotenv(dotenv_path) 