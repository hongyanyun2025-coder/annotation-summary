var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => AnnotationSummaryPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian4 = require("obsidian");

// src/settings.ts
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  summaryTemplate: "",
  hotkeyHighlight: "",
  hotkeyComment: "",
  hotkeyUnderline: "",
  annotationSuffix: ".annotations",
  autoRefreshOnSave: false
};
var DEFAULT_TEMPLATE = `# \u{1F4DD} \u6807\u6CE8\u6C47\u603B

> \u6E90\u6587\u4EF6\uFF1A{{sourcePath}}
> \u66F4\u65B0\u65F6\u95F4\uFF1A{{date}}

---

## \u{1F7E1} \u9AD8\u4EAE

{{#highlights}}
**{{text}}**

> \u539F\u6587\uFF1A{{sentence}}
{{#hasComment}}> \u{1F4AC} {{comment}}

{{/hasComment}}
---

{{/highlights}}

## \u{1F4CC} \u4E0B\u5212\u7EBF

{{#underlines}}
**<u>{{text}}</u>**

> \u539F\u6587\uFF1A{{sentence}}
{{#hasComment}}> \u{1F4AC} {{comment}}

{{/hasComment}}
---

{{/underlines}}

## \u{1F3A8} \u5F69\u8272\u6587\u5B57

{{#colors}}
**{{text}}**

> \u539F\u6587\uFF1A{{sentence}}
{{#hasComment}}> \u{1F4AC} {{comment}}

{{/hasComment}}
---

{{/colors}}
`;
var AnnotationSummarySettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Annotation Summary Settings" });
    new import_obsidian.Setting(containerEl).setName("Summary Template").setDesc("Custom template for summary notes. Use {{highlights}}, {{comments}}, {{underlines}}, {{sourcePath}}, {{date}} as variables.").addTextArea((text) => text.setPlaceholder(DEFAULT_TEMPLATE).setValue(this.plugin.settings.summaryTemplate || DEFAULT_TEMPLATE).onChange(async (value) => {
      this.plugin.settings.summaryTemplate = value;
      await this.plugin.saveSettings();
    })).setName("Template Editor");
    new import_obsidian.Setting(containerEl).setName("Highlight Hotkey").setDesc("Keyboard shortcut for highlighting selected text (e.g., Ctrl+Shift+H). Leave empty to use command palette only.").addText((text) => text.setPlaceholder("e.g., Ctrl+Shift+H").setValue(this.plugin.settings.hotkeyHighlight).onChange(async (value) => {
      this.plugin.settings.hotkeyHighlight = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Comment Hotkey").setDesc("Keyboard shortcut for adding a comment to selected text (e.g., Ctrl+Shift+C). Leave empty to use command palette only.").addText((text) => text.setPlaceholder("e.g., Ctrl+Shift+C").setValue(this.plugin.settings.hotkeyComment).onChange(async (value) => {
      this.plugin.settings.hotkeyComment = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Underline Hotkey").setDesc("Keyboard shortcut for underlining selected text (e.g., Ctrl+Shift+U). Leave empty to use command palette only.").addText((text) => text.setPlaceholder("e.g., Ctrl+Shift+U").setValue(this.plugin.settings.hotkeyUnderline).onChange(async (value) => {
      this.plugin.settings.hotkeyUnderline = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Annotation File Suffix").setDesc("Suffix for annotation summary files. Default: .annotations (e.g., notes.md -> notes.annotations.md)").addText((text) => text.setPlaceholder(".annotations").setValue(this.plugin.settings.annotationSuffix).onChange(async (value) => {
      this.plugin.settings.annotationSuffix = value || ".annotations";
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Auto Refresh on Save").setDesc("Automatically update the summary note when the source file is saved.").addToggle((toggle) => toggle.setValue(this.plugin.settings.autoRefreshOnSave).onChange(async (value) => {
      this.plugin.settings.autoRefreshOnSave = value;
      await this.plugin.saveSettings();
    }));
    containerEl.createEl("h3", { text: "Template Variables" });
    const helpEl = containerEl.createEl("div", { cls: "annotation-summary-help" });
    helpEl.innerHTML = `
			<ul>
				<li><code>{{sourcePath}}</code> - Path of the source file</li>
				<li><code>{{date}}</code> - Current date/time</li>
				<li><code>{{highlights}}</code> - List of highlighted annotations</li>
				<li><code>{{comments}}</code> - List of comment annotations</li>
				<li><code>{{underlines}}</code> - List of underlined annotations</li>
				<li>Within each block: <code>{{text}}</code>, <code>{{sentence}}</code>, <code>{{line}}</code>, <code>{{comment}}</code></li>
			</ul>
		`;
  }
};

// src/annotation-service.ts
var import_obsidian2 = require("obsidian");
var AnnotationService = class {
  /**
   * Apply highlight to selected text: wrap with ==...==
   */
  static applyHighlight(editor) {
    const selection = editor.getSelection();
    if (!selection || selection.trim().length === 0) {
      new import_obsidian2.Notice("Please select some text first.");
      return false;
    }
    if (selection.startsWith("==") && selection.endsWith("==")) {
      new import_obsidian2.Notice("Text is already highlighted.");
      return false;
    }
    const highlighted = `==${selection}==`;
    editor.replaceSelection(highlighted);
    return true;
  }
  /**
   * Apply underline to selected text: wrap with <u>...</u>
   */
  static applyUnderline(editor) {
    const selection = editor.getSelection();
    if (!selection || selection.trim().length === 0) {
      new import_obsidian2.Notice("Please select some text first.");
      return false;
    }
    if (selection.startsWith("<u>") && selection.endsWith("</u>")) {
      new import_obsidian2.Notice("Text is already underlined.");
      return false;
    }
    const underlined = `<u>${selection}</u>`;
    editor.replaceSelection(underlined);
    return true;
  }
  /**
   * Apply colored text to selected text.
   * @param color - Color name (red, yellow, green, blue, orange)
   */
  static applyColor(editor, color = "red") {
    const selection = editor.getSelection();
    if (!selection || selection.trim().length === 0) {
      new import_obsidian2.Notice("Please select some text first.");
      return false;
    }
    const colorMap = {
      red: "#e91e63",
      yellow: "#ff9800",
      green: "#4caf50",
      blue: "#2196f3",
      orange: "#ff5722"
    };
    const hexColor = colorMap[color] || colorMap["red"];
    const colorRegex = new RegExp(`<span[^>]*style="[^"]*color:\\s*${hexColor}[^"]*"[^>]*>.*</span>`, "i");
    if (colorRegex.test(selection)) {
      new import_obsidian2.Notice(`Text is already colored with ${color}.`);
      return false;
    }
    const colored = `<span style="color: ${hexColor}">${selection}</span>`;
    editor.replaceSelection(colored);
    return true;
  }
  /**
   * Apply comment to selected text or to the annotation at cursor position.
   * Inserts an inline comment using simple %%...%% markers that work well in source mode.
   */
  static async applyComment(editor, app) {
    const selection = editor.getSelection();
    const buildCommentBlock = (commentText2 = "") => {
      return ` \u{1F4AC} <span class="annotation-comment-label">comment:</span> <span class="annotation-comment-text">${commentText2}</span>`;
    };
    if (selection && selection.trim().length > 0) {
      const isHighlighted = selection.startsWith("==") && selection.endsWith("==");
      const isUnderlined = selection.startsWith("<u>") && selection.endsWith("</u>");
      const isColored = selection.startsWith("<span") && /style="[^"]*color:/.test(selection) && selection.includes("</span>");
      const hasComment = /annotation-comment-text/.test(selection);
      if (hasComment) {
        new import_obsidian2.Notice("\u6B64\u6807\u6CE8\u5DF2\u6709\u5907\u6CE8");
        return false;
      }
      const commentText2 = await this.promptForComment(app);
      const sanitizedText2 = commentText2.replace(/[\r\n]+/g, " ").trim();
      let commented = "";
      const commentBlock2 = buildCommentBlock(sanitizedText2);
      if (isHighlighted) {
        commented = `${selection}${commentBlock2}`;
      } else if (isUnderlined) {
        commented = `${selection}${commentBlock2}`;
      } else if (isColored) {
        commented = `${selection}${commentBlock2}`;
      } else {
        commented = `==${selection}==${commentBlock2}`;
      }
      editor.replaceSelection(commented);
      return true;
    }
    const cursor = editor.getCursor("from");
    const line = editor.getLine(cursor.line);
    const cursorCh = cursor.ch;
    const annotations = [];
    const hasImmediateComment = (annotationEnd, nextAnnotationStart) => {
      const betweenContent = line.substring(annotationEnd, nextAnnotationStart);
      return /<span[^>]*class="annotation-comment-text"[^>]*>/.test(betweenContent);
    };
    const rawAnnotations = [];
    let tempMatch;
    const highlightRegex = /==([\s\S]+?)==/g;
    while ((tempMatch = highlightRegex.exec(line)) !== null) {
      rawAnnotations.push({
        type: "highlight",
        index: tempMatch.index,
        end: tempMatch.index + tempMatch[0].length,
        text: tempMatch[1].trim()
      });
    }
    const underlineRegex = /<u>([\s\S]+?)<\/u>/g;
    while ((tempMatch = underlineRegex.exec(line)) !== null) {
      rawAnnotations.push({
        type: "underline",
        index: tempMatch.index,
        end: tempMatch.index + tempMatch[0].length,
        text: tempMatch[1].trim()
      });
    }
    const colorRegex = /<span[^>]*style="[^"]*color:\s*(#[0-9a-fA-F]+)[^"]*"[^>]*>([\s\S]+?)<\/span>/gi;
    while ((tempMatch = colorRegex.exec(line)) !== null) {
      rawAnnotations.push({
        type: "color",
        index: tempMatch.index,
        end: tempMatch.index + tempMatch[0].length,
        text: tempMatch[2].trim(),
        color: tempMatch[1]
      });
    }
    rawAnnotations.sort((a, b) => a.index - b.index);
    for (let i = 0; i < rawAnnotations.length; i++) {
      const ann = rawAnnotations[i];
      const nextStart = i + 1 < rawAnnotations.length ? rawAnnotations[i + 1].index : line.length;
      const hasComment = hasImmediateComment(ann.end, nextStart);
      annotations.push({
        ...ann,
        hasComment
      });
    }
    if (annotations.length === 0) {
      new import_obsidian2.Notice("\u672A\u627E\u5230\u6807\u6CE8\uFF0C\u8BF7\u5148\u9009\u4E2D\u6587\u672C");
      return false;
    }
    let closest = null;
    for (const ann of annotations) {
      if (!ann.hasComment && cursorCh >= ann.index && cursorCh <= ann.end) {
        closest = ann;
        break;
      }
    }
    if (!closest) {
      let minDist = Infinity;
      for (const ann of annotations) {
        if (!ann.hasComment) {
          const dist = Math.min(Math.abs(cursorCh - ann.index), Math.abs(cursorCh - ann.end));
          if (dist < minDist) {
            minDist = dist;
            closest = ann;
          }
        }
      }
    }
    if (!closest) {
      new import_obsidian2.Notice("\u6B64\u884C\u6240\u6709\u6807\u6CE8\u5DF2\u6709\u5907\u6CE8");
      return false;
    }
    const commentText = await this.promptForComment(app);
    const sanitizedText = commentText.replace(/[\r\n]+/g, " ").trim();
    const commentBlock = buildCommentBlock(sanitizedText);
    const beforeAnnotation = line.substring(0, closest.end);
    const afterAnnotation = line.substring(closest.end);
    const newLine = beforeAnnotation + commentBlock + afterAnnotation;
    editor.setLine(cursor.line, newLine);
    return true;
  }
  /**
   * Prompt user for comment text using Obsidian Modal API.
   * Supports multi-line input, but sanitizes newlines to prevent span breakage.
   * Returns the user's input (empty string if cancelled).
   */
  static async promptForComment(app) {
    if (!app) {
      app = window.app;
    }
    if (!app) {
      new import_obsidian2.Notice("Unable to open comment dialog");
      return "";
    }
    return new Promise((resolve) => {
      class CommentModal extends import_obsidian2.Modal {
        constructor() {
          super(...arguments);
          this.result = "";
        }
        onOpen() {
          const { contentEl } = this;
          contentEl.createEl("h2", { text: "Add Comment" });
          const inputContainer = contentEl.createDiv();
          inputContainer.style.marginTop = "1em";
          const textareaEl = inputContainer.createEl("textarea", {
            attr: { placeholder: "Enter your comment...", rows: 4 }
          });
          textareaEl.style.width = "100%";
          textareaEl.style.minHeight = "80px";
          textareaEl.style.resize = "vertical";
          textareaEl.style.fontFamily = "inherit";
          textareaEl.style.fontSize = "inherit";
          textareaEl.addEventListener("input", () => {
            this.result = textareaEl.value;
          });
          textareaEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              this.close();
            } else if (e.key === "Escape") {
              this.result = "";
              this.close();
            }
          });
          const hintEl = contentEl.createDiv();
          hintEl.style.marginTop = "0.5em";
          hintEl.style.fontSize = "0.85em";
          hintEl.style.color = "var(--text-muted)";
          hintEl.textContent = "Press Cmd/Ctrl+Enter to submit, Escape to cancel";
          new import_obsidian2.Setting(contentEl).addButton(
            (btn) => btn.setButtonText("Submit").setCta().onClick(() => {
              this.close();
            })
          ).addButton(
            (btn) => btn.setButtonText("Cancel").onClick(() => {
              this.result = "";
              this.close();
            })
          );
          setTimeout(() => textareaEl.focus(), 100);
        }
        onClose() {
          const { contentEl } = this;
          contentEl.empty();
          resolve(this.result);
        }
      }
      const modal = new CommentModal(app);
      modal.open();
    });
  }
  /**
   * Extract all annotations from the given document content.
   * Supports both formats:
   * 1. Inline: ==text== 💬 comment: user comment text
   * 2. Details: ==text== <details class="annotation-comment">...</details>
   */
  static extractAnnotations(content) {
    const lines = content.split("\n");
    const annotations = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      const highlightRegex = /==([\s\S]+?)==/g;
      let match;
      while ((match = highlightRegex.exec(line)) !== null) {
        const text = match[1].trim();
        const sentence = this.extractSentence(line, match.index + match[0].length);
        const afterHighlight = line.substring(match.index + match[0].length);
        let comment;
        const spanMatch = /<span[^>]*class="annotation-comment-text"[^>]*>([\s\S]*?)<\/span>/.exec(afterHighlight);
        if (spanMatch) {
          comment = spanMatch[1].trim() || void 0;
        }
        annotations.push({
          text,
          type: "highlight",
          comment,
          sentence: sentence.trim(),
          line: lineNumber
        });
      }
      const underlineRegex = /<u>([\s\S]+?)<\/u>/g;
      while ((match = underlineRegex.exec(line)) !== null) {
        const sentence = this.extractSentence(line, match.index + match[0].length);
        const afterUnderline = line.substring(match.index + match[0].length);
        let comment;
        const newFormatMatch = /%%c:\s*([^%]+)%%/.exec(afterUnderline);
        if (newFormatMatch) {
          comment = newFormatMatch[1].trim() || void 0;
        } else {
          const legacyMatch = /<span[^>]*class="annotation-comment-text"[^>]*>([\s\S]*?)<\/span>/.exec(afterUnderline);
          if (legacyMatch) {
            comment = legacyMatch[1].trim() || void 0;
          }
        }
        annotations.push({
          text: match[1].trim(),
          type: "underline",
          comment,
          sentence: sentence.trim(),
          line: lineNumber
        });
      }
      const colorRegex = /<span[^>]*style="[^"]*color:\s*(#[0-9a-fA-F]+)[^"]*"[^>]*>([\s\S]+?)<\/span>/gi;
      while ((match = colorRegex.exec(line)) !== null) {
        const sentence = this.extractSentence(line, match.index + match[0].length);
        const hexColor = match[1];
        const text = match[2].trim();
        const afterColor = line.substring(match.index + match[0].length);
        let comment;
        const newFormatMatch = /%%c:\s*([^%]+)%%/.exec(afterColor);
        if (newFormatMatch) {
          comment = newFormatMatch[1].trim() || void 0;
        } else {
          const legacyMatch = /<span[^>]*class="annotation-comment-text"[^>]*>([\s\S]*?)<\/span>/.exec(afterColor);
          if (legacyMatch) {
            comment = legacyMatch[1].trim() || void 0;
          }
        }
        annotations.push({
          text,
          type: "color",
          comment,
          sentence: sentence.trim(),
          line: lineNumber,
          color: hexColor
        });
      }
    }
    return annotations;
  }
  /**
   * Extract the complete sentence containing the annotation.
   * Splits by sentence boundaries (. ! ?) and returns the sentence containing the annotation position.
   * Also strips out any comment markup from the sentence.
   */
  static extractSentence(line, annotationEnd) {
    const immediateCommentPatterns = [
      /\s*💬\s*<span[^>]*class="annotation-comment-label"[^>]*>comment:<\/span>\s*<span[^>]*class="annotation-comment-text"[^>]*>[\s\S]*?<\/span>/,
      /\s*<span[^>]*class="annotation-comment-text"[^>]*>[\s\S]*?<\/span>/,
      /\s*<details[^>]*class="annotation-comment"[^>]*>[\s\S]*?<\/details>/
    ];
    let cleanLine = line;
    let firstCommentStart = -1;
    let firstCommentEnd = -1;
    for (const pattern of immediateCommentPatterns) {
      const globalPattern = new RegExp(pattern.source, "g");
      let m;
      while ((m = globalPattern.exec(line)) !== null) {
        if (m.index >= annotationEnd) {
          if (firstCommentStart === -1 || m.index < firstCommentStart) {
            firstCommentStart = m.index;
            firstCommentEnd = m.index + m[0].length;
          }
          break;
        }
      }
    }
    if (firstCommentStart !== -1) {
      cleanLine = cleanLine.substring(0, firstCommentStart) + cleanLine.substring(firstCommentEnd);
    }
    const sentenceRegex = /[^.!?]*[.!?]+(?:\s|$)|[^.!?]+$/g;
    let match;
    while ((match = sentenceRegex.exec(cleanLine)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (annotationEnd >= start && annotationEnd <= end) {
        return match[0].trim();
      }
    }
    return cleanLine.trim();
  }
  /**
   * Check if a file has any annotations.
   */
  static hasAnnotations(content) {
    return /==[^=]+==/.test(content) || /<u>[^<]+<\/u>/.test(content) || /<span[^>]*style="[^"]*color:/.test(content);
  }
  /**
   * Get the count of annotations by type.
   */
  static getAnnotationCounts(annotations) {
    return {
      highlights: annotations.filter((a) => a.type === "highlight").length,
      comments: annotations.filter((a) => a.type === "comment").length,
      underlines: annotations.filter((a) => a.type === "underline").length,
      colors: annotations.filter((a) => a.type === "color").length
    };
  }
};

// src/summary-generator.ts
var import_obsidian3 = require("obsidian");
var TemplateProcessor = class {
  constructor(template) {
    this.template = template;
    this.variables = {};
    this.highlights = [];
    this.underlines = [];
    this.colors = [];
  }
  setVariable(name, value) {
    this.variables[name] = value;
    return this;
  }
  setHighlights(entries) {
    this.highlights = entries;
    return this;
  }
  setUnderlines(entries) {
    this.underlines = entries;
    return this;
  }
  setColors(entries) {
    this.colors = entries;
    return this;
  }
  process() {
    let result = this.template;
    result = this.processBlock(result, "highlights", this.highlights);
    result = this.processBlock(result, "underlines", this.underlines);
    result = this.processBlock(result, "colors", this.colors);
    for (const [name, value] of Object.entries(this.variables)) {
      const varRegex = new RegExp(`\\{\\{${name}\\}\\}`, "g");
      result = result.replace(varRegex, value);
    }
    return result;
  }
  processBlock(content, blockName, entries) {
    const blockRegex = new RegExp(`\\{\\{#${blockName}\\}\\}([\\s\\S]*?)\\{\\{/${blockName}\\}\\}`, "g");
    const blockMatch = blockRegex.exec(content);
    if (blockMatch) {
      const blockContent = blockMatch[1];
      let expanded = "";
      for (const entry of entries) {
        let itemContent = blockContent;
        itemContent = itemContent.replace(/\{\{text\}\}/g, entry.text);
        itemContent = itemContent.replace(/\{\{sentence\}\}/g, entry.sentence);
        itemContent = itemContent.replace(/\{\{line\}\}/g, String(entry.line));
        itemContent = itemContent.replace(/\{\{comment\}\}/g, entry.comment || "");
        itemContent = itemContent.replace(/\{\{color\}\}/g, entry.color || "");
        const hasCommentBlockRegex = /\{\{#hasComment\}\}([\s\S]*?)\{\{\/hasComment\}\}/g;
        if (entry.hasComment) {
          itemContent = itemContent.replace(hasCommentBlockRegex, "$1");
        } else {
          itemContent = itemContent.replace(hasCommentBlockRegex, "");
        }
        expanded += itemContent;
      }
      return content.replace(blockRegex, expanded);
    }
    content = content.replace(new RegExp(`\\{\\{#${blockName}\\}\\}`, "g"), "");
    content = content.replace(new RegExp(`\\{\\{/${blockName}\\}\\}`, "g"), "");
    return content;
  }
};
var SummaryGenerator = class {
  constructor(vault, settings) {
    this.vault = vault;
    this.settings = settings;
  }
  /**
   * Get the summary file path for a given source file.
   * e.g., "notes.md" -> "notes.annotations.md"
   */
  getSummaryFilePath(sourceFile) {
    var _a;
    const dir = ((_a = sourceFile.parent) == null ? void 0 : _a.path) || "";
    const basename = sourceFile.basename;
    const suffix = this.settings.annotationSuffix || ".annotations";
    if (dir && dir !== "/") {
      return `${dir}/${basename}${suffix}.md`;
    }
    return `${basename}${suffix}.md`;
  }
  /**
   * Merge annotations of different types into separate sorted lists.
   */
  categorizeAnnotations(annotations) {
    const renderable = annotations.map((a) => {
      let marker = "";
      let endmarker = "";
      switch (a.type) {
        case "highlight":
          marker = "==";
          endmarker = "==";
          break;
        case "comment":
          marker = "==";
          endmarker = "==";
          break;
        case "underline":
          marker = "<u>";
          endmarker = "</u>";
          break;
        case "color":
          marker = `<span style="color: ${a.color || "#e91e63"}">`;
          endmarker = "</span>";
          break;
      }
      return {
        ...a,
        marker,
        endmarker,
        hasComment: !!a.comment
      };
    });
    renderable.sort((a, b) => {
      if (a.line !== b.line)
        return a.line - b.line;
      return 0;
    });
    const highlights = renderable.filter((a) => a.type === "highlight" || a.type === "comment");
    const underlines = renderable.filter((a) => a.type === "underline");
    const colors = renderable.filter((a) => a.type === "color");
    return { highlights, underlines, colors };
  }
  /**
   * Generate or update the summary note for a source file.
   */
  async generateSummary(sourceFile) {
    console.log("[Annotation Summary] Generating summary for:", sourceFile.path);
    const content = await this.vault.read(sourceFile);
    console.log("[Annotation Summary] File content length:", content.length);
    if (!AnnotationService.hasAnnotations(content)) {
      new import_obsidian3.Notice("No annotations found in this file.");
      return false;
    }
    const annotations = AnnotationService.extractAnnotations(content);
    console.log("[Annotation Summary] Found annotations:", annotations.length);
    const { highlights, underlines, colors } = this.categorizeAnnotations(annotations);
    const template = this.settings.summaryTemplate || DEFAULT_TEMPLATE;
    const processor = new TemplateProcessor(template);
    processor.setVariable("sourcePath", sourceFile.path);
    processor.setVariable("date", (0, import_obsidian3.moment)().format("YYYY-MM-DD HH:mm:ss"));
    processor.setHighlights(highlights);
    processor.setUnderlines(underlines);
    processor.setColors(colors);
    const summaryContent = processor.process();
    const summaryPath = this.getSummaryFilePath(sourceFile);
    console.log("[Annotation Summary] Generated summary path:", summaryPath);
    console.log("[Annotation Summary] Source file path:", sourceFile.path);
    let summaryFile = this.vault.getAbstractFileByPath(summaryPath);
    console.log("[Annotation Summary] getAbstractFileByPath result:", summaryFile ? "found" : "not found");
    if (!summaryFile) {
      const allFiles = this.vault.getFiles();
      const matchingFiles = allFiles.filter((f) => f.path.includes("annotations"));
      console.log('[Annotation Summary] Files with "annotations" in vault:', matchingFiles.map((f) => f.path));
      summaryFile = allFiles.find((f) => f.path === summaryPath) || null;
      console.log("[Annotation Summary] getFiles exact match:", summaryFile ? "found" : "not found");
    }
    if (!summaryFile) {
      const fileExistsOnDisk = await this.vault.adapter.exists(summaryPath);
      console.log("[Annotation Summary] adapter.exists result:", fileExistsOnDisk);
      if (fileExistsOnDisk) {
        console.log("[Annotation Summary] File exists on disk but not in vault index. Writing via adapter...");
        await this.vault.adapter.write(summaryPath, summaryContent);
        new import_obsidian3.Notice(`Summary updated: ${summaryPath}`);
        return true;
      }
    }
    console.log("[Annotation Summary] Final decision - summaryFile is TFile:", summaryFile instanceof import_obsidian3.TFile);
    if (summaryFile instanceof import_obsidian3.TFile) {
      console.log("[Annotation Summary] Updating existing file via vault:", summaryPath);
      await this.vault.modify(summaryFile, summaryContent);
      new import_obsidian3.Notice(`Summary updated: ${summaryPath}`);
    } else {
      console.log("[Annotation Summary] Creating new file:", summaryPath);
      await this.vault.create(summaryPath, summaryContent);
      new import_obsidian3.Notice(`Summary created: ${summaryPath}`);
    }
    return true;
  }
  /**
   * Refresh the summary for a source file (same as generate, but with different messaging).
   */
  async refreshSummary(sourceFile) {
    const summaryPath = this.getSummaryFilePath(sourceFile);
    const summaryFile = this.vault.getAbstractFileByPath(summaryPath);
    if (!summaryFile) {
      new import_obsidian3.Notice("No summary file found. Generating a new one...");
      return this.generateSummary(sourceFile);
    }
    return this.generateSummary(sourceFile);
  }
  /**
   * Get annotation counts for a file without generating summary.
   */
  async getAnnotationCounts(sourceFile) {
    const content = await this.vault.read(sourceFile);
    if (!AnnotationService.hasAnnotations(content)) {
      return null;
    }
    const annotations = AnnotationService.extractAnnotations(content);
    return AnnotationService.getAnnotationCounts(annotations);
  }
};

// src/main.ts
var AnnotationSummaryPlugin = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.summaryGenerator = null;
  }
  async onload() {
    await this.loadSettings();
    this.summaryGenerator = new SummaryGenerator(this.app.vault, this.settings);
    this.addSettingTab(new AnnotationSummarySettingTab(this.app, this));
    this.registerCommands();
    this.registerEventListeners();
    this.registerStyles();
    console.log("Annotation Summary plugin loaded");
  }
  onunload() {
    console.log("Annotation Summary plugin unloaded");
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
    if (this.summaryGenerator) {
      this.summaryGenerator = new SummaryGenerator(this.app.vault, this.settings);
    }
  }
  registerCommands() {
    this.addCommand({
      id: "add-highlight",
      name: "Add Highlight",
      editorCallback: (editor) => {
        const success = AnnotationService.applyHighlight(editor);
        if (success) {
          new import_obsidian4.Notice("Text highlighted.");
        }
      }
    });
    this.addCommand({
      id: "add-comment",
      name: "Add Comment",
      editorCallback: async (editor) => {
        const success = await AnnotationService.applyComment(editor, this.app);
        if (success) {
          new import_obsidian4.Notice("Comment added.");
        }
      }
    });
    this.addCommand({
      id: "add-underline",
      name: "Add Underline",
      editorCallback: (editor) => {
        const success = AnnotationService.applyUnderline(editor);
        if (success) {
          new import_obsidian4.Notice("Text underlined.");
        }
      }
    });
    this.addCommand({
      id: "add-color-red",
      name: "Add Color: Red",
      editorCallback: (editor) => {
        const success = AnnotationService.applyColor(editor, "red");
        if (success) {
          new import_obsidian4.Notice("Text colored red.");
        }
      }
    });
    this.addCommand({
      id: "add-color-yellow",
      name: "Add Color: Yellow",
      editorCallback: (editor) => {
        const success = AnnotationService.applyColor(editor, "yellow");
        if (success) {
          new import_obsidian4.Notice("Text colored yellow.");
        }
      }
    });
    this.addCommand({
      id: "add-color-green",
      name: "Add Color: Green",
      editorCallback: (editor) => {
        const success = AnnotationService.applyColor(editor, "green");
        if (success) {
          new import_obsidian4.Notice("Text colored green.");
        }
      }
    });
    this.addCommand({
      id: "add-color-blue",
      name: "Add Color: Blue",
      editorCallback: (editor) => {
        const success = AnnotationService.applyColor(editor, "blue");
        if (success) {
          new import_obsidian4.Notice("Text colored blue.");
        }
      }
    });
    this.addCommand({
      id: "add-color-orange",
      name: "Add Color: Orange",
      editorCallback: (editor) => {
        const success = AnnotationService.applyColor(editor, "orange");
        if (success) {
          new import_obsidian4.Notice("Text colored orange.");
        }
      }
    });
    this.addCommand({
      id: "generate-summary",
      name: "Generate/Refresh Summary",
      callback: async () => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") {
          new import_obsidian4.Notice("Please open a Markdown file first.");
          return;
        }
        if (this.summaryGenerator) {
          await this.summaryGenerator.generateSummary(file);
        }
      }
    });
    this.registerCustomHotkeys();
  }
  registerCustomHotkeys() {
    const bindings = [];
    const parseHotkey = (hotkey, callback) => {
      if (!hotkey || hotkey.trim().length === 0)
        return null;
      const parts = hotkey.trim().split("+");
      const modifiers = {};
      let key = "";
      for (const part of parts) {
        const lower = part.toLowerCase();
        if (lower === "ctrl" || lower === "control")
          modifiers.ctrl = true;
        else if (lower === "cmd" || lower === "command" || lower === "meta")
          modifiers.meta = true;
        else if (lower === "shift")
          modifiers.shift = true;
        else if (lower === "alt" || lower === "option")
          modifiers.alt = true;
        else
          key = part;
      }
      if (!key)
        return null;
      return { modifiers, key: key.toLowerCase(), callback };
    };
    console.log("[Annotation] Hotkey settings:", {
      highlight: this.settings.hotkeyHighlight,
      comment: this.settings.hotkeyComment,
      underline: this.settings.hotkeyUnderline
    });
    const h = parseHotkey(this.settings.hotkeyHighlight, () => {
      const view = this.app.workspace.getActiveViewOfType(import_obsidian4.MarkdownView);
      if (view == null ? void 0 : view.editor)
        AnnotationService.applyHighlight(view.editor);
    });
    if (h) {
      bindings.push(h);
      console.log("[Annotation] Registered highlight hotkey:", this.settings.hotkeyHighlight);
    }
    const c = parseHotkey(this.settings.hotkeyComment, async () => {
      const view = this.app.workspace.getActiveViewOfType(import_obsidian4.MarkdownView);
      if (view == null ? void 0 : view.editor)
        await AnnotationService.applyComment(view.editor, this.app);
    });
    if (c) {
      bindings.push(c);
      console.log("[Annotation] Registered comment hotkey:", this.settings.hotkeyComment);
    }
    const u = parseHotkey(this.settings.hotkeyUnderline, () => {
      const view = this.app.workspace.getActiveViewOfType(import_obsidian4.MarkdownView);
      if (view == null ? void 0 : view.editor)
        AnnotationService.applyUnderline(view.editor);
    });
    if (u) {
      bindings.push(u);
      console.log("[Annotation] Registered underline hotkey:", this.settings.hotkeyUnderline);
    }
    if (bindings.length === 0) {
      console.log("[Annotation] No hotkeys configured");
      return;
    }
    console.log("[Annotation] Registered", bindings.length, "hotkey bindings");
    const handleKeyDown = async (evt) => {
      const activeView = this.app.workspace.getActiveViewOfType(import_obsidian4.MarkdownView);
      if (!(activeView == null ? void 0 : activeView.editor))
        return;
      const target = evt.target;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
        return;
      console.log("[Annotation] Key pressed:", evt.key, "Modifiers:", { meta: evt.metaKey, ctrl: evt.ctrlKey, shift: evt.shiftKey, alt: evt.altKey });
      for (const binding of bindings) {
        const { modifiers, key, callback } = binding;
        if (modifiers.ctrl && !evt.ctrlKey)
          continue;
        if (modifiers.meta && !evt.metaKey)
          continue;
        if (modifiers.shift && !evt.shiftKey)
          continue;
        if (modifiers.alt && !evt.altKey)
          continue;
        const pressedKey = evt.key.toLowerCase();
        if (pressedKey !== key)
          continue;
        console.log("[Annotation] Hotkey matched! Executing callback...");
        evt.preventDefault();
        evt.stopPropagation();
        await callback();
        return;
      }
    };
    this.registerDomEvent(document, "keydown", handleKeyDown);
  }
  registerEventListeners() {
    this.registerEvent(
      this.app.vault.on("modify", async (file) => {
        if (file instanceof import_obsidian4.TFile && file.extension === "md") {
          if (this.settings.autoRefreshOnSave && this.summaryGenerator) {
            if (!file.path.endsWith(this.settings.annotationSuffix + ".md")) {
              await this.summaryGenerator.refreshSummary(file);
            }
          }
        }
      })
    );
  }
  registerStyles() {
    const styleEl = document.createElement("style");
    styleEl.id = "annotation-summary-styles";
    styleEl.textContent = `
			.annotation-summary-help ul {
				list-style: disc;
				padding-left: 1.5em;
			}
			.annotation-summary-help li {
				margin-bottom: 0.25em;
			}
			.annotation-summary-help code {
				background: var(--background-secondary);
				padding: 0.1em 0.3em;
				border-radius: 3px;
				font-size: 0.9em;
			}
			.annotation-count-badge {
				display: inline-flex;
				align-items: center;
				gap: 0.3em;
				padding: 0.2em 0.5em;
				background: var(--background-secondary);
				border-radius: 4px;
				font-size: 0.85em;
				color: var(--text-muted);
			}
			.annotation-count-badge .highlight-count {
				color: var(--text-highlight);
			}
			.annotation-count-badge .comment-count {
				color: var(--text-accent);
			}
			.annotation-count-badge .underline-count {
				color: var(--text-normal);
			}
			/* Annotation comment styles */
			.annotation-comment-label {
				display: inline;
				font-size: 0.85em;
				color: #999;
			}
			.annotation-comment-text,
			.annotation-comment-textarea {
				display: inline;
				padding: 2px 4px;
				border: none;
				border-bottom: 1px dashed #aaa;
				background: transparent;
				color: #888;
				font-size: 0.9em;
				font-family: inherit;
				outline: none;
				box-sizing: border-box;
			}
		`;
    document.head.appendChild(styleEl);
    this.register(() => {
      const el = document.getElementById("annotation-summary-styles");
      if (el)
        el.remove();
    });
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3NldHRpbmdzLnRzIiwgInNyYy9hbm5vdGF0aW9uLXNlcnZpY2UudHMiLCAic3JjL3N1bW1hcnktZ2VuZXJhdG9yLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBQbHVnaW4sIE5vdGljZSwgRWRpdG9yLCBNYXJrZG93blZpZXcsIFRBYnN0cmFjdEZpbGUsIFRGaWxlIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgQW5ub3RhdGlvblN1bW1hcnlTZXR0aW5ncywgREVGQVVMVF9TRVRUSU5HUywgQW5ub3RhdGlvblN1bW1hcnlTZXR0aW5nVGFiIH0gZnJvbSAnLi9zZXR0aW5ncyc7XG5pbXBvcnQgeyBBbm5vdGF0aW9uU2VydmljZSB9IGZyb20gJy4vYW5ub3RhdGlvbi1zZXJ2aWNlJztcbmltcG9ydCB7IFN1bW1hcnlHZW5lcmF0b3IgfSBmcm9tICcuL3N1bW1hcnktZ2VuZXJhdG9yJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW5ub3RhdGlvblN1bW1hcnlQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuXHRzZXR0aW5nczogQW5ub3RhdGlvblN1bW1hcnlTZXR0aW5ncztcblx0cHJpdmF0ZSBzdW1tYXJ5R2VuZXJhdG9yOiBTdW1tYXJ5R2VuZXJhdG9yIHwgbnVsbCA9IG51bGw7XG5cblx0YXN5bmMgb25sb2FkKCkge1xuXHRcdC8vIExvYWQgc2V0dGluZ3Ncblx0XHRhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSBzdW1tYXJ5IGdlbmVyYXRvclxuXHRcdHRoaXMuc3VtbWFyeUdlbmVyYXRvciA9IG5ldyBTdW1tYXJ5R2VuZXJhdG9yKHRoaXMuYXBwLnZhdWx0LCB0aGlzLnNldHRpbmdzKTtcblxuXHRcdC8vIEFkZCBzZXR0aW5ncyB0YWJcblx0XHR0aGlzLmFkZFNldHRpbmdUYWIobmV3IEFubm90YXRpb25TdW1tYXJ5U2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xuXG5cdFx0Ly8gUmVnaXN0ZXIgY29tbWFuZHNcblx0XHR0aGlzLnJlZ2lzdGVyQ29tbWFuZHMoKTtcblxuXHRcdC8vIFJlZ2lzdGVyIGV2ZW50IGxpc3RlbmVyc1xuXHRcdHRoaXMucmVnaXN0ZXJFdmVudExpc3RlbmVycygpO1xuXG5cdFx0Ly8gQWRkIENTUyBzdHlsZXNcblx0XHR0aGlzLnJlZ2lzdGVyU3R5bGVzKCk7XG5cblx0XHRjb25zb2xlLmxvZygnQW5ub3RhdGlvbiBTdW1tYXJ5IHBsdWdpbiBsb2FkZWQnKTtcblx0fVxuXG5cdG9udW5sb2FkKCkge1xuXHRcdGNvbnNvbGUubG9nKCdBbm5vdGF0aW9uIFN1bW1hcnkgcGx1Z2luIHVubG9hZGVkJyk7XG5cdH1cblxuXHRhc3luYyBsb2FkU2V0dGluZ3MoKSB7XG5cdFx0dGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XG5cdH1cblxuXHRhc3luYyBzYXZlU2V0dGluZ3MoKSB7XG5cdFx0YXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcblx0XHQvLyBSZS1pbml0aWFsaXplIHN1bW1hcnkgZ2VuZXJhdG9yIHdpdGggbmV3IHNldHRpbmdzXG5cdFx0aWYgKHRoaXMuc3VtbWFyeUdlbmVyYXRvcikge1xuXHRcdFx0dGhpcy5zdW1tYXJ5R2VuZXJhdG9yID0gbmV3IFN1bW1hcnlHZW5lcmF0b3IodGhpcy5hcHAudmF1bHQsIHRoaXMuc2V0dGluZ3MpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVnaXN0ZXJDb21tYW5kcygpIHtcblx0XHQvLyBDb21tYW5kOiBBZGQgSGlnaGxpZ2h0XG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiAnYWRkLWhpZ2hsaWdodCcsXG5cdFx0XHRuYW1lOiAnQWRkIEhpZ2hsaWdodCcsXG5cdFx0XHRlZGl0b3JDYWxsYmFjazogKGVkaXRvcjogRWRpdG9yKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHN1Y2Nlc3MgPSBBbm5vdGF0aW9uU2VydmljZS5hcHBseUhpZ2hsaWdodChlZGl0b3IpO1xuXHRcdFx0XHRpZiAoc3VjY2Vzcykge1xuXHRcdFx0XHRcdG5ldyBOb3RpY2UoJ1RleHQgaGlnaGxpZ2h0ZWQuJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0fSk7XG5cblx0XHQvLyBDb21tYW5kOiBBZGQgQ29tbWVudFxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ2FkZC1jb21tZW50Jyxcblx0XHRcdG5hbWU6ICdBZGQgQ29tbWVudCcsXG5cdFx0XHRlZGl0b3JDYWxsYmFjazogYXN5bmMgKGVkaXRvcjogRWRpdG9yKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHN1Y2Nlc3MgPSBhd2FpdCBBbm5vdGF0aW9uU2VydmljZS5hcHBseUNvbW1lbnQoZWRpdG9yLCB0aGlzLmFwcCk7XG5cdFx0XHRcdGlmIChzdWNjZXNzKSB7XG5cdFx0XHRcdFx0bmV3IE5vdGljZSgnQ29tbWVudCBhZGRlZC4nKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHR9KTtcblxuXHRcdC8vIENvbW1hbmQ6IEFkZCBVbmRlcmxpbmVcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6ICdhZGQtdW5kZXJsaW5lJyxcblx0XHRcdG5hbWU6ICdBZGQgVW5kZXJsaW5lJyxcblx0XHRcdGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yOiBFZGl0b3IpID0+IHtcblx0XHRcdFx0Y29uc3Qgc3VjY2VzcyA9IEFubm90YXRpb25TZXJ2aWNlLmFwcGx5VW5kZXJsaW5lKGVkaXRvcik7XG5cdFx0XHRcdGlmIChzdWNjZXNzKSB7XG5cdFx0XHRcdFx0bmV3IE5vdGljZSgnVGV4dCB1bmRlcmxpbmVkLicpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdH0pO1xuXG5cdFx0Ly8gQ29tbWFuZDogQWRkIENvbG9yIC0gUmVkIChkZWZhdWx0KVxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ2FkZC1jb2xvci1yZWQnLFxuXHRcdFx0bmFtZTogJ0FkZCBDb2xvcjogUmVkJyxcblx0XHRcdGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yOiBFZGl0b3IpID0+IHtcblx0XHRcdFx0Y29uc3Qgc3VjY2VzcyA9IEFubm90YXRpb25TZXJ2aWNlLmFwcGx5Q29sb3IoZWRpdG9yLCAncmVkJyk7XG5cdFx0XHRcdGlmIChzdWNjZXNzKSB7XG5cdFx0XHRcdFx0bmV3IE5vdGljZSgnVGV4dCBjb2xvcmVkIHJlZC4nKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHR9KTtcblxuXHRcdC8vIENvbW1hbmQ6IEFkZCBDb2xvciAtIFllbGxvd1xuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ2FkZC1jb2xvci15ZWxsb3cnLFxuXHRcdFx0bmFtZTogJ0FkZCBDb2xvcjogWWVsbG93Jyxcblx0XHRcdGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yOiBFZGl0b3IpID0+IHtcblx0XHRcdFx0Y29uc3Qgc3VjY2VzcyA9IEFubm90YXRpb25TZXJ2aWNlLmFwcGx5Q29sb3IoZWRpdG9yLCAneWVsbG93Jyk7XG5cdFx0XHRcdGlmIChzdWNjZXNzKSB7XG5cdFx0XHRcdFx0bmV3IE5vdGljZSgnVGV4dCBjb2xvcmVkIHllbGxvdy4nKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHR9KTtcblxuXHRcdC8vIENvbW1hbmQ6IEFkZCBDb2xvciAtIEdyZWVuXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiAnYWRkLWNvbG9yLWdyZWVuJyxcblx0XHRcdG5hbWU6ICdBZGQgQ29sb3I6IEdyZWVuJyxcblx0XHRcdGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yOiBFZGl0b3IpID0+IHtcblx0XHRcdFx0Y29uc3Qgc3VjY2VzcyA9IEFubm90YXRpb25TZXJ2aWNlLmFwcGx5Q29sb3IoZWRpdG9yLCAnZ3JlZW4nKTtcblx0XHRcdFx0aWYgKHN1Y2Nlc3MpIHtcblx0XHRcdFx0XHRuZXcgTm90aWNlKCdUZXh0IGNvbG9yZWQgZ3JlZW4uJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0fSk7XG5cblx0XHQvLyBDb21tYW5kOiBBZGQgQ29sb3IgLSBCbHVlXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiAnYWRkLWNvbG9yLWJsdWUnLFxuXHRcdFx0bmFtZTogJ0FkZCBDb2xvcjogQmx1ZScsXG5cdFx0XHRlZGl0b3JDYWxsYmFjazogKGVkaXRvcjogRWRpdG9yKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHN1Y2Nlc3MgPSBBbm5vdGF0aW9uU2VydmljZS5hcHBseUNvbG9yKGVkaXRvciwgJ2JsdWUnKTtcblx0XHRcdFx0aWYgKHN1Y2Nlc3MpIHtcblx0XHRcdFx0XHRuZXcgTm90aWNlKCdUZXh0IGNvbG9yZWQgYmx1ZS4nKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHR9KTtcblxuXHRcdC8vIENvbW1hbmQ6IEFkZCBDb2xvciAtIE9yYW5nZVxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ2FkZC1jb2xvci1vcmFuZ2UnLFxuXHRcdFx0bmFtZTogJ0FkZCBDb2xvcjogT3JhbmdlJyxcblx0XHRcdGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yOiBFZGl0b3IpID0+IHtcblx0XHRcdFx0Y29uc3Qgc3VjY2VzcyA9IEFubm90YXRpb25TZXJ2aWNlLmFwcGx5Q29sb3IoZWRpdG9yLCAnb3JhbmdlJyk7XG5cdFx0XHRcdGlmIChzdWNjZXNzKSB7XG5cdFx0XHRcdFx0bmV3IE5vdGljZSgnVGV4dCBjb2xvcmVkIG9yYW5nZS4nKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHR9KTtcblxuXHRcdC8vIENvbW1hbmQ6IEdlbmVyYXRlL1JlZnJlc2ggU3VtbWFyeVxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ2dlbmVyYXRlLXN1bW1hcnknLFxuXHRcdFx0bmFtZTogJ0dlbmVyYXRlL1JlZnJlc2ggU3VtbWFyeScsXG5cdFx0XHRjYWxsYmFjazogYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRjb25zdCBmaWxlID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcblx0XHRcdFx0aWYgKCFmaWxlIHx8IGZpbGUuZXh0ZW5zaW9uICE9PSAnbWQnKSB7XG5cdFx0XHRcdFx0bmV3IE5vdGljZSgnUGxlYXNlIG9wZW4gYSBNYXJrZG93biBmaWxlIGZpcnN0LicpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodGhpcy5zdW1tYXJ5R2VuZXJhdG9yKSB7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5zdW1tYXJ5R2VuZXJhdG9yLmdlbmVyYXRlU3VtbWFyeShmaWxlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHR9KTtcblxuXHRcdC8vIFJlZ2lzdGVyIGN1c3RvbSBob3RrZXlzXG5cdFx0dGhpcy5yZWdpc3RlckN1c3RvbUhvdGtleXMoKTtcblx0fVxuXG5cdHByaXZhdGUgcmVnaXN0ZXJDdXN0b21Ib3RrZXlzKCkge1xuXHRcdGludGVyZmFjZSBIb3RrZXlCaW5kaW5nIHtcblx0XHRcdG1vZGlmaWVyczogeyBjdHJsPzogYm9vbGVhbjsgc2hpZnQ/OiBib29sZWFuOyBhbHQ/OiBib29sZWFuOyBtZXRhPzogYm9vbGVhbiB9O1xuXHRcdFx0a2V5OiBzdHJpbmc7XG5cdFx0XHRjYWxsYmFjazogKCkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD47XG5cdFx0fVxuXG5cdFx0Y29uc3QgYmluZGluZ3M6IEhvdGtleUJpbmRpbmdbXSA9IFtdO1xuXG5cdFx0Ly8gUGFyc2UgaG90a2V5IHN0cmluZyBsaWtlIFwiQ29tbWFuZCtTaGlmdCtIXCJcblx0XHRjb25zdCBwYXJzZUhvdGtleSA9IChob3RrZXk6IHN0cmluZywgY2FsbGJhY2s6ICgpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+KTogSG90a2V5QmluZGluZyB8IG51bGwgPT4ge1xuXHRcdFx0aWYgKCFob3RrZXkgfHwgaG90a2V5LnRyaW0oKS5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXHRcdFx0Y29uc3QgcGFydHMgPSBob3RrZXkudHJpbSgpLnNwbGl0KCcrJyk7XG5cdFx0XHRjb25zdCBtb2RpZmllcnM6IEhvdGtleUJpbmRpbmdbJ21vZGlmaWVycyddID0ge307XG5cdFx0XHRsZXQga2V5ID0gJyc7XG5cblx0XHRcdGZvciAoY29uc3QgcGFydCBvZiBwYXJ0cykge1xuXHRcdFx0XHRjb25zdCBsb3dlciA9IHBhcnQudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0aWYgKGxvd2VyID09PSAnY3RybCcgfHwgbG93ZXIgPT09ICdjb250cm9sJykgbW9kaWZpZXJzLmN0cmwgPSB0cnVlO1xuXHRcdFx0XHRlbHNlIGlmIChsb3dlciA9PT0gJ2NtZCcgfHwgbG93ZXIgPT09ICdjb21tYW5kJyB8fCBsb3dlciA9PT0gJ21ldGEnKSBtb2RpZmllcnMubWV0YSA9IHRydWU7XG5cdFx0XHRcdGVsc2UgaWYgKGxvd2VyID09PSAnc2hpZnQnKSBtb2RpZmllcnMuc2hpZnQgPSB0cnVlO1xuXHRcdFx0XHRlbHNlIGlmIChsb3dlciA9PT0gJ2FsdCcgfHwgbG93ZXIgPT09ICdvcHRpb24nKSBtb2RpZmllcnMuYWx0ID0gdHJ1ZTtcblx0XHRcdFx0ZWxzZSBrZXkgPSBwYXJ0O1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWtleSkgcmV0dXJuIG51bGw7XG5cdFx0XHRyZXR1cm4geyBtb2RpZmllcnMsIGtleToga2V5LnRvTG93ZXJDYXNlKCksIGNhbGxiYWNrIH07XG5cdFx0fTtcblxuXHRcdC8vIEFkZCBiaW5kaW5ncyBmcm9tIHNldHRpbmdzXG5cdFx0Y29uc29sZS5sb2coJ1tBbm5vdGF0aW9uXSBIb3RrZXkgc2V0dGluZ3M6Jywge1xuXHRcdFx0aGlnaGxpZ2h0OiB0aGlzLnNldHRpbmdzLmhvdGtleUhpZ2hsaWdodCxcblx0XHRcdGNvbW1lbnQ6IHRoaXMuc2V0dGluZ3MuaG90a2V5Q29tbWVudCxcblx0XHRcdHVuZGVybGluZTogdGhpcy5zZXR0aW5ncy5ob3RrZXlVbmRlcmxpbmUsXG5cdFx0fSk7XG5cblx0XHRjb25zdCBoID0gcGFyc2VIb3RrZXkodGhpcy5zZXR0aW5ncy5ob3RrZXlIaWdobGlnaHQsICgpID0+IHtcblx0XHRcdGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xuXHRcdFx0aWYgKHZpZXc/LmVkaXRvcikgQW5ub3RhdGlvblNlcnZpY2UuYXBwbHlIaWdobGlnaHQodmlldy5lZGl0b3IpO1xuXHRcdH0pO1xuXHRcdGlmIChoKSB7IGJpbmRpbmdzLnB1c2goaCk7IGNvbnNvbGUubG9nKCdbQW5ub3RhdGlvbl0gUmVnaXN0ZXJlZCBoaWdobGlnaHQgaG90a2V5OicsIHRoaXMuc2V0dGluZ3MuaG90a2V5SGlnaGxpZ2h0KTsgfVxuXG5cdFx0Y29uc3QgYyA9IHBhcnNlSG90a2V5KHRoaXMuc2V0dGluZ3MuaG90a2V5Q29tbWVudCwgYXN5bmMgKCkgPT4ge1xuXHRcdFx0Y29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG5cdFx0XHRpZiAodmlldz8uZWRpdG9yKSBhd2FpdCBBbm5vdGF0aW9uU2VydmljZS5hcHBseUNvbW1lbnQodmlldy5lZGl0b3IsIHRoaXMuYXBwKTtcblx0XHR9KTtcblx0XHRpZiAoYykgeyBiaW5kaW5ncy5wdXNoKGMpOyBjb25zb2xlLmxvZygnW0Fubm90YXRpb25dIFJlZ2lzdGVyZWQgY29tbWVudCBob3RrZXk6JywgdGhpcy5zZXR0aW5ncy5ob3RrZXlDb21tZW50KTsgfVxuXG5cdFx0Y29uc3QgdSA9IHBhcnNlSG90a2V5KHRoaXMuc2V0dGluZ3MuaG90a2V5VW5kZXJsaW5lLCAoKSA9PiB7XG5cdFx0XHRjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcblx0XHRcdGlmICh2aWV3Py5lZGl0b3IpIEFubm90YXRpb25TZXJ2aWNlLmFwcGx5VW5kZXJsaW5lKHZpZXcuZWRpdG9yKTtcblx0XHR9KTtcblx0XHRpZiAodSkgeyBiaW5kaW5ncy5wdXNoKHUpOyBjb25zb2xlLmxvZygnW0Fubm90YXRpb25dIFJlZ2lzdGVyZWQgdW5kZXJsaW5lIGhvdGtleTonLCB0aGlzLnNldHRpbmdzLmhvdGtleVVuZGVybGluZSk7IH1cblxuXHRcdGlmIChiaW5kaW5ncy5sZW5ndGggPT09IDApIHtcblx0XHRcdGNvbnNvbGUubG9nKCdbQW5ub3RhdGlvbl0gTm8gaG90a2V5cyBjb25maWd1cmVkJyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc29sZS5sb2coJ1tBbm5vdGF0aW9uXSBSZWdpc3RlcmVkJywgYmluZGluZ3MubGVuZ3RoLCAnaG90a2V5IGJpbmRpbmdzJyk7XG5cblx0XHQvLyBSZWdpc3RlciBrZXlkb3duIGxpc3RlbmVyXG5cdFx0Y29uc3QgaGFuZGxlS2V5RG93biA9IGFzeW5jIChldnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcblx0XHRcdC8vIE9ubHkgaGFuZGxlIHdoZW4gaW4gZWRpdG9yXG5cdFx0XHRjb25zdCBhY3RpdmVWaWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcblx0XHRcdGlmICghYWN0aXZlVmlldz8uZWRpdG9yKSByZXR1cm47XG5cblx0XHRcdC8vIERvbid0IHRyaWdnZXIgaWYgdXNlciBpcyB0eXBpbmcgaW4gYW4gaW5wdXQvdGV4dGFyZWFcblx0XHRcdGNvbnN0IHRhcmdldCA9IGV2dC50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG5cdFx0XHRpZiAodGFyZ2V0LnRhZ05hbWUgPT09ICdJTlBVVCcgfHwgdGFyZ2V0LnRhZ05hbWUgPT09ICdURVhUQVJFQScpIHJldHVybjtcblxuXHRcdFx0Y29uc29sZS5sb2coJ1tBbm5vdGF0aW9uXSBLZXkgcHJlc3NlZDonLCBldnQua2V5LCAnTW9kaWZpZXJzOicsIHsgbWV0YTogZXZ0Lm1ldGFLZXksIGN0cmw6IGV2dC5jdHJsS2V5LCBzaGlmdDogZXZ0LnNoaWZ0S2V5LCBhbHQ6IGV2dC5hbHRLZXkgfSk7XG5cblx0XHRcdGZvciAoY29uc3QgYmluZGluZyBvZiBiaW5kaW5ncykge1xuXHRcdFx0XHRjb25zdCB7IG1vZGlmaWVycywga2V5LCBjYWxsYmFjayB9ID0gYmluZGluZztcblxuXHRcdFx0XHQvLyBDaGVjayBtb2RpZmllcnNcblx0XHRcdFx0aWYgKG1vZGlmaWVycy5jdHJsICYmICFldnQuY3RybEtleSkgY29udGludWU7XG5cdFx0XHRcdGlmIChtb2RpZmllcnMubWV0YSAmJiAhZXZ0Lm1ldGFLZXkpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAobW9kaWZpZXJzLnNoaWZ0ICYmICFldnQuc2hpZnRLZXkpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAobW9kaWZpZXJzLmFsdCAmJiAhZXZ0LmFsdEtleSkgY29udGludWU7XG5cblx0XHRcdFx0Ly8gQ2hlY2sga2V5XG5cdFx0XHRcdGNvbnN0IHByZXNzZWRLZXkgPSBldnQua2V5LnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdGlmIChwcmVzc2VkS2V5ICE9PSBrZXkpIGNvbnRpbnVlO1xuXG5cdFx0XHRcdC8vIE1hdGNoZWQhIFByZXZlbnQgZGVmYXVsdCBhbmQgZXhlY3V0ZVxuXHRcdFx0XHRjb25zb2xlLmxvZygnW0Fubm90YXRpb25dIEhvdGtleSBtYXRjaGVkISBFeGVjdXRpbmcgY2FsbGJhY2suLi4nKTtcblx0XHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdFx0YXdhaXQgY2FsbGJhY2soKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR0aGlzLnJlZ2lzdGVyRG9tRXZlbnQoZG9jdW1lbnQsICdrZXlkb3duJywgaGFuZGxlS2V5RG93bik7XG5cdH1cblxuXHRwcml2YXRlIHJlZ2lzdGVyRXZlbnRMaXN0ZW5lcnMoKSB7XG5cdFx0Ly8gTGlzdGVuIGZvciBmaWxlIHNhdmUgZXZlbnRzIHRvIGF1dG8tcmVmcmVzaCBzdW1tYXJ5XG5cdFx0dGhpcy5yZWdpc3RlckV2ZW50KFxuXHRcdFx0dGhpcy5hcHAudmF1bHQub24oJ21vZGlmeScsIGFzeW5jIChmaWxlOiBUQWJzdHJhY3RGaWxlKSA9PiB7XG5cdFx0XHRcdGlmIChmaWxlIGluc3RhbmNlb2YgVEZpbGUgJiYgZmlsZS5leHRlbnNpb24gPT09ICdtZCcpIHtcblx0XHRcdFx0XHRpZiAodGhpcy5zZXR0aW5ncy5hdXRvUmVmcmVzaE9uU2F2ZSAmJiB0aGlzLnN1bW1hcnlHZW5lcmF0b3IpIHtcblx0XHRcdFx0XHRcdC8vIE9ubHkgYXV0by1yZWZyZXNoIGlmIHRoZSBmaWxlIGlzIG5vdCBhIHN1bW1hcnkgZmlsZSBpdHNlbGZcblx0XHRcdFx0XHRcdGlmICghZmlsZS5wYXRoLmVuZHNXaXRoKHRoaXMuc2V0dGluZ3MuYW5ub3RhdGlvblN1ZmZpeCArICcubWQnKSkge1xuXHRcdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnN1bW1hcnlHZW5lcmF0b3IucmVmcmVzaFN1bW1hcnkoZmlsZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdCk7XG5cdH1cblxuXHRwcml2YXRlIHJlZ2lzdGVyU3R5bGVzKCkge1xuXHRcdGNvbnN0IHN0eWxlRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuXHRcdHN0eWxlRWwuaWQgPSAnYW5ub3RhdGlvbi1zdW1tYXJ5LXN0eWxlcyc7XG5cdFx0c3R5bGVFbC50ZXh0Q29udGVudCA9IGBcblx0XHRcdC5hbm5vdGF0aW9uLXN1bW1hcnktaGVscCB1bCB7XG5cdFx0XHRcdGxpc3Qtc3R5bGU6IGRpc2M7XG5cdFx0XHRcdHBhZGRpbmctbGVmdDogMS41ZW07XG5cdFx0XHR9XG5cdFx0XHQuYW5ub3RhdGlvbi1zdW1tYXJ5LWhlbHAgbGkge1xuXHRcdFx0XHRtYXJnaW4tYm90dG9tOiAwLjI1ZW07XG5cdFx0XHR9XG5cdFx0XHQuYW5ub3RhdGlvbi1zdW1tYXJ5LWhlbHAgY29kZSB7XG5cdFx0XHRcdGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcblx0XHRcdFx0cGFkZGluZzogMC4xZW0gMC4zZW07XG5cdFx0XHRcdGJvcmRlci1yYWRpdXM6IDNweDtcblx0XHRcdFx0Zm9udC1zaXplOiAwLjllbTtcblx0XHRcdH1cblx0XHRcdC5hbm5vdGF0aW9uLWNvdW50LWJhZGdlIHtcblx0XHRcdFx0ZGlzcGxheTogaW5saW5lLWZsZXg7XG5cdFx0XHRcdGFsaWduLWl0ZW1zOiBjZW50ZXI7XG5cdFx0XHRcdGdhcDogMC4zZW07XG5cdFx0XHRcdHBhZGRpbmc6IDAuMmVtIDAuNWVtO1xuXHRcdFx0XHRiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSk7XG5cdFx0XHRcdGJvcmRlci1yYWRpdXM6IDRweDtcblx0XHRcdFx0Zm9udC1zaXplOiAwLjg1ZW07XG5cdFx0XHRcdGNvbG9yOiB2YXIoLS10ZXh0LW11dGVkKTtcblx0XHRcdH1cblx0XHRcdC5hbm5vdGF0aW9uLWNvdW50LWJhZGdlIC5oaWdobGlnaHQtY291bnQge1xuXHRcdFx0XHRjb2xvcjogdmFyKC0tdGV4dC1oaWdobGlnaHQpO1xuXHRcdFx0fVxuXHRcdFx0LmFubm90YXRpb24tY291bnQtYmFkZ2UgLmNvbW1lbnQtY291bnQge1xuXHRcdFx0XHRjb2xvcjogdmFyKC0tdGV4dC1hY2NlbnQpO1xuXHRcdFx0fVxuXHRcdFx0LmFubm90YXRpb24tY291bnQtYmFkZ2UgLnVuZGVybGluZS1jb3VudCB7XG5cdFx0XHRcdGNvbG9yOiB2YXIoLS10ZXh0LW5vcm1hbCk7XG5cdFx0XHR9XG5cdFx0XHQvKiBBbm5vdGF0aW9uIGNvbW1lbnQgc3R5bGVzICovXG5cdFx0XHQuYW5ub3RhdGlvbi1jb21tZW50LWxhYmVsIHtcblx0XHRcdFx0ZGlzcGxheTogaW5saW5lO1xuXHRcdFx0XHRmb250LXNpemU6IDAuODVlbTtcblx0XHRcdFx0Y29sb3I6ICM5OTk7XG5cdFx0XHR9XG5cdFx0XHQuYW5ub3RhdGlvbi1jb21tZW50LXRleHQsXG5cdFx0XHQuYW5ub3RhdGlvbi1jb21tZW50LXRleHRhcmVhIHtcblx0XHRcdFx0ZGlzcGxheTogaW5saW5lO1xuXHRcdFx0XHRwYWRkaW5nOiAycHggNHB4O1xuXHRcdFx0XHRib3JkZXI6IG5vbmU7XG5cdFx0XHRcdGJvcmRlci1ib3R0b206IDFweCBkYXNoZWQgI2FhYTtcblx0XHRcdFx0YmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG5cdFx0XHRcdGNvbG9yOiAjODg4O1xuXHRcdFx0XHRmb250LXNpemU6IDAuOWVtO1xuXHRcdFx0XHRmb250LWZhbWlseTogaW5oZXJpdDtcblx0XHRcdFx0b3V0bGluZTogbm9uZTtcblx0XHRcdFx0Ym94LXNpemluZzogYm9yZGVyLWJveDtcblx0XHRcdH1cblx0XHRgO1xuXHRcdGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVFbCk7XG5cblx0XHR0aGlzLnJlZ2lzdGVyKCgpID0+IHtcblx0XHRcdGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fubm90YXRpb24tc3VtbWFyeS1zdHlsZXMnKTtcblx0XHRcdGlmIChlbCkgZWwucmVtb3ZlKCk7XG5cdFx0fSk7XG5cdH1cbn1cbiIsICJpbXBvcnQgeyBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nLCBBcHAsIFBsdWdpbiB9IGZyb20gJ29ic2lkaWFuJztcblxuLyoqXG4gKiBJbnRlcmZhY2UgcmVwcmVzZW50aW5nIHRoZSBwbHVnaW4gaW5zdGFuY2Ugd2l0aCBzZXR0aW5ncyBhY2Nlc3MuXG4gKiBUaGlzIGF2b2lkcyBjaXJjdWxhciBkZXBlbmRlbmN5IHdpdGggbWFpbi50cy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbm5vdGF0aW9uUGx1Z2luSW5zdGFuY2UgZXh0ZW5kcyBQbHVnaW4ge1xuXHRzZXR0aW5nczogQW5ub3RhdGlvblN1bW1hcnlTZXR0aW5ncztcblx0c2F2ZVNldHRpbmdzKCk6IFByb21pc2U8dm9pZD47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5ub3RhdGlvblN1bW1hcnlTZXR0aW5ncyB7XG5cdC8qKiBDdXN0b20gdGVtcGxhdGUgZm9yIHN1bW1hcnkgbm90ZXMgKi9cblx0c3VtbWFyeVRlbXBsYXRlOiBzdHJpbmc7XG5cdC8qKiBIb3RrZXkgZm9yIGhpZ2hsaWdodCAqL1xuXHRob3RrZXlIaWdobGlnaHQ6IHN0cmluZztcblx0LyoqIEhvdGtleSBmb3IgY29tbWVudCAqL1xuXHRob3RrZXlDb21tZW50OiBzdHJpbmc7XG5cdC8qKiBIb3RrZXkgZm9yIHVuZGVybGluZSAqL1xuXHRob3RrZXlVbmRlcmxpbmU6IHN0cmluZztcblx0LyoqIEFubm90YXRpb24gc3VmZml4IGZvciBzdW1tYXJ5IGZpbGVzICovXG5cdGFubm90YXRpb25TdWZmaXg6IHN0cmluZztcblx0LyoqIEF1dG8tcmVmcmVzaCBzdW1tYXJ5IG9uIHNhdmUgKi9cblx0YXV0b1JlZnJlc2hPblNhdmU6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTOiBBbm5vdGF0aW9uU3VtbWFyeVNldHRpbmdzID0ge1xuXHRzdW1tYXJ5VGVtcGxhdGU6ICcnLFxuXHRob3RrZXlIaWdobGlnaHQ6ICcnLFxuXHRob3RrZXlDb21tZW50OiAnJyxcblx0aG90a2V5VW5kZXJsaW5lOiAnJyxcblx0YW5ub3RhdGlvblN1ZmZpeDogJy5hbm5vdGF0aW9ucycsXG5cdGF1dG9SZWZyZXNoT25TYXZlOiBmYWxzZSxcbn07XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1RFTVBMQVRFID0gYCMgXHVEODNEXHVEQ0REIFx1NjgwN1x1NkNFOFx1NkM0N1x1NjAzQlxuXG4+IFx1NkU5MFx1NjU4N1x1NEVGNlx1RkYxQXt7c291cmNlUGF0aH19XG4+IFx1NjZGNFx1NjVCMFx1NjVGNlx1OTVGNFx1RkYxQXt7ZGF0ZX19XG5cbi0tLVxuXG4jIyBcdUQ4M0RcdURGRTEgXHU5QUQ4XHU0RUFFXG5cbnt7I2hpZ2hsaWdodHN9fVxuKip7e3RleHR9fSoqXG5cbj4gXHU1MzlGXHU2NTg3XHVGRjFBe3tzZW50ZW5jZX19XG57eyNoYXNDb21tZW50fX0+IFx1RDgzRFx1RENBQyB7e2NvbW1lbnR9fVxuXG57ey9oYXNDb21tZW50fX1cbi0tLVxuXG57ey9oaWdobGlnaHRzfX1cblxuIyMgXHVEODNEXHVEQ0NDIFx1NEUwQlx1NTIxMlx1N0VCRlxuXG57eyN1bmRlcmxpbmVzfX1cbioqPHU+e3t0ZXh0fX08L3U+KipcblxuPiBcdTUzOUZcdTY1ODdcdUZGMUF7e3NlbnRlbmNlfX1cbnt7I2hhc0NvbW1lbnR9fT4gXHVEODNEXHVEQ0FDIHt7Y29tbWVudH19XG5cbnt7L2hhc0NvbW1lbnR9fVxuLS0tXG5cbnt7L3VuZGVybGluZXN9fVxuXG4jIyBcdUQ4M0NcdURGQTggXHU1RjY5XHU4MjcyXHU2NTg3XHU1QjU3XG5cbnt7I2NvbG9yc319XG4qKnt7dGV4dH19KipcblxuPiBcdTUzOUZcdTY1ODdcdUZGMUF7e3NlbnRlbmNlfX1cbnt7I2hhc0NvbW1lbnR9fT4gXHVEODNEXHVEQ0FDIHt7Y29tbWVudH19XG5cbnt7L2hhc0NvbW1lbnR9fVxuLS0tXG5cbnt7L2NvbG9yc319XG5gO1xuXG5leHBvcnQgY2xhc3MgQW5ub3RhdGlvblN1bW1hcnlTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG5cdHBsdWdpbjogQW5ub3RhdGlvblBsdWdpbkluc3RhbmNlO1xuXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IEFubm90YXRpb25QbHVnaW5JbnN0YW5jZSkge1xuXHRcdHN1cGVyKGFwcCwgcGx1Z2luKTtcblx0XHR0aGlzLnBsdWdpbiA9IHBsdWdpbjtcblx0fVxuXG5cdGRpc3BsYXkoKTogdm9pZCB7XG5cdFx0Y29uc3QgeyBjb250YWluZXJFbCB9ID0gdGhpcztcblx0XHRjb250YWluZXJFbC5lbXB0eSgpO1xuXG5cdFx0Y29udGFpbmVyRWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnQW5ub3RhdGlvbiBTdW1tYXJ5IFNldHRpbmdzJyB9KTtcblxuXHRcdC8vIFN1bW1hcnkgVGVtcGxhdGVcblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKCdTdW1tYXJ5IFRlbXBsYXRlJylcblx0XHRcdC5zZXREZXNjKCdDdXN0b20gdGVtcGxhdGUgZm9yIHN1bW1hcnkgbm90ZXMuIFVzZSB7e2hpZ2hsaWdodHN9fSwge3tjb21tZW50c319LCB7e3VuZGVybGluZXN9fSwge3tzb3VyY2VQYXRofX0sIHt7ZGF0ZX19IGFzIHZhcmlhYmxlcy4nKVxuXHRcdFx0LmFkZFRleHRBcmVhKHRleHQgPT4gdGV4dFxuXHRcdFx0XHQuc2V0UGxhY2Vob2xkZXIoREVGQVVMVF9URU1QTEFURSlcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnN1bW1hcnlUZW1wbGF0ZSB8fCBERUZBVUxUX1RFTVBMQVRFKVxuXHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3Muc3VtbWFyeVRlbXBsYXRlID0gdmFsdWU7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdH0pKVxuXHRcdFx0XHQuc2V0TmFtZSgnVGVtcGxhdGUgRWRpdG9yJyk7XG5cblx0XHQvLyBIb3RrZXkgLSBIaWdobGlnaHRcblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKCdIaWdobGlnaHQgSG90a2V5Jylcblx0XHRcdC5zZXREZXNjKCdLZXlib2FyZCBzaG9ydGN1dCBmb3IgaGlnaGxpZ2h0aW5nIHNlbGVjdGVkIHRleHQgKGUuZy4sIEN0cmwrU2hpZnQrSCkuIExlYXZlIGVtcHR5IHRvIHVzZSBjb21tYW5kIHBhbGV0dGUgb25seS4nKVxuXHRcdFx0LmFkZFRleHQodGV4dCA9PiB0ZXh0XG5cdFx0XHRcdC5zZXRQbGFjZWhvbGRlcignZS5nLiwgQ3RybCtTaGlmdCtIJylcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmhvdGtleUhpZ2hsaWdodClcblx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLmhvdGtleUhpZ2hsaWdodCA9IHZhbHVlO1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHR9KSk7XG5cblx0XHQvLyBIb3RrZXkgLSBDb21tZW50XG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZSgnQ29tbWVudCBIb3RrZXknKVxuXHRcdFx0LnNldERlc2MoJ0tleWJvYXJkIHNob3J0Y3V0IGZvciBhZGRpbmcgYSBjb21tZW50IHRvIHNlbGVjdGVkIHRleHQgKGUuZy4sIEN0cmwrU2hpZnQrQykuIExlYXZlIGVtcHR5IHRvIHVzZSBjb21tYW5kIHBhbGV0dGUgb25seS4nKVxuXHRcdFx0LmFkZFRleHQodGV4dCA9PiB0ZXh0XG5cdFx0XHRcdC5zZXRQbGFjZWhvbGRlcignZS5nLiwgQ3RybCtTaGlmdCtDJylcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmhvdGtleUNvbW1lbnQpXG5cdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5ob3RrZXlDb21tZW50ID0gdmFsdWU7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdH0pKTtcblxuXHRcdC8vIEhvdGtleSAtIFVuZGVybGluZVxuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoJ1VuZGVybGluZSBIb3RrZXknKVxuXHRcdFx0LnNldERlc2MoJ0tleWJvYXJkIHNob3J0Y3V0IGZvciB1bmRlcmxpbmluZyBzZWxlY3RlZCB0ZXh0IChlLmcuLCBDdHJsK1NoaWZ0K1UpLiBMZWF2ZSBlbXB0eSB0byB1c2UgY29tbWFuZCBwYWxldHRlIG9ubHkuJylcblx0XHRcdC5hZGRUZXh0KHRleHQgPT4gdGV4dFxuXHRcdFx0XHQuc2V0UGxhY2Vob2xkZXIoJ2UuZy4sIEN0cmwrU2hpZnQrVScpXG5cdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5ob3RrZXlVbmRlcmxpbmUpXG5cdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5ob3RrZXlVbmRlcmxpbmUgPSB2YWx1ZTtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0fSkpO1xuXG5cdFx0Ly8gQW5ub3RhdGlvbiBTdWZmaXhcblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKCdBbm5vdGF0aW9uIEZpbGUgU3VmZml4Jylcblx0XHRcdC5zZXREZXNjKCdTdWZmaXggZm9yIGFubm90YXRpb24gc3VtbWFyeSBmaWxlcy4gRGVmYXVsdDogLmFubm90YXRpb25zIChlLmcuLCBub3Rlcy5tZCAtPiBub3Rlcy5hbm5vdGF0aW9ucy5tZCknKVxuXHRcdFx0LmFkZFRleHQodGV4dCA9PiB0ZXh0XG5cdFx0XHRcdC5zZXRQbGFjZWhvbGRlcignLmFubm90YXRpb25zJylcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmFubm90YXRpb25TdWZmaXgpXG5cdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5hbm5vdGF0aW9uU3VmZml4ID0gdmFsdWUgfHwgJy5hbm5vdGF0aW9ucyc7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdH0pKTtcblxuXHRcdC8vIEF1dG8gUmVmcmVzaCBvbiBTYXZlXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZSgnQXV0byBSZWZyZXNoIG9uIFNhdmUnKVxuXHRcdFx0LnNldERlc2MoJ0F1dG9tYXRpY2FsbHkgdXBkYXRlIHRoZSBzdW1tYXJ5IG5vdGUgd2hlbiB0aGUgc291cmNlIGZpbGUgaXMgc2F2ZWQuJylcblx0XHRcdC5hZGRUb2dnbGUodG9nZ2xlID0+IHRvZ2dsZVxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b1JlZnJlc2hPblNhdmUpXG5cdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdXRvUmVmcmVzaE9uU2F2ZSA9IHZhbHVlO1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHR9KSk7XG5cblx0XHQvLyBUZW1wbGF0ZSBIZWxwXG5cdFx0Y29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnVGVtcGxhdGUgVmFyaWFibGVzJyB9KTtcblx0XHRjb25zdCBoZWxwRWwgPSBjb250YWluZXJFbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdhbm5vdGF0aW9uLXN1bW1hcnktaGVscCcgfSk7XG5cdFx0aGVscEVsLmlubmVySFRNTCA9IGBcblx0XHRcdDx1bD5cblx0XHRcdFx0PGxpPjxjb2RlPnt7c291cmNlUGF0aH19PC9jb2RlPiAtIFBhdGggb2YgdGhlIHNvdXJjZSBmaWxlPC9saT5cblx0XHRcdFx0PGxpPjxjb2RlPnt7ZGF0ZX19PC9jb2RlPiAtIEN1cnJlbnQgZGF0ZS90aW1lPC9saT5cblx0XHRcdFx0PGxpPjxjb2RlPnt7aGlnaGxpZ2h0c319PC9jb2RlPiAtIExpc3Qgb2YgaGlnaGxpZ2h0ZWQgYW5ub3RhdGlvbnM8L2xpPlxuXHRcdFx0XHQ8bGk+PGNvZGU+e3tjb21tZW50c319PC9jb2RlPiAtIExpc3Qgb2YgY29tbWVudCBhbm5vdGF0aW9uczwvbGk+XG5cdFx0XHRcdDxsaT48Y29kZT57e3VuZGVybGluZXN9fTwvY29kZT4gLSBMaXN0IG9mIHVuZGVybGluZWQgYW5ub3RhdGlvbnM8L2xpPlxuXHRcdFx0XHQ8bGk+V2l0aGluIGVhY2ggYmxvY2s6IDxjb2RlPnt7dGV4dH19PC9jb2RlPiwgPGNvZGU+e3tzZW50ZW5jZX19PC9jb2RlPiwgPGNvZGU+e3tsaW5lfX08L2NvZGU+LCA8Y29kZT57e2NvbW1lbnR9fTwvY29kZT48L2xpPlxuXHRcdFx0PC91bD5cblx0XHRgO1xuXHR9XG59XG4iLCAiaW1wb3J0IHsgRWRpdG9yLCBURmlsZSwgVmF1bHQsIE5vdGljZSwgTWFya2Rvd25WaWV3LCBNb2RhbCwgU2V0dGluZywgVGV4dENvbXBvbmVudCB9IGZyb20gJ29ic2lkaWFuJztcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgc2luZ2xlIGFubm90YXRpb24gZW50cnkgZXh0cmFjdGVkIGZyb20gYSBkb2N1bWVudC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbm5vdGF0aW9uRW50cnkge1xuXHQvKiogVGhlIGFubm90YXRlZCB0ZXh0IGNvbnRlbnQgKi9cblx0dGV4dDogc3RyaW5nO1xuXHQvKiogVHlwZSBvZiBhbm5vdGF0aW9uICovXG5cdHR5cGU6ICdoaWdobGlnaHQnIHwgJ2NvbW1lbnQnIHwgJ3VuZGVybGluZScgfCAnY29sb3InO1xuXHQvKiogT3B0aW9uYWwgY29tbWVudCB0ZXh0IChmb3IgY29tbWVudCBhbm5vdGF0aW9ucykgKi9cblx0Y29tbWVudD86IHN0cmluZztcblx0LyoqIFRoZSBmdWxsIHNlbnRlbmNlL2xpbmUgY29udGFpbmluZyB0aGUgYW5ub3RhdGlvbiAqL1xuXHRzZW50ZW5jZTogc3RyaW5nO1xuXHQvKiogTGluZSBudW1iZXIgd2hlcmUgdGhlIGFubm90YXRpb24gYXBwZWFycyAoMS1iYXNlZCkgKi9cblx0bGluZTogbnVtYmVyO1xuXHQvKiogQ29sb3IgbmFtZS9oZXggZm9yIGNvbG9yIGFubm90YXRpb25zICovXG5cdGNvbG9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFNlcnZpY2UgZm9yIGRldGVjdGluZywgYWRkaW5nLCBhbmQgZXh0cmFjdGluZyBhbm5vdGF0aW9ucyBmcm9tIGRvY3VtZW50cy5cbiAqL1xuZXhwb3J0IGNsYXNzIEFubm90YXRpb25TZXJ2aWNlIHtcblxuXHQvKipcblx0ICogQXBwbHkgaGlnaGxpZ2h0IHRvIHNlbGVjdGVkIHRleHQ6IHdyYXAgd2l0aCA9PS4uLj09XG5cdCAqL1xuXHRzdGF0aWMgYXBwbHlIaWdobGlnaHQoZWRpdG9yOiBFZGl0b3IpOiBib29sZWFuIHtcblx0XHRjb25zdCBzZWxlY3Rpb24gPSBlZGl0b3IuZ2V0U2VsZWN0aW9uKCk7XG5cdFx0aWYgKCFzZWxlY3Rpb24gfHwgc2VsZWN0aW9uLnRyaW0oKS5sZW5ndGggPT09IDApIHtcblx0XHRcdG5ldyBOb3RpY2UoJ1BsZWFzZSBzZWxlY3Qgc29tZSB0ZXh0IGZpcnN0LicpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIENoZWNrIGlmIGFscmVhZHkgaGlnaGxpZ2h0ZWRcblx0XHRpZiAoc2VsZWN0aW9uLnN0YXJ0c1dpdGgoJz09JykgJiYgc2VsZWN0aW9uLmVuZHNXaXRoKCc9PScpKSB7XG5cdFx0XHRuZXcgTm90aWNlKCdUZXh0IGlzIGFscmVhZHkgaGlnaGxpZ2h0ZWQuJyk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaGlnaGxpZ2h0ZWQgPSBgPT0ke3NlbGVjdGlvbn09PWA7XG5cdFx0ZWRpdG9yLnJlcGxhY2VTZWxlY3Rpb24oaGlnaGxpZ2h0ZWQpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGx5IHVuZGVybGluZSB0byBzZWxlY3RlZCB0ZXh0OiB3cmFwIHdpdGggPHU+Li4uPC91PlxuXHQgKi9cblx0c3RhdGljIGFwcGx5VW5kZXJsaW5lKGVkaXRvcjogRWRpdG9yKTogYm9vbGVhbiB7XG5cdFx0Y29uc3Qgc2VsZWN0aW9uID0gZWRpdG9yLmdldFNlbGVjdGlvbigpO1xuXHRcdGlmICghc2VsZWN0aW9uIHx8IHNlbGVjdGlvbi50cmltKCkubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRuZXcgTm90aWNlKCdQbGVhc2Ugc2VsZWN0IHNvbWUgdGV4dCBmaXJzdC4nKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRpZiAoc2VsZWN0aW9uLnN0YXJ0c1dpdGgoJzx1PicpICYmIHNlbGVjdGlvbi5lbmRzV2l0aCgnPC91PicpKSB7XG5cdFx0XHRuZXcgTm90aWNlKCdUZXh0IGlzIGFscmVhZHkgdW5kZXJsaW5lZC4nKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRjb25zdCB1bmRlcmxpbmVkID0gYDx1PiR7c2VsZWN0aW9ufTwvdT5gO1xuXHRcdGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKHVuZGVybGluZWQpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGx5IGNvbG9yZWQgdGV4dCB0byBzZWxlY3RlZCB0ZXh0LlxuXHQgKiBAcGFyYW0gY29sb3IgLSBDb2xvciBuYW1lIChyZWQsIHllbGxvdywgZ3JlZW4sIGJsdWUsIG9yYW5nZSlcblx0ICovXG5cdHN0YXRpYyBhcHBseUNvbG9yKGVkaXRvcjogRWRpdG9yLCBjb2xvcjogc3RyaW5nID0gJ3JlZCcpOiBib29sZWFuIHtcblx0XHRjb25zdCBzZWxlY3Rpb24gPSBlZGl0b3IuZ2V0U2VsZWN0aW9uKCk7XG5cdFx0aWYgKCFzZWxlY3Rpb24gfHwgc2VsZWN0aW9uLnRyaW0oKS5sZW5ndGggPT09IDApIHtcblx0XHRcdG5ldyBOb3RpY2UoJ1BsZWFzZSBzZWxlY3Qgc29tZSB0ZXh0IGZpcnN0LicpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIENoZWNrIGlmIGFscmVhZHkgY29sb3JlZCB3aXRoIHRoaXMgY29sb3Jcblx0XHRjb25zdCBjb2xvck1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcblx0XHRcdHJlZDogJyNlOTFlNjMnLFxuXHRcdFx0eWVsbG93OiAnI2ZmOTgwMCcsXG5cdFx0XHRncmVlbjogJyM0Y2FmNTAnLFxuXHRcdFx0Ymx1ZTogJyMyMTk2ZjMnLFxuXHRcdFx0b3JhbmdlOiAnI2ZmNTcyMicsXG5cdFx0fTtcblxuXHRcdGNvbnN0IGhleENvbG9yID0gY29sb3JNYXBbY29sb3JdIHx8IGNvbG9yTWFwWydyZWQnXTtcblx0XHRjb25zdCBjb2xvclJlZ2V4ID0gbmV3IFJlZ0V4cChgPHNwYW5bXj5dKnN0eWxlPVwiW15cIl0qY29sb3I6XFxcXHMqJHtoZXhDb2xvcn1bXlwiXSpcIltePl0qPi4qPC9zcGFuPmAsICdpJyk7XG5cdFx0aWYgKGNvbG9yUmVnZXgudGVzdChzZWxlY3Rpb24pKSB7XG5cdFx0XHRuZXcgTm90aWNlKGBUZXh0IGlzIGFscmVhZHkgY29sb3JlZCB3aXRoICR7Y29sb3J9LmApO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGNvbnN0IGNvbG9yZWQgPSBgPHNwYW4gc3R5bGU9XCJjb2xvcjogJHtoZXhDb2xvcn1cIj4ke3NlbGVjdGlvbn08L3NwYW4+YDtcblx0XHRlZGl0b3IucmVwbGFjZVNlbGVjdGlvbihjb2xvcmVkKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHBseSBjb21tZW50IHRvIHNlbGVjdGVkIHRleHQgb3IgdG8gdGhlIGFubm90YXRpb24gYXQgY3Vyc29yIHBvc2l0aW9uLlxuXHQgKiBJbnNlcnRzIGFuIGlubGluZSBjb21tZW50IHVzaW5nIHNpbXBsZSAlJS4uLiUlIG1hcmtlcnMgdGhhdCB3b3JrIHdlbGwgaW4gc291cmNlIG1vZGUuXG5cdCAqL1xuXHRzdGF0aWMgYXN5bmMgYXBwbHlDb21tZW50KGVkaXRvcjogRWRpdG9yLCBhcHA/OiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCBzZWxlY3Rpb24gPSBlZGl0b3IuZ2V0U2VsZWN0aW9uKCk7XG5cblx0XHRjb25zdCBidWlsZENvbW1lbnRCbG9jayA9IChjb21tZW50VGV4dDogc3RyaW5nID0gJycpOiBzdHJpbmcgPT4ge1xuXHRcdFx0cmV0dXJuIGAgXHVEODNEXHVEQ0FDIDxzcGFuIGNsYXNzPVwiYW5ub3RhdGlvbi1jb21tZW50LWxhYmVsXCI+Y29tbWVudDo8L3NwYW4+IDxzcGFuIGNsYXNzPVwiYW5ub3RhdGlvbi1jb21tZW50LXRleHRcIj4ke2NvbW1lbnRUZXh0fTwvc3Bhbj5gO1xuXHRcdH07XG5cblx0XHQvLyBDYXNlIDE6IFVzZXIgaGFzIHNlbGVjdGVkIHNvbWUgdGV4dFxuXHRcdGlmIChzZWxlY3Rpb24gJiYgc2VsZWN0aW9uLnRyaW0oKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRjb25zdCBpc0hpZ2hsaWdodGVkID0gc2VsZWN0aW9uLnN0YXJ0c1dpdGgoJz09JykgJiYgc2VsZWN0aW9uLmVuZHNXaXRoKCc9PScpO1xuXHRcdFx0Y29uc3QgaXNVbmRlcmxpbmVkID0gc2VsZWN0aW9uLnN0YXJ0c1dpdGgoJzx1PicpICYmIHNlbGVjdGlvbi5lbmRzV2l0aCgnPC91PicpO1xuXHRcdFx0Y29uc3QgaXNDb2xvcmVkID0gc2VsZWN0aW9uLnN0YXJ0c1dpdGgoJzxzcGFuJykgJiYgL3N0eWxlPVwiW15cIl0qY29sb3I6Ly50ZXN0KHNlbGVjdGlvbikgJiYgc2VsZWN0aW9uLmluY2x1ZGVzKCc8L3NwYW4+Jyk7XG5cdFx0XHRjb25zdCBoYXNDb21tZW50ID0gL2Fubm90YXRpb24tY29tbWVudC10ZXh0Ly50ZXN0KHNlbGVjdGlvbik7XG5cblx0XHRcdGlmIChoYXNDb21tZW50KSB7XG5cdFx0XHRcdG5ldyBOb3RpY2UoJ1x1NkI2NFx1NjgwN1x1NkNFOFx1NURGMlx1NjcwOVx1NTkwN1x1NkNFOCcpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFByb21wdCB1c2VyIGZvciBjb21tZW50IHRleHRcblx0XHRcdGNvbnN0IGNvbW1lbnRUZXh0ID0gYXdhaXQgdGhpcy5wcm9tcHRGb3JDb21tZW50KGFwcCk7XG5cdFx0XHQvLyBTYW5pdGl6ZTogcmVtb3ZlIGFueSBuZXdsaW5lcyB0byBwcmV2ZW50IHNwYW4gYnJlYWthZ2Vcblx0XHRcdGNvbnN0IHNhbml0aXplZFRleHQgPSBjb21tZW50VGV4dC5yZXBsYWNlKC9bXFxyXFxuXSsvZywgJyAnKS50cmltKCk7XG5cblx0XHRcdGxldCBjb21tZW50ZWQgPSAnJztcblx0XHRcdGNvbnN0IGNvbW1lbnRCbG9jayA9IGJ1aWxkQ29tbWVudEJsb2NrKHNhbml0aXplZFRleHQpO1xuXHRcdFx0aWYgKGlzSGlnaGxpZ2h0ZWQpIHtcblx0XHRcdFx0Y29tbWVudGVkID0gYCR7c2VsZWN0aW9ufSR7Y29tbWVudEJsb2NrfWA7XG5cdFx0XHR9IGVsc2UgaWYgKGlzVW5kZXJsaW5lZCkge1xuXHRcdFx0XHRjb21tZW50ZWQgPSBgJHtzZWxlY3Rpb259JHtjb21tZW50QmxvY2t9YDtcblx0XHRcdH0gZWxzZSBpZiAoaXNDb2xvcmVkKSB7XG5cdFx0XHRcdGNvbW1lbnRlZCA9IGAke3NlbGVjdGlvbn0ke2NvbW1lbnRCbG9ja31gO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29tbWVudGVkID0gYD09JHtzZWxlY3Rpb259PT0ke2NvbW1lbnRCbG9ja31gO1xuXHRcdFx0fVxuXG5cdFx0XHRlZGl0b3IucmVwbGFjZVNlbGVjdGlvbihjb21tZW50ZWQpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gQ2FzZSAyOiBObyBzZWxlY3Rpb24gLSBmaW5kIHRoZSBhbm5vdGF0aW9uIGF0IGN1cnNvciBwb3NpdGlvblxuXHRcdGNvbnN0IGN1cnNvciA9IGVkaXRvci5nZXRDdXJzb3IoJ2Zyb20nKTtcblx0XHRjb25zdCBsaW5lID0gZWRpdG9yLmdldExpbmUoY3Vyc29yLmxpbmUpO1xuXHRcdGNvbnN0IGN1cnNvckNoID0gY3Vyc29yLmNoO1xuXG5cdFx0dHlwZSBBbm5vdGF0aW9uTWF0Y2ggPSB7IHR5cGU6ICdoaWdobGlnaHQnIHwgJ3VuZGVybGluZScgfCAnY29sb3InOyBpbmRleDogbnVtYmVyOyBlbmQ6IG51bWJlcjsgdGV4dDogc3RyaW5nOyBoYXNDb21tZW50OiBib29sZWFuOyBjb2xvcj86IHN0cmluZyB9O1xuXHRcdGNvbnN0IGFubm90YXRpb25zOiBBbm5vdGF0aW9uTWF0Y2hbXSA9IFtdO1xuXG5cdFx0Ly8gQ2hlY2sgaWYgYSBjb21tZW50IHNwYW4gaW1tZWRpYXRlbHkgZm9sbG93cyBhbiBhbm5vdGF0aW9uIGVuZCAoYmVmb3JlIGFueSBvdGhlciBhbm5vdGF0aW9uIHN0YXJ0cylcblx0XHRjb25zdCBoYXNJbW1lZGlhdGVDb21tZW50ID0gKGFubm90YXRpb25FbmQ6IG51bWJlciwgbmV4dEFubm90YXRpb25TdGFydDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG5cdFx0XHRjb25zdCBiZXR3ZWVuQ29udGVudCA9IGxpbmUuc3Vic3RyaW5nKGFubm90YXRpb25FbmQsIG5leHRBbm5vdGF0aW9uU3RhcnQpO1xuXHRcdFx0cmV0dXJuIC88c3BhbltePl0qY2xhc3M9XCJhbm5vdGF0aW9uLWNvbW1lbnQtdGV4dFwiW14+XSo+Ly50ZXN0KGJldHdlZW5Db250ZW50KTtcblx0XHR9O1xuXG5cdFx0Ly8gRmlyc3QgcGFzczogY29sbGVjdCBhbGwgYW5ub3RhdGlvbiBwb3NpdGlvbnMgdG8gZGV0ZXJtaW5lIGJvdW5kYXJpZXNcblx0XHR0eXBlIFJhd0Fubm90YXRpb24gPSB7IHR5cGU6ICdoaWdobGlnaHQnIHwgJ3VuZGVybGluZScgfCAnY29sb3InOyBpbmRleDogbnVtYmVyOyBlbmQ6IG51bWJlcjsgdGV4dDogc3RyaW5nOyBjb2xvcj86IHN0cmluZyB9O1xuXHRcdGNvbnN0IHJhd0Fubm90YXRpb25zOiBSYXdBbm5vdGF0aW9uW10gPSBbXTtcblxuXHRcdC8vIEZpbmQgaGlnaGxpZ2h0c1xuXHRcdGxldCB0ZW1wTWF0Y2g7XG5cdFx0Y29uc3QgaGlnaGxpZ2h0UmVnZXggPSAvPT0oW1xcc1xcU10rPyk9PS9nO1xuXHRcdHdoaWxlICgodGVtcE1hdGNoID0gaGlnaGxpZ2h0UmVnZXguZXhlYyhsaW5lKSkgIT09IG51bGwpIHtcblx0XHRcdHJhd0Fubm90YXRpb25zLnB1c2goe1xuXHRcdFx0XHR0eXBlOiAnaGlnaGxpZ2h0Jyxcblx0XHRcdFx0aW5kZXg6IHRlbXBNYXRjaC5pbmRleCxcblx0XHRcdFx0ZW5kOiB0ZW1wTWF0Y2guaW5kZXggKyB0ZW1wTWF0Y2hbMF0ubGVuZ3RoLFxuXHRcdFx0XHR0ZXh0OiB0ZW1wTWF0Y2hbMV0udHJpbSgpLFxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0Ly8gRmluZCB1bmRlcmxpbmVzXG5cdFx0Y29uc3QgdW5kZXJsaW5lUmVnZXggPSAvPHU+KFtcXHNcXFNdKz8pPFxcL3U+L2c7XG5cdFx0d2hpbGUgKCh0ZW1wTWF0Y2ggPSB1bmRlcmxpbmVSZWdleC5leGVjKGxpbmUpKSAhPT0gbnVsbCkge1xuXHRcdFx0cmF3QW5ub3RhdGlvbnMucHVzaCh7XG5cdFx0XHRcdHR5cGU6ICd1bmRlcmxpbmUnLFxuXHRcdFx0XHRpbmRleDogdGVtcE1hdGNoLmluZGV4LFxuXHRcdFx0XHRlbmQ6IHRlbXBNYXRjaC5pbmRleCArIHRlbXBNYXRjaFswXS5sZW5ndGgsXG5cdFx0XHRcdHRleHQ6IHRlbXBNYXRjaFsxXS50cmltKCksXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvLyBGaW5kIGNvbG9yZWQgc3BhbnNcblx0XHRjb25zdCBjb2xvclJlZ2V4ID0gLzxzcGFuW14+XSpzdHlsZT1cIlteXCJdKmNvbG9yOlxccyooI1swLTlhLWZBLUZdKylbXlwiXSpcIltePl0qPihbXFxzXFxTXSs/KTxcXC9zcGFuPi9naTtcblx0XHR3aGlsZSAoKHRlbXBNYXRjaCA9IGNvbG9yUmVnZXguZXhlYyhsaW5lKSkgIT09IG51bGwpIHtcblx0XHRcdHJhd0Fubm90YXRpb25zLnB1c2goe1xuXHRcdFx0XHR0eXBlOiAnY29sb3InLFxuXHRcdFx0XHRpbmRleDogdGVtcE1hdGNoLmluZGV4LFxuXHRcdFx0XHRlbmQ6IHRlbXBNYXRjaC5pbmRleCArIHRlbXBNYXRjaFswXS5sZW5ndGgsXG5cdFx0XHRcdHRleHQ6IHRlbXBNYXRjaFsyXS50cmltKCksXG5cdFx0XHRcdGNvbG9yOiB0ZW1wTWF0Y2hbMV0sXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvLyBTb3J0IGJ5IHBvc2l0aW9uXG5cdFx0cmF3QW5ub3RhdGlvbnMuc29ydCgoYSwgYikgPT4gYS5pbmRleCAtIGIuaW5kZXgpO1xuXG5cdFx0Ly8gU2Vjb25kIHBhc3M6IGNoZWNrIGZvciBjb21tZW50cyAob25seSBiZXR3ZWVuIGN1cnJlbnQgYW5ub3RhdGlvbiBlbmQgYW5kIG5leHQgYW5ub3RhdGlvbiBzdGFydClcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHJhd0Fubm90YXRpb25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBhbm4gPSByYXdBbm5vdGF0aW9uc1tpXTtcblx0XHRcdGNvbnN0IG5leHRTdGFydCA9IGkgKyAxIDwgcmF3QW5ub3RhdGlvbnMubGVuZ3RoID8gcmF3QW5ub3RhdGlvbnNbaSArIDFdLmluZGV4IDogbGluZS5sZW5ndGg7XG5cdFx0XHRjb25zdCBoYXNDb21tZW50ID0gaGFzSW1tZWRpYXRlQ29tbWVudChhbm4uZW5kLCBuZXh0U3RhcnQpO1xuXG5cdFx0XHRhbm5vdGF0aW9ucy5wdXNoKHtcblx0XHRcdFx0Li4uYW5uLFxuXHRcdFx0XHRoYXNDb21tZW50LFxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKGFubm90YXRpb25zLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0bmV3IE5vdGljZSgnXHU2NzJBXHU2MjdFXHU1MjMwXHU2ODA3XHU2Q0U4XHVGRjBDXHU4QkY3XHU1MTQ4XHU5MDA5XHU0RTJEXHU2NTg3XHU2NzJDJyk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gRmluZCBjbG9zZXN0IGFubm90YXRpb24gd2l0aG91dCBhIGNvbW1lbnRcblx0XHRsZXQgY2xvc2VzdDogQW5ub3RhdGlvbk1hdGNoIHwgbnVsbCA9IG51bGw7XG5cdFx0Zm9yIChjb25zdCBhbm4gb2YgYW5ub3RhdGlvbnMpIHtcblx0XHRcdGlmICghYW5uLmhhc0NvbW1lbnQgJiYgY3Vyc29yQ2ggPj0gYW5uLmluZGV4ICYmIGN1cnNvckNoIDw9IGFubi5lbmQpIHtcblx0XHRcdFx0Y2xvc2VzdCA9IGFubjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gSWYgbm90IGluc2lkZSBhbnkgYW5ub3RhdGlvbiwgcGljayB0aGUgTkVBUkVTVCBvbmUgd2l0aG91dCBhIGNvbW1lbnRcblx0XHRpZiAoIWNsb3Nlc3QpIHtcblx0XHRcdGxldCBtaW5EaXN0ID0gSW5maW5pdHk7XG5cdFx0XHRmb3IgKGNvbnN0IGFubiBvZiBhbm5vdGF0aW9ucykge1xuXHRcdFx0XHRpZiAoIWFubi5oYXNDb21tZW50KSB7XG5cdFx0XHRcdFx0Y29uc3QgZGlzdCA9IE1hdGgubWluKE1hdGguYWJzKGN1cnNvckNoIC0gYW5uLmluZGV4KSwgTWF0aC5hYnMoY3Vyc29yQ2ggLSBhbm4uZW5kKSk7XG5cdFx0XHRcdFx0aWYgKGRpc3QgPCBtaW5EaXN0KSB7XG5cdFx0XHRcdFx0XHRtaW5EaXN0ID0gZGlzdDtcblx0XHRcdFx0XHRcdGNsb3Nlc3QgPSBhbm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCFjbG9zZXN0KSB7XG5cdFx0XHRuZXcgTm90aWNlKCdcdTZCNjRcdTg4NENcdTYyNDBcdTY3MDlcdTY4MDdcdTZDRThcdTVERjJcdTY3MDlcdTU5MDdcdTZDRTgnKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBQcm9tcHQgdXNlciBmb3IgY29tbWVudCB0ZXh0XG5cdFx0Y29uc3QgY29tbWVudFRleHQgPSBhd2FpdCB0aGlzLnByb21wdEZvckNvbW1lbnQoYXBwKTtcblx0XHQvLyBTYW5pdGl6ZTogcmVtb3ZlIGFueSBuZXdsaW5lcyB0byBwcmV2ZW50IHNwYW4gYnJlYWthZ2Vcblx0XHRjb25zdCBzYW5pdGl6ZWRUZXh0ID0gY29tbWVudFRleHQucmVwbGFjZSgvW1xcclxcbl0rL2csICcgJykudHJpbSgpO1xuXG5cdFx0Ly8gSW5zZXJ0IGNvbW1lbnQgd2l0aCB0ZXh0IGFsbCBhdCBvbmNlXG5cdFx0Y29uc3QgY29tbWVudEJsb2NrID0gYnVpbGRDb21tZW50QmxvY2soc2FuaXRpemVkVGV4dCk7XG5cdFx0Y29uc3QgYmVmb3JlQW5ub3RhdGlvbiA9IGxpbmUuc3Vic3RyaW5nKDAsIGNsb3Nlc3QuZW5kKTtcblx0XHRjb25zdCBhZnRlckFubm90YXRpb24gPSBsaW5lLnN1YnN0cmluZyhjbG9zZXN0LmVuZCk7XG5cdFx0Y29uc3QgbmV3TGluZSA9IGJlZm9yZUFubm90YXRpb24gKyBjb21tZW50QmxvY2sgKyBhZnRlckFubm90YXRpb247XG5cdFx0ZWRpdG9yLnNldExpbmUoY3Vyc29yLmxpbmUsIG5ld0xpbmUpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb21wdCB1c2VyIGZvciBjb21tZW50IHRleHQgdXNpbmcgT2JzaWRpYW4gTW9kYWwgQVBJLlxuXHQgKiBTdXBwb3J0cyBtdWx0aS1saW5lIGlucHV0LCBidXQgc2FuaXRpemVzIG5ld2xpbmVzIHRvIHByZXZlbnQgc3BhbiBicmVha2FnZS5cblx0ICogUmV0dXJucyB0aGUgdXNlcidzIGlucHV0IChlbXB0eSBzdHJpbmcgaWYgY2FuY2VsbGVkKS5cblx0ICovXG5cdHByaXZhdGUgc3RhdGljIGFzeW5jIHByb21wdEZvckNvbW1lbnQoYXBwPzogYW55KTogUHJvbWlzZTxzdHJpbmc+IHtcblx0XHRpZiAoIWFwcCkge1xuXHRcdFx0Ly8gVHJ5IHRvIGdldCBhcHAgZnJvbSBnbG9iYWxcblx0XHRcdGFwcCA9ICh3aW5kb3cgYXMgYW55KS5hcHA7XG5cdFx0fVxuXHRcdGlmICghYXBwKSB7XG5cdFx0XHRuZXcgTm90aWNlKCdVbmFibGUgdG8gb3BlbiBjb21tZW50IGRpYWxvZycpO1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0Y2xhc3MgQ29tbWVudE1vZGFsIGV4dGVuZHMgTW9kYWwge1xuXHRcdFx0XHRwcml2YXRlIHJlc3VsdCA9ICcnO1xuXG5cdFx0XHRcdG9uT3BlbigpIHtcblx0XHRcdFx0XHRjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcblx0XHRcdFx0XHRjb250ZW50RWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnQWRkIENvbW1lbnQnIH0pO1xuXG5cdFx0XHRcdFx0Y29uc3QgaW5wdXRDb250YWluZXIgPSBjb250ZW50RWwuY3JlYXRlRGl2KCk7XG5cdFx0XHRcdFx0aW5wdXRDb250YWluZXIuc3R5bGUubWFyZ2luVG9wID0gJzFlbSc7XG5cblx0XHRcdFx0XHQvLyBDcmVhdGUgdGV4dGFyZWEgZm9yIG11bHRpLWxpbmUgaW5wdXRcblx0XHRcdFx0XHRjb25zdCB0ZXh0YXJlYUVsID0gaW5wdXRDb250YWluZXIuY3JlYXRlRWwoJ3RleHRhcmVhJywge1xuXHRcdFx0XHRcdFx0YXR0cjogeyBwbGFjZWhvbGRlcjogJ0VudGVyIHlvdXIgY29tbWVudC4uLicsIHJvd3M6IDQgfSxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR0ZXh0YXJlYUVsLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuXHRcdFx0XHRcdHRleHRhcmVhRWwuc3R5bGUubWluSGVpZ2h0ID0gJzgwcHgnO1xuXHRcdFx0XHRcdHRleHRhcmVhRWwuc3R5bGUucmVzaXplID0gJ3ZlcnRpY2FsJztcblx0XHRcdFx0XHR0ZXh0YXJlYUVsLnN0eWxlLmZvbnRGYW1pbHkgPSAnaW5oZXJpdCc7XG5cdFx0XHRcdFx0dGV4dGFyZWFFbC5zdHlsZS5mb250U2l6ZSA9ICdpbmhlcml0JztcblxuXHRcdFx0XHRcdHRleHRhcmVhRWwuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlc3VsdCA9IHRleHRhcmVhRWwudmFsdWU7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHQvLyBIYW5kbGUgQ3RybCtFbnRlciB0byBzdWJtaXRcblx0XHRcdFx0XHR0ZXh0YXJlYUVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKGUua2V5ID09PSAnRW50ZXInICYmIChlLm1ldGFLZXkgfHwgZS5jdHJsS2V5KSkge1xuXHRcdFx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzdWx0ID0gJyc7XG5cdFx0XHRcdFx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdC8vIEFkZCBoaW50IHRleHRcblx0XHRcdFx0XHRjb25zdCBoaW50RWwgPSBjb250ZW50RWwuY3JlYXRlRGl2KCk7XG5cdFx0XHRcdFx0aGludEVsLnN0eWxlLm1hcmdpblRvcCA9ICcwLjVlbSc7XG5cdFx0XHRcdFx0aGludEVsLnN0eWxlLmZvbnRTaXplID0gJzAuODVlbSc7XG5cdFx0XHRcdFx0aGludEVsLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRleHQtbXV0ZWQpJztcblx0XHRcdFx0XHRoaW50RWwudGV4dENvbnRlbnQgPSAnUHJlc3MgQ21kL0N0cmwrRW50ZXIgdG8gc3VibWl0LCBFc2NhcGUgdG8gY2FuY2VsJztcblxuXHRcdFx0XHRcdG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcblx0XHRcdFx0XHRcdC5hZGRCdXR0b24oKGJ0bikgPT5cblx0XHRcdFx0XHRcdFx0YnRuXG5cdFx0XHRcdFx0XHRcdFx0LnNldEJ1dHRvblRleHQoJ1N1Ym1pdCcpXG5cdFx0XHRcdFx0XHRcdFx0LnNldEN0YSgpXG5cdFx0XHRcdFx0XHRcdFx0Lm9uQ2xpY2soKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQuYWRkQnV0dG9uKChidG4pID0+XG5cdFx0XHRcdFx0XHRcdGJ0bi5zZXRCdXR0b25UZXh0KCdDYW5jZWwnKS5vbkNsaWNrKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnJlc3VsdCA9ICcnO1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHQvLyBGb2N1cyBpbnB1dFxuXHRcdFx0XHRcdHNldFRpbWVvdXQoKCkgPT4gdGV4dGFyZWFFbC5mb2N1cygpLCAxMDApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0b25DbG9zZSgpIHtcblx0XHRcdFx0XHRjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcblx0XHRcdFx0XHRjb250ZW50RWwuZW1wdHkoKTtcblx0XHRcdFx0XHRyZXNvbHZlKHRoaXMucmVzdWx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBtb2RhbCA9IG5ldyBDb21tZW50TW9kYWwoYXBwKTtcblx0XHRcdG1vZGFsLm9wZW4oKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFeHRyYWN0IGFsbCBhbm5vdGF0aW9ucyBmcm9tIHRoZSBnaXZlbiBkb2N1bWVudCBjb250ZW50LlxuXHQgKiBTdXBwb3J0cyBib3RoIGZvcm1hdHM6XG5cdCAqIDEuIElubGluZTogPT10ZXh0PT0gXHVEODNEXHVEQ0FDIGNvbW1lbnQ6IHVzZXIgY29tbWVudCB0ZXh0XG5cdCAqIDIuIERldGFpbHM6ID09dGV4dD09IDxkZXRhaWxzIGNsYXNzPVwiYW5ub3RhdGlvbi1jb21tZW50XCI+Li4uPC9kZXRhaWxzPlxuXHQgKi9cblx0c3RhdGljIGV4dHJhY3RBbm5vdGF0aW9ucyhjb250ZW50OiBzdHJpbmcpOiBBbm5vdGF0aW9uRW50cnlbXSB7XG5cdFx0Y29uc3QgbGluZXMgPSBjb250ZW50LnNwbGl0KCdcXG4nKTtcblx0XHRjb25zdCBhbm5vdGF0aW9uczogQW5ub3RhdGlvbkVudHJ5W10gPSBbXTtcblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IGxpbmUgPSBsaW5lc1tpXTtcblx0XHRcdGNvbnN0IGxpbmVOdW1iZXIgPSBpICsgMTtcblxuXHRcdFx0Ly8gRXh0cmFjdCBoaWdobGlnaHRzXG5cdFx0XHRjb25zdCBoaWdobGlnaHRSZWdleCA9IC89PShbXFxzXFxTXSs/KT09L2c7XG5cdFx0XHRsZXQgbWF0Y2g7XG5cdFx0XHR3aGlsZSAoKG1hdGNoID0gaGlnaGxpZ2h0UmVnZXguZXhlYyhsaW5lKSkgIT09IG51bGwpIHtcblx0XHRcdFx0Y29uc3QgdGV4dCA9IG1hdGNoWzFdLnRyaW0oKTtcblx0XHRcdFx0Y29uc3Qgc2VudGVuY2UgPSB0aGlzLmV4dHJhY3RTZW50ZW5jZShsaW5lLCBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCk7XG5cblx0XHRcdFx0Y29uc3QgYWZ0ZXJIaWdobGlnaHQgPSBsaW5lLnN1YnN0cmluZyhtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCk7XG5cblx0XHRcdFx0Ly8gRXh0cmFjdCBjb21tZW50IGZyb20gc3BhbiBmb3JtYXRcblx0XHRcdFx0bGV0IGNvbW1lbnQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0XHRcdFx0Ly8gUHJpbWFyeSBmb3JtYXQ6IFx1RDgzRFx1RENBQyA8c3BhbiBjbGFzcz1cImFubm90YXRpb24tY29tbWVudC1sYWJlbFwiPmNvbW1lbnQ6PC9zcGFuPiA8c3BhbiBjbGFzcz1cImFubm90YXRpb24tY29tbWVudC10ZXh0XCI+dXNlciB0ZXh0PC9zcGFuPlxuXHRcdFx0XHRjb25zdCBzcGFuTWF0Y2ggPSAvPHNwYW5bXj5dKmNsYXNzPVwiYW5ub3RhdGlvbi1jb21tZW50LXRleHRcIltePl0qPihbXFxzXFxTXSo/KTxcXC9zcGFuPi8uZXhlYyhhZnRlckhpZ2hsaWdodCk7XG5cdFx0XHRcdGlmIChzcGFuTWF0Y2gpIHtcblx0XHRcdFx0XHRjb21tZW50ID0gc3Bhbk1hdGNoWzFdLnRyaW0oKSB8fCB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhbm5vdGF0aW9ucy5wdXNoKHtcblx0XHRcdFx0XHR0ZXh0LFxuXHRcdFx0XHRcdHR5cGU6ICdoaWdobGlnaHQnLFxuXHRcdFx0XHRcdGNvbW1lbnQsXG5cdFx0XHRcdFx0c2VudGVuY2U6IHNlbnRlbmNlLnRyaW0oKSxcblx0XHRcdFx0XHRsaW5lOiBsaW5lTnVtYmVyLFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gRXh0cmFjdCB1bmRlcmxpbmVzXG5cdFx0XHRjb25zdCB1bmRlcmxpbmVSZWdleCA9IC88dT4oW1xcc1xcU10rPyk8XFwvdT4vZztcblx0XHRcdHdoaWxlICgobWF0Y2ggPSB1bmRlcmxpbmVSZWdleC5leGVjKGxpbmUpKSAhPT0gbnVsbCkge1xuXHRcdFx0XHRjb25zdCBzZW50ZW5jZSA9IHRoaXMuZXh0cmFjdFNlbnRlbmNlKGxpbmUsIG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKTtcblxuXHRcdFx0XHRjb25zdCBhZnRlclVuZGVybGluZSA9IGxpbmUuc3Vic3RyaW5nKG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKTtcblxuXHRcdFx0XHQvLyBFeHRyYWN0IGNvbW1lbnQ6IHRyeSBuZXcgJSVjOi4uLiUlIGZvcm1hdCBmaXJzdCwgdGhlbiBsZWdhY3kgc3BhbiBmb3JtYXRcblx0XHRcdFx0bGV0IGNvbW1lbnQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0XHRcdFx0Y29uc3QgbmV3Rm9ybWF0TWF0Y2ggPSAvJSVjOlxccyooW14lXSspJSUvLmV4ZWMoYWZ0ZXJVbmRlcmxpbmUpO1xuXHRcdFx0XHRpZiAobmV3Rm9ybWF0TWF0Y2gpIHtcblx0XHRcdFx0XHRjb21tZW50ID0gbmV3Rm9ybWF0TWF0Y2hbMV0udHJpbSgpIHx8IHVuZGVmaW5lZDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBMZWdhY3kgZm9ybWF0OiBcdUQ4M0RcdURDQUMgPHNwYW4gY2xhc3M9XCJhbm5vdGF0aW9uLWNvbW1lbnQtbGFiZWxcIj5jb21tZW50Ojwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJhbm5vdGF0aW9uLWNvbW1lbnQtdGV4dFwiPnRleHQ8L3NwYW4+XG5cdFx0XHRcdFx0Y29uc3QgbGVnYWN5TWF0Y2ggPSAvPHNwYW5bXj5dKmNsYXNzPVwiYW5ub3RhdGlvbi1jb21tZW50LXRleHRcIltePl0qPihbXFxzXFxTXSo/KTxcXC9zcGFuPi8uZXhlYyhhZnRlclVuZGVybGluZSk7XG5cdFx0XHRcdFx0aWYgKGxlZ2FjeU1hdGNoKSB7XG5cdFx0XHRcdFx0XHRjb21tZW50ID0gbGVnYWN5TWF0Y2hbMV0udHJpbSgpIHx8IHVuZGVmaW5lZDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhbm5vdGF0aW9ucy5wdXNoKHtcblx0XHRcdFx0XHR0ZXh0OiBtYXRjaFsxXS50cmltKCksXG5cdFx0XHRcdFx0dHlwZTogJ3VuZGVybGluZScsXG5cdFx0XHRcdFx0Y29tbWVudCxcblx0XHRcdFx0XHRzZW50ZW5jZTogc2VudGVuY2UudHJpbSgpLFxuXHRcdFx0XHRcdGxpbmU6IGxpbmVOdW1iZXIsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBFeHRyYWN0IGNvbG9yZWQgc3BhbnNcblx0XHRcdGNvbnN0IGNvbG9yUmVnZXggPSAvPHNwYW5bXj5dKnN0eWxlPVwiW15cIl0qY29sb3I6XFxzKigjWzAtOWEtZkEtRl0rKVteXCJdKlwiW14+XSo+KFtcXHNcXFNdKz8pPFxcL3NwYW4+L2dpO1xuXHRcdFx0d2hpbGUgKChtYXRjaCA9IGNvbG9yUmVnZXguZXhlYyhsaW5lKSkgIT09IG51bGwpIHtcblx0XHRcdFx0Y29uc3Qgc2VudGVuY2UgPSB0aGlzLmV4dHJhY3RTZW50ZW5jZShsaW5lLCBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCk7XG5cdFx0XHRcdGNvbnN0IGhleENvbG9yID0gbWF0Y2hbMV07XG5cdFx0XHRcdGNvbnN0IHRleHQgPSBtYXRjaFsyXS50cmltKCk7XG5cblx0XHRcdFx0Y29uc3QgYWZ0ZXJDb2xvciA9IGxpbmUuc3Vic3RyaW5nKG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKTtcblxuXHRcdFx0XHQvLyBFeHRyYWN0IGNvbW1lbnQ6IHRyeSBuZXcgJSVjOi4uLiUlIGZvcm1hdCBmaXJzdCwgdGhlbiBsZWdhY3kgc3BhbiBmb3JtYXRcblx0XHRcdFx0bGV0IGNvbW1lbnQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0XHRcdFx0Y29uc3QgbmV3Rm9ybWF0TWF0Y2ggPSAvJSVjOlxccyooW14lXSspJSUvLmV4ZWMoYWZ0ZXJDb2xvcik7XG5cdFx0XHRcdGlmIChuZXdGb3JtYXRNYXRjaCkge1xuXHRcdFx0XHRcdGNvbW1lbnQgPSBuZXdGb3JtYXRNYXRjaFsxXS50cmltKCkgfHwgdW5kZWZpbmVkO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIExlZ2FjeSBmb3JtYXQ6IFx1RDgzRFx1RENBQyA8c3BhbiBjbGFzcz1cImFubm90YXRpb24tY29tbWVudC1sYWJlbFwiPmNvbW1lbnQ6PC9zcGFuPiA8c3BhbiBjbGFzcz1cImFubm90YXRpb24tY29tbWVudC10ZXh0XCI+dGV4dDwvc3Bhbj5cblx0XHRcdFx0XHRjb25zdCBsZWdhY3lNYXRjaCA9IC88c3BhbltePl0qY2xhc3M9XCJhbm5vdGF0aW9uLWNvbW1lbnQtdGV4dFwiW14+XSo+KFtcXHNcXFNdKj8pPFxcL3NwYW4+Ly5leGVjKGFmdGVyQ29sb3IpO1xuXHRcdFx0XHRcdGlmIChsZWdhY3lNYXRjaCkge1xuXHRcdFx0XHRcdFx0Y29tbWVudCA9IGxlZ2FjeU1hdGNoWzFdLnRyaW0oKSB8fCB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0YW5ub3RhdGlvbnMucHVzaCh7XG5cdFx0XHRcdFx0dGV4dCxcblx0XHRcdFx0XHR0eXBlOiAnY29sb3InLFxuXHRcdFx0XHRcdGNvbW1lbnQsXG5cdFx0XHRcdFx0c2VudGVuY2U6IHNlbnRlbmNlLnRyaW0oKSxcblx0XHRcdFx0XHRsaW5lOiBsaW5lTnVtYmVyLFxuXHRcdFx0XHRcdGNvbG9yOiBoZXhDb2xvcixcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFubm90YXRpb25zO1xuXHR9XG5cblx0LyoqXG5cdCAqIEV4dHJhY3QgdGhlIGNvbXBsZXRlIHNlbnRlbmNlIGNvbnRhaW5pbmcgdGhlIGFubm90YXRpb24uXG5cdCAqIFNwbGl0cyBieSBzZW50ZW5jZSBib3VuZGFyaWVzICguICEgPykgYW5kIHJldHVybnMgdGhlIHNlbnRlbmNlIGNvbnRhaW5pbmcgdGhlIGFubm90YXRpb24gcG9zaXRpb24uXG5cdCAqIEFsc28gc3RyaXBzIG91dCBhbnkgY29tbWVudCBtYXJrdXAgZnJvbSB0aGUgc2VudGVuY2UuXG5cdCAqL1xuXHRwcml2YXRlIHN0YXRpYyBleHRyYWN0U2VudGVuY2UobGluZTogc3RyaW5nLCBhbm5vdGF0aW9uRW5kOiBudW1iZXIpOiBzdHJpbmcge1xuXHRcdC8vIE9ubHkgcmVtb3ZlIHRoZSBjb21tZW50IHRoYXQgYmVsb25ncyB0byBUSElTIGFubm90YXRpb24gKHRoZSBmaXJzdCBvbmUgYWZ0ZXIgYW5ub3RhdGlvbkVuZClcblx0XHRjb25zdCBpbW1lZGlhdGVDb21tZW50UGF0dGVybnMgPSBbXG5cdFx0XHQvXFxzKlx1RDgzRFx1RENBQ1xccyo8c3BhbltePl0qY2xhc3M9XCJhbm5vdGF0aW9uLWNvbW1lbnQtbGFiZWxcIltePl0qPmNvbW1lbnQ6PFxcL3NwYW4+XFxzKjxzcGFuW14+XSpjbGFzcz1cImFubm90YXRpb24tY29tbWVudC10ZXh0XCJbXj5dKj5bXFxzXFxTXSo/PFxcL3NwYW4+Lyxcblx0XHRcdC9cXHMqPHNwYW5bXj5dKmNsYXNzPVwiYW5ub3RhdGlvbi1jb21tZW50LXRleHRcIltePl0qPltcXHNcXFNdKj88XFwvc3Bhbj4vLFxuXHRcdFx0L1xccyo8ZGV0YWlsc1tePl0qY2xhc3M9XCJhbm5vdGF0aW9uLWNvbW1lbnRcIltePl0qPltcXHNcXFNdKj88XFwvZGV0YWlscz4vLFxuXHRcdF07XG5cblx0XHRsZXQgY2xlYW5MaW5lID0gbGluZTtcblxuXHRcdC8vIEZpbmQgdGhlIEZJUlNUIGNvbW1lbnQgcG9zaXRpb24gdGhhdCBhcHBlYXJzIGFmdGVyIGFubm90YXRpb25FbmRcblx0XHRsZXQgZmlyc3RDb21tZW50U3RhcnQgPSAtMTtcblx0XHRsZXQgZmlyc3RDb21tZW50RW5kID0gLTE7XG5cblx0XHRmb3IgKGNvbnN0IHBhdHRlcm4gb2YgaW1tZWRpYXRlQ29tbWVudFBhdHRlcm5zKSB7XG5cdFx0XHQvLyBVc2UgZ2xvYmFsIGZsYWcgdG8gZmluZCBhbGwgbWF0Y2hlcywgdGhlbiBmaWx0ZXIgYnkgcG9zaXRpb25cblx0XHRcdGNvbnN0IGdsb2JhbFBhdHRlcm4gPSBuZXcgUmVnRXhwKHBhdHRlcm4uc291cmNlLCAnZycpO1xuXHRcdFx0bGV0IG07XG5cdFx0XHR3aGlsZSAoKG0gPSBnbG9iYWxQYXR0ZXJuLmV4ZWMobGluZSkpICE9PSBudWxsKSB7XG5cdFx0XHRcdGlmIChtLmluZGV4ID49IGFubm90YXRpb25FbmQpIHtcblx0XHRcdFx0XHRpZiAoZmlyc3RDb21tZW50U3RhcnQgPT09IC0xIHx8IG0uaW5kZXggPCBmaXJzdENvbW1lbnRTdGFydCkge1xuXHRcdFx0XHRcdFx0Zmlyc3RDb21tZW50U3RhcnQgPSBtLmluZGV4O1xuXHRcdFx0XHRcdFx0Zmlyc3RDb21tZW50RW5kID0gbS5pbmRleCArIG1bMF0ubGVuZ3RoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhazsgLy8gT25seSBjYXJlIGFib3V0IGZpcnN0IG1hdGNoIGFmdGVyIGFubm90YXRpb25FbmQgZm9yIHRoaXMgcGF0dGVyblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGZpcnN0Q29tbWVudFN0YXJ0ICE9PSAtMSkge1xuXHRcdFx0Y2xlYW5MaW5lID0gY2xlYW5MaW5lLnN1YnN0cmluZygwLCBmaXJzdENvbW1lbnRTdGFydCkgKyBjbGVhbkxpbmUuc3Vic3RyaW5nKGZpcnN0Q29tbWVudEVuZCk7XG5cdFx0fVxuXG5cdFx0Ly8gU3BsaXQgYnkgc2VudGVuY2UgYm91bmRhcmllczogLiAhID8gZm9sbG93ZWQgYnkgc3BhY2Ugb3IgZW5kXG5cdFx0Y29uc3Qgc2VudGVuY2VSZWdleCA9IC9bXi4hP10qWy4hP10rKD86XFxzfCQpfFteLiE/XSskL2c7XG5cdFx0bGV0IG1hdGNoO1xuXG5cdFx0d2hpbGUgKChtYXRjaCA9IHNlbnRlbmNlUmVnZXguZXhlYyhjbGVhbkxpbmUpKSAhPT0gbnVsbCkge1xuXHRcdFx0Y29uc3Qgc3RhcnQgPSBtYXRjaC5pbmRleDtcblx0XHRcdGNvbnN0IGVuZCA9IHN0YXJ0ICsgbWF0Y2hbMF0ubGVuZ3RoO1xuXHRcdFx0Ly8gVXNlIHRoZSBhbm5vdGF0aW9uIGVuZCBwb3NpdGlvbiB0byBmaW5kIHRoZSByaWdodCBzZW50ZW5jZVxuXHRcdFx0aWYgKGFubm90YXRpb25FbmQgPj0gc3RhcnQgJiYgYW5ub3RhdGlvbkVuZCA8PSBlbmQpIHtcblx0XHRcdFx0cmV0dXJuIG1hdGNoWzBdLnRyaW0oKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBGYWxsYmFjazogcmV0dXJuIHRoZSB3aG9sZSBjbGVhbiBsaW5lIHRyaW1tZWRcblx0XHRyZXR1cm4gY2xlYW5MaW5lLnRyaW0oKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVjayBpZiBhIGZpbGUgaGFzIGFueSBhbm5vdGF0aW9ucy5cblx0ICovXG5cdHN0YXRpYyBoYXNBbm5vdGF0aW9ucyhjb250ZW50OiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0Lz09W149XSs9PS8udGVzdChjb250ZW50KSB8fFxuXHRcdFx0Lzx1PltePF0rPFxcL3U+Ly50ZXN0KGNvbnRlbnQpIHx8XG5cdFx0XHQvPHNwYW5bXj5dKnN0eWxlPVwiW15cIl0qY29sb3I6Ly50ZXN0KGNvbnRlbnQpXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIGNvdW50IG9mIGFubm90YXRpb25zIGJ5IHR5cGUuXG5cdCAqL1xuXHRzdGF0aWMgZ2V0QW5ub3RhdGlvbkNvdW50cyhhbm5vdGF0aW9uczogQW5ub3RhdGlvbkVudHJ5W10pOiB7IGhpZ2hsaWdodHM6IG51bWJlcjsgY29tbWVudHM6IG51bWJlcjsgdW5kZXJsaW5lczogbnVtYmVyOyBjb2xvcnM6IG51bWJlciB9IHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aGlnaGxpZ2h0czogYW5ub3RhdGlvbnMuZmlsdGVyKGEgPT4gYS50eXBlID09PSAnaGlnaGxpZ2h0JykubGVuZ3RoLFxuXHRcdFx0Y29tbWVudHM6IGFubm90YXRpb25zLmZpbHRlcihhID0+IGEudHlwZSA9PT0gJ2NvbW1lbnQnKS5sZW5ndGgsXG5cdFx0XHR1bmRlcmxpbmVzOiBhbm5vdGF0aW9ucy5maWx0ZXIoYSA9PiBhLnR5cGUgPT09ICd1bmRlcmxpbmUnKS5sZW5ndGgsXG5cdFx0XHRjb2xvcnM6IGFubm90YXRpb25zLmZpbHRlcihhID0+IGEudHlwZSA9PT0gJ2NvbG9yJykubGVuZ3RoLFxuXHRcdH07XG5cdH1cbn1cbiIsICJpbXBvcnQgeyBWYXVsdCwgVEZpbGUsIE5vdGljZSwgbW9tZW50IH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgQW5ub3RhdGlvblNlcnZpY2UsIEFubm90YXRpb25FbnRyeSB9IGZyb20gJy4vYW5ub3RhdGlvbi1zZXJ2aWNlJztcbmltcG9ydCB7IEFubm90YXRpb25TdW1tYXJ5U2V0dGluZ3MsIERFRkFVTFRfVEVNUExBVEUgfSBmcm9tICcuL3NldHRpbmdzJztcblxuLyoqXG4gKiBFeHRlbmRlZCBhbm5vdGF0aW9uIGVudHJ5IHdpdGggcmVuZGVyaW5nIGhlbHBlcnMuXG4gKi9cbmludGVyZmFjZSBSZW5kZXJhYmxlQW5ub3RhdGlvbiBleHRlbmRzIEFubm90YXRpb25FbnRyeSB7XG5cdC8qKiBNYXJrZG93biBtYXJrZXIgb3BlbiBzdHJpbmcgKi9cblx0bWFya2VyOiBzdHJpbmc7XG5cdC8qKiBNYXJrZG93biBtYXJrZXIgY2xvc2Ugc3RyaW5nICovXG5cdGVuZG1hcmtlcjogc3RyaW5nO1xuXHQvKiogV2hldGhlciB0aGlzIGVudHJ5IGhhcyBhIGNvbW1lbnQgKi9cblx0aGFzQ29tbWVudDogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBUZW1wbGF0ZSBwcm9jZXNzb3IgZm9yIHN1bW1hcnkgbm90ZSBnZW5lcmF0aW9uLlxuICogU3VwcG9ydHMgc2ltcGxlIHZhcmlhYmxlIHN1YnN0aXR1dGlvbiBhbmQgYmxvY2sgaXRlcmF0aW9uLlxuICovXG5jbGFzcyBUZW1wbGF0ZVByb2Nlc3NvciB7XG5cdHByaXZhdGUgdGVtcGxhdGU6IHN0cmluZztcblx0cHJpdmF0ZSB2YXJpYWJsZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cdHByaXZhdGUgaGlnaGxpZ2h0czogUmVuZGVyYWJsZUFubm90YXRpb25bXTtcblx0cHJpdmF0ZSB1bmRlcmxpbmVzOiBSZW5kZXJhYmxlQW5ub3RhdGlvbltdO1xuXHRwcml2YXRlIGNvbG9yczogUmVuZGVyYWJsZUFubm90YXRpb25bXTtcblxuXHRjb25zdHJ1Y3Rvcih0ZW1wbGF0ZTogc3RyaW5nKSB7XG5cdFx0dGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuXHRcdHRoaXMudmFyaWFibGVzID0ge307XG5cdFx0dGhpcy5oaWdobGlnaHRzID0gW107XG5cdFx0dGhpcy51bmRlcmxpbmVzID0gW107XG5cdFx0dGhpcy5jb2xvcnMgPSBbXTtcblx0fVxuXG5cdHNldFZhcmlhYmxlKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHRoaXMge1xuXHRcdHRoaXMudmFyaWFibGVzW25hbWVdID0gdmFsdWU7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRzZXRIaWdobGlnaHRzKGVudHJpZXM6IFJlbmRlcmFibGVBbm5vdGF0aW9uW10pOiB0aGlzIHtcblx0XHR0aGlzLmhpZ2hsaWdodHMgPSBlbnRyaWVzO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0c2V0VW5kZXJsaW5lcyhlbnRyaWVzOiBSZW5kZXJhYmxlQW5ub3RhdGlvbltdKTogdGhpcyB7XG5cdFx0dGhpcy51bmRlcmxpbmVzID0gZW50cmllcztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHNldENvbG9ycyhlbnRyaWVzOiBSZW5kZXJhYmxlQW5ub3RhdGlvbltdKTogdGhpcyB7XG5cdFx0dGhpcy5jb2xvcnMgPSBlbnRyaWVzO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0cHJvY2VzcygpOiBzdHJpbmcge1xuXHRcdGxldCByZXN1bHQgPSB0aGlzLnRlbXBsYXRlO1xuXG5cdFx0Ly8gUHJvY2VzcyBoaWdobGlnaHRzIGJsb2NrXG5cdFx0cmVzdWx0ID0gdGhpcy5wcm9jZXNzQmxvY2socmVzdWx0LCAnaGlnaGxpZ2h0cycsIHRoaXMuaGlnaGxpZ2h0cyk7XG5cblx0XHQvLyBQcm9jZXNzIHVuZGVybGluZXMgYmxvY2tcblx0XHRyZXN1bHQgPSB0aGlzLnByb2Nlc3NCbG9jayhyZXN1bHQsICd1bmRlcmxpbmVzJywgdGhpcy51bmRlcmxpbmVzKTtcblxuXHRcdC8vIFByb2Nlc3MgY29sb3JzIGJsb2NrXG5cdFx0cmVzdWx0ID0gdGhpcy5wcm9jZXNzQmxvY2socmVzdWx0LCAnY29sb3JzJywgdGhpcy5jb2xvcnMpO1xuXG5cdFx0Ly8gUHJvY2VzcyBzaW1wbGUgdmFyaWFibGVzXG5cdFx0Zm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMudmFyaWFibGVzKSkge1xuXHRcdFx0Y29uc3QgdmFyUmVnZXggPSBuZXcgUmVnRXhwKGBcXFxce1xcXFx7JHtuYW1lfVxcXFx9XFxcXH1gLCAnZycpO1xuXHRcdFx0cmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UodmFyUmVnZXgsIHZhbHVlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0cHJpdmF0ZSBwcm9jZXNzQmxvY2soY29udGVudDogc3RyaW5nLCBibG9ja05hbWU6IHN0cmluZywgZW50cmllczogUmVuZGVyYWJsZUFubm90YXRpb25bXSk6IHN0cmluZyB7XG5cdFx0Y29uc3QgYmxvY2tSZWdleCA9IG5ldyBSZWdFeHAoYFxcXFx7XFxcXHsjJHtibG9ja05hbWV9XFxcXH1cXFxcfShbXFxcXHNcXFxcU10qPylcXFxce1xcXFx7LyR7YmxvY2tOYW1lfVxcXFx9XFxcXH1gLCAnZycpO1xuXHRcdGNvbnN0IGJsb2NrTWF0Y2ggPSBibG9ja1JlZ2V4LmV4ZWMoY29udGVudCk7XG5cblx0XHRpZiAoYmxvY2tNYXRjaCkge1xuXHRcdFx0Y29uc3QgYmxvY2tDb250ZW50ID0gYmxvY2tNYXRjaFsxXTtcblx0XHRcdGxldCBleHBhbmRlZCA9ICcnO1xuXG5cdFx0XHRmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcblx0XHRcdFx0bGV0IGl0ZW1Db250ZW50ID0gYmxvY2tDb250ZW50O1xuXHRcdFx0XHRpdGVtQ29udGVudCA9IGl0ZW1Db250ZW50LnJlcGxhY2UoL1xce1xce3RleHRcXH1cXH0vZywgZW50cnkudGV4dCk7XG5cdFx0XHRcdGl0ZW1Db250ZW50ID0gaXRlbUNvbnRlbnQucmVwbGFjZSgvXFx7XFx7c2VudGVuY2VcXH1cXH0vZywgZW50cnkuc2VudGVuY2UpO1xuXHRcdFx0XHRpdGVtQ29udGVudCA9IGl0ZW1Db250ZW50LnJlcGxhY2UoL1xce1xce2xpbmVcXH1cXH0vZywgU3RyaW5nKGVudHJ5LmxpbmUpKTtcblx0XHRcdFx0aXRlbUNvbnRlbnQgPSBpdGVtQ29udGVudC5yZXBsYWNlKC9cXHtcXHtjb21tZW50XFx9XFx9L2csIGVudHJ5LmNvbW1lbnQgfHwgJycpO1xuXHRcdFx0XHRpdGVtQ29udGVudCA9IGl0ZW1Db250ZW50LnJlcGxhY2UoL1xce1xce2NvbG9yXFx9XFx9L2csIGVudHJ5LmNvbG9yIHx8ICcnKTtcblxuXHRcdFx0XHQvLyBIYW5kbGUge3sjaGFzQ29tbWVudH19Li4ue3svaGFzQ29tbWVudH19IGNvbmRpdGlvbmFsIGJsb2Nrc1xuXHRcdFx0XHRjb25zdCBoYXNDb21tZW50QmxvY2tSZWdleCA9IC9cXHtcXHsjaGFzQ29tbWVudFxcfVxcfShbXFxzXFxTXSo/KVxce1xce1xcL2hhc0NvbW1lbnRcXH1cXH0vZztcblx0XHRcdFx0aWYgKGVudHJ5Lmhhc0NvbW1lbnQpIHtcblx0XHRcdFx0XHRpdGVtQ29udGVudCA9IGl0ZW1Db250ZW50LnJlcGxhY2UoaGFzQ29tbWVudEJsb2NrUmVnZXgsICckMScpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGl0ZW1Db250ZW50ID0gaXRlbUNvbnRlbnQucmVwbGFjZShoYXNDb21tZW50QmxvY2tSZWdleCwgJycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZXhwYW5kZWQgKz0gaXRlbUNvbnRlbnQ7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBjb250ZW50LnJlcGxhY2UoYmxvY2tSZWdleCwgZXhwYW5kZWQpO1xuXHRcdH1cblxuXHRcdC8vIFJlbW92ZSBibG9jayBtYXJrZXJzIGlmIG5vdCBmb3VuZFxuXHRcdGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UobmV3IFJlZ0V4cChgXFxcXHtcXFxceyMke2Jsb2NrTmFtZX1cXFxcfVxcXFx9YCwgJ2cnKSwgJycpO1xuXHRcdGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UobmV3IFJlZ0V4cChgXFxcXHtcXFxcey8ke2Jsb2NrTmFtZX1cXFxcfVxcXFx9YCwgJ2cnKSwgJycpO1xuXHRcdHJldHVybiBjb250ZW50O1xuXHR9XG59XG5cbi8qKlxuICogU3VtbWFyeUdlbmVyYXRvciBoYW5kbGVzIHRoZSBjcmVhdGlvbiBhbmQgdXBkYXRpbmcgb2YgYW5ub3RhdGlvbiBzdW1tYXJ5IG5vdGVzLlxuICovXG5leHBvcnQgY2xhc3MgU3VtbWFyeUdlbmVyYXRvciB7XG5cdHByaXZhdGUgdmF1bHQ6IFZhdWx0O1xuXHRwcml2YXRlIHNldHRpbmdzOiBBbm5vdGF0aW9uU3VtbWFyeVNldHRpbmdzO1xuXG5cdGNvbnN0cnVjdG9yKHZhdWx0OiBWYXVsdCwgc2V0dGluZ3M6IEFubm90YXRpb25TdW1tYXJ5U2V0dGluZ3MpIHtcblx0XHR0aGlzLnZhdWx0ID0gdmF1bHQ7XG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgc3VtbWFyeSBmaWxlIHBhdGggZm9yIGEgZ2l2ZW4gc291cmNlIGZpbGUuXG5cdCAqIGUuZy4sIFwibm90ZXMubWRcIiAtPiBcIm5vdGVzLmFubm90YXRpb25zLm1kXCJcblx0ICovXG5cdGdldFN1bW1hcnlGaWxlUGF0aChzb3VyY2VGaWxlOiBURmlsZSk6IHN0cmluZyB7XG5cdFx0Y29uc3QgZGlyID0gc291cmNlRmlsZS5wYXJlbnQ/LnBhdGggfHwgJyc7XG5cdFx0Y29uc3QgYmFzZW5hbWUgPSBzb3VyY2VGaWxlLmJhc2VuYW1lO1xuXHRcdGNvbnN0IHN1ZmZpeCA9IHRoaXMuc2V0dGluZ3MuYW5ub3RhdGlvblN1ZmZpeCB8fCAnLmFubm90YXRpb25zJztcblx0XHRpZiAoZGlyICYmIGRpciAhPT0gJy8nKSB7XG5cdFx0XHRyZXR1cm4gYCR7ZGlyfS8ke2Jhc2VuYW1lfSR7c3VmZml4fS5tZGA7XG5cdFx0fVxuXHRcdHJldHVybiBgJHtiYXNlbmFtZX0ke3N1ZmZpeH0ubWRgO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1lcmdlIGFubm90YXRpb25zIG9mIGRpZmZlcmVudCB0eXBlcyBpbnRvIHNlcGFyYXRlIHNvcnRlZCBsaXN0cy5cblx0ICovXG5cdHByaXZhdGUgY2F0ZWdvcml6ZUFubm90YXRpb25zKGFubm90YXRpb25zOiBBbm5vdGF0aW9uRW50cnlbXSk6IHsgaGlnaGxpZ2h0czogUmVuZGVyYWJsZUFubm90YXRpb25bXTsgdW5kZXJsaW5lczogUmVuZGVyYWJsZUFubm90YXRpb25bXTsgY29sb3JzOiBSZW5kZXJhYmxlQW5ub3RhdGlvbltdIH0ge1xuXHRcdGNvbnN0IHJlbmRlcmFibGU6IFJlbmRlcmFibGVBbm5vdGF0aW9uW10gPSBhbm5vdGF0aW9ucy5tYXAoYSA9PiB7XG5cdFx0XHRsZXQgbWFya2VyID0gJyc7XG5cdFx0XHRsZXQgZW5kbWFya2VyID0gJyc7XG5cblx0XHRcdHN3aXRjaCAoYS50eXBlKSB7XG5cdFx0XHRcdGNhc2UgJ2hpZ2hsaWdodCc6XG5cdFx0XHRcdFx0bWFya2VyID0gJz09Jztcblx0XHRcdFx0XHRlbmRtYXJrZXIgPSAnPT0nO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdjb21tZW50Jzpcblx0XHRcdFx0XHQvLyBDb21tZW50IHR5cGUgZnJvbSBleHRyYWN0aW9uIFx1MjAxNCB0cmVhdCBhcyBoaWdobGlnaHQgd2l0aCBjb21tZW50XG5cdFx0XHRcdFx0bWFya2VyID0gJz09Jztcblx0XHRcdFx0XHRlbmRtYXJrZXIgPSAnPT0nO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICd1bmRlcmxpbmUnOlxuXHRcdFx0XHRcdG1hcmtlciA9ICc8dT4nO1xuXHRcdFx0XHRcdGVuZG1hcmtlciA9ICc8L3U+Jztcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAnY29sb3InOlxuXHRcdFx0XHRcdG1hcmtlciA9IGA8c3BhbiBzdHlsZT1cImNvbG9yOiAke2EuY29sb3IgfHwgJyNlOTFlNjMnfVwiPmA7XG5cdFx0XHRcdFx0ZW5kbWFya2VyID0gJzwvc3Bhbj4nO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQuLi5hLFxuXHRcdFx0XHRtYXJrZXIsXG5cdFx0XHRcdGVuZG1hcmtlcixcblx0XHRcdFx0aGFzQ29tbWVudDogISFhLmNvbW1lbnQsXG5cdFx0XHR9O1xuXHRcdH0pO1xuXG5cdFx0Ly8gU29ydCBieSBsaW5lIG51bWJlclxuXHRcdHJlbmRlcmFibGUuc29ydCgoYSwgYikgPT4ge1xuXHRcdFx0aWYgKGEubGluZSAhPT0gYi5saW5lKSByZXR1cm4gYS5saW5lIC0gYi5saW5lO1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fSk7XG5cblx0XHQvLyBDYXRlZ29yaXplIFx1MjAxNCBoaWdobGlnaHRzIGluY2x1ZGUgYm90aCAnaGlnaGxpZ2h0JyBhbmQgJ2NvbW1lbnQnIHR5cGVzIChjb21tZW50cyBhcmUgaGlnaGxpZ2h0cyB3aXRoIGF0dGFjaGVkIG5vdGVzKVxuXHRcdGNvbnN0IGhpZ2hsaWdodHMgPSByZW5kZXJhYmxlLmZpbHRlcihhID0+IGEudHlwZSA9PT0gJ2hpZ2hsaWdodCcgfHwgYS50eXBlID09PSAnY29tbWVudCcpO1xuXHRcdGNvbnN0IHVuZGVybGluZXMgPSByZW5kZXJhYmxlLmZpbHRlcihhID0+IGEudHlwZSA9PT0gJ3VuZGVybGluZScpO1xuXHRcdGNvbnN0IGNvbG9ycyA9IHJlbmRlcmFibGUuZmlsdGVyKGEgPT4gYS50eXBlID09PSAnY29sb3InKTtcblxuXHRcdHJldHVybiB7IGhpZ2hsaWdodHMsIHVuZGVybGluZXMsIGNvbG9ycyB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdlbmVyYXRlIG9yIHVwZGF0ZSB0aGUgc3VtbWFyeSBub3RlIGZvciBhIHNvdXJjZSBmaWxlLlxuXHQgKi9cblx0YXN5bmMgZ2VuZXJhdGVTdW1tYXJ5KHNvdXJjZUZpbGU6IFRGaWxlKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc29sZS5sb2coJ1tBbm5vdGF0aW9uIFN1bW1hcnldIEdlbmVyYXRpbmcgc3VtbWFyeSBmb3I6Jywgc291cmNlRmlsZS5wYXRoKTtcblxuXHRcdC8vIFJlYWQgdGhlIHNvdXJjZSBmaWxlIGNvbnRlbnRcblx0XHRjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy52YXVsdC5yZWFkKHNvdXJjZUZpbGUpO1xuXHRcdGNvbnNvbGUubG9nKCdbQW5ub3RhdGlvbiBTdW1tYXJ5XSBGaWxlIGNvbnRlbnQgbGVuZ3RoOicsIGNvbnRlbnQubGVuZ3RoKTtcblxuXHRcdC8vIENoZWNrIGlmIHRoZXJlIGFyZSBhbnkgYW5ub3RhdGlvbnNcblx0XHRpZiAoIUFubm90YXRpb25TZXJ2aWNlLmhhc0Fubm90YXRpb25zKGNvbnRlbnQpKSB7XG5cdFx0XHRuZXcgTm90aWNlKCdObyBhbm5vdGF0aW9ucyBmb3VuZCBpbiB0aGlzIGZpbGUuJyk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gRXh0cmFjdCBhbGwgYW5ub3RhdGlvbnNcblx0XHRjb25zdCBhbm5vdGF0aW9ucyA9IEFubm90YXRpb25TZXJ2aWNlLmV4dHJhY3RBbm5vdGF0aW9ucyhjb250ZW50KTtcblx0XHRjb25zb2xlLmxvZygnW0Fubm90YXRpb24gU3VtbWFyeV0gRm91bmQgYW5ub3RhdGlvbnM6JywgYW5ub3RhdGlvbnMubGVuZ3RoKTtcblxuXHRcdC8vIENhdGVnb3JpemUgaW50byBoaWdobGlnaHRzLCB1bmRlcmxpbmVzLCBhbmQgY29sb3JzXG5cdFx0Y29uc3QgeyBoaWdobGlnaHRzLCB1bmRlcmxpbmVzLCBjb2xvcnMgfSA9IHRoaXMuY2F0ZWdvcml6ZUFubm90YXRpb25zKGFubm90YXRpb25zKTtcblxuXHRcdC8vIFByZXBhcmUgdGVtcGxhdGVcblx0XHRjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuc2V0dGluZ3Muc3VtbWFyeVRlbXBsYXRlIHx8IERFRkFVTFRfVEVNUExBVEU7XG5cdFx0Y29uc3QgcHJvY2Vzc29yID0gbmV3IFRlbXBsYXRlUHJvY2Vzc29yKHRlbXBsYXRlKTtcblxuXHRcdC8vIFNldCB2YXJpYWJsZXNcblx0XHRwcm9jZXNzb3Iuc2V0VmFyaWFibGUoJ3NvdXJjZVBhdGgnLCBzb3VyY2VGaWxlLnBhdGgpO1xuXHRcdHByb2Nlc3Nvci5zZXRWYXJpYWJsZSgnZGF0ZScsIG1vbWVudCgpLmZvcm1hdCgnWVlZWS1NTS1ERCBISDptbTpzcycpKTtcblxuXHRcdC8vIFNldCBjYXRlZ29yaXplZCBsaXN0c1xuXHRcdHByb2Nlc3Nvci5zZXRIaWdobGlnaHRzKGhpZ2hsaWdodHMpO1xuXHRcdHByb2Nlc3Nvci5zZXRVbmRlcmxpbmVzKHVuZGVybGluZXMpO1xuXHRcdHByb2Nlc3Nvci5zZXRDb2xvcnMoY29sb3JzKTtcblxuXHRcdC8vIFByb2Nlc3MgdGVtcGxhdGVcblx0XHRjb25zdCBzdW1tYXJ5Q29udGVudCA9IHByb2Nlc3Nvci5wcm9jZXNzKCk7XG5cblx0XHQvLyBXcml0ZSBvciB1cGRhdGUgdGhlIHN1bW1hcnkgZmlsZVxuXHRcdGNvbnN0IHN1bW1hcnlQYXRoID0gdGhpcy5nZXRTdW1tYXJ5RmlsZVBhdGgoc291cmNlRmlsZSk7XG5cdFx0Y29uc29sZS5sb2coJ1tBbm5vdGF0aW9uIFN1bW1hcnldIEdlbmVyYXRlZCBzdW1tYXJ5IHBhdGg6Jywgc3VtbWFyeVBhdGgpO1xuXHRcdGNvbnNvbGUubG9nKCdbQW5ub3RhdGlvbiBTdW1tYXJ5XSBTb3VyY2UgZmlsZSBwYXRoOicsIHNvdXJjZUZpbGUucGF0aCk7XG5cblx0XHRsZXQgc3VtbWFyeUZpbGUgPSB0aGlzLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChzdW1tYXJ5UGF0aCk7XG5cdFx0Y29uc29sZS5sb2coJ1tBbm5vdGF0aW9uIFN1bW1hcnldIGdldEFic3RyYWN0RmlsZUJ5UGF0aCByZXN1bHQ6Jywgc3VtbWFyeUZpbGUgPyAnZm91bmQnIDogJ25vdCBmb3VuZCcpO1xuXG5cdFx0Ly8gRmFsbGJhY2sgMTogdHJ5IHRvIGZpbmQgYnkgaXRlcmF0aW5nIHZhdWx0IGZpbGVzXG5cdFx0aWYgKCFzdW1tYXJ5RmlsZSkge1xuXHRcdFx0Y29uc3QgYWxsRmlsZXMgPSB0aGlzLnZhdWx0LmdldEZpbGVzKCk7XG5cdFx0XHRjb25zdCBtYXRjaGluZ0ZpbGVzID0gYWxsRmlsZXMuZmlsdGVyKGYgPT4gZi5wYXRoLmluY2x1ZGVzKCdhbm5vdGF0aW9ucycpKTtcblx0XHRcdGNvbnNvbGUubG9nKCdbQW5ub3RhdGlvbiBTdW1tYXJ5XSBGaWxlcyB3aXRoIFwiYW5ub3RhdGlvbnNcIiBpbiB2YXVsdDonLCBtYXRjaGluZ0ZpbGVzLm1hcChmID0+IGYucGF0aCkpO1xuXHRcdFx0c3VtbWFyeUZpbGUgPSBhbGxGaWxlcy5maW5kKGYgPT4gZi5wYXRoID09PSBzdW1tYXJ5UGF0aCkgfHwgbnVsbDtcblx0XHRcdGNvbnNvbGUubG9nKCdbQW5ub3RhdGlvbiBTdW1tYXJ5XSBnZXRGaWxlcyBleGFjdCBtYXRjaDonLCBzdW1tYXJ5RmlsZSA/ICdmb3VuZCcgOiAnbm90IGZvdW5kJyk7XG5cdFx0fVxuXG5cdFx0Ly8gRmFsbGJhY2sgMjogdHJ5IGFkYXB0ZXIgdG8gY2hlY2sgaWYgZmlsZSBleGlzdHMgb24gZGlza1xuXHRcdGlmICghc3VtbWFyeUZpbGUpIHtcblx0XHRcdGNvbnN0IGZpbGVFeGlzdHNPbkRpc2sgPSBhd2FpdCB0aGlzLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHN1bW1hcnlQYXRoKTtcblx0XHRcdGNvbnNvbGUubG9nKCdbQW5ub3RhdGlvbiBTdW1tYXJ5XSBhZGFwdGVyLmV4aXN0cyByZXN1bHQ6JywgZmlsZUV4aXN0c09uRGlzayk7XG5cdFx0XHRpZiAoZmlsZUV4aXN0c09uRGlzaykge1xuXHRcdFx0XHQvLyBGaWxlIGV4aXN0cyBidXQgbm90IGluZGV4ZWQgLSB3cml0ZSBkaXJlY3RseSB2aWEgYWRhcHRlclxuXHRcdFx0XHRjb25zb2xlLmxvZygnW0Fubm90YXRpb24gU3VtbWFyeV0gRmlsZSBleGlzdHMgb24gZGlzayBidXQgbm90IGluIHZhdWx0IGluZGV4LiBXcml0aW5nIHZpYSBhZGFwdGVyLi4uJyk7XG5cdFx0XHRcdGF3YWl0IHRoaXMudmF1bHQuYWRhcHRlci53cml0ZShzdW1tYXJ5UGF0aCwgc3VtbWFyeUNvbnRlbnQpO1xuXHRcdFx0XHRuZXcgTm90aWNlKGBTdW1tYXJ5IHVwZGF0ZWQ6ICR7c3VtbWFyeVBhdGh9YCk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnNvbGUubG9nKCdbQW5ub3RhdGlvbiBTdW1tYXJ5XSBGaW5hbCBkZWNpc2lvbiAtIHN1bW1hcnlGaWxlIGlzIFRGaWxlOicsIHN1bW1hcnlGaWxlIGluc3RhbmNlb2YgVEZpbGUpO1xuXG5cdFx0aWYgKHN1bW1hcnlGaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcblx0XHRcdC8vIFVwZGF0ZSBleGlzdGluZyB2aWEgdmF1bHRcblx0XHRcdGNvbnNvbGUubG9nKCdbQW5ub3RhdGlvbiBTdW1tYXJ5XSBVcGRhdGluZyBleGlzdGluZyBmaWxlIHZpYSB2YXVsdDonLCBzdW1tYXJ5UGF0aCk7XG5cdFx0XHRhd2FpdCB0aGlzLnZhdWx0Lm1vZGlmeShzdW1tYXJ5RmlsZSwgc3VtbWFyeUNvbnRlbnQpO1xuXHRcdFx0bmV3IE5vdGljZShgU3VtbWFyeSB1cGRhdGVkOiAke3N1bW1hcnlQYXRofWApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBDcmVhdGUgbmV3XG5cdFx0XHRjb25zb2xlLmxvZygnW0Fubm90YXRpb24gU3VtbWFyeV0gQ3JlYXRpbmcgbmV3IGZpbGU6Jywgc3VtbWFyeVBhdGgpO1xuXHRcdFx0YXdhaXQgdGhpcy52YXVsdC5jcmVhdGUoc3VtbWFyeVBhdGgsIHN1bW1hcnlDb250ZW50KTtcblx0XHRcdG5ldyBOb3RpY2UoYFN1bW1hcnkgY3JlYXRlZDogJHtzdW1tYXJ5UGF0aH1gKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWZyZXNoIHRoZSBzdW1tYXJ5IGZvciBhIHNvdXJjZSBmaWxlIChzYW1lIGFzIGdlbmVyYXRlLCBidXQgd2l0aCBkaWZmZXJlbnQgbWVzc2FnaW5nKS5cblx0ICovXG5cdGFzeW5jIHJlZnJlc2hTdW1tYXJ5KHNvdXJjZUZpbGU6IFRGaWxlKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc3Qgc3VtbWFyeVBhdGggPSB0aGlzLmdldFN1bW1hcnlGaWxlUGF0aChzb3VyY2VGaWxlKTtcblx0XHRjb25zdCBzdW1tYXJ5RmlsZSA9IHRoaXMudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHN1bW1hcnlQYXRoKTtcblxuXHRcdGlmICghc3VtbWFyeUZpbGUpIHtcblx0XHRcdG5ldyBOb3RpY2UoJ05vIHN1bW1hcnkgZmlsZSBmb3VuZC4gR2VuZXJhdGluZyBhIG5ldyBvbmUuLi4nKTtcblx0XHRcdHJldHVybiB0aGlzLmdlbmVyYXRlU3VtbWFyeShzb3VyY2VGaWxlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5nZW5lcmF0ZVN1bW1hcnkoc291cmNlRmlsZSk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IGFubm90YXRpb24gY291bnRzIGZvciBhIGZpbGUgd2l0aG91dCBnZW5lcmF0aW5nIHN1bW1hcnkuXG5cdCAqL1xuXHRhc3luYyBnZXRBbm5vdGF0aW9uQ291bnRzKHNvdXJjZUZpbGU6IFRGaWxlKTogUHJvbWlzZTx7IGhpZ2hsaWdodHM6IG51bWJlcjsgY29tbWVudHM6IG51bWJlcjsgdW5kZXJsaW5lczogbnVtYmVyOyBjb2xvcnM6IG51bWJlciB9IHwgbnVsbD4ge1xuXHRcdGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLnZhdWx0LnJlYWQoc291cmNlRmlsZSk7XG5cdFx0aWYgKCFBbm5vdGF0aW9uU2VydmljZS5oYXNBbm5vdGF0aW9ucyhjb250ZW50KSkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdGNvbnN0IGFubm90YXRpb25zID0gQW5ub3RhdGlvblNlcnZpY2UuZXh0cmFjdEFubm90YXRpb25zKGNvbnRlbnQpO1xuXHRcdHJldHVybiBBbm5vdGF0aW9uU2VydmljZS5nZXRBbm5vdGF0aW9uQ291bnRzKGFubm90YXRpb25zKTtcblx0fVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUFBQSxtQkFBMkU7OztBQ0EzRSxzQkFBdUQ7QUEwQmhELElBQU0sbUJBQThDO0FBQUEsRUFDMUQsaUJBQWlCO0FBQUEsRUFDakIsaUJBQWlCO0FB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UUFDRDtBQUFBLE1BQ0QsQ0FBQztBQUFBLElBQ0Y7QUFBQSxFQUNEO0FBQUEsRUFFUSxpQkFBaUI7QUFDeEIsVUFBTSxVQUFVLFNBQVMsY0FBYyxPQUFPO0FBQzlDLFlBQVEsS0FBSztBQUNiLFlBQVEsY0FBYztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBcUR0QixhQUFTLEtBQUssWUFBWSxPQUFPO0FBRWpDLFNBQUssU0FBUyxNQUFNO0FBQ25CLFlBQU0sS0FBSyxTQUFTLGVBQWUsMkJBQTJCO0FBQzlELFVBQUk7QUFBSSxXQUFHLE9BQU87QUFBQSxJQUNuQixDQUFDO0FBQUEsRUFDRjtBQUNEOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImNvbW1lbnRUZXh0IiwgInNhbml0aXplZFRleHQiLCAiY29tbWVudEJsb2NrIiwgImltcG9ydF9vYnNpZGlhbiJdCn0K
