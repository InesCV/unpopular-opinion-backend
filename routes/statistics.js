/* eslint-disable no-restricted-syntax */
/* eslint-disable no-loop-func */
const express = require('express');

const router = express.Router();

// const User = require('../models/user');
const Opinion = require('../models/opinion');
const Response = require('../models/response');

const { isLoggedIn } = require('../helpers/middlewares');

router.use(isLoggedIn('user'));

router.post('/', async (req, res, next) => {
  const query = req.body;
  let data = null;
  let total = 0;
  const stats = null;
  let responses = null;
  let responseIndex = null;
  let opinions = null;
  let userResponses = 0;
  let userResponseResponses = null;
  let user = null;
  let likeUser = 0;
  let unlikeUser = 0;

  if (!Object.prototype.hasOwnProperty.call(query, 'user')) {
    query.user = req.session.currentUser._id;
  }

  switch (query.type) {
    case 'category':
      // Find all opinions of an specific category
      opinions = await Opinion.find({ category: query.category }).select('_id');
      if (opinions.length > 0) {
        let totalCategory = 0;
        for (const opinion of opinions) {
          // Find all responses to an specific opinion
          responses = await Response.find({ opinion: opinion._id });
          if (responses.length > 0) {
            // Find what the user has responded to that specific opinion
            responseIndex = responses.findIndex(resp => resp.user.equals(query.user));
            // Count how many people have responded the same as the user
            if (responseIndex >= 0) {
              total = responses.reduce((cont, resp) => {
                if (resp.response == responses[responseIndex].response) {
                  return cont + 1;
                }
                return cont;
              }, 0);
              // Calculate the % of the people that has responded the same as the user for this opinion
              likeUser += total;
              unlikeUser += (responses.length - likeUser);
              totalCategory += responses.length;
            }
          }
        };
        // Calculate the % of each response to this category
        const result = Math.round(((likeUser / totalCategory) * 100) * 100) / 100;

        if (likeUser === 0) {
          data = {
            message: `User don't have responded any Opinion of ${query.category}`,
            stats: {
              avg: null,
            },
          };
        } else {
          data = {
            message: `${query.category} statistics.`,
            stats: {
              avg: result,
              totalOpinions: totalCategory,
            },
          };
        }

      } else {
        data = {
          message: `Sorry, ${query.category} doesn't have any response yet.`,
          stats,
        };
      }

      break;

    case 'user':
      // Find all responses of a specific user
      userResponses = await Response.find({ user: query.user }).populate('opinion user');
      // User object with name and link to him profile (to return with json)
      user = {
        username: userResponses[0].user.username,
        request: {
          type: 'GET',
          url: `${process.env.HEROKU}/users/${userResponses[0].user._id}`,
        },
      };
      // Array to store all the avg for opinion responsed by the user
      responses = [];
      if (userResponses.length > 0) {
        // Calculate statistics for each Opinion that the user has responded
        for (const resp of userResponses) {
          // Find all responses to this opinion
          userResponseResponses = await Response.find({ opinion: resp.opinion });
          if (userResponseResponses.length > 0) {
            // Count how many people have responded the same as the user
            total = userResponseResponses.reduce((cont, respo) => {
              if (respo.response == resp.response) {
                return cont + 1;
              }
              return cont;
            }, 0);
            // Calculate the % of the people that has responded the same as the user
            total = Math.round(((total / userResponseResponses.length) * 100) * 100) / 100;
          }
          // Take basic values of the Opinion to make the response object to store
          const { _id, author, category } = resp.opinion;
          // Add the Opinion stats object to the responses array
          responses.push({
            opinion: {
              _id,
              author,
              category,
              avg: total, // How many people have responded the same as the user for this Opinion
              totalResponses: userResponseResponses.length,
              request: {
                type: 'GET',
                url: `${process.env.HEROKU}/opinions/${_id}`,
              },
            },
          });
        };
        data = {
          message: `${user.username} response statistics.`,
          stats: {
            user,
            responses,
          },
        };
      } else {
        data = {
          message: `Sorry, ${user.username} doesn't have response yet.`,
          stats,
        };
      }

      break;

    case 'userRate':
      // Find all responses of a specific user
      userResponses = await Response.find({ user: query.user }).populate('user');
      // User object with name and link to him profile (to return with json)
      user = {
        username: userResponses[0].user.username,
        request: {
          type: 'GET',
          url: `${process.env.HEROKU}/users/${userResponses[0].user._id}`,
        },
      };
      if (userResponses.length > 0) {
        let totalResponses = 0;
        // Use for of loop to control the forEach async
        for (const resp of userResponses) {
          // Find all responses to this opinion
          userResponseResponses = Response.find({ opinion: resp.opinion });
          totalResponses += userResponseResponses.length;
          // Count how many people have responded the same as the user
          total = userResponseResponses.reduce((cont, respo) => {
            if (respo.response == resp.response) {
              return cont + 1;
            }
            return cont;
          }, 0);
          // Store how many users have response the same as the user globaly
          likeUser += total;
          // Store how many users haven't response the same as the user globaly
          unlikeUser += (userResponseResponses.length - total);
        };
        // Calculate the % of the people that has responded the same globaly
        const avg = Math.round(((likeUser / totalResponses) * 100) * 100) / 100;
        data = {
          message: `${user.username} rate statistics.`,
          stats: {
            user,
            avg,
          },
        };
      } else {
        data = {
          message: `Sorry, ${user.username} doesn't have response yet.`,
          stats,
        };
      }

      break;

    case 'opinion':
      // Find all responses to an specific opinion
      responses = await Response.find({ opinion: query.opinion }).populate('user');
      if (responses.length > 0) {
        let xVotes = 0;
        let yVotes = 0;
        const users = [];

        // Count how many people have responded the same to an specific opinion
        responses.forEach((resp) => {
          if (resp.response == 'x') {
            xVotes++;
          } else {
            yVotes++;
          }
          user = {
            username: resp.user.username,
            response: resp.user.response,
            request: {
              type: 'GET',
              url: `${process.env.HEROKU}/users/${resp.user._id}`,
            },
          };
          users.push(user);
        });

        // Calculate the % of the people that has responded the same to an specific opinion
        const totalVotes = responses.length;
        // Round avg to 2 decimals
        const xAvg = Math.round(((xVotes / totalVotes) * 100) * 100) / 100;
        const yAvg = Math.round(((yVotes / totalVotes) * 100) * 100) / 100;

        // Return data.stats object with extended values
        data = {
          message: 'Opinion statistics.',
          stats: {
            xVotes, // How many users has responded X
            yVotes, // How many users has responded Y
            totalVotes, // // How many users has responded
            xAvg, // Average of how many users has responded X
            yAvg, // Average of how many users has responded Y
            users, // Array with tthe users that have response to this opinion and they response
          },
        };
      } else {
        data = {
          message: "Sorry, this Opinion doesn't have any response yet.",
          stats,
        };
      }

      break;

    case 'opinionRate':
      // Find all responses to an specific opinion
      responses = await Response.find({ opinion: query.opinion });
      if (responses.length > 0) {
        // Find what the user has responded to that specific opinion
        responseIndex = responses.findIndex(resp => resp.user.equals(query.user));
        // Count how many people have responded the same as the user
        if (responseIndex >= 0) {
          total = responses.reduce((cont, resp) => {
            if (resp.response == responses[responseIndex].response) {
              return cont + 1;
            }
            return cont;
          }, 0);
        }
        // Calculate the % of the people that has responded the same as the user
        total = Math.round(((total / responses.length) * 100) * 100) / 100;
        data = {
          message: 'Opinion rate statistics.',
          stats: {
            avg: total,
          },
        };
      } else {
        data = {
          message: "Sorry, this Opinion doesn't have any response yet.",
          stats,
        };
      }

      break;

    case 'opinionScore':
      // Find all responses to an specific opinion
      responses = await Response.find({ opinion: query.opinion });

      if (responses.length > 0) {
        let xVotes = 0;
        let yVotes = 0;

        // Count how many people have responded the same
        responses.forEach((resp) => {
          if (resp.response == 'x') {
            xVotes++;
          } else {
            yVotes++;
          }
        });

        // Calculate the % of the people that has responded the same
        const totalVotes = responses.length;
        const xAvg = Math.round(((xVotes / totalVotes) * 100) * 100) / 100;
        const yAvg = Math.round(((yVotes / totalVotes) * 100) * 100) / 100;

        // Return data.stats object with extended values
        data = {
          message: 'Opinion score statistics.',
          stats: {
            xVotes, // How many users has responded X
            yVotes, // How many users has responded Y
            totalVotes, // // How many users has responded
            xAvg, // Average of how many users has responded X
            yAvg, // Average of how many users has responded Y
          },
        };
      } else {
        data = {
          message: "Sorry, this Opinion doesn't have any response yet.",
          stats,
        };
      }

      break;

    default:
      data = {
        message: `Sorry, ${query.type} statistic doesn't exist.`,
        stats,
      };
      res.status(404).json(data);
  }

  res.status(200).json(data);
});

module.exports = router;
