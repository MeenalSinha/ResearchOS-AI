import asyncio
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.models import User, Professor, Application, ApplicationStatus, CompatibilityScore

async def seed_mock_data():
    async with AsyncSessionLocal() as session:
        # Find the demo user
        result = await session.execute(select(User).where(User.email == "demo@researchos.com"))
        user = result.scalar_one_or_none()
        
        if not user:
            print("Demo user not found! Please create demo@researchos.com first.")
            return

        # Find professors
        prof_result = await session.execute(select(Professor))
        professors = prof_result.scalars().all()

        if not professors:
            print("No professors found! Did you run seed.py?")
            return

        print(f"Adding mock data for {user.email}...")

        import random

        for prof in professors:
            # Create a mock CompatibilityScore
            score = CompatibilityScore(
                user_id=user.id,
                professor_id=prof.id,
                match_percentage=random.randint(80, 98),
                recommendation="Highly Recommended",
                strengths=["Strong overlap in computer vision", "Aligned with deep learning background"],
                weaknesses=["Slightly different focus on robotics"]
            )
            session.add(score)

            # Create a mock Application
            app = Application(
                user_id=user.id,
                professor_id=prof.id,
                status=random.choice([ApplicationStatus.DRAFT, ApplicationStatus.READY, ApplicationStatus.SUBMITTED, ApplicationStatus.INTERVIEW])
            )
            session.add(app)

        await session.commit()
        print("Mock applications and compatibility scores added successfully!")

if __name__ == "__main__":
    asyncio.run(seed_mock_data())
