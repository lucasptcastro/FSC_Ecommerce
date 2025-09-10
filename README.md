### Anotações

---

O projeto trata-se de um e-commerce de roupas e acessórios. A ideia é que o carrinho não seja armazenado no frontend via estados locais, mas sim no banco de dados para que o usuário consiga acessá-lo a partir de qualquer dispositivo

### Next

- No arquivo "src\components\common\product-item.tsx" há algumas dicas sobre como fazer com que uma imagem ocupe 100% da largura
- É interessante sempre preservar que um componente seja server component ao precisar escolher entre client component e server component para evitar hydration

### ShadCN

- No arquivo "src\components\common\product-item.tsx" é usado a função CN do ShadCN que serve para mergear classes do Tailwind sem conflitar

### React Query

Biblioteca para lidar com fetch dinâmico de dados. Em aplicações onde há requisições constantes para exibir dados em tabelas, filtrar dados das tabelas, ordenar, etc, ela é super importante pois otimiza esses fetches e também gerencia o cache para deixar as requisições mais rápidas

- Nos arquivos "src/app/product-variant/[slug]/components/add-to-cart-button.tsx" e "src/components/common/cart.tsx" há exemplos de como usar o React Query

### TSX

Ferramenta para executar arquivos TypeScript e TSX diretamente no Node.js, sem precisar de um processo de build separado. Ele compila e executa arquivos .ts e .tsx "on the fly", facilitando o desenvolvimento, testes e scripts em projetos TypeScript. É muito usado para rodar scripts, ferramentas de linha de comando ou até servidores de desenvolvimento que usam TypeScript.
