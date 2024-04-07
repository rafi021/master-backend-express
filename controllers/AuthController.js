import prismaclient from "../DB/db.config.js";
import vine, {errors} from "@vinejs/vine";
import { registerSchema } from "../validations/authValidation.js";
import bcrypt from "bcryptjs";

class AuthController {
  static async register(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(body);

      // Check if email exists
      const findUser = await prismaclient.users.findUnique({
        where: {
          email: payload.email
        }
      })

       if(findUser){
        return res.status(400).json({
            status: 400,
            message: "Email already exists!",
            errors: {
                email: "Email already exists!"
            }
        })
       }
        // Encrypt Password
        const salt = bcrypt.genSaltSync(10);
        payload.password = bcrypt.hashSync(payload.password, salt);

        // insert user
        const user = await prismaclient.users.create({
            data: payload
        });

        return res.json({
            status: 200,
            message: "User created successfully!",
            user: user
        });

    } catch (error) {
        if(error instanceof errors.E_VALIDATION_ERROR){
            // console.log(error.messages);
            return res.status(400).json({
                errors: error.messages
            })
        }else{
            return res.status(500).json({
                status: 500,
                message: "Internal Server Error",
                errors: error.message
            })
        }
    }
  }
}

export default AuthController;