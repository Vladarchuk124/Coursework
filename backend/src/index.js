import './config/env.js';

import express from 'express';
import cors from 'cors';
import moviesRouter from './routes/movies/index.js';
import searchRouter from './routes/searchBar/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/movies', moviesRouter);
app.use('/api/search', searchRouter);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
