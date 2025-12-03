COMO ATUALIZAR O LOGO DO APP:
================================

1. Salve sua imagem como: logo-source.png
   (Coloque nesta mesma pasta onde está este arquivo)

2. Abra o PowerShell e rode:
   cd "C:\Users\dougm\Downloads\AppFidelidade_complete_with_auth_frontend\frontend\public"
   node generate-pwa-icons.js

3. Isso vai gerar automaticamente:
   - icon-192x192.png (PWA)
   - icon-512x512.png (PWA)
   - favicon-16x16.png
   - favicon-32x32.png
   - favicon-48x48.png
   - favicon-64x64.png
   - apple-touch-icon-180x180.png (iOS)

4. Rebuild do frontend:
   cd ..
   npm run build

5. Commit e push:
   cd ../..
   git add -A
   git commit -m "update logo"
   git push origin main

IMPORTANTE: O arquivo deve se chamar exatamente "logo-source.png" ou "logo-source.svg"
