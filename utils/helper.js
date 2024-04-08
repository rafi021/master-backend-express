import moment from "moment";
import { supportedMimes } from "../config/filesystem.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export const formatDateTime = (time) => {
  return moment(time).format("DD MMM YYYY HH:mm:ss");
};

export const imageValidator = (size, mime) => {
  if (byteToMb(size) > 2) {
    return "Image Size must be less than 2 MB";
  } else if (!supportedMimes.includes(mime)) {
    return "Image must be types of png,jpg,jpeg,svg,gif,webp";
  }

  return null;
};

export const byteToMb = (bytes) => {
  return (bytes / 1024 / 1024).toFixed(2);
};

export const generateRandomNumber = () => {
  return uuidv4();
};

export const getImageUrl = (imageName) => {
  return `${process.env.APP_URL}/images/${imageName}`;
};

export const removeImage = (imageName) => {
  const path = process.cwd() + "/public/images/" + imageName;
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};

// * Upload image
export const uploadImage = (image) => {
  const imgExt = image?.name.split(".");
  const imageName = generateRandomNumber() + "." + imgExt[1];
  const uploadPath = process.cwd() + "/public/images/" + imageName;
  image.mv(uploadPath, (err) => {
    if (err) throw err;
  });

  return imageName;
};
