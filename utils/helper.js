import moment from "moment";
import { supportedMimes } from "../config/filesystem.js";
import { v4 as uuidv4 } from "uuid";

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
