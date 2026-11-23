from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession # IMPORTANTE: Trocado de Session para AsyncSession
from app.api.dependencies import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.models.domain import Usuario
from sqlalchemy import select

router = APIRouter()

class ChangePasswordRequest(BaseModel):
    senha_atual: str
    nova_senha: str

@router.post("/login")
async def login( # IMPORTANTE: Adicionado 'async' na função
    db: AsyncSession = Depends(get_db), # IMPORTANTE: Tipagem atualizada para AsyncSession
    # O form_data capta automaticamente o que for digitado na tela do Swagger
    form_data: OAuth2PasswordRequestForm = Depends() 
):
    # No OAuth2 padrão o campo chama 'username', mas nós usamos como 'email'
    # IMPORTANTE: Nova sintaxe do SQLAlchemy 2.0 para buscas assíncronas
    query = select(Usuario).filter(Usuario.email == form_data.username)
    result = await db.execute(query)
    usuario = result.scalars().first()

    # Verifica se o usuário existe e se a senha bate com o hash criptografado
    if not usuario or not verify_password(form_data.password, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo no sistema"
        )

    # Gera o token válido com a nossa chave secreta do .env
    access_token = create_access_token(subject=usuario.email)

    # Esse é o formato exato que o Swagger e o Frontend esperam receber
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

from app.api.dependencies import get_current_user

@router.get("/me")
async def read_current_user(
    current_user: Usuario = Depends(get_current_user)
):
    return {"email": current_user.email}

@router.put("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Verifica se a senha atual está correta
    if not verify_password(data.senha_atual, current_user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual incorreta"
        )

    # Valida a nova senha
    if len(data.nova_senha) < 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A nova senha deve ter pelo menos 12 caracteres"
        )

    if data.senha_atual == data.nova_senha:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A nova senha deve ser diferente da atual"
        )

    # Atualiza a senha criptografada
    current_user.senha_hash = get_password_hash(data.nova_senha)

    await db.commit()

    return {"message": "Senha alterada com sucesso"}