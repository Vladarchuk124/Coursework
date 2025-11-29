import './config/env.js';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import moviesRouter from './routes/movies.js';
import searchRouter from './routes/search.js';
import showsRouter from './routes/shows.js';
import catalogRouter from './routes/catalog.js';
import homeRouter from './routes/home.js';
import authRouter from './routes/authorization.js';
import listsRouter from './routes/lists.js';
import userRouter from './routes/users.js';
import reviewsRouter from './routes/reviews.js';
import ratingsRouter from './routes/ratings.js';
import recommendationsRouter from './routes/recommendations.js';
import reportsRouter from './routes/reports.js';
import adminRouter from './routes/admin.js';
import actorsRouter from './routes/actors.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/movies', moviesRouter);
app.use('/api/search', searchRouter);
app.use('/api/shows', showsRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/home', homeRouter);
app.use('/api/auth', authRouter);
app.use('/api/lists', listsRouter);
app.use('/api/users', userRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/actors', actorsRouter);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
