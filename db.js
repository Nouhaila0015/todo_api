import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite' ,dialectOptions: {
        timeout: 10000, // Timeout in milliseconds
    },
});

await sequelize.sync({ force: true })

    .then(() => {
        console.log('Database synchronized');
    })
    .catch(err => {
        console.error('Unable to synchronize the database:', err);
    });


export default sequelize;