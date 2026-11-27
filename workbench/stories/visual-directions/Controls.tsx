import { useRef, useState, type FormEvent } from "react";
import { Button, SelectField, Switch, TextField, type ButtonIntent, type ButtonSize } from "@mayf3/ui-react";
import { Button as AriaButton, Checkbox, Input, Label, Radio, RadioGroup, SearchField } from "react-aria-components";
import { Icon } from "./Icon";
import "./controls.css";

const buttonKinds = [
  { intent: "primary", label: "主操作", action: "启动" },
  { intent: "secondary", label: "次操作", action: "复核" },
  { intent: "quiet", label: "Ghost", action: "详情" },
  { intent: "danger", label: "危险", action: "清除" },
] satisfies { intent: ButtonIntent; label: string; action: string }[];

const buttonSizes = [
  { size: "sm", label: "小" },
  { size: "md", label: "中" },
  { size: "lg", label: "大" },
] satisfies { size: ButtonSize; label: string }[];

const agents = [
  { id: "a", label: "Agent A" },
  { id: "b", label: "Agent B" },
  { id: "c", label: "Agent C" },
];

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function PreviewButtonMatrix() {
  const [feedback, setFeedback] = useState("");

  return (
    <section className="sky-control-panel" aria-label="按钮矩阵">
      <h3>按钮矩阵</h3>
      <table className="sky-button-matrix" aria-label="按钮样式与尺寸">
        <thead>
          <tr>
            <th scope="col">样式</th>
            {buttonSizes.map(({ size, label }) => <th key={size} scope="col">{label}</th>)}
          </tr>
        </thead>
        <tbody>
          {buttonKinds.map(({ intent, label, action }) => (
            <tr key={intent}>
              <th scope="row">{label}</th>
              {buttonSizes.map(({ size, label: sizeLabel }) => (
                <td key={size}>
                  <Button
                    intent={intent}
                    size={size}
                    aria-label={`${action}（${sizeLabel}）`}
                    onPress={() => setFeedback(`${label} · ${sizeLabel}尺寸 · 已触发`)}
                  >
                    {action}
                  </Button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="sky-button-samples" role="group" aria-label="按钮状态">
        <Button
          intent="secondary"
          className="sky-icon-button"
          aria-label="图标按钮：重置反馈"
          onPress={() => setFeedback("已重置按钮反馈")}
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="sky-control-icon sky-reset-icon">
            <path d="M4 8a6 6 0 1 1 .5 5M4 4v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
        <Button intent="primary" onPress={() => setFeedback("悬停示例 · 已触发")} className="sky-sample-hover">悬停</Button>
        <Button intent="primary" onPress={() => setFeedback("按压示例 · 已触发")} className="sky-sample-press">按压</Button>
        <Button intent="secondary" onPress={() => setFeedback("聚焦示例 · 已触发")} className="sky-sample-focus">聚焦</Button>
        <Button intent="secondary" isDisabled>禁用</Button>
        <Button intent="secondary" loading>加载</Button>
      </div>
      <p className="sky-control-feedback" role="status">{feedback || "点击按钮或用键盘查看操作反馈。"}</p>
    </section>
  );
}

function PreviewSettings() {
  const [name, setName] = useState("Mayf3 Agent");
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState<string | null>(agents[0].id);
  const [slug, setSlug] = useState("Agent 测试");
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [audience, setAudience] = useState("workspace");
  const [autoRecover, setAutoRecover] = useState(true);
  const [view, setView] = useState("list");
  const [saved, setSaved] = useState("");
  const slugRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const matching = agents.filter(agent => agent.label.toLowerCase().includes(query.trim().toLowerCase()));
  const slugError = slugPattern.test(slug) ? undefined : "请用小写英文字母、数字和连字符，如 agent-run。";

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (slugError) {
      setSaved("");
      slugRef.current?.focus();
      return;
    }
    if (!name.trim()) {
      setSaved("");
      nameRef.current?.focus();
      return;
    }
    const agent = agents.find(item => item.id === owner)?.label ?? "未分配";
    const scope = audience === "workspace" ? "全工作区" : "仅分配给我";
    setSaved(`已保存 ${name.trim()} · ${agent} · ${scope} · ${view === "list" ? "列表" : "看板"} · ${autoRecover ? "自动恢复已开启" : "自动恢复已关闭"} · ${includeCompleted ? "含已完成任务" : "排除已完成任务"}`);
  }

  return (
    <form className="sky-control-panel" aria-label="控件测试设置" onSubmit={save} noValidate>
      <h3>控件测试设置</h3>
      <div className="sky-control-grid">
        <TextField label="工作区名称" value={name} onChange={setName} inputRef={nameRef}
          isRequired errorMessage={name.trim() ? undefined : "请输入工作区名称。"} />
        <SearchField value={query} onChange={setQuery} onSubmit={setQuery} className="mf-field sky-agent-search">
          <Label className="mf-field__label">搜索代理</Label>
          <div className="sky-search-field">
            <Icon name="search" className="sky-control-icon" />
            <Input className="mf-input" placeholder="输入代理名称" />
            <AriaButton className="sky-search-clear" aria-label="清除代理搜索">×</AriaButton>
          </div>
          <span role="status" className="sky-search-result">
            {query.trim() ? matching.map(agent => agent.label).join("、") || "未找到代理" : ""}
          </span>
        </SearchField>
        <SelectField label="负责人" items={agents} value={owner} onChange={setOwner} />
        <TextField label="任务键名" value={slug} onChange={setSlug} inputRef={slugRef} isRequired errorMessage={slugError} />
      </div>

      <div className="sky-form-options">
        <div className="sky-option-stack">
          <Checkbox className="sky-choice" isSelected={includeCompleted} onChange={setIncludeCompleted}>
            <span aria-hidden="true" className="sky-choice__mark">
              <Icon name="check" />
            </span>
            包含已完成任务
          </Checkbox>
          <Switch isSelected={autoRecover} onChange={setAutoRecover}>自动恢复</Switch>
        </div>

        <RadioGroup className="sky-radio-group" value={audience} onChange={setAudience}>
          <Label className="mf-field__label">接收范围</Label>
          <Radio className="sky-choice" value="workspace"><span aria-hidden="true" className="sky-choice__mark" />全工作区</Radio>
          <Radio className="sky-choice" value="assigned"><span aria-hidden="true" className="sky-choice__mark" />仅分配给我</Radio>
        </RadioGroup>

        <RadioGroup className="sky-segment" value={view} onChange={setView} orientation="horizontal">
          <Label className="mf-field__label">任务视图</Label>
          <div className="sky-segment__track">
            <Radio className="sky-segment__option" value="list">列表</Radio>
            <Radio className="sky-segment__option" value="board">看板</Radio>
          </div>
        </RadioGroup>
      </div>

      <div className="sky-form-actions">
        <Button type="submit" intent="secondary">保存测试设置</Button>
        <p role="status" className="sky-control-feedback">{saved}</p>
      </div>
    </form>
  );
}

export function Controls() {
  return (
    <section id="controls" className="sky-preview-section sky-controls" aria-labelledby="sky-controls-title">
      <h2 id="sky-controls-title">组件控件</h2>
      <div className="sky-control-panels">
        <PreviewButtonMatrix />
        <PreviewSettings />
      </div>
    </section>
  );
}
