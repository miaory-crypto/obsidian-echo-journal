const panels = [...document.querySelectorAll("[data-step-panel]")];
const stepButtons = [...document.querySelectorAll("[data-step-button]")];
const progress = document.querySelector("[data-progress]");
const stepNames = ["写下今天", "找回过去", "继续对话", "保存想法", "日后验证"];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let currentStep = 0;

function showStep(index, { focus = false } = {}) {
  const next = Math.max(0, Math.min(index, panels.length - 1));
  currentStep = next;

  panels.forEach((panel, panelIndex) => {
    panel.hidden = panelIndex !== next;
  });

  stepButtons.forEach((button, buttonIndex) => {
    if (buttonIndex === next) {
      button.setAttribute("aria-current", "step");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  progress.textContent = `步骤 ${next + 1} / ${panels.length} · ${stepNames[next]}`;

  if (focus) {
    panels[next].querySelector("h3")?.focus({ preventScroll: true });
  }
}

function pause(duration = 460) {
  return new Promise((resolve) => window.setTimeout(resolve, reducedMotion ? 20 : duration));
}

async function simulate(button, busyText, nextStep) {
  const original = button.textContent;
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.textContent = busyText;
  await pause();
  button.disabled = false;
  button.removeAttribute("aria-busy");
  button.textContent = original;
  showStep(nextStep);
}

stepButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showStep(Number(button.dataset.stepButton));
  });
});

document.querySelector("[data-action='retrieve']")?.addEventListener("click", (event) => {
  simulate(event.currentTarget, "正在检索合成笔记…", 1);
});

document.querySelectorAll("[data-result]").forEach((result) => {
  result.addEventListener("click", () => {
    document.querySelectorAll("[data-result]").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === result));
    });
  });
});

document.querySelector("[data-action='explain']")?.addEventListener("click", (event) => {
  simulate(event.currentTarget, "正在生成固定演示回答…", 2);
});

document.querySelectorAll("[data-choice]").forEach((choice) => {
  choice.addEventListener("click", () => {
    document.querySelectorAll("[data-choice]").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === choice));
    });

    document.querySelector("[data-user-choice]").textContent = choice.dataset.choice;
    document.querySelector("[data-user-message]").hidden = false;
    document.querySelector("[data-action='to-insight']").disabled = false;
  });
});

document.querySelector("[data-action='to-insight']")?.addEventListener("click", () => {
  showStep(3);
});

document.querySelector("[data-action='save-insight']")?.addEventListener("click", (event) => {
  const insight = document.querySelector("[data-insight]");
  const value = insight.value.trim();

  if (!value) {
    insight.setAttribute("aria-invalid", "true");
    document.querySelector("[data-insight-error]").hidden = false;
    insight.focus();
    return;
  }

  insight.removeAttribute("aria-invalid");
  document.querySelector("[data-insight-error]").hidden = true;
  simulate(event.currentTarget, "只保存到本页内存…", 4);
});

document.querySelector("[data-insight]")?.addEventListener("input", (event) => {
  if (event.currentTarget.value.trim()) {
    event.currentTarget.removeAttribute("aria-invalid");
    document.querySelector("[data-insight-error]").hidden = true;
  }
});

document.querySelectorAll("[data-action='back']").forEach((button) => {
  button.addEventListener("click", () => {
    showStep(Number(button.dataset.target));
  });
});

document.querySelector("[data-action='reset']")?.addEventListener("click", () => {
  document.querySelectorAll("[data-result]").forEach((item, index) => {
    item.setAttribute("aria-pressed", String(index === 0));
  });
  document.querySelectorAll("[data-choice]").forEach((item) => {
    item.setAttribute("aria-pressed", "false");
  });
  document.querySelector("[data-user-message]").hidden = true;
  document.querySelector("[data-action='to-insight']").disabled = true;
  document.querySelector("[data-insight]").value = "想弄清经验中的因果时，一次只改变一个变量，并记下结果。";
  document.querySelector("[data-insight]").removeAttribute("aria-invalid");
  document.querySelector("[data-insight-error]").hidden = true;
  showStep(0);
});

showStep(currentStep);
