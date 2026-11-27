import { useRef, useState } from "react";
import { Button, SelectField } from "@mayf3/ui-react";
import { FileTrigger, Label, Text, TextArea, TextField } from "react-aria-components";
import { Icon } from "../visual-directions/Icon";
import { promptContexts, promptModes, type Context, type RunMode, type TaskPrompt } from "./agent-model";

export function AgentPromptBar({ onSubmit }: { onSubmit: (prompt: TaskPrompt) => void }) {
  const [intent, setIntent] = useState("");
  const [context, setContext] = useState<Context>("workspace");
  const [mode, setMode] = useState<RunMode>("plan");
  const [attachment, setAttachment] = useState<string>();
  const [announcement, setAnnouncement] = useState("");
  const text = useRef<HTMLTextAreaElement>(null);
  const addAttachment = useRef<HTMLButtonElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const trimmedIntent = intent.trim();

  return (
    <section className="agent-section agent-prompt" id="prompt" aria-labelledby="agent-prompt-title">
      <div className="agent-section-heading"><h2 id="agent-prompt-title">发起任务</h2></div>
      <form className="agent-prompt-form" ref={form} onSubmit={event => {
        event.preventDefault();
        if (!trimmedIntent || trimmedIntent.length > 500) return;
        onSubmit({ intent: trimmedIntent, context, mode, attachment });
        setIntent("");
        setAttachment(undefined);
        setAnnouncement(`已加入任务队列：${trimmedIntent}`);
        text.current?.focus();
      }}>
        <div className="agent-prompt-config">
          <SelectField label="任务上下文" items={promptContexts} value={context} onChange={key => {
            const option = promptContexts.find(item => item.id === key);
            if (option) setContext(option.id);
          }} />
          <SelectField label="执行方式" items={promptModes} value={mode} onChange={key => {
            const option = promptModes.find(item => item.id === key);
            if (option) setMode(option.id);
          }} />
        </div>
        <TextField className="mf-field agent-prompt-field" value={intent} onChange={setIntent}>
          <Label className="mf-field__label">任务意图</Label>
          <TextArea className="mf-input" ref={text} rows={3} maxLength={500}
            placeholder="例如：检查 390px 深色页面的任务表格和焦点顺序"
            onKeyDown={event => {
              if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey) || event.nativeEvent.isComposing) return;
              event.preventDefault();
              form.current?.requestSubmit();
            }} />
          <Text slot="description" className="mf-field__description">换行用 Enter，提交用 Ctrl / ⌘ + Enter。</Text>
        </TextField>
        <div className="agent-prompt-actions">
          <div className="agent-attachments">
            <FileTrigger onSelect={files => setAttachment(files?.[0]?.name)}>
              <Button ref={addAttachment} size="sm" intent="secondary"><Icon name="layers" className="agent-icon" /> 添加附件</Button>
            </FileTrigger>
            {attachment && <div className="agent-attachment">
              <bdi>{attachment}</bdi>
              <Button intent="quiet" size="sm" onPress={() => {
                addAttachment.current?.focus();
                setAttachment(undefined);
              }}>移除</Button>
            </div>}
          </div>
          <Button type="submit" isDisabled={!trimmedIntent}>加入任务队列 <Icon name="arrow" className="agent-icon" /></Button>
        </div>
      </form>
      {announcement && <p className="agent-prompt-feedback" role="status">{announcement}</p>}
    </section>
  );
}
