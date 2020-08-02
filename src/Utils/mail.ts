import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export const mail = async (email: any, type: any, id: any) => {
  try {
    let html = "";
    const transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      service: "Gmail",
      port: 2525,
      auth: {
        user: "CrystoWorld@gmail.com",
        pass: "atk8145%K",
      },
    });
    //"13.126.82.139"
    const ip = "15.207.42.59";
    const token = jwt.sign(JSON.stringify(id), "awesome-learning");

    console.log("token", token);
    if (type == "registration") {
      html = `<a href='http://${ip}:4000/v1/user/confirmation/${token}?type=emailverification'>Click here to verify Email</a>`;
    }

    if (type == "forgot password") {
      html = `<a href='http://${ip}:4000/v1/user/confirmation/${token}?type=forgotpassword'>Click here to reset password</a>`;
    }
    var mailOptions = {
      from: "CrystoWorld@gmail.com",
      to: email,
      subject: "Essentials",
      text: "Hey",
      html,
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
