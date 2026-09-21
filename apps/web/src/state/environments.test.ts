import { EnvironmentId } from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";

import { makeEnvironmentPresentation } from "~/test/environmentPresentation";
import { buildSidebarEnvironmentScopeItems, environmentScopeLabel } from "./environments";

const first = {
  environmentId: EnvironmentId.make("first"),
  label: "Development",
  displayUrl: "https://first.example.com",
};
const second = {
  environmentId: EnvironmentId.make("second"),
  label: "Development",
  displayUrl: "https://second.example.com",
};

describe("environmentScopeLabel", () => {
  it("distinguishes same-name environments by address", () => {
    const environments = [first, second];
    expect(
      environments.map((environment) => environmentScopeLabel(environment, environments)),
    ).toEqual([
      "Development · https://first.example.com",
      "Development · https://second.example.com",
    ]);
  });

  it("falls back to environment IDs when duplicate names have no display URL", () => {
    const environments = [first, second].map((environment) => ({
      ...environment,
      displayUrl: null,
    }));
    expect(
      environments.map((environment) => environmentScopeLabel(environment, environments)),
    ).toEqual(["Development · first", "Development · second"]);
  });

  it("keeps unique names compact and removes disambiguation after a rename", () => {
    expect(environmentScopeLabel(first, [first])).toBe("Development");
    expect(environmentScopeLabel(first, [first, { ...second, label: "Production" }])).toBe(
      "Development",
    );
  });
});

describe("buildSidebarEnvironmentScopeItems", () => {
  it("offers only switched-on entries, in catalog order", () => {
    const laptop = makeEnvironmentPresentation({ id: "laptop" });
    const desk = makeEnvironmentPresentation({ id: "desk" });

    expect(
      buildSidebarEnvironmentScopeItems([
        laptop,
        makeEnvironmentPresentation({ id: "parked", enabled: false }),
        desk,
      ]),
    ).toEqual([laptop, desk]);
  });

  it("offers nothing below two enabled environments, so a single-machine user sees no control", () => {
    expect(
      buildSidebarEnvironmentScopeItems([
        makeEnvironmentPresentation({ id: "laptop" }),
        makeEnvironmentPresentation({ id: "parked", enabled: false }),
      ]),
    ).toEqual([]);
    expect(buildSidebarEnvironmentScopeItems([])).toEqual([]);
  });
});
