import './config/env.js';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import moviesRouter from './routes/movies.js';
import searchRouter from './routes/search.js';
import showsRouter from './routes/shows.js';
import authRouter from './routes/authorization.js';
import listsRouter from './routes/lists.js';
import userRouter from './routes/users.js';

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
app.use('/api/users', userRouter);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
