import moment from "moment";

export const formatDateTime = (time) => {
  return moment(time).format("DD MMM YYYY HH:mm:ss");
};
