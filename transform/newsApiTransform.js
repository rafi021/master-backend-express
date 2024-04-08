import { formatDateTime, getImageUrl } from "../utils/helper.js";

class NewsApiTransform {
  static transform(news) {
    return {
      id: news.id,
      title: news.title,
      content: news.content,
      image: getImageUrl(news.image),
      created_at: formatDateTime(news.created_at),
    };
  }
}

export default NewsApiTransform;
