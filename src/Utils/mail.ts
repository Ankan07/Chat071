import nodemailer, { TransportOptions } from "nodemailer";
import jwt from "jsonwebtoken";
import { google } from "googleapis";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { values } from '../config'

export const mail = async (email: any, type: any, id: any) => {
  try {
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      values["clientId"],
      values["clientSecret"], // Client Secret
      "https://developers.google.com/oauthplayground" // Redirect URL
    );
    oauth2Client.setCredentials({
      refresh_token: values["refreshToken"],
    });

    const accessToken = await oauth2Client.getAccessToken();
    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      port: 2525,
      auth: {
        type: "OAuth2",
        user: "ankantech96@gmail.com",
        clientId: values["clientSecret"],
        clientSecret: values["clientSecret"],
        refreshToken: values["refreshToken"],
        accessToken: accessToken.token as string,
      },
    });

    const ip = values["ip"];
    const token = jwt.sign(JSON.stringify(id), "awesome-learning");

    let html = "";
    // console.log("token", token);
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
  } catch (error) {
    return { message: "failure", error: JSON.stringify(error) };
  }
};
