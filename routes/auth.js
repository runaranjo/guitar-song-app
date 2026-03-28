import express from "express";
import bcrypt from "bcrypt";
import { saveNewUser, doesUserExist, getUserByEmail } from "../db/queries.js";

const router = express.Router();

router.get('/register', (req, res) => {
    res.render('register.ejs', { error: null })
});

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const userExists = await doesUserExist(email);
        if (userExists) {
            return res.render('register.ejs', { error: 'Email already registered' });
        }
        const hashed_password = await bcrypt.hash(password, 10);
        await saveNewUser(username, email, hashed_password);
        res.redirect('/login');
    } catch (error) {
        console.error('Error registering user:', error);
        res.render('register.ejs', { error: 'Something went wrong. Please try again.' });
    }
});

router.get('/login', (req, res) => {
    res.render('login.ejs', { error: null })
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userExists = await doesUserExist(email);
        if (!userExists) {
            return res.render('login.ejs', { error: 'Email not found' });
        }

        const user = await getUserByEmail(email);
        const passwordMatch = await bcrypt.compare(password, user.hashed_password);

        if (!passwordMatch) {
            return res.render('login.ejs', { error: 'Incorrect password' });
        }

        req.session.user = { id: user.user_id, username: user.user_name };
        console.log('Session after login:', req.session.user);
        res.redirect('/home');

    } catch (error) {
        console.error('Error logging in:', error);
        res.render('login.ejs', { error: 'Something went wrong. Please try again.' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

export default router;
