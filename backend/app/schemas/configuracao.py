from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional


class ConfiguracaoBase(BaseModel):
    nome_instituicao: str
    email_contato: Optional[EmailStr] = None
    telefone_contato: Optional[str] = None


class ConfiguracaoUpdate(ConfiguracaoBase):
    pass


class ConfiguracaoResponse(ConfiguracaoBase):
    id: int

    model_config = ConfigDict(from_attributes=True)