## Setup DevBooks API

Fala pessoal, para fazer o Setup do DevBooks API vocês vão precisar ter instalado em seus computadores, o docker, basta seguir o passo a passo dos links a baixo:

Linux: https://docs.docker.com/desktop/install/linux-install/

Windows: https://docs.docker.com/desktop/install/windows-install/

MacOS: https://docs.docker.com/desktop/install/mac-install/

Após instalação do docker ter sido feito, o próximo passo será criar um container do Postgres, que é o banco de dados utilizado no DevBooks API, para isso basta executar em seu terminal o seguinte script:

```
docker run --name pg -e POSTGRES_PASSWORD=docker -p 5432:5432  -d postgres
```

Informações de acesso ao Postgres:

Nome do seu container: pg

Senha para acesso do banco de dados: docker

Porta do postgres: 5432

User: postgres

Agora com o container do Postgres instalado na máquina de vocês basta executar em seu terminal o comando a baixo para iniciar seu container:

```
docker start pg
```

Para ajuda-los na criação do banco de dados é importante ter uma interface gráfica para manipular o Postgres, recomendo baixar o Postbird:

https://github.com/Paxa/postbird

Depois de instalado o Postbird, vocês precisam abrir o Postbird, conectar ao Postgres usando as informações de acesso acima e em seguida criar um banco de dados com o nome que vocês desejarem, nesse caso pode ser simplesmente: devbooks-db.

Agora o próximo passo é fazer o clone do repositório do DevBooks API: 

https://github.com/gcmatheusj/devbooks-api

Após clona-lo você deve instalar as dependências usando:

```
pnpm install
```

Em seguida você deve criar um arquivo .env na raiz do seu projeto e adicionar as seguintes informações nele:

```
DATABASE_URL="postgresql://postgres:docker@localhost:5432/devbooks-db?schema=public"

JWT_SECRET="devbooks"
```

PS: No DATABASE_URL você deve se atentar no trecho que tem devbooks-db, aqui é onde você irá colocar o nome do seu banco de dados que você criou la no Postbird, caso você tenha mantido o mesmo nome então não precisa modificar nada.


Agora que as dependências do projeto foram instaladas e as variáveis de ambiente foram configuradas, você precisa executar as migrations do prisma para que sejam criadas as tabelas necessárias no banco de dados e para isso basta executar:

```
npx prisma migrate dev
```

Por último é só colocar o DevBooks API pra rodar na sua maquina, executando:

```
pnpm run start:dev
```

Tudo pronto! 😁