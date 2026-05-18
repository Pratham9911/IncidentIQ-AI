import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL_NAME = "llama-3.3-70b-versatile"

def generate_resolution_recommendation(
    new_title: str,
    new_description: str,
    new_service: str,
    similar_incidents: list[dict]
) -> str:
    
    if not similar_incidents:
        # Generates a standard baseline troubleshooting suggestion
        prompt = f"""
You are IncidentIQ, an advanced IT operations and system incident resolution assistant.

A new incident has been reported, but no matching past incidents were found in the database.
Based on the ticket description, provide a highly professional, structured, and detailed initial triage and diagnostic step recommendation.

New Incident Details:
- Title: {new_title}
- Service: {new_service}
- Description: {new_description}

Instructions:
- Provide a clear, actionable list of diagnostics steps.
- Suggest potential root causes tailored to the service: "{new_service}".
- Present the response in professional markdown format.
"""
    else:
        # Format the historical matching incidents as context
        context_str = ""
        for idx, inc in enumerate(similar_incidents):
            context_str += f"""
---
Similar Incident #{idx + 1}:
- Title: {inc['title']}
- Service: {inc['service']} (Env: {inc['environment']}, Priority: {inc['priority']})
- Description: {inc['description']}
- Solved/Logged By: {inc.get('creator_name', 'Unknown')}
- Date Resolved: {inc.get('created_at', 'Unknown')}
"""
            
        prompt = f"""
You are IncidentIQ, an advanced IT operations and system incident resolution assistant.

A new incident has been reported, and we have successfully retrieved similar past incidents from the database.
Your task is to analyze these past incidents and generate a detailed diagnostic, resolution recommendation, and triage path for the engineers.

New Incident Details:
- Title: {new_title}
- Service: {new_service}
- Description: {new_description}

Similar Past Incidents Context:
{context_str}

Instructions:
- Correlate details from the past incidents to suggest immediate steps or resolutions.
- For each resolution strategy or recommendation, you MUST clearly state WHO originally solved it (cite "Solved/Logged By") and WHEN (cite "Date Resolved") so that the engineers have absolute transparency on whose historical solution this is.
- Outline what worked in the past and what to check first.
- Keep the response highly structured, technical, and professional using markdown.
"""

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": "You are a senior site reliability engineer (SRE) and systems architect specializing in structured troubleshooting and incident response."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.1
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Unable to generate recommendations due to an LLM service error: {str(e)}"
