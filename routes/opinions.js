const express = require('express');
const createError = require('http-errors');

const router = express.Router();

const Opinion = require('../models/opinion');

// const { isLoggedIn } = require('../helpers/middlewares');

router.get('/', (req, res, next) => {
  res.status(200).json([
    { 
      author: 'Paco is the author',
      category: 'Nonsense',
      question: 'Lo vamos a petar',
      response: {
        x: 'Claro que sí guapi',
        y: 'Ni del Flais'
      }
    },
    { 
      author: 'Made by UOP',
      category: 'Nonsense',
      question: 'su PUTA MADRE',
      response: {
        x: 'Claro que sí guapi',
        y: 'Ni del Flais'
      }
    },
    { 
      author: 'Made by UOP',
      category: 'Nonsense',
      question: 'Has matado a Jorge, tia controlate, lo necesitas para el proyecto',
      response: {
        x: 'Nah, a la mierda todo',
        y: 'Ostias, verdad'
      }
    },
    { 
      author: 'Made by UOP',
      category: 'Nonsense',
      question: 'Si tienes que matar a una persona, ¿a quién matarias?',
      response: {
        x: 'Ines, está claro',
        y: 'Jorge, no doubt'
      }
    },
  ]);
});

router.post('/', async (req, res, next) => {
  const { author, category, question, response } = req.body;
  console.log(req.body)
  try {
    const newOpinion = await Opinion.create({ author, category, question, response })
    req.session.currentUser = newOpinion;
    res.status(200).json(newOpinion);
  } catch (error) {
    next(error);
  }
})

module.exports = router;
