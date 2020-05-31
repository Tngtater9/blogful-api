require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const ArticlesService = require('./articles-service')


const app = express();

const morganSetting = NODE_ENV === 'production' ? 'tiny' : 'dev';

app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

// app.use(function validateBearerToken(req, res, next) {
//     const apiToken = process.env.API_TOKEN
//     const authToken = req.get('Authorization')

//     if (!authToken || authToken.split(' ')[1] !== apiToken) {
//         logger.error(`Unauthorized request to path: ${req.path}`);
//         return res.status(401).json({ error: 'Unauthorized request' })
//     }
//     // move to the next middleware
//     next()
// })

app.get('/', (req, res) => {
    res.send("Hello, boilerplate!")
})

app.get('/articles', (req, res, next) => {
    const knexInstance = req.app.get('db')
    ArticlesService.getAllArticles(knexInstance)
        .then(articles =>
            res.json(articles))
        .catch(next)
})

app.get('/articles/:article_id', (req, res, next) => {
    const knexInstance = req.app.get('db')
    ArticlesService.getById(knexInstance, req.params.article_id)
        .then(article =>{
            if(!article){
                return res
                .status(404)
                .json({ error: { message: `Article doesn't exist` } })
            }
            res.json(article)
        })
        .catch(next)
})

app.use((error, req, res, next) => {
    let response
    if(NODE_ENV === "production") {
        response =  {error: {message: 'server error'}};
    } else {
        console.error(error);
        response = {message: error.message, error};
    }
    res.status(500).json(response);
})

module.exports = app;