"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_graphql_1 = __importDefault(require("express-graphql"));
const graphql_1 = require("graphql");
const config_1 = require("../../config");
const requestLogger_1 = require("./requestLogger");
const user_service_1 = require("./../../components/user/user.service");
exports.allowCors = (router) => {
    router.use(cors_1.default({
        origin(origin, callback) {
            if (!origin) {
                return callback(null, true);
            }
            if (config_1.configCors.allowOrigin.indexOf(origin) === -1) {
                const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
        exposedHeaders: config_1.configCors.exposedHeaders,
    }));
};
exports.handleBodyRequestParsing = (router) => {
    router.use(express_1.urlencoded({ extended: true }));
    router.use(express_1.json());
};
exports.reqConsoleLogger = (router) => {
    router.use(requestLogger_1.requestLogger);
};
exports.handleCompression = (router) => {
    router.use(compression_1.default());
};
exports.requestLimiter = (router) => {
    const limiter = new express_rate_limit_1.default({
        windowMs: +config_1.rateLimitConfig.inTime || 1 * 60 * 1000,
        max: +config_1.rateLimitConfig.maxRequest || 12,
        message: {
            status: 0,
            error: "Too Many Requests",
            statusCode: 429,
            message: "Oh boy! You look in hurry, take it easy",
            description: "You have crossed maximum number of requests. please wait and try again."
        }
    });
    router.use(limiter);
};
exports.graphQl = (router) => {
    router.use("/graphql", express_graphql_1.default({
        schema: graphql_1.buildSchema(`

      type User {
        _id: ID!,
        name: String!,
        age: Int,
        email: String,
        createdAt: String
      }

      input userInput{
        name: String!,
        age: Int!,
        email: String!
      }
    
      type RootQuery{
        users: [User!]!
      }

      type RootMutation{
        createUser(user: userInput): User
      }
      
      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
        rootValue: {
            users: async () => {
                return user_service_1.userModel.fetchAll();
            },
            createUser: async (args) => {
                return user_service_1.userModel.add(args.user);
            }
        },
        graphiql: true
    }));
    return "";
};
//# sourceMappingURL=common.middleware.js.map