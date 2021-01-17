"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const googleapis_1 = require("googleapis");
const config_1 = require("../config");
exports.mail = async (email, type, id) => {
    try {
        const OAuth2 = googleapis_1.google.auth.OAuth2;
        const oauth2Client = new OAuth2(config_1.values["clientId"], config_1.values["clientSecret"], "https://developers.google.com/oauthplayground");
        oauth2Client.setCredentials({
            refresh_token: config_1.values["refreshToken"],
        });
        const accessToken = await oauth2Client.getAccessToken();
        const smtpTransport = nodemailer_1.default.createTransport({
            service: "gmail",
            port: 2525,
            auth: {
                type: "OAuth2",
                user: "ankantech96@gmail.com",
                clientId: config_1.values["clientSecret"],
                clientSecret: config_1.values["clientSecret"],
                refreshToken: config_1.values["refreshToken"],
                accessToken: accessToken.token,
            },
        });
        const ip = config_1.values["ip"];
        const token = jsonwebtoken_1.default.sign(JSON.stringify(id), "awesome-learning");
        let html = "";
        if (type === "registration") {
            html = `<a href='http://${ip}:4000/v1/user/confirmation/${token}?type=emailverification'>Click here to verify Email</a>`;
        }
        if (type === "forgot password") {
            html = `<a href='http://${ip}:4000/v1/user/confirmation/${token}?type=forgotpassword'>Click here to reset password</a>`;
        }
        const mailOptions = {
            from: "ankantech96@gmail.com",
            to: email,
            subject: "Verification Chat App",
            generateTextFromHTML: true,
            html,
        };
        const message = await smtpTransport.sendMail(mailOptions);
        console.log("mesage s ", message);
        return { message: "success" };
    }
    catch (error) {
        return { message: "failure", error: JSON.stringify(error) };
    }
};
