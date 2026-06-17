Problemas

Lógica de validação duplicada em vários services
Validações com ordem obrigatória sem garantia de execução correta
Dois entry points diferentes (token e userId) com chain final compartilhado
Combinações de validações complexas espalhadas pelo código

Soluções aplicadas

Builder pattern — chain fluente que força ordem de execução das validações
Interfaces segregadas por entry point — TokenInitialChain e TokenByUserInitialChain convergindo para TokenValidationChain compartilhado
Facade pattern — TokenServiceValidator encapsula combinações do builder evitando replicação nos services
Exceptions como guardiões — cada etapa do chain lança sua própria exception tipada ao invés de retornar null ou boolean
Terminal method — .get() só acessível após passar por todas as validações sem exception
Não existe um padrão único, mas as abordagens mais comuns são:
Empresas menores / projetos simples

— jogam tudo no service mesmo, vira um arquivo gigante, ninguém refatora
Empresas médias com código cuidado

— separam em validators/, helpers/, ou utils/ mas sem o builder, só funções isoladas
Projetos que escalam com muitas regras

— chegam exatamente no que você fez, seja builder, seja pipe customizado, seja uma lib interna
