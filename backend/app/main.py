from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.models import domain

# Importação de todas as rotas da V1
from app.api.v1.routers import auth, entrevistados, programas, usuarios, entrevistas, relatorios, configuracoes

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    erros = []

    for erro in exc.errors():
        mensagem = erro["msg"]

        if "email" in str(erro["type"]).lower() or "email" in mensagem.lower():
            mensagem = "Informe um endereço de e-mail válido. Exemplo: usuario@email.com."

        erros.append({
            "campo": erro["loc"][-1],
            "mensagem": mensagem
        })

    return JSONResponse(
        status_code=422,
        content={"detail": erros}
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criação automática das tabelas do banco de dados
@app.on_event("startup")
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tabelas do banco de dados verificadas/criadas com sucesso!")

# Registo das rotas
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Autenticação"])
app.include_router(entrevistados.router, prefix=f"{settings.API_V1_STR}/entrevistados", tags=["Entrevistados"])
app.include_router(programas.router, prefix=f"{settings.API_V1_STR}/programas", tags=["Programas"])
app.include_router(usuarios.router, prefix=f"{settings.API_V1_STR}/usuarios", tags=["Usuários"])
app.include_router(entrevistas.router, prefix=f"{settings.API_V1_STR}/entrevistas", tags=["Entrevistas"])
app.include_router(relatorios.router, prefix=f"{settings.API_V1_STR}/relatorios", tags=["Relatórios"])
app.include_router(configuracoes.router,prefix=f"{settings.API_V1_STR}/configuracoes",tags=["Configurações"])

@app.get("/")
def health_check():
    return {"status": "ok", "message": "API SURTE Completa e Operante"}
