import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { getFontEmbedCSS, toPng } from "html-to-image";
import JSZip from "jszip";
import rough from "roughjs/bundled/rough.esm.js";
import {
  CaretDown,
  CaretUp,
  Check,
  CheckCircle,
  Clock,
  DotsSixVertical,
  DownloadSimple,
  FileText,
  ListDashes,
  Notebook,
  PenNib,
  PencilSimple,
  Plus,
  Sparkle,
  TreeStructure,
  X,
} from "@phosphor-icons/react";
import "@fontsource/ma-shan-zheng/chinese-simplified.css";
import "@fontsource/ma-shan-zheng/latin.css";
import "@fontsource/long-cang/chinese-simplified.css";
import "@fontsource/long-cang/latin.css";
import "@fontsource/zcool-kuaile/chinese-simplified.css";
import "@fontsource/zcool-kuaile/latin.css";

const initialSections = [
  {
    id: "mindset",
    title: "一、面试心态",
    children: ["1.1 候选人 ↔ 面试官，双向对等关系", "1.2 双方目标"],
  },
  {
    id: "before",
    title: "二、面试前必做",
    children: ["2.1 对齐预期", "2.2 信息收集排雷", "2.3 心态调整"],
  },
  {
    id: "content",
    title: "三、面试内容准备",
    children: ["3.A 个人发展路径", "3.B 故事自我展示", "3.C 问面试官的问题"],
  },
  {
    id: "process",
    title: "四、面试过程推进",
    children: ["4.1 自我介绍", "4.2 深入沟通", "4.3 结尾与确认"],
  },
  {
    id: "retro",
    title: "五、面试后复盘",
    children: ["5.1 复盘要点", "5.2 跟进行动"],
  },
];

const paperOptions = [
  { id: "classic", label: "米黄横线纸", src: "/assets/paper-classic-lined.png" },
  { id: "clean", label: "白色横线纸", src: "/assets/paper-clean-lined.png" },
  { id: "grid", label: "方格纸", src: "/assets/paper-grid.png" },
];

const palettes = [
  { id: "classic", label: "经典多色", colors: ["#e53a2d", "#264d99", "#252525", "#ddbd55"] },
  { id: "blue", label: "蓝黑为主", colors: ["#143b70", "#2f6fa7", "#17191c", "#a8c6dd"] },
  { id: "mono", label: "黑白系", colors: ["#181818", "#4d4d4d", "#868686", "#d2d2d2"] },
  { id: "warm", label: "暖色系", colors: ["#d65a35", "#c78349", "#562f2a", "#e9b4a1"] },
];

const fontOptions = [
  { id: "ma", label: "马善政手写体", css: '"Ma Shan Zheng"', scale: 1 },
  { id: "long", label: "龙藏手写体", css: '"Long Cang"', scale: 1 },
  { id: "zcool", label: "站酷快乐体", css: '"ZCOOL KuaiLe"', scale: 1 },
  { id: "shiguang", label: "平方时光体", css: '"PingFang ShiGuang"', scale: 1 },
  { id: "shaohua", label: "平方韶华体", css: '"PingFang ShaoHua"', scale: 1.1 },
  { id: "satuo", label: "平方洒脱体", css: '"PingFang SaTuo"', scale: 1 },
  { id: "dongzhu", label: "杨任东竹石体 Bold", css: '"YangRen DongZhu"', scale: 1 },
  { id: "jiangjun", label: "平方将军体", css: '"PingFang JiangJun"', scale: 1 },
  { id: "shoushu", label: "平方手书体", css: '"PingFang ShouShu"', scale: 1 },
];

const fontWeightOptions = [
  { value: 400, label: "常规", stroke: 0 },
  { value: 500, label: "稍粗", stroke: 0.12 },
  { value: 600, label: "加粗", stroke: 0.24 },
  { value: 700, label: "特粗", stroke: 0.38 },
];

const layoutOptions = [
  { id: "classroom", label: "课堂笔记", icon: Notebook },
  { id: "sop", label: "SOP 长图", icon: ListDashes },
  { id: "mindmap", label: "思维导图", icon: TreeStructure },
];

const brushOptions = [
  { id: "pencil", label: "铅笔", roughness: 1.55, bowing: 1.25, widthScale: 0.9, multiStroke: true },
  { id: "marker", label: "马克笔", roughness: 0.7, bowing: 1.6, widthScale: 1.55, multiStroke: false },
  { id: "chalk", label: "粉笔", roughness: 2.45, bowing: 1.15, widthScale: 1.15, multiStroke: true },
];

function stableSeed(value) {
  return [...String(value)].reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) % 2147483647, 17);
}

function SketchStroke({
  type = "line",
  orientation = "horizontal",
  color = "#252525",
  brush = "pencil",
  weight = 2,
  jitter = 2,
  seed = "stroke",
  className = "",
}) {
  const svgRef = useRef(null);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.replaceChildren();
    const preset = brushOptions.find((item) => item.id === brush) ?? brushOptions[0];
    const canvas = rough.svg(svg);
    const options = {
      stroke: color,
      strokeWidth: Math.max(0.8, weight * preset.widthScale),
      roughness: preset.roughness * (jitter / 2),
      bowing: preset.bowing * (0.8 + (jitter * 0.14)),
      disableMultiStroke: !preset.multiStroke,
      preserveVertices: false,
      seed: stableSeed(`${seed}-${brush}-${weight}-${jitter}`),
    };

    if (type === "arrow") {
      svg.appendChild(canvas.path("M 4 13 C 28 9, 58 17, 88 11", options));
      svg.appendChild(canvas.line(88, 11, 75, 3, { ...options, seed: options.seed + 1 }));
      svg.appendChild(canvas.line(88, 11, 76, 21, { ...options, seed: options.seed + 2 }));
      return;
    }

    if (type === "wave") {
      const wave = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const naturalWobble = ((stableSeed(`${seed}-${jitter}`) % 9) - 4) * 0.055;
      wave.setAttribute(
        "d",
        `M 2 ${8 + naturalWobble} C 10 ${5.4 - naturalWobble}, 18 ${5.2 + naturalWobble}, 27 7.8 C 36 ${10.4 + naturalWobble}, 45 ${10.2 - naturalWobble}, 54 7.4 C 63 ${4.9 + naturalWobble}, 73 ${5.4 - naturalWobble}, 81 7.9 C 88 ${10 + naturalWobble}, 94 ${9.6 - naturalWobble}, 98 7.5`,
      );
      wave.setAttribute("fill", "none");
      wave.setAttribute("stroke", color);
      wave.setAttribute("stroke-width", String(Math.max(0.8, weight * preset.widthScale)));
      wave.setAttribute("stroke-linecap", "round");
      wave.setAttribute("stroke-linejoin", "round");
      wave.setAttribute("stroke-opacity", brush === "chalk" ? "0.86" : brush === "pencil" ? "0.92" : "0.96");
      svg.appendChild(wave);
      return;
    }

    if (orientation === "vertical") {
      svg.appendChild(canvas.line(8, 3, 8, 97, options));
      return;
    }

    svg.appendChild(canvas.path("M 2 8 C 28 5, 64 11, 98 7", options));
  }, [brush, color, jitter, orientation, seed, type, weight]);

  return (
    <svg
      ref={svgRef}
      className={`sketch-stroke ${className}`}
      viewBox={orientation === "vertical" ? "0 0 16 100" : type === "arrow" ? "0 0 96 24" : "0 0 100 16"}
      preserveAspectRatio="none"
      aria-hidden="true"
    />
  );
}

function SketchBox({ color, brush, weight, jitter, seed = "box" }) {
  const svgRef = useRef(null);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.replaceChildren();
    const preset = brushOptions.find((item) => item.id === brush) ?? brushOptions[0];
    const canvas = rough.svg(svg);
    svg.appendChild(canvas.rectangle(3, 3, 94, 94, {
      stroke: color,
      strokeWidth: Math.max(0.8, weight * preset.widthScale),
      roughness: preset.roughness * (jitter / 2),
      bowing: preset.bowing,
      disableMultiStroke: !preset.multiStroke,
      fill: "none",
      seed: stableSeed(`${seed}-${brush}-${weight}-${jitter}`),
    }));
  }, [brush, color, jitter, seed, weight]);

  return <svg ref={svgRef} className="sketch-box" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" />;
}

function Editable({ id, as: Tag = "div", className = "", children, selected, onSelect }) {
  return (
    <Tag
      className={`editable ${className} ${selected === id ? "editable-active" : ""}`}
      contentEditable
      suppressContentEditableWarning
      onClick={(event) => {
        event.stopPropagation();
        onSelect(id);
      }}
      spellCheck={false}
    >
      {children}
    </Tag>
  );
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function PaperPage({
  title,
  paper,
  palette,
  font,
  fontWeight,
  density,
  layout,
  strokeBrush,
  strokeWeight,
  strokeJitter,
  selectedBlock,
  setSelectedBlock,
  pageRef,
}) {
  const paperSrc = paperOptions.find((item) => item.id === paper)?.src ?? paperOptions[0].src;
  const ink = palettes.find((item) => item.id === palette)?.colors ?? palettes[0].colors;
  const activeFont = fontOptions.find((item) => item.id === font) ?? fontOptions[0];
  const activeFontWeight = fontWeightOptions.find((item) => item.value === fontWeight) ?? fontWeightOptions[0];

  return (
    <article
      ref={pageRef}
      id="note-page"
      className={`paper-page layout-${layout}`}
      onClick={() => setSelectedBlock("")}
      style={{
        backgroundImage: `url(${paperSrc})`,
        "--ink-red": ink[0],
        "--ink-blue": ink[1],
        "--ink-black": ink[2],
        "--marker": ink[3],
        "--note-font": activeFont.css,
        "--note-weight": fontWeight,
        "--note-embolden": `${activeFontWeight.stroke}px`,
        "--note-density": (density / 68) * activeFont.scale,
      }}
    >
      <header className="note-header">
        <Editable id="page-title" as="h1" selected={selectedBlock} onSelect={setSelectedBlock}>
          {title}
        </Editable>
        <div className="principle-wrap">
          <Editable id="principle" className="principle" selected={selectedBlock} onSelect={setSelectedBlock}>
            核心原则：不背稿、不背题、不靠模板
          </Editable>
          <SketchStroke type="wave" color={ink[0]} brush={strokeBrush} weight={strokeWeight * 0.82} jitter={strokeJitter} seed="principle-wave" className="hand-wave" />
        </div>
      </header>

      <section id="note-section-mindset" className="note-section">
        <Editable id="section-one" as="h2" className="section-title blue-title" selected={selectedBlock} onSelect={setSelectedBlock}>
          一、面试心态
        </Editable>
        <Editable id="equal" className="note-lead" selected={selectedBlock} onSelect={setSelectedBlock}>
          候选人 ↔ 面试官，双向对等关系
        </Editable>
        <Editable id="goals" className="center-blue" selected={selectedBlock} onSelect={setSelectedBlock}>
          双方目标
        </Editable>

        <div className="note-columns two comparison">
          <div>
            <Editable id="candidate" className="highlight yellow" selected={selectedBlock} onSelect={setSelectedBlock}>
              候选人（找工作）：
            </Editable>
            <Editable id="candidate-list" className="note-list" selected={selectedBlock} onSelect={setSelectedBlock}>
              ① 用劳动付出兑换合理回报；<br />② 完成一场能被对方认可的愉快对话。
            </Editable>
          </div>
          <div>
            <Editable id="interviewer" className="highlight yellow" selected={selectedBlock} onSelect={setSelectedBlock}>
              面试官：
            </Editable>
            <Editable id="interviewer-list" className="note-list" selected={selectedBlock} onSelect={setSelectedBlock}>
              ① 找人填补岗位、解决业务；<br />② 花费最少时间找到合适人选 offer。
            </Editable>
          </div>
          <SketchStroke
            orientation="vertical"
            color={ink[0]}
            brush={strokeBrush}
            weight={strokeWeight}
            jitter={strokeJitter}
            seed="comparison-divider"
            className="comparison-divider"
          />
        </div>

        <div className="logic-row">
          <SketchStroke color={ink[0]} brush={strokeBrush} weight={strokeWeight} jitter={strokeJitter} seed="logic-left" className="logic-rule" />
          <Editable id="logic" className="logic-copy" selected={selectedBlock} onSelect={setSelectedBlock}>
            心理博弈逻辑：<b>回报 &gt; 成本投入</b>
          </Editable>
          <SketchStroke color={ink[0]} brush={strokeBrush} weight={strokeWeight} jitter={strokeJitter} seed="logic-right" className="logic-rule" />
        </div>

        <div className="note-columns four stakes">
          {[
            ["候选人收益：", "① 薪资福利\n② 未来发展", "mint"],
            ["候选人投入成本：", "① 跳槽风险成本\n② 学习适应成本\n③ 劳动工作量\n④ 能力/资源利用", "blue"],
            ["面试官回报：", "① 工作产出\n② 对方转正后的带动影响", "yellow"],
            ["面试官投入成本：", "① 薪资\n② 新人培养\n③ 管理成本", "blue"],
          ].map(([heading, copy, color], index) => (
            <div className="stake" key={heading}>
              <div>
                <Editable id={`stake-heading-${index}`} className={`highlight ${color}`} selected={selectedBlock} onSelect={setSelectedBlock}>
                  {heading}
                </Editable>
                <Editable id={`stake-copy-${index}`} className="stake-copy" selected={selectedBlock} onSelect={setSelectedBlock}>
                  {copy.split("\n").map((line) => <span key={line}>{line}<br /></span>)}
                </Editable>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="note-section-before" className="note-section compact-section">
        <SketchStroke color={ink[0]} brush={strokeBrush} weight={strokeWeight} jitter={strokeJitter} seed="section-before" className="section-hand-divider" />
        <Editable id="section-two" as="h2" className="section-title blue-title" selected={selectedBlock} onSelect={setSelectedBlock}>
          二、面试前必做
        </Editable>
        <Editable id="before-list" className="note-list numbered" selected={selectedBlock} onSelect={setSelectedBlock}>
          <span className="numbered-transition">
            <b>①</b>
            <span className="transition-copy">
              对齐预期：职级、预期薪资、岗位性质（是否带人）{" "}
              <span className="transition-tail">
                <SketchStroke type="arrow" color={ink[2]} brush={strokeBrush} weight={strokeWeight} jitter={strokeJitter} seed="inline-arrow" className="inline-arrow" />
                <span className="transition-target">预留谈判空间</span>
              </span>
            </span>
          </span>
          <span><b>②</b> 信息收集排雷：同行圈子、校友、合作伙伴、公开财报</span>
          <span className="subline">↳ 拿到 dirty offer：设想对方不给试用期、同等打探、无意发放 offer 的应对方案</span>
          <span><b>③</b> 心态调整</span>
        </Editable>
        <div className="red-callout-wrap">
          <Editable id="three-things" className="red-callout" selected={selectedBlock} onSelect={setSelectedBlock}>
            面试全程只做好三件事：能力证明 + 意愿表达 + 建立联系
          </Editable>
          <SketchStroke type="wave" color={ink[0]} brush={strokeBrush} weight={strokeWeight * 0.82} jitter={strokeJitter} seed="three-things-wave" className="hand-wave" />
        </div>
      </section>

      <section id="note-section-content" className="note-section compact-section">
        <SketchStroke color={ink[0]} brush={strokeBrush} weight={strokeWeight} jitter={strokeJitter} seed="section-content" className="section-hand-divider" />
        <Editable id="section-three" as="h2" className="section-title blue-title" selected={selectedBlock} onSelect={setSelectedBlock}>
          三、面试内容准备
        </Editable>
        <div className="note-columns three preparation">
          <div>
            <Editable id="prep-a" className="highlight yellow subheading" selected={selectedBlock} onSelect={setSelectedBlock}>
              A. 个人发展路径
            </Editable>
            <Editable id="prep-a-copy" className="small-copy" selected={selectedBlock} onSelect={setSelectedBlock}>
              • 梳理：经历、变化原因、里程碑 / 高光点<br />• 无关经历不提，只按 JD 匹配<br />• 话术逻辑：肯定对方 → 我适配岗位 → 愿意加入
            </Editable>
          </div>
          <div>
            <SketchStroke orientation="vertical" color={ink[0]} brush={strokeBrush} weight={strokeWeight} jitter={strokeJitter} seed="prep-divider-one" className="prep-divider" />
            <Editable id="prep-b" className="highlight yellow subheading" selected={selectedBlock} onSelect={setSelectedBlock}>
              B. 准备 1–2 个故事做自我展示
            </Editable>
            <Editable id="prep-b-copy" className="small-copy" selected={selectedBlock} onSelect={setSelectedBlock}>
              <b className="red-ink">核心：匹配岗位，最大化展现自身优势</b><br />1. 锚定 JD 撰写事例：围绕需求讲故事<br />2. 关键价值证明：突出独家贡献<br />3. 软能力展示：沟通表达 / 结构化思维
            </Editable>
          </div>
          <div>
            <SketchStroke orientation="vertical" color={ink[0]} brush={strokeBrush} weight={strokeWeight} jitter={strokeJitter} seed="prep-divider-two" className="prep-divider" />
            <Editable id="prep-c" className="highlight yellow subheading" selected={selectedBlock} onSelect={setSelectedBlock}>
              C. 准备 1 个反问
            </Editable>
            <div className="warning-wrap">
              <SketchBox color={ink[0]} brush={strokeBrush} weight={strokeWeight} jitter={strokeJitter} seed="warning-box" />
              <Editable id="prep-c-copy" className="warning-box" selected={selectedBlock} onSelect={setSelectedBlock}>
                <b>禁忌：</b><br />× 不要质问<br />× 不要反问挖社<br />× 不要辩论
              </Editable>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

function OutlinePanel({ sections, setSections, selectedSection, setSelectedSection, onImport }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [expanded, setExpanded] = useState(() => Object.fromEntries(initialSections.map((item) => [item.id, true])));
  const inputRef = useRef(null);

  const addSection = () => {
    const id = `custom-${Date.now()}`;
    const next = { id, title: "新章节（点击正文可编辑）", children: ["新增要点"] };
    setSections((items) => [...items, next]);
    setSelectedSection(id);
    setExpanded((items) => ({ ...items, [id]: true }));
  };

  const dropAt = (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    setSections((items) => {
      const next = [...items];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
  };

  const selectSection = (id) => {
    setSelectedSection(id);
    document.getElementById(`note-section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside className="outline-panel" aria-label="内容大纲">
      <div className="outline-actions">
        <button className="secondary-button" onClick={addSection}><Plus size={17} />新建文本段落</button>
        <button className="secondary-button" onClick={() => inputRef.current?.click()}><FileText size={17} />导入 Markdown</button>
        <input ref={inputRef} type="file" accept=".md,.markdown,.txt" hidden onChange={onImport} />
      </div>
      <div className="outline-list">
        {sections.map((section, index) => (
          <div
            className={`outline-section ${selectedSection === section.id ? "selected" : ""}`}
            key={section.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => dropAt(index)}
          >
            <div className="outline-heading">
              <DotsSixVertical className="drag-handle" size={20} />
              <button className="outline-title" onClick={() => selectSection(section.id)}>{section.title}</button>
              <button
                className="icon-button small"
                aria-label={expanded[section.id] ? "收起" : "展开"}
                onClick={() => setExpanded((items) => ({ ...items, [section.id]: !items[section.id] }))}
              >
                {expanded[section.id] ? <CaretUp size={16} /> : <CaretDown size={16} />}
              </button>
            </div>
            {expanded[section.id] && (
              <div className="outline-children">
                {section.children.map((child) => <button key={child} onClick={() => selectSection(section.id)}><DotsSixVertical size={16} />{child}</button>)}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="outline-helper">拖拽可调整顺序，点击正文直接编辑</div>
      <div className="outline-meta">共 {sections.length} 个章节，{sections.reduce((sum, item) => sum + item.children.length, 0)} 个段落</div>
    </aside>
  );
}

function StylePanel({
  paper,
  setPaper,
  palette,
  setPalette,
  font,
  setFont,
  fontWeight,
  setFontWeight,
  density,
  setDensity,
  layout,
  setLayout,
  strokeBrush,
  setStrokeBrush,
  strokeWeight,
  setStrokeWeight,
  strokeJitter,
  setStrokeJitter,
  applyAll,
}) {
  return (
    <aside className="style-panel" aria-label="整页风格">
      <div className="panel-heading"><h2>整页风格</h2><CaretUp size={16} /></div>

      <section className="control-section">
        <h3>主题风格</h3>
        <div className="theme-row">
          {[
            ["classic", "课堂笔记", "classic", "classic"],
            ["vintage", "复古笔记", "classic", "warm"],
            ["fresh", "清新手账", "clean", "blue"],
            ["academic", "学术素稿", "clean", "mono"],
          ].map(([id, label, nextPaper, nextPalette]) => (
            <button
              key={id}
              className={`theme-choice ${paper === nextPaper && palette === nextPalette ? "selected" : ""}`}
              onClick={() => { setPaper(nextPaper); setPalette(nextPalette); }}
            >
              <img src={paperOptions.find((item) => item.id === nextPaper)?.src} alt="" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="control-section">
        <h3>纸张选择</h3>
        <div className="paper-row">
          {paperOptions.map((item) => (
            <button key={item.id} className={`paper-choice ${paper === item.id ? "selected" : ""}`} onClick={() => setPaper(item.id)}>
              <img src={item.src} alt={item.label} /><span>{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="control-section">
        <h3>墨水配色</h3>
        <div className="palette-row">
          {palettes.map((item) => (
            <button key={item.id} className={`palette-choice ${palette === item.id ? "selected" : ""}`} onClick={() => setPalette(item.id)} aria-label={item.label} title={item.label}>
              {item.colors.map((color) => <span key={color} style={{ backgroundColor: color }} />)}
            </button>
          ))}
        </div>
      </section>

      <section className="control-section stroke-control">
        <h3>线段与箭头</h3>
        <div className="brush-row">
          {brushOptions.map((item) => (
            <button
              key={item.id}
              className={`brush-choice ${strokeBrush === item.id ? "selected" : ""}`}
              onClick={() => setStrokeBrush(item.id)}
              aria-label={`${item.label}笔刷`}
            >
              <SketchStroke brush={item.id} weight={2.2} jitter={strokeJitter} seed={`preview-${item.id}`} className="brush-preview" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <label className="stroke-slider">
          <span>笔刷粗细</span><b>{strokeWeight}px</b>
          <input aria-label="笔刷粗细" type="range" min="1" max="5" step="0.5" value={strokeWeight} onChange={(event) => setStrokeWeight(Number(event.target.value))} />
        </label>
        <label className="stroke-slider">
          <span>手绘抖动</span><b>{strokeJitter === 1 ? "轻" : strokeJitter === 2 ? "中" : "重"}</b>
          <input aria-label="手绘抖动" type="range" min="1" max="3" step="1" value={strokeJitter} onChange={(event) => setStrokeJitter(Number(event.target.value))} />
        </label>
      </section>

      <section className="control-section">
        <label className="control-label" htmlFor="font-choice">手写字体</label>
        <select id="font-choice" value={font} onChange={(event) => setFont(event.target.value)}>
          {fontOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <div className="font-weight-label"><span>字体粗细</span><b>{fontWeight} · {fontWeightOptions.find((item) => item.value === fontWeight)?.label}</b></div>
        <div className="font-weight-row" role="group" aria-label="字体粗细">
          {fontWeightOptions.map(({ value: weight, label }) => (
            <button
              key={weight}
              className={`font-weight-choice ${fontWeight === weight ? "selected" : ""}`}
              aria-pressed={fontWeight === weight}
              aria-label={`字重 ${weight} ${label}`}
              onClick={() => setFontWeight(weight)}
            >
              <span>{weight}</span>
              <small>{label}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="control-section density-control">
        <div className="control-label"><span>笔迹浓淡</span><span>{density}%</span></div>
        <input aria-label="笔迹浓淡" type="range" min="52" max="82" value={density} onChange={(event) => setDensity(Number(event.target.value))} />
      </section>

      <section className="control-section">
        <h3>版式布局</h3>
        <div className="layout-row">
          {layoutOptions.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={`layout-choice ${layout === item.id ? "selected" : ""}`} onClick={() => setLayout(item.id)}>
                <Icon size={27} weight="light" /><span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="control-section compact-control">
        <div className="control-label"><span>页边距</span><b>适中</b></div>
      </section>
      <button className="primary-wide" onClick={applyAll}><Sparkle size={18} weight="fill" />应用到全部页面</button>
      <button className="reset-button" onClick={() => { setPaper("classic"); setPalette("classic"); setFont("ma"); setFontWeight(400); setDensity(68); setLayout("classroom"); setStrokeBrush("pencil"); setStrokeWeight(2); setStrokeJitter(2); }}>重置当前页样式</button>
    </aside>
  );
}

function BatchDialog({ names, setNames, onClose, onGenerate, generating }) {
  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="batch-dialog" role="dialog" aria-modal="true" aria-labelledby="batch-title">
        <div className="dialog-heading">
          <div><span className="eyebrow">批量生成</span><h2 id="batch-title">一次产出多份可编辑笔记</h2></div>
          <button className="icon-button" aria-label="关闭" onClick={onClose}><X size={20} /></button>
        </div>
        <p>下面每一行会生成一张独立 PNG，并自动打包为 ZIP。</p>
        <div className="batch-list">
          {names.map((name, index) => (
            <label key={index}><FileText size={19} /><input value={name} onChange={(event) => setNames((items) => items.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /><CheckCircle size={18} color="#2a9b68" weight="fill" /></label>
          ))}
        </div>
        <div className="dialog-actions">
          <button className="secondary-button" onClick={() => setNames((items) => [...items, `新笔记 ${items.length + 1}`])}><Plus size={17} />添加一份</button>
          <button className="primary-button" disabled={generating} onClick={onGenerate}><Sparkle size={18} weight="fill" />{generating ? "正在生成…" : `生成 ${names.length} 份`}</button>
        </div>
      </section>
    </div>
  );
}

export function App() {
  const [sections, setSections] = useState(initialSections);
  const [selectedSection, setSelectedSection] = useState("mindset");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [title, setTitle] = useState("极简面试准备 SOP");
  const [paper, setPaper] = useState("classic");
  const [palette, setPalette] = useState("classic");
  const [font, setFont] = useState("ma");
  const [fontWeight, setFontWeight] = useState(400);
  const [density, setDensity] = useState(68);
  const [layout, setLayout] = useState("classroom");
  const [strokeBrush, setStrokeBrush] = useState("pencil");
  const [strokeWeight, setStrokeWeight] = useState(2);
  const [strokeJitter, setStrokeJitter] = useState(2);
  const [toast, setToast] = useState("");
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchNames, setBatchNames] = useState(["面试 SOP", "求职复盘", "项目总结"]);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const pageRef = useRef(null);
  const fontCssRef = useRef("");

  const savedPayload = useMemo(
    () => ({ paper, palette, font, fontWeight, density, layout, strokeBrush, strokeWeight, strokeJitter }),
    [paper, palette, font, fontWeight, density, layout, strokeBrush, strokeWeight, strokeJitter],
  );
  useEffect(() => {
    localStorage.setItem("handnote-style", JSON.stringify(savedPayload));
  }, [savedPayload]);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const capturePage = async () => {
    if (!pageRef.current) throw new Error("页面尚未就绪");
    if (!fontCssRef.current) {
      fontCssRef.current = await getFontEmbedCSS(pageRef.current);
    }
    return toPng(pageRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#fffdf8",
      fontEmbedCSS: fontCssRef.current,
      filter: (node) => !(node instanceof HTMLElement && node.classList.contains("editable-active")),
    });
  };

  const exportPng = async () => {
    try {
      setExporting(true);
      setSelectedBlock("");
      const dataUrl = await capturePage();
      downloadBlob(await (await fetch(dataUrl)).blob(), `${title}.png`);
      notify("高清 PNG 已导出");
    } catch (error) {
      notify(`导出失败：${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  const generateBatch = async () => {
    const validNames = batchNames.map((item) => item.trim()).filter(Boolean);
    if (!validNames.length) return;
    const originalTitle = title;
    try {
      setGenerating(true);
      setSelectedBlock("");
      const zip = new JSZip();
      for (const name of validNames) {
        flushSync(() => setTitle(name));
        await document.fonts.ready;
        const dataUrl = await capturePage();
        zip.file(`${name}.png`, dataUrl.split(",")[1], { base64: true });
      }
      flushSync(() => setTitle(originalTitle));
      downloadBlob(await zip.generateAsync({ type: "blob" }), "手写笔记批量包.zip");
      setBatchOpen(false);
      notify(`已生成 ${validNames.length} 份，并打包下载`);
    } catch (error) {
      flushSync(() => setTitle(originalTitle));
      notify(`批量生成失败：${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const importMarkdown = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const parsed = [];
    let current = null;
    lines.forEach((line) => {
      if (/^#{1,3}\s+/.test(line)) {
        current = { id: `import-${parsed.length}-${Date.now()}`, title: line.replace(/^#{1,3}\s+/, ""), children: [] };
        parsed.push(current);
      } else {
        if (!current) {
          current = { id: `import-0-${Date.now()}`, title: file.name.replace(/\.(md|markdown|txt)$/i, ""), children: [] };
          parsed.push(current);
        }
        current.children.push(line.replace(/^[-*+]\s+/, ""));
      }
    });
    if (parsed.length) {
      setSections(parsed);
      setSelectedSection(parsed[0].id);
      setTitle(file.name.replace(/\.(md|markdown|txt)$/i, ""));
      notify(`已导入 ${parsed.length} 个章节`);
    }
    event.target.value = "";
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><PenNib size={27} weight="fill" /><span>小红书手写笔记</span></div>
        <div className="document-title"><span>{title}</span><PencilSimple size={16} /><span className="save-status"><Clock size={15} />已保存</span></div>
        <div className="top-actions">
          <button className="secondary-button export-button" onClick={exportPng} disabled={exporting}><DownloadSimple size={18} />{exporting ? "导出中…" : "导出 PNG"}</button>
          <button className="primary-button" onClick={() => setBatchOpen(true)}><Sparkle size={18} weight="fill" />批量生成</button>
        </div>
      </header>

      <main className="workspace">
        <OutlinePanel
          sections={sections}
          setSections={setSections}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          onImport={importMarkdown}
        />
        <section className="canvas-stage" aria-label="手写笔记编辑区">
          <PaperPage
            title={title}
            paper={paper}
            palette={palette}
            font={font}
            fontWeight={fontWeight}
            density={density}
            layout={layout}
            strokeBrush={strokeBrush}
            strokeWeight={strokeWeight}
            strokeJitter={strokeJitter}
            selectedBlock={selectedBlock}
            setSelectedBlock={setSelectedBlock}
            pageRef={pageRef}
          />
        </section>
        <StylePanel
          paper={paper}
          setPaper={setPaper}
          palette={palette}
          setPalette={setPalette}
          font={font}
          setFont={setFont}
          fontWeight={fontWeight}
          setFontWeight={setFontWeight}
          density={density}
          setDensity={setDensity}
          layout={layout}
          setLayout={setLayout}
          strokeBrush={strokeBrush}
          setStrokeBrush={setStrokeBrush}
          strokeWeight={strokeWeight}
          setStrokeWeight={setStrokeWeight}
          strokeJitter={strokeJitter}
          setStrokeJitter={setStrokeJitter}
          applyAll={() => notify("样式已应用到全部页面")}
        />
      </main>

      {batchOpen && <BatchDialog names={batchNames} setNames={setBatchNames} onClose={() => setBatchOpen(false)} onGenerate={generateBatch} generating={generating} />}
      {toast && <div className="toast"><Check size={17} weight="bold" />{toast}</div>}
    </div>
  );
}
