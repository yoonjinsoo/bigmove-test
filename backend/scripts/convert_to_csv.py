import pandas as pd
import re
import os
import chardet

def generate_id(row):
    # NaN 값 처리 및 문자열 변환
    base = str(row['subcategory']).lower() if pd.notna(row['subcategory']) else ''
    size = str(row['size']).lower() if pd.notna(row['size']) else ''
    
    # 특수문자 제거 및 공백을 하이픈으로 변경
    base = re.sub(r'[^\w\s-]', '', base)
    size = re.sub(r'[^\w\s-]', '', size)
    
    base = base.replace(' ', '-')
    size = size.replace(' ', '-')
    
    return f"{base}-{size}"

def convert_txt_to_csv():
    try:
        # 프로젝트 루트 디렉토리 경로 설정
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(current_dir)
        
        input_path = os.path.join(project_root, '1-2-3 choice.txt')
        output_dir = os.path.join(project_root, 'app', 'data')
        output_path = os.path.join(output_dir, 'furniture_data.csv')
        
        # 디버깅을 위한 경로 출력
        print(f"현재 디렉토리: {current_dir}")
        print(f"프로젝트 루트: {project_root}")
        print(f"입력 파일 경로: {input_path}")
        print(f"출력 파일 경로: {output_path}")
        
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"입력 파일을 찾을 수 없습니다: {input_path}")
        
        # 출력 디렉토리 생성
        os.makedirs(output_dir, exist_ok=True)
        
        # 파일 읽기 전 인코딩 확인
        with open(input_path, 'rb') as file:
            raw = file.read()
            result = chardet.detect(raw)
            encoding = result['encoding']
            print(f"감지된 파일 인코딩: {encoding}")
        
        # 데이터 읽기
        df = pd.read_csv(input_path, sep='\t', encoding=encoding, dtype=str)
        
        df = df.dropna(how='all')
        
        # 컬럼명 변경
        df.columns = ['category', 'subcategory', 'size', 'description', 'base_price']
        
        # size를 options 컬럼으로 변환
        df['options'] = df['size']  # 기존 size 값을 options로 저장
        df['name'] = df['subcategory']  # subcategory를 기본 이름으로 사용
        
        # id 필드 생성
        df['id'] = df.apply(generate_id, axis=1)
        
        # 카테고리 매핑
        category_mapping = {
            '침실/거실': 'bedroom-living',
            '서재': 'study',
            '주방': 'kitchen',
            '디지털/가전': 'digital',
            '운동/이동수단': 'exercise',
            '기타': 'etc'
        }
        df['category'] = df['category'].map(category_mapping)
        
        # 가격 처리
        df['base_price'] = df['base_price'].replace('기본 가격은 확인 후 연락드립니다', '0')
        df['base_price'] = pd.to_numeric(df['base_price'], errors='coerce').fillna(0)
        
        # 최종 컬럼 순서 재배치
        df = df[['id', 'category', 'subcategory', 'name', 'description', 'base_price', 'options']]
        
        # CSV 파일로 저장
        df.to_csv(output_path, index=False, encoding='utf-8-sig')
        print("CSV 파일 생성 완료")
    except Exception as e:
        print(f"CSV 변환 중 오류 발생: {e}")

if __name__ == "__main__":
    convert_txt_to_csv()