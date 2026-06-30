"""
Seeds the database with demo professors and papers so the dashboard,
Professor Directory, and Research Graph look populated immediately
after deployment, without needing a live discovery run first.
"""
import asyncio

from app.db.session import AsyncSessionLocal
from app.models.models import Professor, Paper

DEMO_PROFESSORS = [
    {
        "name": "Prof. Antonio Torralba",
        "university": "MIT",
        "department": "EECS / CSAIL",
        "research_areas": ["Computer Vision", "Deep Learning"],
        "bio": "Works on scene understanding, visual recognition, and generative vision models.",
    },
    {
        "name": "Prof. Fei-Fei Li",
        "university": "Stanford University",
        "department": "Computer Science",
        "research_areas": ["AI", "Computer Vision"],
        "bio": "Pioneer of large-scale visual recognition and human-centered AI.",
    },
    {
        "name": "Prof. Martial Hebert",
        "university": "Carnegie Mellon University",
        "department": "Robotics Institute",
        "research_areas": ["Robotics", "Vision", "AI"],
        "bio": "Research spans visual perception for robotics and autonomous systems.",
    },
]


async def seed():
    async with AsyncSessionLocal() as session:
        for entry in DEMO_PROFESSORS:
            professor = Professor(**entry)
            session.add(professor)
        await session.commit()
        print(f"Seeded {len(DEMO_PROFESSORS)} demo professors.")


if __name__ == "__main__":
    asyncio.run(seed())
