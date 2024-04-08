import prismaclient from "../DB/db.config.js";
import { generateRandomNumber, imageValidator } from "../utils/helper.js";
import { newsSchema } from "../validations/newsValidation.js";
import vine, { errors } from "@vinejs/vine";

class NewsController {
  static async index(req, res) {}
  static async store(req, res) {
    try {
      const user = req.user;
      const body = req.body;
      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(body);

      /* image file validation */
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          status: 400,
          message: "No image file provided!",
          errors: {
            image: "No image file provided!",
          },
        });
      }

      /* Image Custom Validation */
      const image = req.files.image;
      const message = imageValidator(image?.size, image?.mimetype);

      if (message !== null) {
        return res.status(400).json({
          status: 400,
          message: message,
          errors: {
            image: message,
          },
        });
      }

      /* Image Upload */
      const imageExtension = image?.name.split(".");
      const imageName = generateRandomNumber() + "." + imageExtension[1];
      const uploadPath = process.cwd() + "/public/images/" + imageName;

      image.mv(uploadPath, (err) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            message: err.message,
          });
        }
      });

      payload.image = imageName;
      payload.user_id = user.id;

      /* Store in DB */
      const news = await prismaclient.news.create({
        data: payload,
      });

      return res.status(200).json({
        status: 200,
        message: "News created successfully!",
        news: news,
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
  static async show(req, res) {}
  static async update(req, res) {}
  static async delete(req, res) {}
}

export default NewsController;
