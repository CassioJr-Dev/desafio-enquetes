import Fastify from 'fastify';

const app = Fastify({
    logger: true,
});

app.get('/', async () => {
    return 'hello word';
});

const start = async () => {
    try {
        await app.listen({
            port: 3000,
        });

        console.log('Servidor rodando');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
