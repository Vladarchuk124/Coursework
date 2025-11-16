import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import moviesRouter from './routes/movies/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/movies', moviesRouter);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
