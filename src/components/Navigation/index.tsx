"use client";

import { TabItem, Tabs } from "@worldcoin/mini-apps-ui-kit-react";
import { Home, StatsUpSquare } from "iconoir-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

/**
 * This component uses the UI Kit to navigate between pages
 * Bottom navigation is the most common navigation pattern in Mini Apps
 * We require mobile first design patterns for mini apps
 * Read More: https://docs.world.org/mini-apps/design/app-guidelines#mobile-first
 */

export const Navigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState("home");

  // Sync tab value with current pathname
  useEffect(() => {
    if (pathname.includes("/game")) {
      setValue("game");
    } else if (pathname.includes("/home")) {
      setValue("home");
    }
  }, [pathname]);

  const handleTabChange = (newValue: string) => {
    setValue(newValue);

    // Navigate to the appropriate page
    switch (newValue) {
      case "home":
        router.push("/home");
        break;
      case "game":
        router.push("/game");
        break;
      default:
        break;
    }
  };

  return (
    <Tabs value={value} onValueChange={handleTabChange}>
      <TabItem value="home" icon={<Home />} label="Home" />
      <TabItem value="game" icon={<StatsUpSquare />} label="Game" />
    </Tabs>
  );
};
