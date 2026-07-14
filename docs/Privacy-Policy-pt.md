# Política de Privacidade — Diário de Passeios da Annie

**Última atualização: 16 de junho de 2026**

A Annie Works (“nós”, “nos” ou “o Desenvolvedor”) estabelece esta Política de Privacidade (“Política”) em relação ao tratamento de informações pessoais e dados de usuários no aplicativo Diário de Passeios da Annie (“o App”).

---

## 1. Controlador de dados

| Item | Detalhes |
|------|----------|
| Nome comercial | Annie Works |
| Representante | Toshiya Karimata |
| Atividades comerciais | Planejamento, desenvolvimento e operação de aplicativos |
| Endereço | ParkFront Hakataekimae 1-chome 5F-B, 1-23-2 Hakataekimae, Hakata-ku, Fukuoka-shi, Fukuoka 812-0011, Japan |
| Contato | support@annie-works.com |

A empresa listada acima é a controladora dos dados pessoais processados no App.

Para consultas sobre esta Política ou solicitações de acesso, correção ou exclusão de dados pessoais, entre em contato conosco pelo endereço de e-mail acima. Não aceitamos consultas por telefone. Aceitamos consultas por correio ou e-mail.

### 1.1 Assuntos atualmente não aplicáveis

O seguinte não se aplica à operação atual do App:

| Tópico | Detalhes |
|--------|----------|
| Tomada de decisão automatizada / perfilamento | Não tomamos decisões automatizadas que produzam efeitos jurídicos ou efeitos significativos similares sobre os usuários |
| Serviços para crianças | O App não se destina a usuários menores de 16 anos |
| Representante na UE (GDPR Artigo 27) | Como empresa sediada no Japão, não nomeamos um representante na UE neste momento. Consultas de residentes na UE são tratadas pelo contato de e-mail acima |
| Encarregado de Proteção de Dados (DPO) | Não nomeamos um DPO, pois o tratamento se qualifica como de pequena escala neste momento |

### 1.2 Consentimento

Quando você começa a utilizar o App (utilização como convidado, registro como membro ou login), você concorda com esta Política. Se revisarmos esta Política (exceto correções tipográficas), podemos solicitar que você concorde novamente ao abrir o aplicativo ou fazer login. Se não concordar, você pode sair e deixar de utilizar o App.

Permissões para localização, câmera, notificações e recursos similares são solicitadas separadamente por meio das caixas de diálogo de permissão do sistema operacional quando você utiliza cada recurso. Você pode desativar as notificações a qualquer momento nas configurações do dispositivo.

Registramos a data e a hora do consentimento a esta Política e a versão da Política no seu dispositivo e na nuvem (Firebase).

---

## 2. Informações que coletamos e finalidades de uso

O App coleta e utiliza as informações abaixo para gerenciar registros de passeios, compartilhar dados dentro de famílias, fazer backup de dados na nuvem e melhorar a qualidade do serviço. Exceto quando necessário para nossas operações, não revisamos individualmente o conteúdo registrado pelos usuários.

### 2.1 Informações inseridas por você

**Informações coletadas**

- **Informações da conta**: Nome de exibição, endereço de e-mail (quando registrado), método de autenticação (convidado / e-mail)
- **Informações sobre pets**: Nome, raça/tipo, sexo, data de nascimento, dia de adoção, data de despedida (opcional), nome do grupo (opcional), foto de perfil
- **Registros de passeios**: Hora de início/fim, distância, duração, rota GPS (coordenadas de latitude/longitude), pets no passeio, localizações de fezes/marcas personalizadas, memos, fotos tiradas durante os passeios, instantâneo meteorológico no início do passeio (temperatura, ícone do clima, etc.)
- **Código familiar**: Identificador para entrar e compartilhar um grupo familiar (family ID no Firestore)

**Finalidade de uso**

Criar, armazenar e visualizar registros de passeios com pets, compartilhar registros dentro de famílias e fazer backup seguro de dados na nuvem.

**Tratamento**

Os dados inseridos são armazenados no Google Firebase (Cloud Firestore, Cloud Storage) utilizando comunicação criptografada (HTTPS). Apenas membros da família que compartilham o mesmo código familiar e possuem acesso legítimo podem visualizá-los.

**Base legal (referência para usuários na UE)**

O tratamento baseia-se na execução de um contrato necessário para prestar o Serviço e no seu consentimento (incluindo permissões do dispositivo para localização, câmera, notificações, etc.).

---

### 2.2 Câmera e fotos

**Informações coletadas**

Coletadas apenas quando você concede permissão e utiliza a câmera do dispositivo ou a biblioteca de fotos.

**Finalidade de uso**

- Registrar fotos de perfil de pets
- Tirar e armazenar fotos de passeios durante ou após os passeios na nuvem
- Salvar opcionalmente fotos na biblioteca de fotos do dispositivo (com base nas configurações)

**Tratamento**

As imagens são armazenadas no Firebase Cloud Storage e podem ser visualizadas apenas por usuários no mesmo grupo familiar. Não capturamos imagens em segundo plano nem coletamos imagens para fins não relacionados.

---

### 2.3 Informações de localização

**Informações coletadas**

Com a sua permissão, coletamos a localização do dispositivo (GPS) enquanto você utiliza o recurso de passeio. Se a localização em segundo plano estiver habilitada, podemos coletar a localização enquanto o aplicativo estiver fechado ou enquanto você utiliza outros aplicativos, a fim de registrar a rota do seu passeio.

Para exibir o clima quando um passeio começa, podemos enviar temporariamente latitude e longitude ao OpenWeatherMap e anexar os dados meteorológicos resultantes ao registro do passeio.

**Finalidade de uso**

- Registrar início e fim do passeio
- Calcular a distância percorrida
- Exibir rotas em um mapa
- Mostrar e registrar o clima no início do passeio

**Tratamento**

Os dados de localização e rota são armazenados no Cloud Firestore e podem ser visualizados apenas por usuários no mesmo grupo familiar. Não coletamos localização para fins não relacionados quando você não está utilizando o recurso de passeio. A precisão pode variar conforme as configurações do dispositivo e as condições de sinal.

No dispositivo, podemos utilizar armazenamento local (AsyncStorage) apenas durante um passeio ativo para armazenar temporariamente a rota. Isso é removido quando o passeio é salvo ou descartado.

---

### 2.4 Notificações push

**Informações coletadas**

Com a sua permissão, acessamos o recurso de notificação do dispositivo e obtemos um token do dispositivo (Expo Push Token) necessário para entregar notificações push.

**Finalidade de uso**

- Notificar membros da família quando um passeio termina
- Entregar avisos e mensagens relacionadas ao serviço do App

**Tratamento**

Os tokens são armazenados no Cloud Firestore vinculados à sua conta. O conteúdo das notificações limita-se ao necessário para operar o App. Não utilizamos notificações para publicidade de terceiros.

Você pode desativar as notificações a qualquer momento nas configurações de notificação do dispositivo ou do sistema operacional.

---

### 2.5 Autenticação e contas

**Informações coletadas**

- Identificador de usuário anônimo emitido para login de convidado (anônimo)
- Informações da conta ao registrar-se ou fazer login com e-mail e senha
- Identificadores, endereço de e-mail, nome de exibição, etc. recebidos via Google e Firebase Authentication ao entrar com Google (varia conforme suas configurações e consentimento do Google)
- Identificadores, endereço de e-mail (ou endereço de relay privado da Apple), nome de exibição, etc. recebidos via Apple e Firebase Authentication ao entrar com Apple (varia conforme suas configurações e consentimento da Apple)
- Continuidade do mesmo identificador de usuário ao fazer upgrade de conta de convidado para registro como membro

**Finalidade de uso**

Autenticação de usuários, proteção e transferência de dados e gestão da participação em grupos familiares.

**Tratamento**

Os dados de autenticação são gerenciados pelo Firebase Authentication. Não visualizamos nem armazenamos diretamente senhas; elas são tratadas com segurança pela plataforma de autenticação. As informações recebidas do login com Google ou Apple são utilizadas apenas para criar contas, fazer login ou vincular a contas existentes.

---

### 2.6 Recursos Premium e cobrança

**Informações coletadas**

- Status Premium para a unidade familiar (expiração, etc., incluindo `premiumExpiresAt` no Cloud Firestore)
- Informações relacionadas a compras, restauração e status de assinatura via Apple App Store / Google Play
- Para cobrança, family ID (utilizado como App User ID), metadados de transações de compra, etc. podem ser enviados a plataformas de cobrança como RevenueCat (RevenueCat, Inc.)

**Finalidade de uso**

- Fornecer recursos Premium
- Gerenciar o status para que **uma assinatura por família habilite o Premium para todos os membros que compartilham o mesmo código familiar**
- Restaurar compras, prevenir uso indevido e fornecer suporte

**Tratamento**

- O processamento de pagamentos (números de cartão de crédito, etc.) é tratado pela **Apple / Google**. Não armazenamos informações de cartão de pagamento.
- Cobrança, cancelamento, reembolsos e renovação automática seguem os termos e procedimentos de cada loja.

---

## 3. Período de retenção

| Tipo de dado | Período de retenção |
|--------------|---------------------|
| Dados de conta, família, pets e passeios | Até você excluir sua conta, ou até o último membro de um grupo familiar excluir sua conta |
| Dados de conta de convidado | Excluídos quando você executa “Sair (descartar dados)” enquanto ainda é convidado |
| Tokens de notificação push | Sobrescritos ou excluídos quando a conta é excluída ou o dispositivo é registrado novamente |
| Rota temporária no dispositivo durante um passeio | Excluída quando o passeio é salvo ou descartado |

Exceto quando a retenção for exigida por lei, não mantemos dados além dos períodos acima para fins não relacionados.

---

## 4. Exclusão de dados

Você pode excluir dados no App da seguinte forma.

### 4.1 Exclusão de conta de membro

Em Configurações → “Excluir conta”, você pode excluir sua conta de membro conectada.

- Suas informações de usuário e sua entrada na lista de membros da família são excluídas.
- Se você for o **último membro** de um grupo familiar, todos os pets, registros de passeios e fotos (incluindo arquivos no Cloud Storage) vinculados a essa família também são excluídos.
- Se **outros membros da família permanecerem**, pets compartilhados e registros de passeios permanecem; apenas suas informações de conta são excluídas.

Por segurança, pode ser necessário um login recente. Nesse caso, saia, faça login novamente e tente a exclusão outra vez.

### 4.2 “Sair (descartar dados)” para convidados

Se você sair como convidado e escolher “Sair (descartar dados)”, os registros na nuvem (passeios, pets, fotos, etc.) e a conta anônima são excluídos e não podem ser restaurados.

Para manter seus dados, utilize o registro gratuito como membro (vincular uma conta de e-mail). Se fizer upgrade de convidado para membro, os registros existentes são transferidos para a mesma conta.

### 4.3 Logout de membro

Se um membro sair normalmente, os dados na nuvem não são excluídos. Você pode acessá-los novamente no próximo login.

### 4.4 Exclusão mediante solicitação

Se não puder utilizar o acima ou desejar excluir outros dados pessoais, entre em contato conosco pelo endereço no final desta Política. Responderemos dentro de um prazo razoável.

---

## 5. Serviços de terceiros e transferências de dados

O App utiliza os serviços de terceiros abaixo para armazenamento, autenticação, mapas, clima, notificações e funcionalidade do aplicativo. Os dados podem ser enviados conforme exigido pela política de privacidade de cada serviço. Não vendemos nem fornecemos a terceiros o conteúdo registrado pelos usuários para publicidade.

### 5.1 Plataforma do app e armazenamento

| Item | Detalhes |
|------|----------|
| Serviço | Google Firebase (Cloud Firestore, Authentication, Cloud Storage) |
| Dados enviados | Informações da conta, dados de pets e passeios, imagens, localização, tokens push |
| Finalidade | Autenticação, armazenamento em nuvem, compartilhamento dentro de famílias |
| Política de privacidade | [Google Privacy & Terms](https://policies.google.com/privacy) / [Firebase Privacy and Security](https://firebase.google.com/support/privacy) |

Os dados podem ser armazenados na infraestrutura em nuvem do Google e **transferidos para fora do Espaço Econômico Europeu (EEE)** (por exemplo, Japão, Estados Unidos).

Confiamos nos termos de processamento de dados do Google (incluindo disposições de proteção de dados) e nas **Cláusulas Contratuais Padrão (SCC)** e outras salvaguardas apropriadas ao utilizar o Firebase.

### 5.2 Entrega de notificações push

| Item | Detalhes |
|------|----------|
| Serviço | Expo (Expo Push Notification Service) e infraestrutura de notificação Apple / Google |
| Dados enviados | Tokens do dispositivo e metadados necessários para entrega |
| Finalidade | Entregar notificações push |
| Política de privacidade | [Expo Privacy Policy](https://expo.dev/privacy) |

### 5.3 Mapas

O App utiliza `react-native-maps` para exibir rotas de passeios. **O provedor de mapas depende do sistema operacional do seu dispositivo.**

#### 5.3.1 Android

| Item | Detalhes |
|------|----------|
| Serviço | Google Maps Platform |
| Dados enviados | Dados de solicitação necessários para exibir mapas (comunicação do dispositivo com o Google) |
| Finalidade | Exibir rotas de passeios em um mapa |
| Política de privacidade | [Google Privacy & Terms](https://policies.google.com/privacy) |

#### 5.3.2 iOS

| Item | Detalhes |
|------|----------|
| Serviço | Apple Maps (MapKit) |
| Dados enviados | Dados de solicitação necessários para buscar tiles de mapa (comunicação do dispositivo com a Apple) |
| Finalidade | Exibir rotas de passeios em um mapa |
| Política de privacidade | [Apple Privacy Policy](https://www.apple.com/legal/privacy/) |

### 5.4 Clima (no início do passeio)

| Item | Detalhes |
|------|----------|
| Serviço | OpenWeatherMap |
| Dados enviados | Latitude e longitude no início do passeio |
| Finalidade | Mostrar o clima no início do passeio e anexá-lo ao registro |
| Política de privacidade | [OpenWeatherMap Privacy Policy](https://openweathermap.org/privacy-policy) |

### 5.5 Compras no app (assinaturas Premium)

| Item | Detalhes |
|------|----------|
| Serviço | RevenueCat (RevenueCat, Inc.), Apple App Store, Google Play |
| Dados enviados | Family ID (App User ID para cobrança), informações de transações para compra/restauração, metadados do dispositivo e da loja |
| Finalidade | Comprar e restaurar assinaturas Premium, gerenciar status ativo, compartilhar recursos dentro de uma família |
| Política de privacidade | [RevenueCat Privacy Policy](https://www.revenuecat.com/privacy) / [Apple Privacy Policy](https://www.apple.com/legal/privacy/) / [Google Privacy & Terms](https://policies.google.com/privacy) |

---

## 6. Divulgação a terceiros

Adotamos medidas de segurança necessárias e apropriadas para as informações que tratamos. Exceto quando exigido por lei ou para proteger a vida, a integridade física ou os bens, não fornecemos informações pessoais a terceiros sem o consentimento do usuário.

Entre membros que compartilham um código familiar, informações sobre pets e registros de passeios são mutuamente visíveis por design. Os usuários são responsáveis pela gestão dos códigos familiares.

---

## 7. Seus direitos (incluindo usuários na UE)

Quando a lei aplicável permitir, você pode ter os seguintes direitos:

- **Direito de acesso**: Solicitar a divulgação dos dados pessoais que mantemos sobre você
- **Direito de retificação**: Solicitar a correção de dados pessoais imprecisos
- **Direito de exclusão**: Solicitar a exclusão de dados pessoais (via exclusão no app ou nosso endereço de contato)
- **Direito de restrição ou oposição**: Em certas condições, restringir o tratamento ou opor-se ao tratamento
- **Direito à portabilidade de dados**: Solicitar exportação em formato estruturado (JSON) via Configurações → “Exportar dados” (versão resumida ou completa; fotos incluídas como URLs do Storage no JSON)

Usuários residentes na UE podem ter o direito de apresentar reclamação a uma autoridade supervisora em seu país de residência.

---

## 8. Isenção de responsabilidade

O App destina-se a ajudar a registrar passeios com pets e compartilhar informações dentro de famílias. Distância registrada, rotas, clima e dados similares dependem do dispositivo, do ambiente e das configurações e podem não corresponder exatamente aos passeios reais. Não nos responsabilizamos por problemas ou danos decorrentes do uso do App.

O App não substitui diagnóstico ou tratamento por um veterinário. Se o seu pet apresentar problemas de saúde, consulte um veterinário ou outro profissional qualificado.

---

## 9. Contato

Para dúvidas sobre esta Política, solicitações relativas a dados pessoais ou suporte ao App, entre em contato:

| Item | Detalhes |
|------|----------|
| Nome comercial | Annie Works |
| Representante | Toshiya Karimata |
| Atividades comerciais | Planejamento, desenvolvimento e operação de aplicativos para smartphone |
| Endereço | ParkFront Hakataekimae 1-chome 5F-B, 1-23-2 Hakataekimae, Hakata-ku, Fukuoka-shi, Fukuoka 812-0011, Japan |
| Contato | support@annie-works.com |

---

## 10. Alterações a esta Política

Podemos revisar esta Política quando as leis ou o Serviço mudarem. A Política revisada entra em vigor quando publicada neste site ou em canais similares. Para alterações importantes, podemos notificá-lo no App ou no site.

---

*Publicado em: https://www.annie-works.com/pt/AnnieWalkingLog/Privacy-Policy*
