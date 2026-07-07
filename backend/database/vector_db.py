from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
from backend.core.config import settings

def get_qdrant_client() -> QdrantClient:
    """Returns a Qdrant client connected to the vector database."""
    client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
    return client

def init_vector_db():
    """Initializes collections if they don't exist."""
    client = get_qdrant_client()
    collection_name = "agent_memory"
    
    collections = client.get_collections()
    if not any(c.name == collection_name for c in collections.collections):
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=768, distance=Distance.COSINE),
        )
        print(f"Collection '{collection_name}' created successfully.")

if __name__ == "__main__":
    init_vector_db()
