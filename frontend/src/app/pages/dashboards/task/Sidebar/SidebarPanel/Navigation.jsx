// Import Dependencies
import {
  TrashIcon,
  SunIcon,
  StarIcon,
  HomeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useState } from "react";

// Local Imports
import { Button } from "components/ui";

// ----------------------------------------------------------------------

const navigation = [
  {
    id: "1",
    name: "Open",
    link: "#",
    messageCount: 0,
    icon: SunIcon,
    color: "neutral",
  },
  {
    id: "2",
    name: "Working",
    link: "#",
    messageCount: 0,
    icon: StarIcon,
    color: "neutral",
  },
  {
    id: "3",
    name: "Pending Review",
    link: "#",
    messageCount: 0,
    icon: HomeIcon,
    color: "neutral",
  },
  {
    id: "4",
    name: "Overdue",
    link: "#",
    messageCount: 0,
    icon: UserIcon,
    color: "neutral",
  },
  {
    id: "5",
    name: "Template",
    link: "#",
    messageCount: 0,
    icon: StarIcon,
    color: "neutral",
  },
  {
    id: "6",
    name: "Completed",
    link: "#",
    messageCount: 0,
    icon: HomeIcon,
    color: "neutral",
  },
  {
    id: "7",
    name: "Cancelled",
    link: "#",
    messageCount: 0,
    icon: TrashIcon,
    color: "neutral",
  },
];

export function Navigation() {
  const [selectedId, setSelectedId] = useState("1");

  return (
    <ul className="space-y-1.5 px-2 pt-4 font-medium">
      {navigation.map((item) => (
        <li key={item.id}>
          <Button
            color={item.id === selectedId ? "primary" : item.color}
            variant={item.id === selectedId ? "soft" : "flat"}
            className="group w-full justify-between gap-2 p-2 text-xs-plus"
            onClick={() => setSelectedId(item.id)}
          >
            <div className="flex gap-2">
              <item.icon
                className={clsx(
                  "size-4.5 transition-colors",
                  item.id !== selectedId &&
                  item.color === "neutral" &&
                  "text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500 dark:text-dark-300 dark:group-hover:text-dark-200 dark:group-focus:text-dark-200",
                )}
              />
              <span className="truncate">{item.name}</span>
            </div>
            {item.messageCount > 0 && (
              <span className="text-primary-600 dark:text-primary-400">
                {item.messageCount}
              </span>
            )}
          </Button>
        </li>
      ))}
    </ul>
  );
}
