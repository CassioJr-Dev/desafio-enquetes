import 'dotenv/config';
import { buildApp } from './app.js';

const app = buildApp();
const port = Number.parseInt(process.env.PORT ?? '3000', 10);

app.log.level = 'info';

const start = async () => {
    try {
        await app.listen({
            port: Number.isNaN(port) ? 3000 : port,
        });

        console.log('Servidor rodando');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
