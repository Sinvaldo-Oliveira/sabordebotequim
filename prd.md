# PRD — Sistema SaaS de Votação Online

## Festival Gastronômico e Cultural de Ribeirão das Neves — Sabor de Botequim

Atue como um engenheiro de software sênior, arquiteto de sistemas SaaS, especialista em Next.js, Supabase, Tailwind CSS, segurança de aplicações, UX/UI Design e implantação de sistemas na Hostinger.

Desenvolva um sistema completo de votação online para o evento **Festival Gastronômico e Cultural de Ribeirão das Neves**, com o nome:

# Sabor de Botequim

O sistema deverá permitir que o público conheça os restaurantes participantes, acesse o perfil público de cada estabelecimento e vote em seu restaurante ou prato favorito.

O projeto deverá ter:

* Landing page pública do festival;
* Página pública individual de cada restaurante;
* Sistema seguro de votação;
* Dashboard administrativa;
* Dashboard exclusiva para cada restaurante;
* Relatórios de visitas, cliques e votos;
* Sistema de autenticação e controle de permissões;
* Layout totalmente responsivo;
* Banco de dados integrado ao Supabase;
* Estrutura preparada para hospedagem na Hostinger.

---

# 1. Objetivo do sistema

Criar uma plataforma digital para divulgação, gestão e votação do Festival **Sabor de Botequim**.

O sistema deverá:

1. Divulgar o festival e os restaurantes participantes;
2. Apresentar o perfil de cada restaurante;
3. Permitir que o público vote de maneira simples e segura;
4. Impedir votos duplicados conforme as regras configuradas;
5. Registrar visitas, visualizações, cliques e votos;
6. Permitir que a administração configure todo o festival;
7. Disponibilizar dados e relatórios para os restaurantes;
8. Oferecer uma experiência intuitiva em celulares, tablets e computadores.

---

# 2. Tecnologias obrigatórias

Utilizar:

* Next.js com App Router;
* TypeScript;
* Tailwind CSS;
* Supabase;
* Supabase PostgreSQL;
* Supabase Authentication;
* Supabase Storage;
* Row Level Security;
* React Hook Form;
* Zod para validação;
* Componentes acessíveis e reutilizáveis;
* Recharts ou biblioteca semelhante para gráficos;
* Lucide Icons;
* Sistema preparado para hospedagem na Hostinger.

Utilizar preferencialmente:

* Server Components;
* Server Actions;
* API Routes apenas quando necessário;
* Middleware para proteção das rotas;
* Componentes modulares;
* Variáveis de ambiente;
* Estrutura escalável e organizada.

Não colocar chaves, tokens, URLs privadas ou credenciais diretamente no código.

---

# 3. Identidade visual

O sistema deverá possuir uma identidade relacionada a:

* Gastronomia;
* Cultura local;
* Bares e botequins;
* Festival;
* Experiência popular;
* Ribeirão das Neves.

A interface deverá ser moderna, acolhedora, profissional e fácil de utilizar.

Sugestão de identidade:

* Tons quentes;
* Laranja;
* Amarelo;
* Vermelho escuro;
* Marrom;
* Bege;
* Verde como cor complementar;
* Elementos visuais que lembrem gastronomia e cultura.

Criar as cores através de variáveis no tema para permitir alterações pelo administrador.

O sistema deverá ter:

* Boa hierarquia visual;
* Botões de votação destacados;
* Cards organizados;
* Imagens otimizadas;
* Tipografia legível;
* Feedback visual nas ações;
* Estados de carregamento;
* Estados vazios;
* Mensagens de sucesso e erro;
* Confirmações antes de ações importantes.

---

# 4. Perfis de acesso

O sistema deverá possuir três tipos principais de acesso.

## 4.1 Visitante

O visitante poderá:

* Acessar a landing page;
* Conhecer o festival;
* Visualizar os restaurantes;
* Pesquisar restaurantes;
* Filtrar restaurantes;
* Acessar o perfil público de cada restaurante;
* Compartilhar o perfil;
* Abrir o formulário de votação;
* Cadastrar os dados necessários;
* Registrar seu voto;
* Visualizar a confirmação do voto.

O visitante não precisará criar uma senha ou dashboard pessoal.

## 4.2 Restaurante

Cada restaurante deverá possuir:

* Login próprio;
* Dashboard privada;
* Acesso somente aos dados do próprio restaurante;
* Edição do próprio perfil, conforme autorização;
* Visualização das métricas;
* Visualização dos dados de votação permitidos pelo administrador;
* Acompanhamento de visitas, cliques e votos.

Um restaurante nunca poderá visualizar ou alterar informações privadas de outro restaurante.

## 4.3 Administrador

O administrador deverá possuir acesso completo para:

* Configurar o festival;
* Gerenciar a landing page;
* Gerenciar restaurantes;
* Configurar as regras de votação;
* Acompanhar votos;
* Gerenciar usuários;
* Visualizar relatórios gerais;
* Exportar dados;
* Ativar ou desativar restaurantes;
* Abrir ou encerrar a votação;
* Moderar conteúdos;
* Alterar identidade visual;
* Visualizar logs administrativos.

---

# 5. Landing page pública

Criar uma landing page pública moderna, responsiva e otimizada.

Sugestão de rota:

`/`

## 5.1 Cabeçalho

O cabeçalho deverá conter:

* Logo do Sabor de Botequim;
* Link para início;
* Link para restaurantes;
* Link para como votar;
* Link para regulamento;
* Link para contato;
* Botão “Vote agora”;
* Menu responsivo para dispositivos móveis.

O administrador deverá conseguir ativar, desativar ou editar os itens do menu.

## 5.2 Seção Hero

Criar uma seção Hero com:

* Banner principal;
* Logo do festival;
* Título;
* Subtítulo;
* Texto de apresentação;
* Data ou período do festival;
* Botão “Conheça os participantes”;
* Botão “Vote agora”;
* Imagem ou vídeo de fundo opcional.

O conteúdo deverá ser controlado pela Dashboard Administrativa.

O administrador deverá conseguir:

* Alterar o título;
* Alterar o subtítulo;
* Alterar os textos;
* Alterar o banner;
* Alterar os botões;
* Alterar os links;
* Ativar ou desativar a seção;
* Configurar uma sobreposição de cor sobre a imagem;
* Definir alinhamento do conteúdo.

## 5.3 Seção de apresentação do festival

Adicionar uma seção com:

* Título;
* Descrição;
* Imagem;
* Informações sobre o festival;
* Objetivo do evento;
* Informações culturais;
* Informações gastronômicas.

Todo o conteúdo deverá ser editável pela administração.

## 5.4 Seção de restaurantes participantes

Criar uma grade de cards com os restaurantes cadastrados.

Cada card deverá apresentar:

* Logo ou foto de perfil;
* Imagem de capa ou imagem do prato;
* Nome do restaurante;
* Nome do prato participante;
* Categoria;
* Bairro ou região;
* Pequena descrição;
* Botão “Conhecer restaurante”;
* Botão “Votar”.

Os cards deverão ter:

* Paginação ou carregamento progressivo;
* Campo de pesquisa;
* Filtro por nome;
* Filtro por categoria;
* Filtro por bairro;
* Filtro por status;
* Ordenação configurável;
* Estado para restaurantes em destaque.

Ao clicar em “Conhecer restaurante”, abrir a página pública do restaurante.

Ao clicar em “Votar”, abrir um modal de votação.

## 5.5 Seção “Como votar”

Apresentar um passo a passo simples:

1. Escolha um restaurante;
2. Clique em votar;
3. Informe seus dados;
4. Confirme o voto.

O administrador deverá conseguir editar os textos e ícones.

## 5.6 Seção de patrocinadores e apoiadores

Criar uma seção opcional contendo:

* Logotipos;
* Nome dos patrocinadores;
* Links externos;
* Categorias de patrocínio;
* Ordem de exibição.

## 5.7 Rodapé

O rodapé deverá conter:

* Logo;
* Breve descrição;
* Links úteis;
* Regulamento;
* Política de Privacidade;
* Termos de Uso;
* Informações de contato;
* Redes sociais;
* Créditos;
* Direitos reservados.

Todos os itens deverão ser configuráveis na Dashboard Administrativa.

---

# 6. Página pública do restaurante

Criar uma página pública individual para cada restaurante.

Sugestão de rota:

`/restaurantes/[slug]`

Cada restaurante deverá possuir um endereço amigável, por exemplo:

`/restaurantes/bar-do-joao`

## 6.1 Hero do restaurante

Criar uma seção Hero inspirada na organização visual de uma página de perfil do Facebook.

A seção deverá conter:

* Banner no formato recomendado de 1920 × 750 pixels;
* Foto de perfil ou logo;
* Nome do restaurante;
* Categoria;
* Bairro;
* Botão “Votar neste restaurante”;
* Botão de compartilhar;
* Links de contato;
* Redes sociais;
* Botão de WhatsApp, quando cadastrado.

O banner deverá ser responsivo, mantendo uma boa área de visualização em dispositivos móveis.

## 6.2 Seção “Quem é [nome da empresa]”

Criar automaticamente o título utilizando o nome cadastrado.

Exemplo:

“Quem é Bar do João”

A seção deverá conter:

* História do restaurante;
* Descrição;
* Diferenciais;
* Informações sobre o estabelecimento;
* Fotos;
* Vídeo opcional;
* Endereço;
* Horário de funcionamento;
* Telefone;
* WhatsApp;
* Instagram;
* Site;
* Mapa ou link de localização.

## 6.3 Seção do prato participante

Apresentar:

* Nome do prato;
* Foto principal;
* Galeria de fotos;
* Descrição;
* Ingredientes;
* História do prato;
* Preço, quando permitido;
* Informação sobre restrições alimentares;
* Categoria da votação.

## 6.4 Seção de votação

Apresentar:

* Nome do restaurante;
* Nome do prato participante;
* Imagem;
* Texto de chamada;
* Botão “Votar agora”;
* Período de votação;
* Status da votação.

Caso a votação esteja encerrada, apresentar:

“Votação encerrada”

Caso ainda não tenha começado, apresentar:

“A votação será aberta em [data e horário]”

## 6.5 Rodapé

Utilizar o rodapé global do festival.

---

# 7. Modal de votação

Ao clicar em qualquer botão de votação, abrir um modal acessível e responsivo.

O modal deverá apresentar:

* Nome do restaurante;
* Nome do prato;
* Foto ou logo;
* Texto explicativo;
* Campo nome completo;
* Campo CPF;
* Checkbox de aceite do regulamento;
* Checkbox de aceite da Política de Privacidade;
* Botão “Confirmar voto”;
* Botão para cancelar ou fechar.

O campo CPF deverá:

* Possuir máscara;
* Aceitar apenas números válidos;
* Validar os dígitos verificadores;
* Remover pontuação antes de salvar;
* Nunca ser exibido publicamente;
* Nunca ser salvo sem proteção adequada.

Antes de registrar o voto, o sistema deverá verificar:

* Se o período de votação está ativo;
* Se o restaurante está ativo;
* Se a categoria está ativa;
* Se o CPF é válido;
* Se o CPF já votou conforme a regra configurada;
* Se os termos foram aceitos;
* Se a solicitação não ultrapassou o limite de tentativas;
* Se não existem sinais básicos de automação ou fraude.

Após o voto, exibir uma mensagem de sucesso:

“Seu voto foi registrado com sucesso!”

Também apresentar:

* Nome do restaurante votado;
* Data e horário do voto;
* Código de protocolo opcional;
* Botão para fechar;
* Botão para compartilhar o restaurante.

Não permitir alteração do voto, exceto se essa opção estiver habilitada pela administração.

---

# 8. Regras configuráveis de votação

A Dashboard Administrativa deverá permitir selecionar uma regra de votação.

## Regra 1 — Um voto por CPF em todo o festival

Cada CPF poderá votar apenas uma vez durante todo o festival.

## Regra 2 — Um voto por CPF em cada categoria

Cada CPF poderá votar uma vez em cada categoria.

## Regra 3 — Um voto por CPF por período

O CPF poderá votar novamente após um intervalo configurado, como:

* A cada 24 horas;
* A cada 7 dias;
* Uma vez por etapa;
* Uma vez por rodada.

## Regra 4 — Um voto por CPF em cada restaurante

Cada CPF poderá votar uma única vez em cada restaurante.

## Regra 5 — Votação personalizada

Permitir ao administrador configurar regras específicas por categoria, período ou rodada.

A regra selecionada deverá ser aplicada no backend e no banco de dados. Não confiar somente em validações no navegador.

---

# 9. Proteção contra fraude

Implementar medidas de segurança e prevenção contra votação automatizada.

Incluir:

* Validação real de CPF;
* Índices únicos no banco de dados;
* Rate limiting;
* Limite de tentativas por IP;
* Registro do IP de forma protegida ou anonimizada;
* Registro de user agent;
* Registro de data e horário;
* Identificação de tentativas repetidas;
* Detecção de comportamento suspeito;
* CAPTCHA configurável;
* Bloqueio temporário por excesso de tentativas;
* Logs de auditoria;
* Status do voto;
* Sistema para invalidar votos sem excluí-los definitivamente.

Nunca depender apenas do IP para impedir votos, pois diferentes usuários podem utilizar a mesma rede.

Criar estados para o voto:

* Válido;
* Em análise;
* Suspeito;
* Invalidado;
* Cancelado pela administração.

Somente votos válidos deverão entrar na apuração oficial.

---

# 10. Privacidade e LGPD

O sistema manipulará nome e CPF. Portanto, implementar recursos compatíveis com a LGPD.

Criar:

* Política de Privacidade;
* Termos de Uso;
* Registro do consentimento;
* Data e versão do termo aceito;
* Finalidade clara para coleta dos dados;
* Restrição de acesso aos dados pessoais;
* Mascaramento de CPF;
* Proteção contra consultas públicas;
* Permissões de acesso no Supabase;
* Prazo de retenção configurável;
* Processo de anonimização após o festival;
* Exportação dos dados quando necessária;
* Registro das ações administrativas.

Nos relatórios gerais, exibir CPF mascarado:

`***.***.***-12`

O CPF completo somente poderá ser acessado por administradores autorizados, quando realmente necessário.

Não mostrar dados pessoais dos votantes para os restaurantes.

---

# 11. Dashboard Administrativa

Criar uma área administrativa protegida.

Sugestão de rota:

`/admin`

## 11.1 Login administrativo

Criar:

* Login com e-mail e senha;
* Recuperação de senha;
* Redefinição de senha;
* Controle de sessão;
* Logout;
* Proteção das rotas;
* Opção futura para autenticação em dois fatores.

## 11.2 Visão geral

A página inicial deverá apresentar:

* Total de restaurantes;
* Restaurantes ativos;
* Restaurantes pendentes;
* Total de votos;
* Votos válidos;
* Votos suspeitos;
* Votos invalidados;
* Total de visitantes;
* Visualizações de perfis;
* Cliques nos botões;
* Taxa de conversão de visita para voto;
* Restaurantes mais acessados;
* Restaurantes mais votados, caso essa informação possa ser exibida;
* Gráfico de votos por dia;
* Gráfico de visitas por dia;
* Gráfico de cliques;
* Distribuição por categoria;
* Período atual da votação.

## 11.3 Gestão da landing page

Criar um editor organizado por seções.

Permitir configurar:

* Cabeçalho;
* Hero;
* Apresentação;
* Como votar;
* Restaurantes;
* Patrocinadores;
* Rodapé;
* SEO;
* Redes sociais;
* Scripts de análise;
* Cores;
* Fontes;
* Botões;
* Banners.

Cada seção deverá permitir:

* Editar;
* Visualizar;
* Ativar;
* Desativar;
* Alterar ordem;
* Salvar rascunho;
* Publicar alterações.

## 11.4 Gestão dos restaurantes

Criar uma tabela contendo:

* Logo;
* Nome;
* Responsável;
* E-mail;
* Telefone;
* Categoria;
* Bairro;
* Status;
* Total de visitas;
* Total de cliques;
* Total de votos;
* Data de cadastro;
* Ações.

Permitir:

* Cadastrar restaurante;
* Editar restaurante;
* Visualizar perfil;
* Ativar;
* Desativar;
* Suspender;
* Excluir logicamente;
* Redefinir senha;
* Reenviar acesso;
* Destacar na landing page;
* Alterar ordem;
* Aprovar alterações solicitadas.

Campos do restaurante:

* Nome comercial;
* Razão social opcional;
* CNPJ opcional;
* Nome do responsável;
* CPF do responsável opcional;
* E-mail;
* Telefone;
* WhatsApp;
* Endereço;
* Número;
* Complemento;
* Bairro;
* Cidade;
* Estado;
* CEP;
* Localização;
* Categoria;
* Descrição curta;
* História;
* Diferenciais;
* Logo;
* Banner;
* Galeria;
* Vídeo;
* Instagram;
* Facebook;
* TikTok;
* Site;
* Horário de funcionamento;
* Status;
* Slug;
* Informações do prato participante.

## 11.5 Gestão das categorias

Permitir:

* Criar categorias;
* Editar categorias;
* Ativar ou desativar;
* Definir ordem;
* Definir período de votação;
* Vincular restaurantes;
* Definir regras próprias;
* Configurar número de votos permitidos;
* Adicionar imagem e descrição.

Exemplos de categorias:

* Melhor prato;
* Melhor atendimento;
* Melhor ambiente;
* Melhor petisco;
* Melhor bebida;
* Voto popular.

## 11.6 Configuração da votação

Criar uma tela contendo:

* Nome da votação;
* Descrição;
* Data e horário de início;
* Data e horário de encerramento;
* Fuso horário;
* Regra de voto;
* Categorias participantes;
* Exigir nome;
* Exigir CPF;
* Exigir aceite dos termos;
* Permitir alteração de voto;
* Exibir ou ocultar resultados;
* Exibir contagem de votos;
* Ativar CAPTCHA;
* Definir limite de tentativas;
* Mensagem antes da votação;
* Mensagem após a votação;
* Regulamento;
* Status da votação.

Status possíveis:

* Rascunho;
* Agendada;
* Ativa;
* Pausada;
* Encerrada;
* Em apuração;
* Resultado publicado.

## 11.7 Gestão dos votos

Criar uma tabela protegida contendo:

* Código do voto;
* Nome do participante;
* CPF mascarado;
* Restaurante;
* Categoria;
* Data e horário;
* Origem;
* Status;
* Indicadores de possível fraude;
* Protocolo;
* Ações.

Permitir:

* Pesquisar;
* Filtrar;
* Visualizar detalhes;
* Marcar como suspeito;
* Validar;
* Invalidar;
* Restaurar;
* Adicionar observação interna;
* Exportar dados;
* Visualizar histórico da análise.

Toda alteração no status de um voto deverá gerar um registro de auditoria.

## 11.8 Relatórios administrativos

Criar relatórios de:

* Total de visitas na landing page;
* Visitantes únicos estimados;
* Visualizações de cada restaurante;
* Cliques em “Conhecer restaurante”;
* Cliques em “Votar”;
* Aberturas do modal;
* Formulários iniciados;
* Formulários abandonados;
* Votos concluídos;
* Taxa de conversão;
* Votos por restaurante;
* Votos por categoria;
* Votos por dia;
* Votos por horário;
* Votos válidos;
* Votos suspeitos;
* Votos invalidados;
* Origem do tráfego;
* Dispositivo;
* Navegador;
* Sistema operacional;
* Parâmetros UTM.

Permitir:

* Selecionar período;
* Filtrar restaurante;
* Filtrar categoria;
* Comparar períodos;
* Exportar em CSV;
* Exportar em Excel;
* Gerar versão para impressão;
* Gerar PDF futuramente.

## 11.9 Gestão dos patrocinadores

Permitir:

* Cadastrar patrocinador;
* Logo;
* Nome;
* Link;
* Categoria;
* Ordem;
* Status;
* Data de início;
* Data de encerramento.

## 11.10 Usuários e permissões

Criar perfis como:

* Superadministrador;
* Administrador;
* Moderador;
* Analista;
* Restaurante.

Permitir configurar permissões por módulo.

## 11.11 Logs de auditoria

Registrar:

* Usuário;
* Ação;
* Entidade alterada;
* Valor anterior;
* Novo valor;
* Data;
* Horário;
* IP protegido;
* Identificação da sessão.

---

# 12. Dashboard do restaurante

Criar uma área privada.

Sugestão de rota:

`/painel-restaurante`

## 12.1 Visão geral

Apresentar:

* Nome e logo;
* Status do perfil;
* Status da votação;
* Total de visualizações;
* Visitantes únicos estimados;
* Cliques em votar;
* Aberturas do formulário;
* Votos registrados;
* Taxa de conversão;
* Cliques no WhatsApp;
* Cliques no Instagram;
* Cliques no mapa;
* Gráfico de visitas;
* Gráfico de votos;
* Desempenho por período.

A exibição do total de votos deverá respeitar a configuração definida pelo administrador.

Caso os resultados estejam ocultos, apresentar:

“Os resultados da votação serão divulgados pela organização do festival.”

## 12.2 Configuração do perfil

Permitir editar:

* Logo;
* Banner;
* Descrição;
* História;
* Endereço;
* Contato;
* Horários;
* Redes sociais;
* Galeria;
* Informações do prato;
* Ingredientes;
* Restrições alimentares;
* Imagens.

Criar dois possíveis fluxos:

### Publicação direta

A alteração é publicada imediatamente.

### Publicação com aprovação

A alteração fica pendente até aprovação do administrador.

O administrador deverá escolher qual fluxo será utilizado.

## 12.3 Página de pré-visualização

Permitir que o restaurante visualize o perfil antes da publicação.

## 12.4 Relatórios

Permitir visualizar:

* Visitas;
* Cliques;
* Votos;
* Conversão;
* Origem do tráfego;
* Dispositivos;
* Links mais clicados;
* Evolução diária.

Não disponibilizar:

* CPF dos votantes;
* Nome completo dos votantes;
* IP dos votantes;
* Informações pessoais sensíveis.

## 12.5 Materiais de divulgação

Criar uma seção futura ou inicial contendo:

* Link público do restaurante;
* QR Code do perfil;
* QR Code direto para votação;
* Botão para copiar link;
* Imagem para compartilhamento;
* Texto padrão para redes sociais.

---

# 13. Rastreamento de visitas e cliques

Criar um sistema interno de eventos.

Eventos recomendados:

* `page_view`;
* `landing_view`;
* `restaurant_profile_view`;
* `restaurant_card_view`;
* `restaurant_card_click`;
* `vote_button_click`;
* `vote_modal_open`;
* `vote_form_start`;
* `vote_form_error`;
* `vote_form_abandon`;
* `vote_completed`;
* `whatsapp_click`;
* `instagram_click`;
* `map_click`;
* `share_click`.

Registrar, quando permitido:

* ID do restaurante;
* ID da categoria;
* Sessão;
* Página;
* Referência;
* UTM source;
* UTM medium;
* UTM campaign;
* Tipo de dispositivo;
* Navegador;
* Sistema operacional;
* Data;
* Horário.

Não registrar dados além do necessário.

---

# 14. Estrutura inicial do banco de dados

Criar migrations e tipos TypeScript para as tabelas.

## Tabelas principais

### `profiles`

* id;
* full_name;
* email;
* role;
* avatar_url;
* status;
* created_at;
* updated_at.

### `festivals`

* id;
* name;
* slug;
* description;
* start_date;
* end_date;
* voting_start_at;
* voting_end_at;
* timezone;
* status;
* settings;
* created_at;
* updated_at.

### `restaurants`

* id;
* festival_id;
* owner_user_id;
* name;
* slug;
* short_description;
* description;
* story;
* category_id;
* logo_url;
* banner_url;
* phone;
* whatsapp;
* email;
* website;
* instagram;
* facebook;
* tiktok;
* address;
* number;
* complement;
* neighborhood;
* city;
* state;
* postal_code;
* latitude;
* longitude;
* opening_hours;
* status;
* is_featured;
* display_order;
* created_at;
* updated_at;
* deleted_at.

### `dishes`

* id;
* restaurant_id;
* category_id;
* name;
* description;
* story;
* ingredients;
* dietary_information;
* price;
* main_image_url;
* status;
* created_at;
* updated_at.

### `restaurant_gallery`

* id;
* restaurant_id;
* image_url;
* alt_text;
* display_order;
* created_at.

### `voting_categories`

* id;
* festival_id;
* name;
* slug;
* description;
* image_url;
* voting_rule;
* voting_start_at;
* voting_end_at;
* status;
* display_order;
* created_at;
* updated_at.

### `votes`

* id;
* festival_id;
* restaurant_id;
* dish_id;
* category_id;
* voter_name;
* voter_cpf_hash;
* voter_cpf_encrypted;
* voter_cpf_last_digits;
* protocol;
* status;
* consent_privacy;
* consent_regulation;
* terms_version;
* ip_hash;
* user_agent;
* risk_score;
* risk_reasons;
* created_at;
* updated_at;
* invalidated_at;
* invalidated_by;
* invalidation_reason.

Não salvar o CPF apenas em texto puro.

Usar uma combinação adequada de:

* Hash para comparação de duplicidade;
* Criptografia para necessidades administrativas autorizadas;
* Últimos dígitos para identificação mascarada.

### `analytics_events`

* id;
* festival_id;
* restaurant_id;
* category_id;
* event_name;
* session_id;
* page_path;
* referrer;
* utm_source;
* utm_medium;
* utm_campaign;
* device_type;
* browser;
* operating_system;
* metadata;
* created_at.

### `landing_sections`

* id;
* festival_id;
* section_key;
* title;
* subtitle;
* content;
* image_url;
* settings;
* is_active;
* display_order;
* updated_at.

### `sponsors`

* id;
* festival_id;
* name;
* logo_url;
* website_url;
* sponsorship_level;
* status;
* display_order;
* created_at.

### `restaurant_change_requests`

* id;
* restaurant_id;
* requested_by;
* current_data;
* requested_data;
* status;
* reviewed_by;
* reviewed_at;
* review_notes;
* created_at.

### `audit_logs`

* id;
* user_id;
* action;
* entity_type;
* entity_id;
* old_values;
* new_values;
* ip_hash;
* created_at.

### `system_settings`

* id;
* festival_id;
* setting_key;
* setting_value;
* updated_at.

---

# 15. Segurança no Supabase

Configurar Row Level Security em todas as tabelas privadas.

Regras obrigatórias:

* Visitantes podem visualizar somente festivais ativos e restaurantes publicados;
* Visitantes não podem consultar votos;
* Votos devem ser criados somente por uma função segura;
* Restaurantes podem visualizar e editar somente o próprio cadastro;
* Restaurantes podem visualizar somente métricas agregadas próprias;
* Restaurantes não podem consultar dados pessoais dos votantes;
* Administradores podem gerenciar os dados conforme sua permissão;
* Logs não podem ser alterados por usuários comuns;
* Alterações importantes devem passar por funções do backend.

Criar funções SQL ou RPC para:

* Registrar voto;
* Verificar duplicidade;
* Calcular métricas agregadas;
* Validar período de votação;
* Gerar protocolo;
* Atualizar contadores com segurança;
* Aplicar as regras de votação.

Evitar inserir votos diretamente pela interface do navegador.

---

# 16. Rotas sugeridas

## Públicas

* `/`;
* `/restaurantes`;
* `/restaurantes/[slug]`;
* `/como-votar`;
* `/regulamento`;
* `/politica-de-privacidade`;
* `/termos-de-uso`;
* `/contato`.

## Administrativas

* `/admin/login`;
* `/admin`;
* `/admin/landing-page`;
* `/admin/restaurantes`;
* `/admin/restaurantes/novo`;
* `/admin/restaurantes/[id]`;
* `/admin/categorias`;
* `/admin/votacao`;
* `/admin/votos`;
* `/admin/relatorios`;
* `/admin/patrocinadores`;
* `/admin/usuarios`;
* `/admin/configuracoes`;
* `/admin/logs`.

## Restaurante

* `/painel-restaurante/login`;
* `/painel-restaurante`;
* `/painel-restaurante/perfil`;
* `/painel-restaurante/prato`;
* `/painel-restaurante/galeria`;
* `/painel-restaurante/relatorios`;
* `/painel-restaurante/divulgacao`;
* `/painel-restaurante/configuracoes`.

---

# 17. SEO e compartilhamento

Implementar:

* Título e descrição por página;
* URLs amigáveis;
* Sitemap;
* Robots.txt;
* Dados estruturados;
* Open Graph;
* Imagem de compartilhamento;
* Metadados por restaurante;
* Canonical URL;
* Alt text nas imagens.

Ao compartilhar o perfil de um restaurante, exibir:

* Banner;
* Logo;
* Nome;
* Nome do prato;
* Texto do festival.

---

# 18. Responsividade e acessibilidade

O sistema deverá funcionar corretamente em:

* Smartphones;
* Tablets;
* Notebooks;
* Desktops;
* Telas grandes.

Seguir boas práticas de acessibilidade:

* Contraste adequado;
* Navegação por teclado;
* Labels nos campos;
* Foco visível;
* Textos alternativos;
* Modal acessível;
* Mensagens de erro claras;
* Botões com área de toque adequada;
* Uso correto de HTML semântico;
* Compatibilidade com leitores de tela.

---

# 19. Otimização de imagens

Toda imagem enviada deverá:

* Ter validação de formato;
* Ter validação de tamanho;
* Ser otimizada;
* Ser convertida preferencialmente para WebP;
* Possuir diferentes tamanhos;
* Utilizar carregamento responsivo;
* Utilizar lazy loading quando adequado;
* Ter imagem padrão de fallback.

Formatos aceitos:

* JPG;
* JPEG;
* PNG;
* WebP.

Criar limites configuráveis para:

* Logo;
* Banner;
* Foto do prato;
* Galeria;
* Patrocinadores.

---

# 20. Hospedagem na Hostinger

Preparar o projeto para publicação na Hostinger.

A estrutura deverá:

* Utilizar variáveis de ambiente;
* Possuir script de build;
* Possuir script de start;
* Ter documentação de implantação;
* Ter arquivo `.env.example`;
* Separar ambiente de desenvolvimento e produção;
* Configurar domínio e HTTPS;
* Integrar o domínio da Hostinger ao projeto;
* Utilizar Supabase como banco de dados externo;
* Configurar URLs de redirecionamento do Supabase;
* Configurar políticas de CORS quando necessário;
* Possuir tratamento de erros de produção.

Caso o plano compartilhado da Hostinger não suporte adequadamente a execução contínua do Next.js, preparar o projeto para implantação em uma VPS da Hostinger ou para uma arquitetura compatível com o ambiente contratado.

Criar um guia de deploy contendo:

1. Configuração do projeto;
2. Variáveis de ambiente;
3. Build;
4. Execução;
5. Configuração do domínio;
6. Certificado SSL;
7. Configuração do Supabase;
8. Criação do primeiro administrador;
9. Backup;
10. Atualizações futuras.

---

# 21. Requisitos de desempenho

Implementar:

* Cache onde for seguro;
* Paginação;
* Otimização de consultas;
* Índices no banco;
* Carregamento progressivo;
* Suspense;
* Skeleton loading;
* Otimização de imagens;
* Evitar consultas repetidas;
* Reduzir JavaScript enviado ao navegador;
* Monitoramento de erros;
* Tratamento de falhas da API.

A landing page deverá priorizar carregamento rápido em redes móveis.

---

# 22. Estados e mensagens do sistema

Criar mensagens claras para:

* Voto registrado;
* CPF inválido;
* CPF já utilizado;
* Votação encerrada;
* Votação ainda não iniciada;
* Restaurante indisponível;
* Erro ao enviar voto;
* Limite de tentativas atingido;
* Perfil atualizado;
* Alteração enviada para aprovação;
* Arquivo inválido;
* Imagem muito grande;
* Sessão expirada;
* Acesso não autorizado.

Não mostrar mensagens técnicas ou detalhes internos do banco de dados ao usuário.

---

# 23. Testes obrigatórios

Criar testes para:

* Validação de CPF;
* Regras de duplicidade;
* Período de votação;
* Registro de votos;
* Permissões;
* Acesso entre restaurantes;
* Modal de votação;
* Formulários;
* Relatórios;
* Responsividade;
* Proteção das rotas;
* Upload de imagens;
* Alteração de status;
* Exportação de dados.

Realizar testes específicos para garantir que:

* Um restaurante não acesse dados de outro;
* Um usuário não consulte a tabela de votos;
* O CPF não apareça em APIs públicas;
* O voto duplicado seja bloqueado no backend;
* A alteração manual de JavaScript no navegador não contorne as regras;
* Votos fora do período sejam rejeitados.

---

# 24. Etapas de desenvolvimento

Desenvolver o projeto em etapas. Não tentar criar todo o sistema de uma única vez.

## Etapa 1 — Planejamento e arquitetura

Antes de programar:

* Analisar os requisitos;
* Criar arquitetura;
* Criar mapa de rotas;
* Criar modelos de dados;
* Criar regras de acesso;
* Criar fluxo de votação;
* Criar fluxo dos usuários;
* Listar riscos técnicos;
* Apresentar plano de implementação.

## Etapa 2 — Fundação do projeto

Criar:

* Next.js;
* TypeScript;
* Tailwind CSS;
* Supabase;
* Estrutura de pastas;
* Tema;
* Componentes básicos;
* Layouts;
* Variáveis de ambiente;
* Autenticação;
* Middleware.

## Etapa 3 — Banco de dados e segurança

Criar:

* Tabelas;
* Relacionamentos;
* Índices;
* Migrations;
* Triggers;
* Funções;
* RLS;
* Usuários e permissões;
* Dados iniciais de teste.

## Etapa 4 — Landing page

Desenvolver:

* Cabeçalho;
* Hero;
* Apresentação;
* Cards;
* Pesquisa;
* Filtros;
* Como votar;
* Patrocinadores;
* Rodapé.

## Etapa 5 — Página pública do restaurante

Desenvolver:

* Hero;
* Banner;
* Foto de perfil;
* Informações;
* Prato;
* Galeria;
* Contato;
* Compartilhamento;
* Votação.

## Etapa 6 — Sistema de votação

Desenvolver:

* Modal;
* Formulário;
* Validação de CPF;
* Consentimentos;
* Regras;
* Prevenção contra duplicidade;
* Protocolo;
* Mensagens;
* Segurança;
* Logs.

## Etapa 7 — Dashboard Administrativa

Desenvolver:

* Visão geral;
* Landing page;
* Restaurantes;
* Categorias;
* Votação;
* Votos;
* Relatórios;
* Patrocinadores;
* Usuários;
* Configurações;
* Logs.

## Etapa 8 — Dashboard do restaurante

Desenvolver:

* Visão geral;
* Perfil;
* Prato;
* Galeria;
* Relatórios;
* Materiais de divulgação;
* Fluxo de aprovação.

## Etapa 9 — Analytics e relatórios

Desenvolver:

* Registro de eventos;
* Métricas;
* Gráficos;
* Filtros;
* Exportações;
* Conversões;
* UTMs.

## Etapa 10 — Testes e segurança

Realizar:

* Testes funcionais;
* Testes de permissão;
* Testes de votação;
* Testes de fraude;
* Testes de responsividade;
* Revisão da LGPD;
* Revisão da segurança.

## Etapa 11 — Deploy

Preparar:

* Ambiente de produção;
* Documentação;
* Hostinger;
* Domínio;
* SSL;
* Supabase;
* Backup;
* Usuário administrador;
* Checklist de lançamento.

Ao terminar cada etapa:

1. Apresente o que foi criado;
2. Informe os arquivos alterados;
3. Informe as migrations executadas;
4. Apresente como testar;
5. Liste possíveis pendências;
6. Somente depois avance para a etapa seguinte.

---

# 25. Dados demonstrativos

Criar dados fictícios para apresentação do sistema:

* Um festival;
* Seis restaurantes;
* Três categorias;
* Seis pratos;
* Patrocinadores;
* Visitas;
* Cliques;
* Votos fictícios;
* Um administrador;
* Dois acessos de restaurantes.

Os dados devem estar claramente identificados como demonstrativos.

Não utilizar CPFs reais nos testes.

---

# 26. Critérios de aceitação

O projeto será considerado funcional quando:

* A landing page estiver responsiva;
* Os restaurantes puderem ser cadastrados;
* Cada restaurante possuir uma página pública;
* O visitante conseguir abrir o modal;
* O CPF for validado;
* O voto for registrado com segurança;
* Votos duplicados forem bloqueados;
* O administrador conseguir abrir e encerrar a votação;
* O administrador conseguir gerenciar restaurantes;
* O administrador conseguir editar a landing page;
* O restaurante conseguir editar o próprio perfil;
* Os relatórios exibirem visitas, cliques e votos;
* As permissões do Supabase estiverem configuradas;
* Os dados pessoais não estiverem expostos;
* O projeto estiver preparado para implantação na Hostinger.

---

# 27. Regras importantes para a implementação

* Não criar telas apenas ilustrativas;
* Não utilizar dados estáticos nas funcionalidades finais;
* Não simular votos somente no frontend;
* Não expor CPF ou informações pessoais;
* Não permitir acesso entre contas de restaurantes;
* Não remover registros importantes definitivamente;
* Utilizar exclusão lógica quando necessário;
* Criar componentes reutilizáveis;
* Criar código limpo e documentado;
* Utilizar TypeScript com tipagem adequada;
* Validar dados no frontend e backend;
* Tratar estados de erro;
* Criar migrations versionadas;
* Implementar segurança desde o início;
* Não avançar para recursos avançados antes de concluir a base;
* Manter o sistema preparado para novos festivais no futuro.

Embora a primeira versão seja destinada ao **Sabor de Botequim**, desenvolver a arquitetura de forma que futuramente o sistema possa administrar outros festivais, edições, cidades, categorias e períodos de votação.

---

# 28. Instrução inicial para a IDE

Comece somente pela **Etapa 1 — Planejamento e arquitetura**.

Antes de gerar código, apresente:

1. Resumo do entendimento do projeto;
2. Arquitetura proposta;
3. Estrutura de pastas;
4. Diagrama textual do banco de dados;
5. Fluxo completo de votação;
6. Perfis e permissões;
7. Estratégia de proteção dos dados pessoais;
8. Estratégia contra votos duplicados;
9. Estratégia de hospedagem na Hostinger;
10. Cronograma técnico dividido por etapas;
11. Riscos e recomendações;
12. Lista das variáveis de ambiente necessárias.

Após apresentar o planejamento, inicie a fundação do projeto sem remover recursos existentes que já estejam funcionando.
