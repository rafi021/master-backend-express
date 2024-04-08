import prismaclient from "../DB/db.config.js";
import vine, { errors } from "@vinejs/vine";
import { loginSchema, registerSchema } from "../validations/authValidation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { formatDateTime } from "../utils/helper.js";
import { sendEmail } from "../config/mailer.js";
import logger from "../config/logger.js";
import { emailQueue, emailQueueName } from "../jobs/SendEmailJob.js";

class AuthController {
  static async register(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(body);

      // Check if email exists
      const findUser = await prismaclient.users.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (findUser) {
        return res.status(400).json({
          status: 400,
          message: "Email already exists!",
          errors: {
            email: "Email already exists!",
          },
        });
      }
      // Encrypt Password
      const salt = bcrypt.genSaltSync(10);
      payload.password = bcrypt.hashSync(payload.password, salt);

      // insert user
      const user = await prismaclient.users.create({
        data: payload,
      });

      return res.json({
        status: 200,
        message: "User created successfully!",
        user: user,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // console.log(error.messages);
        return res.status(400).json({
          errors: error.messages,
        });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Internal Server Error",
          errors: error.message,
        });
      }
    }
  }

  static async login(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(loginSchema);
      const payload = await validator.validate(body);

      // Check if email exists
      const findUser = await prismaclient.users.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (!findUser) {
        return res.status(400).json({
          status: 400,
          message: "Email does not exist!",
          errors: {
            email: "Email does not exist!",
          },
        });
      }

      if (findUser) {
        // Check if password matches
        const isMatch = bcrypt.compareSync(payload.password, findUser.password);
        if (!isMatch) {
          return res.status(400).json({
            status: 400,
            message: "Password does not match!",
            errors: {
              password: "password does not match!",
            },
          });
        }

        // create token
        const payloadData = {
          id: findUser.id,
          name: findUser.name,
          phone: findUser.phone,
          email: findUser.email,
          profile: findUser.profile,
          created_at: formatDateTime(findUser.created_at),
        };
        const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
          expiresIn: "1d", // expires in 24 hours
        });

        return res.status(200).json({
          status: 200,
          message: "User logged in successfully!",
          access_token: `${token}`,
        });
      }
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // console.log(error.messages);
        return res.status(400).json({
          errors: error.messages,
        });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Internal Server Error",
          errors: error.message,
        });
      }
    }
  }

  static async sendTestEmail(req, res) {
    try {
      const { email, subject, body } = req.query;

      const payload = [
        {
          toEmail: email,
          subject: subject ?? "Test Email",
          body: `<h1>${body}</h1>`,
        },
        {
          toEmail: email,
          subject: "Test Email 1",
          body: `<h1>${body}</h1>`,
        },
        {
          toEmail: email,
          subject: "Test Email 2",
          body: `<h1>${body}</h1>`,
        },
        {
          toEmail: email,
          subject: "Test Email 3",
          body: `<h1>${body}</h1>`,
        },
      ];

      // await sendEmail(payload.toEmail, payload.subject, payload.body);
      await emailQueue.add(emailQueueName, payload);

      return res.status(200).json({
        status: 200,
        message: "Job added successfully!",
      });
    } catch (error) {
      logger.error({
        type: "Email Error",
        body: error.message,
      });

      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        errors: error.message,
      });
    }
  }
}

export default AuthController;
