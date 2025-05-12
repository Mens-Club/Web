import clip 
from PIL import Image
import requests
import io 
import torch 

class Encoding:
    
    def __init__(self, model="ViT-B/32", device=None, jit=False):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")

        try:
            self.model, self.preprocess = clip.load(model, device=self.device, jit=jit)
            self.model.eval()
        except Exception as e:
            raise RuntimeError(f"CLIP 모델 로딩 중 오류 발생: {e}")
    
    def encode_image(self, image_url):
        
        try:
            response = requests.get(image_url)
            response.raise_for_status() # 상태 보고 
            
            image = Image.open(io.BytesIO(response.content))
            
            image_input = self.preprocess(image).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                image_features = self.model.encode_image(image_input)

            return image_features.cpu().numpy().flatten()
        except Exception as e:
            print(f"이미지 처리 중 오류 발생 - {image_url}: {e}")
            return None
        

clip_model_instance = Encoding()