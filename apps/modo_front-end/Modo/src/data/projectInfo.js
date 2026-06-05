/**
 * Base de Conhecimento do Projeto Modo
 * Documento de referência completo para o assistente virtual (chatbot)
 *
 * Este ficheiro contém toda a informação estruturada sobre o projeto,
 * funcionalidades, regras de negócio e terminologia do domínio.
 */

export const projectInfo = {
  // ========================================
  // 1. IDENTIFICAÇÃO DO PROJETO
  // ========================================
  project: {
    name: 'Modo',
    tagline: 'Gestão de Foco, Hábitos e Produtividade',
    version: '1.0.0',
    description:
      'Aplicação web gamificada para a gestão de tarefas e hábitos. Permite criar e concluir tarefas (tipo check, temporizador e contador), registar progresso diário, acumular pontos, subir de nível e desbloquear decorações de avatar.',
    targetAudience:
      'Estudantes e profissionais focados em melhorar a sua produtividade e consistência diária através de gamificação.',
    mainProblem:
      'Procrastinação, falta de organização nas tarefas do dia-a-dia e ausência de motivação para manter hábitos saudáveis e produtivos a longo prazo.',
  },

  // ========================================
  // 2. FUNCIONALIDADES PRINCIPAIS
  // ========================================
  features: {
    authentication: {
      title: 'Sistema de Autenticação e Gestão de Sessão',
      description: 'Registo e login de contas com sistema JWT e WebSockets.',
      details: [
        'Registo com email, username e password',
        'Login persistente com JWT (JSON Web Tokens)',
        'Recuperação de password em tempo real via WebSockets e Nodemailer (Ethereal Email)',
        'Interceptores de fetch globais para auto-logout quando a sessão expira',
      ],
      relatedFiles: [
        'src/views/LoginView.vue',
        'src/views/SigninView.vue',
        'src/stores/userStore.js',
        'backend/sockets/auth.sockets.js'
      ],
    },

    habitManager: {
      title: 'Gestor de Hábitos (Habit Manager)',
      description: 'Criação e acompanhamento de tarefas diárias.',
      details: [
        'Três tipos de tarefas: Check (Simples), Timer (Temporizador) e Count (Contador)',
        'Classificação por prioridade (Alta, Média, Baixa) e localização (Casa, Exterior, etc.)',
        'Temporizador integrado num modal interativo, com sincronização em tempo real na BD',
        'Alertas meteorológicos da OpenWeather API para tarefas no exterior quando chove',
      ],
      relatedFiles: [
        'src/views/HabitManagerView.vue',
        'src/stores/habitStore.js'
      ],
    },

    exploreHabits: {
      title: 'Explorar Hábitos e Impactos',
      description: 'Catálogo de hábitos pré-definidos e visualização de impactos.',
      details: [
        'Explorar tarefas comunitárias sugeridas pelo sistema',
        'Filtros por dificuldade (Fácil, Médio, Difícil)',
        'Secção de impactos (ex: CO2 Poupado, Água Poupada) gerados ao completar certos hábitos',
      ],
      relatedFiles: [
        'src/views/ExploreHabitsView.vue'
      ],
    },

    gamification: {
      title: 'Sistema de Níveis e Gamificação',
      description: 'Mecânicas de jogo aplicadas à produtividade.',
      details: [
        'Ganho de pontos ao completar qualquer tarefa',
        'Subida de nível a cada 100 pontos acumulados (Math.floor(pontos/100))',
        'Loja de Decorações de Avatar: compra de itens visuais com os pontos obtidos',
        'Equipar e desequipar decorações no perfil do utilizador',
      ],
      relatedFiles: [
        'src/views/ShopView.vue',
        'src/views/ProfileView.vue'
      ],
    },

    adminPanel: {
      title: 'Painel de Administração',
      description: 'Área exclusiva para administradores gerirem a plataforma.',
      details: [
        'Gestão de Utilizadores (banir/eliminar contas)',
        'Gestão de Hábitos Comunitários (criar, editar, apagar)',
        'Gestão de Decorações de Avatar (fazer upload de novas imagens via Cloudinary, definir preço)',
        'Envio de Notificações Broadcast (WebSocket) para todos os utilizadores online',
      ],
      relatedFiles: ['src/views/AdminPanelView.vue'],
    },

    chatbot: {
      title: 'Assistente Virtual (ChatBot)',
      description: 'Integração de suporte IA.',
      details: [
        'Integrado através da API iaedu para respostas contextualizadas.',
        'Envio de pedidos com user_info e contexto de forma contínua.',
      ],
      relatedFiles: ['src/api/services/chatbotApi.js'],
    },
  },

  // ========================================
  // 3. TIPOS DE UTILIZADOR E PERMISSÕES
  // ========================================
  userTypes: {
    admin: {
      name: 'Administrador',
      description: 'Gestor da plataforma.',
      permissions: [
        'Acesso total ao Painel de Administração',
        'Gerir todos os hábitos, utilizadores, impactos e decorações',
        'Enviar notificações globais para a comunidade',
      ],
      identification: "userStore.role === 'admin'",
    },

    standardUser: {
      name: 'Utilizador Standard',
      description: 'Membro normal da aplicação.',
      permissions: [
        'Criar e gerir tarefas próprias',
        'Completar tarefas e ganhar pontos',
        'Comprar e equipar decorações',
        'Explorar o catálogo de hábitos',
      ],
      restrictions: [
        'Acesso restrito apenas aos seus dados',
        'Sem acesso às rotas /adminpanel',
      ],
      identification: "userStore.role === 'user'",
    },
  },

  // ========================================
  // 4. GLOSSÁRIO E TERMINOLOGIA DO DOMÍNIO
  // ========================================
  glossary: {
    points: {
      term: 'Pontos (Points)',
      definition: 'Moeda da plataforma.',
      usage: 'Ganhos ao completar tarefas. Podem ser usados para comprar decorações.',
      calculation: 'Atribuídos dinamicamente pela dificuldade ou configurados na criação da tarefa.',
    },

    level: {
      term: 'Nível (Level)',
      definition: 'Indicador do progresso geral do utilizador.',
      calculation: 'Cada 100 pontos garantem 1 Nível. (Math.floor(Pontos / 100)).',
    },

    avatarDecorations: {
      term: 'Decorações de Avatar',
      definition: 'Itens cosméticos vendidos na loja (Shop) para personalizar a foto de perfil.',
      usage: 'Comprados com pontos e equipados no ProfileView.',
    },

    taskCheck: {
      term: 'Tarefa Check',
      definition: 'Tarefa simples que só pode estar Pendente ou Concluída.',
    },

    taskTimer: {
      term: 'Tarefa Timer',
      definition: 'Tarefa baseada em tempo (Temporizador).',
      usage: 'Utilizador inicia o relógio. Progresso é gravado em segundos no backend.',
    },

    taskCount: {
      term: 'Tarefa Contador',
      definition: 'Tarefa que requer múltiplas repetições (ex: Beber 8 copos de água).',
      usage: 'Utilizador usa os botões +/- para atingir o valor alvo (quantidade_necessaria).',
    },

    impacts: {
      term: 'Impactos',
      definition: 'Métricas geradas por certas tarefas.',
      examples: ['CO2 Poupado', 'Plástico Reduzido'],
    },
  },

  // ========================================
  // 5. STACK TECNOLÓGICA
  // ========================================
  technologies: {
    frontend: {
      framework: 'Vue.js 3',
      apiStyle: 'Options API / Setup',
      styling: 'Vanilla CSS e Bootstrap (Modals)',
      routing: 'Vue Router',
      stateManagement: 'Pinia',
      buildTool: 'Vite',
    },

    backend: {
      framework: 'Express.js (Node)',
      database: 'MySQL + Sequelize ORM',
      authentication: 'JWT (JSON Web Tokens) e bcryptjs',
      realtime: 'Socket.io',
      email: 'Nodemailer (Ethereal)',
      storage: 'Cloudinary (para imagens de Avatar/Decoração)',
    },

    external: {
      chatbotAPI: 'API iaedu (https://api.iaedu.pt)',
      weatherAPI: 'OpenWeather API (Para validação de tarefas no exterior)',
    },
  },

  // ========================================
  // 6. REGRAS DE NEGÓCIO E LÓGICA
  // ========================================
  businessRules: {
    weatherAlerts: 'Se um utilizador tentar iniciar uma tarefa no exterior (Outside) e estiver a chover na sua área (via OpenWeather), o sistema mostra um Toast Alert a avisar.',
    timerSaving: 'O progresso do temporizador é gravado em Segundos no backend, independentemente do objetivo ser definido em minutos.',
    countingLimits: 'Tarefas de tipo Contador não podem ultrapassar o número estipulado pela quantidade necessária.',
    authentication: 'O token expira passadas poucas horas. A aplicação tem um interceptor Axios/Fetch que força o logout para proteger a conta assim que recebe um erro 401 (Unauthorized).',
  },

  // ========================================
  // 7. ESTRUTURA DE DADOS PRINCIPAIS (BACKEND MODELS)
  // ========================================
  dataModels: {
    User: 'id_utilizador, email, password, pontos, xp, role',
    Task: 'id_tarefa, nome_tarefa, tipo_tarefa, quantidade_necessaria, duracao_temporizador, prioridade',
    UserTask: 'Tabela Pivot: id_utilizador, id_tarefa, progresso, estado_tarefa (Pending/Completed)',
    Decoration: 'id_decoracao, nome_decoracao, caminho_imagem, preco',
    Impact: 'id_impacto, tipo_impacto, valor_por_unidade',
  },
}
