import prismaclient from "../DB/db.config.js";
import { generateRandomNumber, imageValidator } from "../utils/helper.js";

class ProfileController {
  static async index(req, res) {
    try {
      const user = req.user;
      return res.status(200).json({
        status: 200,
        message: "User info",
        user: user,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }
  static async store(req, res) {}
  static async show(req, res) {}
  static async update(req, res) {
    try {
      const { id } = req.params;
      const authUser = req.user;

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          status: 400,
          message: "please select a file",
        });
      }

      const profile_image = req.files.profile_image;
      const message = imageValidator(
        profile_image?.size,
        profile_image?.mimetype
      );

      if (message !== null) {
        return res.status(400).json({
          status: 400,
          message: message,
          errors: {
            profile_image: message,
          },
        });
      }

      const imageExtension = profile_image?.name.split(".");
      const imageName = generateRandomNumber() + "." + imageExtension[1];
      const uploadPath = process.cwd() + "/public/images/" + imageName;

      profile_image.mv(uploadPath, (err) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            message: err.message,
          });
        }
      });

      await prismaclient.users.update({
        data: {
          profile_image: imageName,
        },
        where: {
          id: Number(id),
        },
      });

      return res.status(200).json({
        status: 200,
        message: "profile image updated successfully!",
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }
  static async delete(req, res) {}
}

export default ProfileController;
