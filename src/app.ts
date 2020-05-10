import express from 'express';
import { home } from './routes/home';
const app = express();
app.use(express.json());

app.use('/home', home);
app.get('/', (req, res) => {
    res.send('hello world');
});

app.listen(4000, () => {
    console.log('running on port 4000');
})
