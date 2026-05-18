from sqlalchemy import text
from rag.embedder import get_embedding

def retrieve_similar_incidents(
    query: str, 
    project_id: int, 
    db, 
    limit: int = 5,
    max_distance: float = 0.5
) -> list[dict]:
    # 1. Generate query embedding
    query_embedding = get_embedding(query, is_query=True)
    
    # Convert vector to pgvector format string e.g. "[0.1, 0.2, ...]"
    vector_str = "[" + ",".join(map(str, query_embedding)) + "]"
    
    # 2. Semantic search using cosine distance (<=>)
    sql = text("""
        SELECT 
            i.incident_id,
            i.title,
            i.description,
            i.service,
            i.environment,
            i.priority,
            i.created_at,
            u.name AS creator_name,
            i.embedding <=> CAST(:query_vector AS vector) AS distance
        FROM incidents i
        JOIN users u ON i.created_by = u.user_id
        WHERE i.project_id = :project_id
        ORDER BY i.embedding <=> CAST(:query_vector AS vector)
        LIMIT :limit;
    """)
    
    results = db.execute(
        sql,
        {
            "query_vector": vector_str,
            "project_id": project_id,
            "limit": limit
        }
    ).fetchall()
    
    output = []
    for row in results:
        # We can filter out results that are too different
        # A distance of 0 means identical, 1 means orthogonal
        if row.distance <= max_distance:
            output.append({
                "incident_id": row.incident_id,
                "title": row.title,
                "description": row.description,
                "service": row.service,
                "environment": row.environment,
                "priority": row.priority,
                "created_at": row.created_at.isoformat() if row.created_at else None,
                "creator_name": row.creator_name,
                "distance": float(row.distance)
            })
            
    return output
