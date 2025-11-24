import './config/env.js';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import moviesRouter from './routes/movies/index.js';
import searchRouter from './routes/searchBar/index.js';
import showsRouter from './routes/shows/index.js';
import authRouter from './routes/authorization/index.js';
import listsRouter from './routes/lists/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/movies', moviesRouter);
app.use('/api/search', searchRouter);
app.use('/api/shows', showsRouter);
app.use('/api/auth', authRouter);
app.use('/api/lists', listsRouter);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
