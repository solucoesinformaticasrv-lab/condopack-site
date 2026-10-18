# CondoPack — site institucional

Site institucional do **CondoPack**, software (SaaS) de gestão de encomendas para portarias de condomínios no Brasil.

Publicado com GitHub Pages em: https://solucoesinformaticasrv-lab.github.io/condopack-site/

O site também serve para a verificação de empresa da Meta (WhatsApp Business Platform): usa HTTPS, explica a atividade da empresa e mostra no rodapé de todas as páginas a razão social, o CNPJ e o endereço.

## Páginas

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Início: apresentação, como funciona, funcionalidades, planos e contato |
| `privacidade.html` | Política de Privacidade (LGPD) |
| `termos.html` | Termos de Uso |
| `portaria.html` | Redireciona o morador ao WhatsApp da portaria: `portaria.html?n=55DDDNUMERO` (só aceita número brasileiro e só abre o WhatsApp) |
| `assets/style.css` | Estilos (cores, fonte Inter, layout responsivo) |
| `assets/script.js` | Menu no celular |
| `assets/favicon.svg` | Ícone do site |

HTML e CSS estáticos, sem frameworks e sem etapa de build.

## Como atualizar

1. Edite os arquivos `.html` (ou `assets/style.css`) diretamente no GitHub (botão ✏️ no arquivo) ou no seu computador.
2. Para ver localmente, abra `index.html` no navegador (ou rode `python3 -m http.server` na pasta e acesse http://localhost:8000).
3. Faça commit na branch `main`. O GitHub Pages publica sozinho em 1–2 minutos (acompanhe em **Actions**).

**Importante:** o rodapé (razão social, CNPJ e endereço) e o cabeçalho se repetem nas páginas (a `portaria.html` tem um rodapé próprio, mais simples). Se mudar algum desses dados, altere em **todas** elas, inclusive na `portaria.html` — a linha fica dentro de `<p class="legal-line">`.

## Domínio próprio

Para usar um domínio como `condopack.com.br`: em **Settings → Pages → Custom domain**, informe o domínio e configure o DNS no Registro.br (registros `A` do domínio raiz para os IPs do GitHub Pages e `CNAME` de `www` para `solucoesinformaticasrv-lab.github.io`). Depois ative **Enforce HTTPS** e atualize os links `canonical`/`og:url` nas páginas.
