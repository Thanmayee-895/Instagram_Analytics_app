from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import hashlib
import random

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_realistic_seed(username):
    return int(hashlib.sha256(username.encode()).hexdigest(), 16) % 10**8

@app.get("/analyze/{username}")
async def analyze(username: str):
    seed = get_realistic_seed(username)
    random.seed(seed)

    # 1. FIXED: Realistic Account Tiers (Scaled down post counts)
    tier = random.choices([0, 1, 2, 3], weights=[40, 40, 15, 5])[0]
    
    if tier == 0: # Nano
        followers = random.randint(800, 5000)
        posts = random.randint(12, 65) # Realistic
        base_likes = random.randint(40, 150)
    elif tier == 1: # Professional
        followers = random.randint(10000, 50000)
        posts = random.randint(80, 280) # Realistic
        base_likes = random.randint(300, 1200)
    elif tier == 2: # Macro
        followers = random.randint(100000, 500000)
        posts = random.randint(350, 850) # Realistic
        base_likes = random.randint(4000, 12000)
    else: # Major Brand/Celebrity
        followers = random.randint(1000000, 10000000)
        posts = random.randint(900, 1800) # Realistic (Even Nike doesn't have 10k+)
        base_likes = random.randint(40000, 150000)

    pos_sent = random.randint(68, 88)
    neu_sent = random.randint(8, 18)
    neg_sent = 100 - pos_sent - neu_sent
    eng_rate = round(random.uniform(1.8, 5.2), 2)

    return {
        "metrics": {
            "total_posts": f"{posts:,}",
            "pos_sentiment": f"{pos_sent}%",
            "avg_engagement": f"{eng_rate}%",
            "top_hashtag": "#travel",
            "followers_formatted": f"{followers:,}" 
        },
        "charts": {
            "sentiment_pie": [pos_sent, neu_sent, neg_sent],
            "engagement_line": [int(base_likes * random.uniform(0.8, 1.2)) for _ in range(7)],
            "sentiment_history": {
                "positive": sorted([random.randint(60, pos_sent) for _ in range(5)]),
                "neutral": [random.randint(10, 20) for _ in range(5)],
                "negative": [random.randint(2, 8) for _ in range(5)]
            },
            "interaction_types": [base_likes, int(base_likes*0.08), int(base_likes*0.04)]
        },
        "hashtags": ["#lifestyle", "#explore", "#photography", "#vibes", "#nature", "#trending"]
    }