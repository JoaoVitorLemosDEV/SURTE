from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.dependencies import get_db, get_admin_user
from app.models.domain import ConfiguracaoSistema, Usuario
from app.schemas.configuracao import ConfiguracaoUpdate, ConfiguracaoResponse

router = APIRouter()


@router.get("/", response_model=ConfiguracaoResponse)
async def obter_configuracoes(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_admin_user)
):
    result = await db.execute(select(ConfiguracaoSistema))
    configuracao = result.scalars().first()

    if not configuracao:
        raise HTTPException(
            status_code=404,
            detail="As configurações institucionais ainda não foram cadastradas."
        )

    return configuracao


@router.put("/", response_model=ConfiguracaoResponse)
async def salvar_configuracoes(
    payload: ConfiguracaoUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_admin_user)
):
    result = await db.execute(select(ConfiguracaoSistema))
    configuracao = result.scalars().first()

    if not configuracao:
        configuracao = ConfiguracaoSistema(
            nome_instituicao=payload.nome_instituicao,
            email_contato=payload.email_contato,
            telefone_contato=payload.telefone_contato
        )
        db.add(configuracao)
    else:
        configuracao.nome_instituicao = payload.nome_instituicao
        configuracao.email_contato = payload.email_contato
        configuracao.telefone_contato = payload.telefone_contato

    await db.commit()
    await db.refresh(configuracao)

    return configuracao