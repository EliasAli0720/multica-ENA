import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithI18n } from "../test/i18n";
import { AsoPage, resolveAsoUrl } from "./aso-page";

describe("resolveAsoUrl", () => {
  it.each([
    ["http://localhost:3001", "http://localhost:3001/"],
    ["  https://aso.example.com/app  ", "https://aso.example.com/app"],
  ])("accepts %s", (input, expected) => {
    expect(resolveAsoUrl(input)).toBe(expected);
  });

  it.each([undefined, null, "", "   ", "localhost:3001", "javascript:alert(1)", "file:///etc/passwd"])(
    "rejects %s",
    (input) => {
      expect(resolveAsoUrl(input)).toBeNull();
    },
  );
});

describe("AsoPage", () => {
  it("embeds the configured ASO app with a sandboxed frame", () => {
    renderWithI18n(<AsoPage src="http://localhost:3001" />);

    expect(screen.getByRole("heading", { name: "ASO", level: 1 })).toBeInTheDocument();
    const frame = screen.getByTitle("ASO");
    expect(frame.tagName).toBe("IFRAME");
    expect(frame).toHaveAttribute("src", "http://localhost:3001/");
    expect(frame.getAttribute("sandbox")).not.toContain("allow-top-navigation");
    expect(screen.getByRole("link", { name: "Open in new tab" })).toHaveAttribute(
      "href",
      "http://localhost:3001/",
    );
  });

  it("reloads the frame on refresh", () => {
    renderWithI18n(<AsoPage src="http://localhost:3001" />);
    const before = screen.getByTitle("ASO");

    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));

    expect(screen.getByTitle("ASO")).not.toBe(before);
  });

  it("shows a not-configured state instead of a frame for an unusable address", () => {
    renderWithI18n(<AsoPage src="not a url" />);

    expect(screen.getByText("ASO address not set")).toBeInTheDocument();
    expect(screen.queryByTitle("ASO")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Refresh" })).not.toBeInTheDocument();
  });

  it("renders localized chrome", () => {
    renderWithI18n(<AsoPage src={undefined} />, { locale: "zh-Hans" });

    expect(screen.getByText("未设置 ASO 地址")).toBeInTheDocument();
  });
});
