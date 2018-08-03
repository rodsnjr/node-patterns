# Padrões de desenvolvimento com NodeJS

Recentemente temos utilizado muitos projetos menores com NodeJS.
Como venho do mundo Java e [Spring](https://spring.io/) para desenvolvimento de Backends sempre estranhei o formato de desenvolvimento com NodeJS em respeito a padrões.

Minha pouca experiência nos tutoriais e projetos, e leituras sobre, eu vi muita gente usando de vários jeitos distintos. E sempre senti falta de uma boa estrutura com programação orientada a objetos, e uma boa estrutura na gerência das dependências entre os diversos arquivos dos projetos.

Lendo mais sobre, eu descobri o Typescript, que pareceu resolver boa parte dos problemas em relação a estrutura orientada a objetos que eu sentia falta.

A linguagem oferece:
* Tipagem dinâmica, e forte.
* Classes, Interfaces, e Enumerações
* Generics
* Decorators

Essa combinação de coisas já deixam a programação em NodeJS bem mais estruturada, é como deixar o Javascript um pouco mais completo.

Mas ainda tem um problema, como gerenciar de forma efetiva as dependências do projeto, garantir de uma forma limpa que cada objeto da aplicação esteja lá na hora certa, e etc...

Foi então que eu descobri o [Inversify](http://inversify.io/), esse projeto resolve esse problema muito bem. Ele oferece um container par [IoC](https://pt.wikipedia.org/wiki/Invers%C3%A3o_de_controle), que funciona de uma maneira bem elegante com o Typescript.

Algo mais ou menos assim:

```typescript

const TYPES = {
    Repository: Symbol.for('Repository'),
    Service: Symbol.for('Service')
}

@injectable()
class UserRepository {
    public findOne(id) {
        return `One ${id}`;
    }
}


@injectable()
class UserService {

    @inject(TYPES.Repository)
    private userRepository: UserRepository;

    public findUser(id) {
        return this.userRepository.findOne(id);
    }
}


```

E como isso é util para o meu projeto ?

> Bem. O container que vai gerenciar as dependências no Inversify tem diversas configurações, para suprir todas as necessidades no projeto. Ele vai tirar do desenvolvimento o trabalho de se preocupar com o ciclo de vida dos objetos da aplicação.

Isso é feito da seguinte maneira:

```typescript

import "reflect-metadata"
import { Container } from "inversify";
import { TYPES } from "./types";

const myContainer = new Container();

myContainer.bind<UserRepository>(TYPES.Repository).to(UserRepository);
myContainer.bind<UserService>(TYPES.Service).to(UserService);

export { myContainer };

```

A partir desse momento, os objetos podem ser acessados através do decorator `@inject()`, identificando os tipos através das constantes definidas em `TYPES`.

A partir desse conjunto de Typescript e Inversify eu comecei a estruturar os meus projetos mais perto do padrão definido no [Spring](https://spring.io/), que já sou um pouco mais familiarizado, eu deixo o projeto organizado da forma em que cada classe e arquivo tenha sua responsabilidade bem definida.

## Organização de um projeto

Com isso tenho organizado meus projetos da seguinte maneira:

Em módulos, contendo as seguintes responsabilidades:
* Module
* Service
* Domain
* Repository
* Controller

E no módulo principal ou *core* adiciono os tipos definidos utilizados, em uma constante `TYPES`, e as demais dependências no `Container` principal da aplicação.

Vou explicar e exemplificar a responsabilidade de cada um, e como esse conjunto de Typescript e Inversify ajudou e muito a estrutura dos meus projetos, e garantiu com que eu conseguisse definir bem a responsabilidade de cada bloco do meu código.

Primeiro vamos com o coração da aplicação, os `Modules`.
A ideia do Inversify, além de garantir uma boa gerência de dependências da aplicação, além de também modularizar bem a aplicação, por exemplo, eu tenho um módulo especifico para lidar com os usuários da minha aplicação.

Como eu faço isso ?

O Inversify permite que eu declare [Containers modulares](https://github.com/inversify/InversifyJS/blob/master/wiki/container_modules.md), e também trabalhe com eles de forma assíncrona.

Dessa forma eu posso simplesmente definir em um arquivo especifico do módulo todos os objetos contidos no próprio módulo.

```typescript
// UserModule.ts
export const UserModule = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind<UserRepository>(TYPES.Repository).to(UserRepository);
    bind<UserService>(TYPES.Service).to(UserService);
});


```

Minha camada de `Domain` eu uso para definir os objetos transacionados entre o módulo. Outra biblioteca interessante que gosto de utilizar para isso é a [Validator.ts](https://www.npmjs.com/package/validator.ts).

```typescript
// User.ts
export class User {
 
    @IsLength(4, 20)
    name: string;
 
    password: string;
 
    @IsEmail()
    email: string;

    @IsDate()
    createDate: Date;
 
}

```

Para a camada de repositório, como estamos utilizando os Containers, a gente pode definir objetos de acesso aos dados conforme a necessidade. Para esse exemplo vou usar um objeto `db` de acesso a um MongoDB.

```typescript
// UserRepository.ts

@injectable()
export class UserRepository {

    constructor(@inject(TYPES.MongoDB) private db: Db){}

    public createOne(user: User): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            this.db.collection('users').insertOne(user, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(<User>res.ops[0]);
            });
        });
    }

    // Demais Funções ...
}

```

Dessa forma, com essa organização a camada de Serviço pode continuar da mesma maneira apresentada anteriormente.
Lembrando que a responsabilidade da camada de Serviço é de garantir as regras de negócio do sistema, para esse exemplo a única regra de negócio é registrar um usuário válido.

```typescript
// UserService.ts

@injectable()
export class UserService {

    @inject(TYPES.Validator)
    private validator: Validator;

    @inject(TYPES.Repository)
    private userRepository: UserRepository;

    public async createUser(userData: any): Promise<Response<User>> {
        const user: User = new User();

        user.name = userData.name;
        user.password = userData.password;
        user.email = userData.email;
        user.createDate = new Date().toDateString();
            
        if (this.validator.isValid(user, { skipMissingProperties: true })) {
            const createdUser = await this.userRepository.createOne(user);
            return { 
                status: 201,
                body: createdUser
            };
        }

        return { 
            status: 400
        };
    }

    // Demais Funções ...
}

```

Por fim a `Controller` tem a responsabilidade de mapear as *rotas* da nossa API, a partir da nossa camada de `Service`.
Para isso utilizamos o [ExpressJS](http://expressjs.com/), o mais interessante é que o próprio inversify nos libera uma [biblioteca auxiliar](https://github.com/inversify/inversify-express-utils) justamente para facilitar nossa vida nesse caso.

Dessa forma o nosso `UserController` fica da seguinte maneira

```typescript

@controller('/user')
export class UserController implements interfaces.Controller { 
    
    constructor(@inject(TYPES.Service) private userService: UserService) {}

    @httpGet('/')
    private async findAll(req: Request, res: Response) {
        console.log('find All Users');
        const response = await this.userService.findUsers();
        return res.status(response.status).send(response.body);
    }

    @httpPost('/')
    private async create(req: Request, res: Response) {
        console.log('Create One User');
        const response = await this.userService.createUser(req.body);
        return res.status(response.status).send(response.body);
    }
}
```

## Finalizando os Containers

Por fim eu defino uma classe principal da aplicação, que irá conter cada modulo registrado em um container principal, bem como os objetos principais da aplicação (como o acesso ao BD).

```typescript

export class UserApplication {
    
    private container: Container;
    private server: InversifyExpressServer;
    private serverApp: any;
    private dbUrl: string;

    constructor() {
        this.container = new Container();
        this.dbUrl = 'mongodb://localhost:27017/';
    }

    public async build() {
        this.container.load(UserModule);

        this.container.bind(TYPES.Validator)
            .toConstantValue(new Validator());
        const db = await this.buildDatabase();
        this.container.bind(TYPES.MongoDB).toConstantValue(db);
        this.buildServer();
    }

    private async buildDatabase() {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.dbUrl, function(err, db) {
                if (err) {
                    return reject(err);
                }
                const dbConnect = db.db('usersTutorial');
                return resolve(dbConnect);
            });
        })
    }

    private buildServer() {
        this.server = new InversifyExpressServer(this.container);
        this.server.setConfig((app) => {
            // add body parser
            app.use(bodyParser.urlencoded({
                extended: true
            }));
            app.use(bodyParser.json());
        });
        
        this.serverApp = this.server.build();
    }

    public start() {
        console.log('Server Start at 3000');
        this.serverApp.listen(3000);
    }
}

```

E por fim no script principal da aplicação eu inicializo minha classe `UserApplication`

```typescript

const userApp = new UserApplication();

userApp.build().then(() => {
    userApp.start();
});

```

## Finalizando

Ótimo, agora temos uma idéia de como organizar melhor nosso projeto, com cada objeto com sua responsabilidade, sem se preocupar com o ciclo de vida dos nossos objetos, organizando bem nossa aplicação em blocos bem definidos.

Os últimos detalhes são, organizar a compilação e execução da aplicação. Outro ponto importante é que o `Inversify` necessita da `reflect-metadata`.

Para ajustar a compilação do nosso projeto precisamos definir um `tsconfig.json` com alguns detalhes específicos do `Inversify`.

```json

{
    "compilerOptions": {
      "target": "es6",
      "outDir": "dist",
      "lib": ["es2017", "dom"],
      "types": ["reflect-metadata"],
      "module": "commonjs",
      "moduleResolution": "node",
      "experimentalDecorators": true,
      "emitDecoratorMetadata": true,
    },
    "include": [
      "src/**/*.ts",
      "src/**/*.json"
    ],
    "exclude": [
      "node_modules"
    ]
}

```

Essa configuração permite alguns módulos específicos úteis para trabalhar tanto com o `Validator.ts`, quanto com o `Inversify`.

Por fim, para quem ainda não é familiarizado com o Typescript precisamos instalar ele como um pacote global, e usar o comando de compilação no nosso projeto.

> npm install -g typescript
> tsc

Conforme a compilação definida no nosso `tsconfig.json` o nosso projeto vai ser gerado os arquivos na pasta `dist`, então podemos simplesmente rodar com.

> node dist/Index.js

Ou simplesmente definir em nosso `npm start`

```json

"scripts": {
    "start": "tsc && node dist/Index.js"
  }

```