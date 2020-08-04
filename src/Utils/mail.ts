import nodemailer, { TransportOptions } from "nodemailer";
import jwt from "jsonwebtoken";
import { google } from "googleapis";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export const mail = async (email: any, type: any, id: any) => {
  try {
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      "869071345122-ob5h0uud9fpuaminog5tmlm681fgk8hm.apps.googleusercontent.com",
      "rxTDC823n5SUEk9gAH-9_6_N", // Client Secret
      "https://developers.google.com/oauthplayground" // Redirect URL
    );
    oauth2Client.setCredentials({
      refresh_token:
        "1//04IojCHI7VhLZCgYIARAAGAQSNwF-L9IrUcfXP1yl0XvWK-Wb-C2tPnPbaDF9Ntm7KwJeiSBiVVQitr95HAor9jDmmuMAN4zyg2A",
    });

    const accessToken = await oauth2Client.getAccessToken();
    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      port: 2525,
      auth: {
        type: "OAuth2",
        user: "Crystoworld@gmail.com",
        clientId:
          "869071345122-ob5h0uud9fpuaminog5tmlm681fgk8hm.apps.googleusercontent.com",
        clientSecret: "rxTDC823n5SUEk9gAH-9_6_N",
        refreshToken:
          "1//04IojCHI7VhLZCgYIARAAGAQSNwF-L9IrUcfXP1yl0XvWK-Wb-C2tPnPbaDF9Ntm7KwJeiSBiVVQitr95HAor9jDmmuMAN4zyg2A",
        accessToken: accessToken.token as string,
      },
    });

    // "13.126.82.139"
    const ip = "15.207.42.59";
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
      from: "Crystoworld@gmail.com",
      to: email,
      subject: "Shop with Crysto",
      generateTextFromHTML: true,
      html,
    };
    const message = await smtpTransport.sendMail(mailOptions);
    // console.log("mesage s ", message);
    return { message: "success" };
  } catch (error) {
    return { message: "failure", error: JSON.stringify(error) };
  }
};
