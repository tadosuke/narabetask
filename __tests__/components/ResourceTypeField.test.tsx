import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResourceTypeField } from "../../src/components/TaskSidebar/ResourceTypeField";
import type { ResourceType } from "../../src/types";

describe("ResourceTypeField", () => {
  const defaultProps = {
    resourceTypes: ["self"] as ResourceType[],
    onResourceTypeChange: vi.fn(),
  };

  it("ラベルが表示される", () => {
    render(<ResourceTypeField {...defaultProps} />);

    expect(screen.getByText("リソースタイプ")).toBeInTheDocument();
  });

  it("すべてのリソースタイプオプションが表示される", () => {
    render(<ResourceTypeField {...defaultProps} />);

    expect(screen.getByText("自分")).toBeInTheDocument();
    expect(screen.getByText("他人")).toBeInTheDocument();
    expect(screen.getByText("マシンパワー")).toBeInTheDocument();
    expect(screen.getByText("ネットワーク")).toBeInTheDocument();
  });

  it("選択されているリソースタイプがチェックされる", () => {
    render(<ResourceTypeField {...defaultProps} resourceTypes={["self", "others"]} />);

    const selfCheckbox = screen.getByRole("checkbox", { name: "自分" });
    const othersCheckbox = screen.getByRole("checkbox", { name: "他人" });
    const machineCheckbox = screen.getByRole("checkbox", { name: "マシンパワー" });
    const networkCheckbox = screen.getByRole("checkbox", { name: "ネットワーク" });

    expect(selfCheckbox).toBeChecked();
    expect(othersCheckbox).toBeChecked();
    expect(machineCheckbox).not.toBeChecked();
    expect(networkCheckbox).not.toBeChecked();
  });

  it("チェックボックスがクリックされたときにonResourceTypeChangeを呼び出す", async () => {
    const mockOnResourceTypeChange = vi.fn();
    const user = userEvent.setup();
    
    render(<ResourceTypeField {...defaultProps} onResourceTypeChange={mockOnResourceTypeChange} />);

    const othersCheckbox = screen.getByRole("checkbox", { name: "他人" });
    await user.click(othersCheckbox);

    expect(mockOnResourceTypeChange).toHaveBeenCalledWith("others", true);
  });

  it("既にチェックされているアイテムのチェックを外したときにonResourceTypeChangeを呼び出す", async () => {
    const mockOnResourceTypeChange = vi.fn();
    const user = userEvent.setup();
    
    render(<ResourceTypeField {...defaultProps} resourceTypes={["self", "others"]} onResourceTypeChange={mockOnResourceTypeChange} />);

    const selfCheckbox = screen.getByRole("checkbox", { name: "自分" });
    await user.click(selfCheckbox);

    expect(mockOnResourceTypeChange).toHaveBeenCalledWith("self", false);
  });

  it("マシンパワーのチェックボックスが正しく動作する", async () => {
    const mockOnResourceTypeChange = vi.fn();
    const user = userEvent.setup();
    
    render(<ResourceTypeField {...defaultProps} onResourceTypeChange={mockOnResourceTypeChange} />);

    const machineCheckbox = screen.getByRole("checkbox", { name: "マシンパワー" });
    await user.click(machineCheckbox);

    expect(mockOnResourceTypeChange).toHaveBeenCalledWith("machine", true);
  });

  it("ネットワークのチェックボックスが正しく動作する", async () => {
    const mockOnResourceTypeChange = vi.fn();
    const user = userEvent.setup();
    
    render(<ResourceTypeField {...defaultProps} onResourceTypeChange={mockOnResourceTypeChange} />);

    const networkCheckbox = screen.getByRole("checkbox", { name: "ネットワーク" });
    await user.click(networkCheckbox);

    expect(mockOnResourceTypeChange).toHaveBeenCalledWith("network", true);
  });

  it("空のリソースタイプ配列でもエラーにならない", () => {
    render(<ResourceTypeField {...defaultProps} resourceTypes={[]} />);

    const selfCheckbox = screen.getByRole("checkbox", { name: "自分" });
    const othersCheckbox = screen.getByRole("checkbox", { name: "他人" });
    const machineCheckbox = screen.getByRole("checkbox", { name: "マシンパワー" });
    const networkCheckbox = screen.getByRole("checkbox", { name: "ネットワーク" });

    expect(selfCheckbox).not.toBeChecked();
    expect(othersCheckbox).not.toBeChecked();
    expect(machineCheckbox).not.toBeChecked();
    expect(networkCheckbox).not.toBeChecked();
  });
});