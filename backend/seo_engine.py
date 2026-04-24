import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

# Load Environment Variables
load_dotenv()

# Initialize Groq Client
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def clean_json_string(json_str):
    """Cleans AI output to ensure valid JSON."""
    json_str = re.sub(r'^```json', '', json_str, flags=re.MULTILINE)
    json_str = re.sub(r'^```', '', json_str, flags=re.MULTILINE)
    return json_str.strip()

def generate_ecommerce_seo(product_name, features, brand_name="MyStore"):
    """
    Generates 9.5/10 Yoast SEO Green content using Groq.
    Updates: Enforces H2/H3 tags with Keywords.
    """
    
    # --- 🚀 YOAST "HEADINGS OPTIMIZED" PROMPT ---
    system_instruction = f"""
    You are a Senior SEO Expert & Copywriter for '{brand_name}' (Pakistani E-commerce).
    Your goal is to score 95/100 on RankMath/Yoast.

    **STRICT OPTIMIZATION RULES:**
    1. **Title Formula:** MUST be "[Focus Keyword] | [Top Spec] | {brand_name}". 
    
    2. **Headings Structure (CRITICAL FOR YOAST):**
       - You MUST use <h2> and <h3> tags properly.
       - **Rule:** At least one <h2> MUST contain the exact 'Focus Keyword'.
       - **Rule:** The 'Features' section must have an <h2> heading (e.g., "<h2>Premium Features of [Product Name]</h2>").
       - **Rule:** The 'Specifications' section must have an <h2> heading (e.g., "<h2>Technical Specifications</h2>").

    3. **Keyword Strategy:** - Use the Focus Keyword in the H1, First Paragraph, and Conclusion.
       - Use LSI variations in H2/H3 subheadings.

    4. **Readability:** Use Transition Words (However, Moreover, Therefore) in 30% of sentences.

    5. **Technical Specs:** Generate a detailed HTML Table.

    **OUTPUT JSON FORMAT:**
    Return ONLY a valid JSON object:
    
    1. "seo_title": The perfect title string.
    2. "slug": Short, hyphenated slug.
    3. "meta_description": 160 chars. Keyword + CTA + 'Pakistan' + 'Price'.
    4. "focus_keyword": The main high-volume keyword.
    5. "secondary_keywords": Array of 5 LSI variations.
    6. "product_description": HTML format content.
       **Strict HTML Structure:**
       - <h1> [Title Including Keyword] </h1>
       - <p> [Intro with Keyword] </p>
       - <h2> [Focus Keyword] Key Features </h2> (Must include keyword)
       - <ul> [Bullet Points] </ul>
       - <h2> Technical Specifications of [Product] </h2>
       - <table> [Specs Table] </table>
       - <h3> Why Choose {brand_name} for [Product]? </h3>
       - <p> [Conclusion with CTA] </p>
    7. "faq_section": Array of 5 objects {{"question": "...", "answer": "..."}}.
    8. "image_alt_text": "Alt text" string with keyword.
    9. "outbound_link": A relevant Wikipedia/TechRadar link anchor.
    10. "internal_links": Array of 3 related categories.
    """

    user_message = f"""
    Generate Yoast H2/H3 Optimized Content for:
    - Product: {product_name}
    - Brand: {brand_name}
    - Features: {features}
    - Market: Pakistan (Currency: PKR)
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_message}
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0.6,
            max_tokens=3500,
        )

        response_content = chat_completion.choices[0].message.content
        cleaned_json = clean_json_string(response_content)
        return json.loads(cleaned_json)

    except Exception as e:
        print(f"Groq SEO Error: {e}")
        return None