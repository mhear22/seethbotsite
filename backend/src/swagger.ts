import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Seethbot API',
      version: '1.0.0',
      description: 'Interactive API documentation for the Seethbot backend services',
      contact: {
        name: 'Seethbot Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: '/api',
        description: 'API base path'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for authentication (format: sk_xxxxx)'
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API Key',
          description: 'API key as Bearer token (format: Bearer sk_xxxxx)'
        }
      },
      schemas: {
        Stock: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Cam'
            },
            avatar: {
              type: 'string',
              example: '🥔'
            },
            price: {
              type: 'number',
              format: 'float',
              example: 100.50
            },
            coolnessScore: {
              type: 'number',
              format: 'float',
              example: 10000
            },
            shares: {
              type: 'integer',
              example: 100
            },
            priceHistory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string', format: 'date-time' },
                  price: { type: 'number' }
                }
              }
            }
          }
        },
        Movie: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            title: {
              type: 'string',
              example: 'The Matrix'
            },
            suggestedBy: {
              type: 'string',
              example: 'Cam'
            },
            year: {
              type: 'integer',
              example: 1999
            },
            genre: {
              type: 'string',
              example: 'Sci-Fi'
            },
            notes: {
              type: 'string',
              example: 'Classic cyberpunk film'
            },
            thumbnail: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/poster.jpg'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Vote: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              example: 'user123'
            },
            rankings: {
              type: 'array',
              items: {
                type: 'integer'
              },
              example: [1, 3, 2]
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        VotingRound: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            startDate: {
              type: 'string',
              format: 'date-time'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              nullable: true
            },
            movieIds: {
              type: 'array',
              items: {
                type: 'integer'
              },
              example: [1, 2, 3]
            },
            winner: {
              type: 'integer',
              nullable: true,
              example: 1
            }
          }
        },
        UserPortfolio: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              example: 'user123'
            },
            cash: {
              type: 'number',
              format: 'float',
              example: 10000.00
            },
            holdings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  stockName: { type: 'string' },
                  shares: { type: 'integer' },
                  avgPrice: { type: 'number' }
                }
              }
            },
            transactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string', format: 'date-time' },
                  type: { type: 'string', enum: ['buy', 'sell'] },
                  stockName: { type: 'string' },
                  shares: { type: 'integer' },
                  price: { type: 'number' }
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'An error occurred'
            },
            message: {
              type: 'string',
              example: 'Detailed error message'
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Validation failed'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  param: { type: 'string' },
                  location: { type: 'string' }
                }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Authentication required'
                  },
                  message: {
                    type: 'string',
                    example: 'Please provide an API key via X-API-Key or Authorization: Bearer header'
                  }
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Invalid or insufficient permissions',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Invalid API key'
                  },
                  message: {
                    type: 'string',
                    example: 'The provided API key is not valid'
                  }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError'
              }
            }
          }
        },
        RateLimitError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Too many requests'
                  },
                  retryAfter: {
                    type: 'integer',
                    example: 30
                  },
                  message: {
                    type: 'string',
                    example: 'Rate limit exceeded. Try again in 30 seconds.'
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'API health and status endpoints'
      },
      {
        name: 'Rankings',
        description: 'User rankings and leaderboard'
      },
      {
        name: 'Stocks',
        description: 'Stock market trading system'
      },
      {
        name: 'Portfolio',
        description: 'User portfolio management'
      },
      {
        name: 'Clicks',
        description: 'Click counter functionality'
      },
      {
        name: 'Movies',
        description: 'Movie suggestions and management'
      },
      {
        name: 'Voting',
        description: 'Movie voting system'
      },
      {
        name: 'Gender',
        description: 'Gender detection service'
      },
      {
        name: 'Quotes',
        description: 'Northernlion quote service'
      },
      {
        name: 'Tickets',
        description: 'Ticketing and feedback system'
      }
    ]
  },
  apis: ['./src/controllers/*.controller.ts'] // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
