import * as React from "react";
import { Tabs as AriaTabs, TabList, Tab, TabPanel } from "react-aria-components";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps extends Pick<React.ComponentProps<typeof AriaTabs>, "aria-label" | "aria-labelledby"> {
  items: TabItem[];
  /** Controlled selected tab. */
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelectionChange?: (key: string) => void;
  className?: string;
}

/**
 * Tabs with correct tablist/tab/tabpanel semantics. Arrow-key navigation,
 * Home/End and automatic selection are handled by React Aria.
 * Panels stay mounted (hidden) so in-panel state is preserved.
 */
export function Tabs({ items, selectedKey, defaultSelectedKey, onSelectionChange, className, ...ariaProps }: TabsProps) {
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const list = listRef.current;
    const canvas = list?.closest("[data-mf-premium]");
    if (!list || !canvas || typeof ResizeObserver === "undefined" || typeof MutationObserver === "undefined") return;

    // RAC owns selection and focus. This observer only positions the
    // decorative backing plate, including in horizontally scrolling RTL lists.
    function positionMarker() {
      if (!list) return;
      const tab = list.querySelector<HTMLElement>('[role="tab"][data-selected]');
      if (!tab || !tab.offsetWidth) {
        list.removeAttribute("data-mf-slide-marker");
        return;
      }
      list.style.setProperty("--mf-tab-marker-x", `${tab.offsetLeft}px`);
      list.style.setProperty("--mf-tab-marker-width", `${tab.offsetWidth}px`);
      list.setAttribute("data-mf-slide-marker", "");
    }

    const resize = new ResizeObserver(positionMarker);
    function observeTabs() {
      if (!list) return;
      resize.disconnect();
      resize.observe(list);
      list.querySelectorAll('[role="tab"]').forEach(tab => resize.observe(tab));
    }
    const selection = new MutationObserver(records => {
      if (records.some(record => record.type === "childList")) observeTabs();
      positionMarker();
    });
    observeTabs();
    selection.observe(list, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-selected"] });
    selection.observe(canvas, { attributes: true, attributeFilter: ["dir"] });
    positionMarker();

    return () => {
      selection.disconnect();
      resize.disconnect();
      list.removeAttribute("data-mf-slide-marker");
      list.style.removeProperty("--mf-tab-marker-x");
      list.style.removeProperty("--mf-tab-marker-width");
    };
  }, []);

  return (
    <AriaTabs
      selectedKey={selectedKey}
      defaultSelectedKey={defaultSelectedKey}
      onSelectionChange={key => onSelectionChange?.(String(key))}
      className={["mf-tabs", className].filter(Boolean).join(" ")}
    >
      {/* Labelling lives on the tablist, matching the tablist/tab/tabpanel contract. */}
      <TabList ref={listRef} className="mf-tabs__list" {...ariaProps}>
        {items.map(item => (
          <Tab key={item.id} id={item.id} className="mf-tabs__tab">
            {item.label}
          </Tab>
        ))}
      </TabList>
      {items.map(item => (
        <TabPanel key={item.id} id={item.id} className="mf-tabs__panel">
          {item.content}
        </TabPanel>
      ))}
    </AriaTabs>
  );
}
