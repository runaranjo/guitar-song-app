import express from "express";

const router = express.Router()

router.get('/', (req, res) => {
    res.render('index.ejs')
})

router.get('/home', (req, res) => {
    res.render('home.ejs')
})


export default router