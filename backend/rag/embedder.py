import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY1")
)

MODEL_NAME = "gemini-embedding-2"

def get_embedding(text: str, is_query: bool = False) -> list[float]:
    task_type = "RETRIEVAL_QUERY" if is_query else "RETRIEVAL_DOCUMENT"
    
    response = client.models.embed_content(
        model=MODEL_NAME,
        contents=text,
        config=types.EmbedContentConfig(
            task_type=task_type,
            output_dimensionality=1024
        )
    )
    return response.embeddings[0].values
