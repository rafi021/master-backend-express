import prismaclient from "../DB/db.config.js";
import redisCache from "../DB/redis.config.js";
import logger from "../config/logger.js";
import NewsApiTransform from "../transform/newsApiTransform.js";
import {
  generateRandomNumber,
  imageValidator,
  removeImage,
  uploadImage,
} from "../utils/helper.js";
import { newsSchema } from "../validations/newsValidation.js";
import vine, { errors } from "@vinejs/vine";

class NewsController {
  static async index(req, res) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    if (page <= 0) {
      page = 1;
    }
    if (limit <= 0 || limit > 100) {
      limit = 10;
    }

    const skip = (page - 1) * limit;

    const news = await prismaclient.news.findMany({
      take: limit,
      skip: skip,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile_image: true,
          },
        },
      },
    });

    const newsTransform = news?.map((item) => NewsApiTransform.transform(item));
    const totalNews = await prismaclient.news.count();
    const totalPages = Math.ceil(totalNews / limit);

    return res.status(200).json({
      status: 200,
      message: "News fetched successfully!",
      news: newsTransform,
      metadata: {
        totalNews: totalNews,
        totalPages: totalPages,
        currentPage: page,
        currentLimit: limit,
      },
    });
  }
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

      /* remove cache */
      redisCache.del("news-list", (err) => {
        if (err) throw err;
      });

      return res.status(200).json({
        status: 200,
        message: "News created successfully!",
        news: news,
      });
    } catch (error) {
      logger.error(error.message);
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
  static async show(req, res) {
    const { id } = req.params;
    const news = await prismaclient.news.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile_image: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: 200,
      message: "News fetched successfully!",
      news: news ? NewsApiTransform.transform(news) : null,
    });
  }
  static async update(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const body = req.body;

      const news = await prismaclient.news.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (user.id !== news.user_id) {
        return res.status(400).json({ message: "UnAtuhorized" });
      }

      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(body);
      const image = req?.files?.image;

      if (image) {
        const message = imageValidator(image?.size, image?.mimetype);
        if (message !== null) {
          return res.status(400).json({
            errors: {
              image: message,
            },
          });
        }

        //   * Upload new image
        const imageName = uploadImage(image);
        payload.image = imageName;
        // * Delete old image
        removeImage(news.image);
      }

      await prismaclient.news.update({
        data: payload,
        where: {
          id: Number(id),
        },
      });

      /* remove cache */
      redisCache.del("news-list", (err) => {
        if (err) throw err;
      });

      return res.status(200).json({ message: "News updated successfully!" });
    } catch (error) {
      logger.error(error.message);
      if (error instanceof errors.E_VALIDATION_ERROR) {
        console.log(error.messages);
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong.Please try again.",
          errors: error.message,
        });
      }
    }
  }
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const news = await prismaclient.news.findUnique({
        where: {
          id: Number(id),
        },
      });
      if (user.id !== news?.user_id) {
        return res.status(401).json({ message: "UnAuthorized" });
      }

      // * Delete image from filesystem
      removeImage(news.image);
      await prismaclient.news.delete({
        where: {
          id: Number(id),
        },
      });

      /* remove cache */
      redisCache.del("news-list", (err) => {
        if (err) throw err;
      });

      return res.json({ message: "News deleted successfully!" });
    } catch (error) {
      logger.error(error.message);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong.Please try again.",
        errors: error.message,
      });
    }
  }
}

export default NewsController;
