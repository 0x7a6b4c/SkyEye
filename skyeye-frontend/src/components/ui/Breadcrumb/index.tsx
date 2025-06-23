import classNames from "classnames";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import BreadcrumbItem, {
  BreadcrumbItemProps,
} from "@/components/ui/BreadcrumbItem";
import routeConfigs from "@/configs/routes";

interface BreadcrumbProps {
  className?: string;
  items?: BreadcrumbItemProps[];
}

export default function Breadcrumb({
  className = "",
  items = undefined,
}: BreadcrumbProps) {
  const { pathname } = useRouter();
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItemProps[]>(
    []
  );

  useEffect(() => {
    const routeItems = pathname.split("/");
    const itemsData = [];
    for (let routeIndex = 0; routeIndex < routeItems.length; routeIndex += 1) {
      const routePath = routeItems.slice(0, routeIndex + 1).join("/") || "/";
      if (
        routeConfigs[routePath as keyof typeof routeConfigs] &&
        !(routeIndex > 0 && routePath === "/")
      ) {
        itemsData.push({
          href: routePath,
          title: routeConfigs[routePath as keyof typeof routeConfigs],
        });
      }
    }
    setBreadcrumbItems(itemsData);
  }, [pathname]);

  const lastItemIndex = breadcrumbItems.length - 1;

  return (
    <nav
      className={classNames("m-0 text-base font-normal", className)}
      aria-label="breadcrumb"
    >
      <ol className="m-0 flex list-none flex-wrap items-center p-0">
        {(items || breadcrumbItems).map((breadcrumbItem, index) => {
          const isLastItem = index === lastItemIndex;
          return (
            // eslint-disable-next-line react/no-array-index-key
            <React.Fragment key={index}>
              <BreadcrumbItem {...breadcrumbItem} onlyTitle={isLastItem} />
              {!isLastItem && (
                <li className="mx-2 flex select-none" aria-hidden="true">
                  /
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
