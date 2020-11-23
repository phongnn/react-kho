import React, { useState } from "react";
import { useQuery } from "react-kho";

import { feedQuery } from "./store";
import { Article } from "./types";

const PAGE_SIZE = 5;

function ArticleList(props: { articles: Article[] }) {
  return (
    <ul>
      {props.articles.map(({ slug, title }) => (
        <li key={slug}>{title}</li>
      ))}
    </ul>
  );
}

function PaginationNav(props: {
  currentPageIndex: number;
  pagesCount: number;
  onPageSelect: (pageIndex: number) => void;
}) {
  const { currentPageIndex, pagesCount, onPageSelect } = props;
  return (
    <div>
      {[...Array(pagesCount)].map((_, index) => (
        <button
          style={{
            padding: 5,
            border: "none",
            fontWeight: index === currentPageIndex ? "bold" : "normal"
          }}
          disabled={index === currentPageIndex}
          onClick={() => onPageSelect(index)}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [pageIndex, setPageIndex] = useState(0);
  const { loading, data } = useQuery(feedQuery, {
    arguments: { limit: PAGE_SIZE, offset: pageIndex * PAGE_SIZE }
  });

  if (loading) {
    return <p>Loading...</p>;
  } else if (!data) {
    return null;
  }

  const { articles, articlesCount } = data;
  const pagesCount = Math.ceil(articlesCount / PAGE_SIZE);
  return (
    <div>
      <ArticleList articles={articles} />
      <PaginationNav
        pagesCount={pagesCount}
        currentPageIndex={pageIndex}
        onPageSelect={setPageIndex}
      />
    </div>
  );
}
