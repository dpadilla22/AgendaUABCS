import express from 'express';
import connect from './db.js';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Server is running baby!');
});

app.get('/Accounts', async (req, res) => {
    let db;
    try {
        db = await connect();
        const query = "SELECT * FROM Account";
        const [rows] = await db.execute(query);
        console.log(rows);

        res.json({
            data: rows,
            status: 200
        });
    } catch(err) {
        console.error(err);
    } finally {
        if(db)
            db.end();
    }
});

app.post('/login', async (req, res) => {
    let db;
    try {
        const { identifierUser, passwordUser } = req.body;

        if (!identifierUser || !passwordUser) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        db = await connect();
       
        const query = 'SELECT nameUser, passwordUser, idAccount FROM Account WHERE identifierUser = ?';
        const [rows] = await db.execute(query, [identifierUser]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const user = rows[0];
        
        console.log('Datos del usuario de la BD:', {
            name: user.nameUser,
            idAccount: user.idAccount
        });

        const isPasswordValid = await bcrypt.compare(passwordUser, user.passwordUser);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

       
        const responseData = {
            success: true,
            message: 'Inicio de sesión exitoso',
            user: {
                name: user.nameUser,
                email: identifierUser,
                idAccount: user.idAccount 
            }
        };

        console.log('Enviando respuesta:', responseData);
        res.json(responseData);

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    } finally {
        if (db) await db.end();
    }
});

app.post('/createAccount', async (req, res) =>{
    let db;
    try {
        const { nameUser, emailUser, passwordUser } = req.body;
        bcrypt.hash(passwordUser, 8, async(error, hash) => {
            if (error) throw error;
            db = await connect();
            const query = `CALL SP_CREATE_ACCOUNT('${nameUser}', '${emailUser}', '${hash}')`;
            const [rows] = await db.execute(query);
            console.log(rows);
            
            res.json({
                data: rows,
                status: 200
            });
        });
    } catch(err) {
        console.error(err);
    } finally {
        if(db)
            db.end();
    };
});