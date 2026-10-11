import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ArtifactArt } from "@/components/art/ArtifactArt";
import { LayeredDocument } from "@/components/artifacts/interactions/LayeredDocument";
import { SegmentedControl } from "@/components/interactions/SegmentedControl";
import { getArtifactById, getAllArtifacts, getAllCollections } from "@/lib/archive";
import type { LayeredDocumentInteraction } from "@/types";

describe("LayeredDocument", () => {
  const letter = getArtifactById("DC-2442-CD")!.interaction as LayeredDocumentInteraction;

  it("hides redacted phrases until the redaction layer is lifted", async () => {
    const user = userEvent.setup();
    render(<LayeredDocument interaction={letter} />);
    expect(screen.queryByText("the eleven seconds")).toBeNull();
    expect(screen.getAllByText("[redacted]").length).toBe(5);

    await user.click(screen.getByRole("button", { name: /Lift redactions/ }));
    expect(screen.getByText("the eleven seconds")).toBeTruthy();
    expect(screen.queryAllByText("[redacted]")).toHaveLength(0);
    expect(screen.getByRole("button", { name: /Lift redactions/ }).getAttribute("aria-pressed")).toBe("true");
  });

  it("reveals annotations belonging to a layer", async () => {
    const user = userEvent.setup();
    render(<LayeredDocument interaction={letter} />);
    expect(screen.queryByText("Underlined twice in the original.")).toBeNull();
    await user.click(screen.getByRole("button", { name: /Marginalia/ }));
    expect(screen.getByText("Underlined twice in the original.")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Marginalia/ }));
    expect(screen.queryByText("Underlined twice in the original.")).toBeNull();
  });
});

describe("SegmentedControl", () => {
  function Harness() {
    const [value, setValue] = useState<"a" | "b" | "c">("a");
    return (
      <SegmentedControl
        label="Mode"
        value={value}
        onChange={setValue}
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
          { value: "c", label: "Gamma" },
        ]}
      />
    );
  }

  it("exposes a radio group with a single tab stop", () => {
    render(<Harness />);
    const radios = screen.getAllByRole("radio");
    expect(radios.map((r) => r.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
    expect(screen.getByRole("radio", { name: "Alpha" }).getAttribute("aria-checked")).toBe("true");
  });

  it("moves selection and focus with the arrow keys, wrapping at the ends", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("radio", { name: "Alpha" }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Beta" }).getAttribute("aria-checked")).toBe("true");
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Beta" }));
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByRole("radio", { name: "Gamma" }).getAttribute("aria-checked")).toBe("true");
    await user.keyboard("{Home}");
    expect(screen.getByRole("radio", { name: "Alpha" }).getAttribute("aria-checked")).toBe("true");
  });
});

describe("ArtifactArt", () => {
  const visualizations = [
    ...getAllArtifacts().map((a) => a.visualization),
    ...getAllCollections().map((c) => c.visualization),
  ];

  it("renders every artwork deterministically at both levels of detail", () => {
    for (const visualization of visualizations) {
      for (const detail of ["full", "thumb"] as const) {
        const first = renderToStaticMarkup(<ArtifactArt visualization={visualization} detail={detail} />);
        const second = renderToStaticMarkup(<ArtifactArt visualization={visualization} detail={detail} />);
        expect(first).toBe(second);
        expect(first).toContain("<svg");
        expect(first).not.toMatch(/NaN|undefined|Infinity/);
      }
    }
  });

  it("exposes meaningful alternative text, or hides decorative artwork", () => {
    const visualization = getArtifactById("OB-2112-BO")!.visualization;
    render(<ArtifactArt visualization={visualization} />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe(visualization.alt);

    const { container } = render(<ArtifactArt visualization={visualization} decorative />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.hasAttribute("role")).toBe(false);
  });

  it("renders every interaction variant without errors", () => {
    for (const artifact of getAllArtifacts()) {
      const interaction = artifact.interaction;
      if (interaction?.type === "view-mode") {
        for (const mode of interaction.modes) {
          const markup = renderToStaticMarkup(<ArtifactArt visualization={artifact.visualization} override={mode.visualization} />);
          expect(markup).not.toMatch(/NaN/);
        }
      }
      if (interaction?.type === "timeline-slider") {
        for (const stop of interaction.stops) {
          const markup = renderToStaticMarkup(<ArtifactArt visualization={artifact.visualization} override={{ param: stop.param }} />);
          expect(markup).not.toMatch(/NaN/);
        }
      }
    }
  });
});
