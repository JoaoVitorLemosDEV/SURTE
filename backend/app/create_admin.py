
import asyncio

from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession

from app.db.database import engine
from app.models.domain import Usuario

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def create_admin():
    async with SessionLocal() as session:
        result = await session.execute(
            select(Usuario).where(Usuario.email == "admin@surte.com")
        )

        existing_user = result.scalar_one_or_none()

        if existing_user:
            print("O administrador já está cadastrado.")
            return

        admin = Usuario(
            nome_completo="Administrador SURTE",
            email="admin@surte.com",
            senha_hash=pwd_context.hash("admin123"),
            cargo="admin",
            ativo=True
        )

        session.add(admin)
        await session.commit()

        print("Administrador cadastrado com sucesso!")

if __name__ == "__main__":
    asyncio.run(create_admin())
