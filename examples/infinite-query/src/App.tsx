import * as React from "react";
import { useQuery } from "react-kho";

import { feedQuery } from "./store";

const PAGE_SIZE = 5;

export default function App() {
  const { loading, data, fetchMore, fetchingMore } = useQuery(feedQuery, {
    arguments: { limit: PAGE_SIZE, offset: 0 }
  });

  if (loading) {
    return <p>Loading...</p>;
  } else if (!data) {
    return null;
  }

  const { articles, hasMore } = data;
  return (
    <div>
      <ul>
        {articles.map(({ slug, title }) => (
          <li key={slug}>{title}</li>
        ))}
      </ul>
      <div>
        <button
          disabled={!hasMore || fetchingMore}
          onClick={() =>
            fetchMore({
              arguments: { limit: PAGE_SIZE, offset: data.articles.length }
            })
          }
        >
          {fetchingMore ? "Fetching..." : "More"}
        </button>
      </div>
    </div>
  );
}
