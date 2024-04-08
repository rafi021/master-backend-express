import { formatDateTime, getImageUrl } from "../utils/helper.js";

class NewsApiTransform {
  static transform(news) {
    return {
      id: news.id,
      title: news.title,
      content: news.content,
      image: getImageUrl(news.image),
      created_at: formatDateTime(news.created_at),
      user: {
        id: news.user.id,
        name: news.user.name,
        profile_image:
          news?.user?.profile_image != null
            ? getImageUrl(news.user.profile_image)
            : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D",
      },
    };
  }
}

export default NewsApiTransform;
