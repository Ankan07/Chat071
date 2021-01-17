import nodemailer, { TransportOptions } from "nodemailer";
import jwt from "jsonwebtoken";
import { google } from "googleapis";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export const mail = async (email: any, type: any, id: any) => {
  try {
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      "550151232396-4qvutl9q8mlfip23kq573m95qhlqmp1b.apps.googleusercontent.com",
      "Gwg3J9IkYLU6K5J9s9viiU2-", // Client Secret
      "https://developers.google.com/oauthplayground" // Redirect URL
    );
    oauth2Client.setCredentials({
      refresh_token:
        "1//04Ay7BN4XEnQqCgYIARAAGAQSNwF-L9IrPWcbKZXRvemWSAoA2ts-yFBosNBcHtOMHGUMuFiqfV1ULEsA8nvaGSCxqK5JIYdj1vk",
    });

    const accessToken = await oauth2Client.getAccessToken();
    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      port: 2525,
      auth: {
        type: "OAuth2",
        user: "ankantech96@gmail.com",
        clientId:
          "550151232396-4qvutl9q8mlfip23kq573m95qhlqmp1b.apps.googleusercontent.com",
        clientSecret: "Gwg3J9IkYLU6K5J9s9viiU2-",
        refreshToken:
          "1//04Ay7BN4XEnQqCgYIARAAGAQSNwF-L9IrPWcbKZXRvemWSAoA2ts-yFBosNBcHtOMHGUMuFiqfV1ULEsA8nvaGSCxqK5JIYdj1vk",
        accessToken: accessToken.token as string,
      },
    });

    // "13.126.82.139"
    const ip = "localhost";
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
