from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from sqlalchemy import func

from app.api.dependencies import get_db, get_current_user, get_admin_user
from app.models.domain import Usuario, UsuarioCargo
from app.core.security import get_password_hash
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, UsuarioUpdate, UsuarioStatusUpdate

router = APIRouter()

@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def criar_usuario(
    payload: UsuarioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_admin_user)
):

    result = await db.execute(select(Usuario).filter(Usuario.email == payload.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Este e-mail já está registado no sistema.")

    novo = Usuario(
        nome_completo=payload.nome_completo,
        email=payload.email,
        senha_hash=get_password_hash(payload.senha),
        cargo=payload.cargo
    )
    db.add(novo)
    await db.commit()
    await db.refresh(novo)
    return novo

@router.get("/me", response_model=UsuarioResponse)
async def obter_usuario_logado(current_user: Usuario = Depends(get_current_user)):
    return current_user

@router.get("/", response_model=List[UsuarioResponse])
async def listar_usuarios(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_admin_user)
):
    result = await db.execute(select(Usuario))
    return result.scalars().all()

@router.put("/{usuario_id}", response_model=UsuarioResponse)
async def atualizar_usuario(
    usuario_id: int,
    payload: UsuarioUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_admin_user)
):
    result = await db.execute(
        select(Usuario).filter(Usuario.id == usuario_id)
    )
    usuario = result.scalars().first()

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado."
        )

    # Impede que o administrador remova o próprio cargo
    if usuario.id == current_user.id and payload.cargo != UsuarioCargo.admin:
        raise HTTPException(
            status_code=400,
            detail="Você não pode remover seu próprio cargo de administrador."
        )

    # Verifica se o e-mail já pertence a outro usuário
    email_result = await db.execute(
        select(Usuario).filter(
            Usuario.email == payload.email,
            Usuario.id != usuario_id
        )
    )

    if email_result.scalars().first():
        raise HTTPException(
            status_code=400,
            detail="Este e-mail já está cadastrado."
        )

    usuario.nome_completo = payload.nome_completo
    usuario.email = payload.email
    usuario.cargo = payload.cargo

    await db.commit()
    await db.refresh(usuario)

    return usuario

@router.patch("/{usuario_id}/status", response_model=UsuarioResponse)
async def alterar_status_usuario(
    usuario_id: int,
    payload: UsuarioStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_admin_user)
):
    result = await db.execute(
        select(Usuario).filter(Usuario.id == usuario_id)
    )
    usuario = result.scalars().first()

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado."
        )

        # Impede a desativação do último administrador ativo
    if usuario.cargo == UsuarioCargo.admin and not payload.ativo:
        result = await db.execute(
            select(func.count(Usuario.id)).filter(
                Usuario.cargo == UsuarioCargo.admin,
                Usuario.ativo == True
            )
        )

        total_admins = result.scalar()

        if total_admins <= 1:
            raise HTTPException(
                status_code=400,
                detail="Não é possível desativar o último administrador ativo."
            )
    usuario.ativo = payload.ativo

    await db.commit()
    await db.refresh(usuario)

    return usuario