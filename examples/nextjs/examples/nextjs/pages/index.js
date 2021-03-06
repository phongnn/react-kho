import Link from "next/link";
import { useQuery, createStore } from "react-kho";

import { query } from "../store";

export default function IndexPage() {
  const { data, fetchMore, fetchingMore } = useQuery(query);
  return (
    <div>
      <nav>
        <Link href="/about">
          <a>About</a>
        </Link>
      </nav>
      <br />
      <br />
      {data && (
        <>
          <ul>
            {data.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <footer>
            <button onClick={fetchMore}>More</button>
            {fetchingMore && <span>Fetching more...</span>}
          </footer>
        </>
      )}
    </div>
  );
}

export async function getServerSideProps({ req }) {
  if (req.url.endsWith(".json")) {
    return { props: {} };
  }

  const store = createStore();
  await store.query(query);
  return { props: { preloadedState: store.getState() } };
}
