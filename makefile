dev-back:
	cd backend && npm run dev 

dev-front:
	cd frontend && npm run dev

prf:
	cd backend && npm run prisma:format	

migration:
	cd backend && npx prisma migrate dev --name ${name}