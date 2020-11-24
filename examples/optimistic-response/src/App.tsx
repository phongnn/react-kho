import React, { FormEvent, useState } from "react";
import { useMutation, useQuery } from "react-kho";
import { guid } from "./helpers";

import { userListQuery, addUserMutation } from "./store";

function UserList() {
  const { data: users } = useQuery(userListQuery);
  return !users ? (
    <p>Loading...</p>
  ) : (
    <ul>
      {users.map(({ id, name, __optimistic__ }) => (
        <li key={id} style={{ opacity: __optimistic__ ? 0.3 : 1 }}>
          {name}
        </li>
      ))}
    </ul>
  );
}

function UserForm() {
  const [addUser] = useMutation(addUserMutation);
  const [name, setName] = useState("");
  const handleSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    if (name.trim().length > 0) {
      const user = {
        id: guid(),
        name: name.trim()
      };
      addUser({
        arguments: { user },
        optimisticResponse: { ...user, __optimistic__: true }
      });
      setName("");
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(evt) => setName(evt.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  );
}

export default function App() {
  return (
    <div>
      <UserList />
      <UserForm />
    </div>
  );
}
