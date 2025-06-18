// Import Dependencies
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useNavigate } from "react-router";
import { Fragment, useRef, useState, useEffect } from "react";
// Local Imports
import { useTodoContext } from "../Todo.context";
import { TodoCard } from "./TodoCard";
import { getItemPosition } from "../utils";
import { useInfo, useFeachData } from "hooks/useApiHook";

// ----------------------------------------------------------------------
const doctype = "Opportunity"
const fields = ['opportunity_from', 'opportunity_type', 'party_name', 'source', 'status', 'probability', 'industry']

export function Todos() {
  const { todos, searchQuery } = useTodoContext();
  const [parent] = useAutoAnimate();

  const navigate = useNavigate();
  const [lists, setLists] = useState([]);

  const { data: info } = useInfo({ doctype, fields: JSON.stringify(fields) });
  const [search, setSearch] = useState({ doctype, page: 1, page_length: 10, fields: null });
  const { data } = useFeachData(search);

  useEffect(() => {
    if (info?.fields) {
      const fieldnames = info?.fields.map(field => field.fieldname);
      setSearch({ ...search, fields: JSON.stringify([...fieldnames, "name"]) })
    }
  }, [info])

  useEffect(() => {
    if (data?.data) {
      setLists(data?.data)
    }
  }, [data])

  const todoIndexMap = new Map(lists.map((todo, index) => [todo.id, index]));

  const normalizedQuery = searchQuery.toLowerCase().replace(/\s+/g, "");

  const visibleTodos = normalizedQuery
    ? lists.filter((todo) =>
      todo.subject
        .toLowerCase()
        .replace(/\s+/g, "")
        .includes(normalizedQuery.toLowerCase()),
    )
    : lists;

  return (
    <div ref={parent} className="relative flex flex-col pt-4">
      {visibleTodos.map((todo) => {
        const originalIndex = todoIndexMap.get(todo.id);

        return (
          <TodoCard
            key={todo.id}
            todo={todo}
            index={originalIndex}
            position={getItemPosition({
              index: originalIndex,
              items: todos,
            })}
          />
        );
      })}
    </div>
  );
}
