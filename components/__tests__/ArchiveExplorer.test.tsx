import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ArchiveExplorer } from "@/components/archive/ArchiveExplorer";
import { getArtifactSummaries, getCategories } from "@/lib/archive";

let currentSearch = "";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(currentSearch),
  usePathname: () => "/archive",
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const items = getArtifactSummaries();
const categories = getCategories();

function renderExplorer(search = "") {
  currentSearch = search;
  return render(<ArchiveExplorer items={items} categories={categories} />);
}

const resultTitles = () =>
  screen
    .getAllByRole("article")
    .map((article) => within(article).getByRole("heading").textContent);

describe("ArchiveExplorer", () => {
  beforeEach(() => {
    vi.spyOn(window.history, "pushState").mockImplementation(() => {});
    vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
  });

  it("shows the first page of records, newest first", () => {
    renderExplorer();
    expect(resultTitles()).toHaveLength(9);
    expect(resultTitles()[0]).toBe("Letter Dated 2113");
    expect(screen.getByText(/Showing 09 of 24 records/)).toBeTruthy();
  });

  it("renders the results described by URL parameters", () => {
    renderExplorer("q=quell&category=places");
    expect(resultTitles()).toEqual(["Isle of Quell"]);
    expect((screen.getByLabelText(/Search the record/) as HTMLInputElement).value).toBe("quell");
  });

  it("writes category filters to the URL as a new history entry", async () => {
    const user = userEvent.setup();
    renderExplorer();
    const group = screen.getAllByRole("group", { name: "Filter by category" })[0];
    await user.click(within(group).getByRole("button", { name: /Signals/ }));
    expect(window.history.pushState).toHaveBeenCalledWith(null, "", "/archive?category=signals");
  });

  it("debounces typed searches into the URL", async () => {
    const user = userEvent.setup();
    renderExplorer();
    await user.type(screen.getByLabelText(/Search the record/), "2113");
    await vi.waitFor(() =>
      expect(window.history.replaceState).toHaveBeenLastCalledWith(null, "", "/archive?q=2113"),
    );
  });

  it("shows an empty state with a way out", async () => {
    const user = userEvent.setup();
    renderExplorer("q=nothing-matches-this");
    expect(screen.getByText("Silence.")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Clear all filters" }));
    expect(window.history.pushState).toHaveBeenCalledWith(null, "", "/archive");
  });

  it("reveals more records on demand", async () => {
    const user = userEvent.setup();
    renderExplorer();
    await user.click(screen.getByRole("button", { name: /Load 09 more records/ }));
    expect(window.history.replaceState).toHaveBeenCalledWith(null, "", "/archive?page=2");
  });

  it("switches between grid and list display", async () => {
    const user = userEvent.setup();
    renderExplorer();
    await user.click(screen.getByRole("radio", { name: "List view" }));
    expect(window.history.replaceState).toHaveBeenCalledWith(null, "", "/archive?view=list");
  });
});
