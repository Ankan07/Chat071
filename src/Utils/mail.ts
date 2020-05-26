import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export const mail = async (email: any, type: any, id: any) => {
  try {
    let html = "";
    let transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      service: "Gmail",
      port: 2525,
      auth: {
        user: "ankanmukherjee1480@gmail.com",
        pass: "XXXX",
      },
    });

    const token = jwt.sign(JSON.stringify(id), "awesome-learning");

    console.log("token", token);
    if (type == "registration") {
      html = `<a href='http://localhost:4000/v1/user/confirmation/${token}'>Click here to verify Email</a>`;
    }

    if (type == "forgot password") {
      html = `<a href='http://localhost:4000/v1/user/confirmation/${token}'>Click here to reset password</a>`;
    }
    var mailOptions = {
      from: "ankanmukherjee1480@gmail.com",
      to: email,
      subject: "Essentials",
      text: "Hey",
      html: html,
      //   attachments: [
      //     {
      //       filename: 'mailtrap.png',
      //       path: __dirname + '/mailtrap.png',
      //       cid: 'uniq-mailtrap.png'
      //     }
      //   ]
    };

    const message = await transport.sendMail(mailOptions);
    return { message: "success" };
  } catch (error) {
    return { message: "failure", error: JSON.stringify(error) };
  }
};
