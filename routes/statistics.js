/* eslint-disable no-plusplus */
/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-case-declarations */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-loop-func */
const express = require('express');

const router = express.Router();

const User = require('../models/user');
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
  let avg = 0;
  let userData = null;
  let aux = null;

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
              totalCategory += responses.length;
            }
          }
        }
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

    case 'categoryRate':
      // Create an array of categories
      const categories = Opinion.schema.path('category').enumValues;
      // Find user data
      user = await User.findById(query.user);
      // Array to store each category with the avg
      avg = [];
      if (categories) {
        for (const category of categories) {
          let totalCategory = 0;
          likeUser = 0;
          // Find all opinions of a specific category
          opinions = await Opinion.find({ category }).select('_id');
          if (opinions.length > 0) {
            // Traverse opinions array
            for (const opinion of opinions) {
              // Find all the responses for a specific opinion
              responses = await Response.find({ opinion });
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
                  // Acumulate the total of people that has responded the same as the user for this opinion
                  likeUser += total;
                  totalCategory += responses.length;
                }
              }
            }
            // Calculate the % of the user to this category
            const result = Math.round(((likeUser / totalCategory) * 100) * 100) / 100;
            // Add stat to avg array
            if (likeUser > 0) {
              avg.push({
                category,
                percent: result,
                totalOpinions: totalCategory,
              });
            }
          }
        }
        if (avg.length > 0) {
          data = {
            message: `${user.username} statistics per category.`,
            stats: {
              avg,
            },
            request: {
              type: 'GET',
              url: `${process.env.HEROKU}/opinions/${query.user}`,
            },
          };
        } else {
          data = {
            message: `Sorry, ${user.username} doesn't have responses yet.`,
            stats,
          };
        }
      } else {
        data = {
          message: "Sorry, there aren't any categories in the API.",
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
        }
        data = {
          message: `${user.username} response statistics.`,
          stats: {
            user,
            responses,
          },
        };
      } else {
        data = {
          message: `Sorry, ${user.username} doesn't have responses yet.`,
          stats,
        };
      }

      break;

    case 'userRate':
      // Find all responses of a specific user
      userResponses = await Response.find({ user: query.user }).populate('user');
      // If it hasn't responded to any opinion
      if (userResponses.length === 0) {
        data = {
          message: "Sorry, the user hasn't responded to any opinion yet.",
          stats,
        };
      } else {
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
            userResponseResponses = await Response.find({ opinion: resp.opinion });
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
          }
          // Calculate the % of the people that has responded the same globaly
          avg = Math.round(((likeUser / totalResponses) * 100) * 100) / 100;
          data = {
            message: `${user.username} rate statistics.`,
            stats: {
              user,
              avg,
            },
          };
        } else {
          data = {
            message: `Sorry, ${user.username} doesn't have responses yet.`,
            stats,
          };
        }
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

    case 'matchRate':
      // Users objects with name and link to him profile (to return with json)
      userData = await User.findById(query.user);
      user = {
        username: userData.username,
        request: {
          type: 'GET',
          url: `${process.env.HEROKU}/users/${userData._id}`,
        },
      };
      userData = await User.findById(query.userMatch);
      const userMatch = {
        username: userData.username,
        request: {
          type: 'GET',
          url: `${process.env.HEROKU}/users/${userData._id}`,
        },
      };
      // Find all responses of user
      aux = await Response.find({ user: query.user }).select('opinion -_id');
      userResponses = aux.map(({ opinion }) => String(opinion));
      if (userResponses.length > 0) {
        // Find all responses of userMatch
        aux = await Response.find({ user: query.userMatch }).select('opinion -_id');
        const userMatchResponses = aux.map(({ opinion }) => String(opinion));

        if (userMatchResponses.length > 0) {
          // Find intersection between the two arrays
          const intersection = userResponses.filter(response => userMatchResponses.includes(response));
          if (intersection.length > 0) {
            // Find all the opinions responded by both users
            const matchingResponses = await Response
              .find({
                $and: [
                  { opinion: { $in: intersection } },
                  {
                    $or: [
                      { user: query.user },
                      { user: query.userMatch },
                    ],
                  },
                ],
              });

            // Count conincidences between users responses
            let matches = 0;
            intersection.forEach((opinion) => {
              const auxi = matchingResponses.filter(resp => resp.opinion == opinion);
              if (auxi[0].response === auxi[1].response) {
                matches++;
              }
            });

            // Calculate the % of match between users
            avg = Math.round(((matches / intersection.length) * 100) * 100) / 100;

            data = {
              message: `${user.username} & ${userMatch.username} affinity.`,
              avg,
            };
          } else {
            data = {
              message: "Sorry, there aren't matching responses.",
              stats,
            };
          }
        } else {
          data = {
            message: `Sorry, ${userMatch.username} doesn't have responses yet.`,
            stats,
          };
        }
      } else {
        data = {
          message: `Sorry, ${user.username} doesn't have responses yet.`,
          stats,
        };
      }
      break;

    case 'inMyZoneRate':
      // Users objects with name and link to him profile (to return with json)
      userData = await User.findById(query.user);
      user = {
        username: userData.username,
        request: {
          type: 'GET',
          url: `${process.env.HEROKU}/users/${userData._id}`,
        },
      };
      // Find all responses of user
      aux = await Response.find({ user: query.user }).select('opinion -_id');
      userResponses = aux.map(({ opinion }) => String(opinion));
      if (userResponses.length > 0) {
        // Find all responses of nearUopers
        aux = await Response.find({ user: { $in: query.nearUopers } }).select('opinion -_id');
        const nearUopersResponses = aux.map(({ opinion }) => String(opinion));
        if (nearUopersResponses.length > 0) {
          // Find intersection between the user responses and all nearUopers responses
          aux = nearUopersResponses.filter(opinion => userResponses.includes(opinion));
          // Find all opinions responded by all nearUopers
          const intersection = userResponses.map(opinion => {
            let cont = nearUopersResponses.filter(element => element == opinion).length;
            if (cont === 3) {
              return opinion;
            }
          });
          if (intersection.length > 0) {
            // Find all the opinions responded by all users
            const matchingResponses = await Response
              .find({
                $and: [
                  { opinion: { $in: intersection } },
                  {
                    $or: [
                      { user: { $in: query.nearUopers } },
                    ],
                  },
                ],
              });
            // Count conincidences between users responses
            let matches = 0;
            intersection.forEach((opinion) => {
              // Find all responses of this opinion
              aux = matchingResponses.filter(resp => resp.opinion == opinion);
              // Find what the user has responded to that specific opinion
              const userResponseIndex = aux.findIndex(resp => resp.user.equals(query.user));
              let userLike = 0;
              aux.forEach((op) => {
                if (op.response == aux[userResponseIndex].response) {
                  userLike++;
                }
              });
              matches += userLike;
            });
            console.log(`Matches: ${matches}, total: ${matchingResponses.length}`);
            // Calculate the % of match between users
            avg = Math.round(((matches / matchingResponses.length) * 100) * 100) / 100;
            data = {
              message: `${user.username} acceptance in this zone.`,
              stats: {
                avg, // Average of how many users has responded like user
                matches, // How many users has responded like user
                totalResponses: matchingResponses.length, // Total responses in the zone
              },
            };
          } else {
            data = {
              message: "Sorry, there aren't matching responses.",
              stats,
            };
          }
        } else {
          data = {
            message: `Sorry, nearUopers doesn't have response to the same opinions.`,
            stats,
          };
        }
      } else {
        data = {
          message: `Sorry, ${user.username} doesn't have responses yet.`,
          stats,
        };
      }
      break;

    case 'inMyZoneCategory':
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
