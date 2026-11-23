import { useEffect, useState } from "react";
import { Settings, Bell, Shield, Users as UsersIcon, Lock } from "lucide-react";
import api from "../services/api";

export default function Configuracoes() {

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenhas, setMostrarSenhas] = useState(false);
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [carregandoUsuarios, setCarregandoUsuarios] = useState(false);
  const [erroUsuarios, setErroUsuarios] = useState("");
  const [mostrarUsuarios, setMostrarUsuarios] = useState(false);

  const [mostrarCadastro, setMostrarCadastro] = useState(false);
const [novoUsuario, setNovoUsuario] = useState({
  nome_completo: "",
  email: "",
  senha: "",
  cargo: "produtor",
});
const [cadastrandoUsuario, setCadastrandoUsuario] = useState(false);
const [mensagemUsuarios, setMensagemUsuarios] = useState("");
const [usuarioEditando, setUsuarioEditando] = useState(null);
const [salvandoEdicao, setSalvandoEdicao] = useState(false);
const [configuracao, setConfiguracao] = useState({
  nome_instituicao: "",
  email_contato: "",
  telefone_contato: "",
});

const [carregandoConfiguracao, setCarregandoConfiguracao] = useState(true);
const [salvandoConfiguracao, setSalvandoConfiguracao] = useState(false);
const [mensagemConfiguracao, setMensagemConfiguracao] = useState("");
const [erroConfiguracao, setErroConfiguracao] = useState("");

  useEffect(() => {
  const carregarConfiguracao = async () => {
    setCarregandoConfiguracao(true);
    setErroConfiguracao("");

    try {
      const response = await api.get("/configuracoes/");
      setConfiguracao(response.data);
    } catch (error) {
      const detalhe = error.response?.data?.detail;

      setErroConfiguracao(
        typeof detalhe === "string"
          ? detalhe
          : "Não foi possível carregar as configurações institucionais."
      );
    } finally {
      setCarregandoConfiguracao(false);
    }
  };

  carregarConfiguracao();
}, []);

  useEffect(() => {
  if (
    !mensagemUsuarios &&
    !erroUsuarios &&
    !mensagemConfiguracao &&
    !erroConfiguracao
  ) return;

  const timeout = window.setTimeout(() => {
    setMensagemUsuarios("");
    setErroUsuarios("");
    setMensagemConfiguracao("");
    setErroConfiguracao("");
  }, 3200);

  return () => window.clearTimeout(timeout);
}, [
  mensagemUsuarios,
  erroUsuarios,
  mensagemConfiguracao,
  erroConfiguracao,
]);

  useEffect(() => {
  if (!mostrarUsuarios) return;

  const carregarUsuarios = async () => {
    setCarregandoUsuarios(true);
    setErroUsuarios("");

    try {
      const response = await api.get("/usuarios/");
      setUsuarios(response.data);
    } catch (error) {
      const detalhe = error.response?.data?.detail;
      setErroUsuarios(
        typeof detalhe === "string"
          ? detalhe
          : "Não foi possível carregar os usuários."
      );
    } finally {
      setCarregandoUsuarios(false);
    }
  };

  carregarUsuarios();
}, [mostrarUsuarios]);

  const cadastrarUsuario = async (e) => {
  e.preventDefault();
  setMensagemUsuarios("");
  setErroUsuarios("");
  setCadastrandoUsuario(true);

  try {
    await api.post("/usuarios/", novoUsuario);

    setMensagemUsuarios("Usuário cadastrado com sucesso!");

    setNovoUsuario({
      nome_completo: "",
      email: "",
      senha: "",
      cargo: "produtor",
    });

    const response = await api.get("/usuarios/");
    setUsuarios(response.data);
    setMostrarCadastro(false);
  } catch (error) {
    const detalhe = error.response?.data?.detail;

    setErroUsuarios(
      Array.isArray(detalhe)
        ? detalhe.map((item) => item.msg).join(" ")
        : detalhe || "Não foi possível cadastrar o usuário."
    );
  } finally {
    setCadastrandoUsuario(false);
  }
};

  const editarUsuario = async (e) => {
  e.preventDefault();
  setMensagemUsuarios("");
  setErroUsuarios("");
  setSalvandoEdicao(true);

  try {
    await api.put(`/usuarios/${usuarioEditando.id}`, {
      nome_completo: usuarioEditando.nome_completo,
      email: usuarioEditando.email,
      cargo: usuarioEditando.cargo,
    });

    setMensagemUsuarios("Usuário atualizado com sucesso!");
    setUsuarioEditando(null);

    const response = await api.get("/usuarios/");
    setUsuarios(response.data);
  } catch (error) {
    const detalhe = error.response?.data?.detail;

    setErroUsuarios(
      Array.isArray(detalhe)
        ? detalhe.map((item) => item.msg).join(" ")
        : detalhe || "Não foi possível atualizar o usuário."
    );
  } finally {
    setSalvandoEdicao(false);
  }
};

  const alterarSenha = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");

    if (novaSenha.length < 8) {
      setErro("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("A confirmação da senha não corresponde.");
      return;
    }

    setAlterandoSenha(true);

    try {
      const response = await api.put("/auth/change-password", {
        senha_atual: senhaAtual,
        nova_senha: novaSenha,
      });

      setMensagem(response.data.message);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error) {
      const detail = error.response?.data?.detail;
      setErro(
        Array.isArray(detail)
          ? detail.map((item) => item.msg).join(" ")
          : detail || "Não foi possível alterar a senha."
      );
    } finally {
      setAlterandoSenha(false);
    }
  };

  const salvarConfiguracao = async (e) => {
  e.preventDefault();

  setMensagemConfiguracao("");
  setErroConfiguracao("");
  setSalvandoConfiguracao(true);

  try {
    const response = await api.put("/configuracoes/", configuracao);

    setConfiguracao(response.data);
    setMensagemConfiguracao(
      "Configurações institucionais salvas com sucesso!"
    );
  } catch (error) {
    const detalhe = error.response?.data?.detail;

    setErroConfiguracao(
      Array.isArray(detalhe)
        ? detalhe.map((item) => item.msg).join(" ")
        : detalhe || "Não foi possível salvar as configurações institucionais."
    );
  } finally {
    setSalvandoConfiguracao(false);
  }
};

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--surte-azul-escuro)]">
          Configurações
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Gerencie as configurações do sistema
        </p>
      </div>

      {(mensagemUsuarios || erroUsuarios || mensagemConfiguracao || erroConfiguracao) && (
  <div className="fixed left-1/2 top-4 z-[9999] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 space-y-2">
    {(mensagemUsuarios || mensagemConfiguracao) && (
      <div
        role="status"
        className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center text-green-800 shadow-lg"
      >
        <p className="font-medium">
          {mensagemUsuarios || mensagemConfiguracao}
        </p>
      </div>
    )}

    {(erroUsuarios || erroConfiguracao) && (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-red-800 shadow-lg"
      >
        <p className="font-medium">
          {erroUsuarios || erroConfiguracao}
        </p>
      </div>
    )}
  </div>
)}

      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--surte-azul-primario)]/10 rounded-lg flex items-center justify-center">
              <Settings
                className="text-[var(--surte-azul-primario)]"
                size={20}
              />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--surte-azul-escuro)]">
              Configurações Gerais
            </h2>
          </div>
          <form onSubmit={salvarConfiguracao} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Instituição
              </label>
              <input
                type="text"
                value={configuracao.nome_instituicao}
onChange={(e) =>
  setConfiguracao({
    ...configuracao,
    nome_instituicao: e.target.value,
  })
}
                className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)] text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail de Contato
              </label>
              <input
                type="email"
                value={configuracao.email_contato}
onChange={(e) =>
  setConfiguracao({
    ...configuracao,
    email_contato: e.target.value,
  })
}
                className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)] text-sm sm:text-base"
              />
            </div>
            <div>
  <label className="mb-2 block text-sm font-medium text-gray-700">
    Telefone de contato
  </label>
  <input
    type="text"
    value={configuracao.telefone_contato}
    onChange={(e) =>
      setConfiguracao({
        ...configuracao,
        telefone_contato: e.target.value,
      })
    }
    placeholder="(77) 3424-0000"
    className="w-full rounded-lg border border-gray-300 px-4 py-2"
    disabled={carregandoConfiguracao}
  />
</div>
  <button
  type="submit"
  disabled={salvandoConfiguracao || carregandoConfiguracao}
  className="bg-[var(--surte-azul-primario)] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-60"
>
  {salvandoConfiguracao ? "Salvando..." : "Salvar configurações"}
</button>
</form>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--surte-laranja-principal)]/10 rounded-lg flex items-center justify-center">
              <Bell
                className="text-[var(--surte-laranja-principal)]"
                size={20}
              />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--surte-azul-escuro)]">
              Notificações
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-700">
                  Notificar novos agendamentos
                </p>
                <p className="text-sm text-gray-500">
                  Receba e-mails quando houver novos agendamentos
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--surte-azul-primario)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--surte-azul-primario)]"></div>
              </label>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-700">
                  Lembrete de confirmação
                </p>
                <p className="text-sm text-gray-500">
                  Enviar lembrete 24h antes de entrevistas agendadas
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--surte-azul-primario)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--surte-azul-primario)]"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--surte-amarelo-destaque)]/10 rounded-lg flex items-center justify-center">
              <Shield className="text-[var(--surte-marrom)]" size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--surte-azul-escuro)]">
              Privacidade e Segurança
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-700">Backup automático</p>
                <p className="text-sm text-gray-500">
                  Realizar backup diário dos dados
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--surte-azul-primario)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--surte-azul-primario)]"></div>
              </label>
            </div>
                      <div className="border-t border-gray-100 pt-5 mt-5">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="text-[var(--surte-marrom)]" size={20} />
              <h3 className="font-semibold text-gray-800">Alterar senha</h3>
            </div>

            <form onSubmit={alterarSenha} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha atual
                </label>
                <input
                  type={mostrarSenhas ? "text" : "password"}
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova senha
                </label>
                <input
                  type={mostrarSenhas ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  autoComplete="new-password"
                  minLength={12}
                  required
                  className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar nova senha
                </label>
                <input
                  type={mostrarSenhas ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  autoComplete="new-password"
                  minLength={12}
                  required
                  className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-sm sm:text-base"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mostrarSenhas}
                  onChange={(e) => setMostrarSenhas(e.target.checked)}
                />
                Mostrar senhas
              </label>

              {erro && (
                <p role="alert" className="text-sm text-red-600">{erro}</p>
              )}

              {mensagem && (
                <p role="status" className="text-sm text-green-700">{mensagem}</p>
              )}

              <button
                type="submit"
                disabled={alterandoSenha}
                className="bg-[var(--surte-azul-primario)] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-60"
              >
                {alterandoSenha ? "Alterando..." : "Alterar senha"}
              </button>
            </form>
          </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--surte-bege-claro)]/30 rounded-lg flex items-center justify-center">
              <UsersIcon className="text-[var(--surte-marrom)]" size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--surte-azul-escuro)]">
              Gestão de Usuários
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Controle de acesso e permissões do sistema
          </p>
          <button
            type="button"
            onClick={() => setMostrarUsuarios((visivel) => !visivel)}
            className="w-full sm:w-auto bg-[var(--surte-azul-primario)] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            {mostrarUsuarios ? "Ocultar Usuários" : "Gerenciar Usuários"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMostrarCadastro((visivel) => !visivel);
              setMensagemUsuarios("");
              setErroUsuarios("");
            }}
            className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2 border border-[var(--surte-azul-primario)] text-[var(--surte-azul-primario)] px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {mostrarCadastro ? "Cancelar cadastro" : "Cadastrar usuário"}
          </button>
          {mostrarCadastro && (
  <form
    onSubmit={cadastrarUsuario}
    className="mt-6 border-t border-gray-100 pt-5 space-y-4"
  >
    <h3 className="font-semibold text-gray-800">
      Cadastrar novo usuário
    </h3>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Nome completo
      </label>
      <input
        type="text"
        required
        value={novoUsuario.nome_completo}
        onChange={(e) =>
          setNovoUsuario({ ...novoUsuario, nome_completo: e.target.value })
        }
        className="w-full px-4 py-2 border border-gray-200 rounded-lg"
        placeholder="Nome do usuário"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        E-mail
      </label>
      <input
        type="email"
        required
        value={novoUsuario.email}
        onChange={(e) =>
          setNovoUsuario({ ...novoUsuario, email: e.target.value })
        }
        className="w-full px-4 py-2 border border-gray-200 rounded-lg"
        placeholder="usuario@email.com"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Senha inicial
      </label>
      <input
        type="password"
        required
        minLength={12}
        value={novoUsuario.senha}
        onChange={(e) =>
          setNovoUsuario({ ...novoUsuario, senha: e.target.value })
        }
        className="w-full px-4 py-2 border border-gray-200 rounded-lg"
        placeholder="Mínimo de 12 caracteres"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Cargo
      </label>
      <select
        value={novoUsuario.cargo}
        onChange={(e) =>
          setNovoUsuario({ ...novoUsuario, cargo: e.target.value })
        }
        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white"
      >
        <option value="produtor">Produtor</option>
        <option value="jornalista">Jornalista</option>
        <option value="apresentador">Apresentador</option>
        <option value="tecnico_programacao">Técnico de programação</option>
        <option value="admin">Administrador</option>
      </select>
    </div>

    <button
      type="submit"
      disabled={cadastrandoUsuario}
      className="bg-[var(--surte-azul-primario)] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-60"
    >
      {cadastrandoUsuario ? "Cadastrando..." : "Salvar usuário"}
    </button>
  </form>
)}

          {mostrarUsuarios && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              {carregandoUsuarios && (
                <p className="text-sm text-gray-500">Carregando usuários...</p>
              )}

              {!carregandoUsuarios && !erroUsuarios && (
                <div className="space-y-3">
                  {usuarios.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Nenhum usuário cadastrado.
                    </p>
                  ) : (
                    usuarios.map((usuario) => (
  <div key={usuario.id}>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border border-gray-100 rounded-lg">
      <div>
        <p className="font-medium text-gray-800">
          {usuario.nome_completo}
        </p>
        <p className="text-sm text-gray-500">{usuario.email}</p>
        <p className="text-sm text-gray-500">
          {usuario.cargo === "admin"
            ? "Administrador"
            : usuario.cargo === "produtor"
            ? "Produtor"
            : usuario.cargo === "jornalista"
            ? "Jornalista"
            : usuario.cargo === "apresentador"
            ? "Apresentador"
            : "Técnico de programação"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-medium ${
            usuario.ativo ? "text-green-700" : "text-red-600"
          }`}
        >
          {usuario.ativo ? "Ativo" : "Inativo"}
        </span>

        <button
          type="button"
          onClick={() => {
            setUsuarioEditando({ ...usuario });
            setMostrarCadastro(false);
            setMensagemUsuarios("");
            setErroUsuarios("");
          }}
          className="text-sm font-medium text-[var(--surte-azul-primario)] hover:underline cursor-pointer"
        >
          Editar
        </button>
      </div>
    </div>

    {usuarioEditando?.id === usuario.id && (
      <form
        onSubmit={editarUsuario}
        className="mt-3 mb-4 p-4 border border-[var(--surte-azul-primario)]/30 rounded-lg space-y-4"
      >
        <h3 className="font-semibold text-gray-800">
          Editar usuário: {usuarioEditando.nome_completo}
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome completo
          </label>
          <input
            type="text"
            required
            value={usuarioEditando.nome_completo}
            onChange={(e) =>
              setUsuarioEditando({
                ...usuarioEditando,
                nome_completo: e.target.value,
              })
            }
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-mail
          </label>
          <input
            type="email"
            required
            value={usuarioEditando.email}
            onChange={(e) =>
              setUsuarioEditando({
                ...usuarioEditando,
                email: e.target.value,
              })
            }
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cargo
          </label>
          <select
            value={usuarioEditando.cargo}
            onChange={(e) =>
              setUsuarioEditando({
                ...usuarioEditando,
                cargo: e.target.value,
              })
            }
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white"
          >
            <option value="admin">Administrador</option>
            <option value="produtor">Produtor</option>
            <option value="jornalista">Jornalista</option>
            <option value="apresentador">Apresentador</option>
            <option value="tecnico_programacao">
              Técnico de programação
            </option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={salvandoEdicao}
            className="bg-[var(--surte-azul-primario)] text-white px-6 py-3 rounded-lg hover:opacity-90 font-medium disabled:opacity-60"
          >
            {salvandoEdicao ? "Salvando..." : "Salvar alterações"}
          </button>

          <button
            type="button"
            onClick={() => setUsuarioEditando(null)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    )}
  </div>
)))
                  }
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
