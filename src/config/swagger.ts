import swaggerJsdoc from "swagger-jsdoc";
import settings from "./settings";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Social Chat API",
      version: "1.0.0",
      description: "API documentation for the Social Chat application",
      contact: {
        name: "API Support",
        email: "support@socialchat.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${settings.PORT}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
