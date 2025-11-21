dev:
	cd backend && npm run dev &
	cd frontend && npm run dev
	
prf:
	cd backend && npm run prisma:format	