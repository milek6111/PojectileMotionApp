const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');

// Rejestracja nowego użytkownika
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Sprawdzenie, czy użytkownik już istnieje
        const userExists = await pool.query('SELECT * FROM TI.users WHERE username = $1', [username]);

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Nazwa użytkownika jest już zajęta.' });
        }

        // Hashowanie hasła
        const hashedPassword = await bcrypt.hash(password, 10);

        // Zapis do bazy danych
        await pool.query('INSERT INTO TI.users (username, password) VALUES ($1, $2)', [username, hashedPassword]);

        res.status(201).json({ message: 'Użytkownik zarejestrowany.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Wystąpił błąd podczas rejestracji.' });
    }
});

// Logowanie użytkownika
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    

    try {
        // Pobieranie użytkownika z bazy danych
        const result = await pool.query('SELECT * FROM TI.users WHERE username = $1', [username]);

        if (result.rows.length > 0) {
            const user = result.rows[0];

            // Porównywanie hasła
            if (await bcrypt.compare(password, user.password)) {
                req.session.userId = user.id;
                res.send('Zalogowano pomyślnie.');
            } else {
                res.status(400).json('Niepoprawne hasło.');
            }
        } else {
            res.status(400).json({message: 'Nie znaleziono użytkownika.'});
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({message: 'Wystąpił błąd podczas logowania.'});
    }
});

router.post('/save-parameters', async (req, res) => {
    const { angle, velocity, height } = req.body;
    const userId = req.session.userId; // Pobranie ID użytkownika z sesji

    if (!userId) {
        return res.status(403).json({message: 'Nie jesteś zalogowany.'});
    }

    try {
        await pool.query('INSERT INTO TI.parameters (user_id, angle, velocity, height) VALUES ($1, $2, $3, $4)', [userId, angle, velocity, height]);
        res.send('Parametry zapisane.');
    } catch (error) {
        console.error(error.message);
        res.status(500).json({message: 'Błąd podczas zapisywania parametrów.'});
    }
});

router.get('/is-logged-in', (req, res) => {
    if (req.session.userId) {
        res.json({ isLoggedIn: true });
    } else {
        res.json({ isLoggedIn: false });
    }
});

router.get('/throw-history', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).json({message:'Nie jesteś zalogowany.'});
    }

    try {
        const result = await pool.query('SELECT * FROM TI.parameters WHERE user_id = $1', [req.session.userId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({message: 'Błąd podczas ładowania historii rzutów.'});
    }
});

router.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(500).json({message:'Nie udało się wylogować.'});
            } else {
                res.json({message: 'Wylogowanie pomyślne.'});
            }
        });
    } else {
        res.end();
    }
});

router.get('/username', (req, res) => {
    if (req.session.userId) {
        pool.query('SELECT username FROM TI.users WHERE id = $1', [req.session.userId], (err, result) => {
            if (err) {
                res.status(500).json({ message: 'Błąd serwera' });
            } else {
                res.json({ username: result.rows[0].username });
            }
        });
    } else {
        res.status(403).json({ message: 'Nie jesteś zalogowany' });
    }
});

router.delete('/delete-throw/:id', async (req, res) => {
    const throwId = req.params.id;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(403).json({ message: 'Nie jesteś zalogowany' });
    }

    try {
        await pool.query('DELETE FROM TI.parameters WHERE id = $1 AND user_id = $2', [throwId, userId]);
        res.json({ message: 'Rekord usunięty' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Błąd podczas usuwania rekordu' });
    }
});

module.exports = router;