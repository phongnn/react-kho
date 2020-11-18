interface Feed {
  articles: Array<{ slug: string; title: string }>;
  hasMore: boolean;
}

const articles = [...Array(13)].map((_, index) => ({
  slug: `s${index}`,
  title: `Article #${index + 1}`
}));

export async function getFeed(limit: number, offset: number) {
  return new Promise<Feed>((resolve) =>
    setTimeout(() => {
      const selectedArticles = articles.slice(offset, offset + limit);
      const hasMore = offset + limit < articles.length;
      resolve({ articles: selectedArticles, hasMore });
    }, 1500)
  );
}
