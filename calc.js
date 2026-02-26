const display = document.getElementById("numpad");
const expressionView = document.getElementById("expression");
const keyboard = document.querySelector(".keyboard");

const OPERATORS = new Set(["+", "-", "*", "/"]);

let expression = "";
let shouldResetOnInput = false;

function updateDisplay(value = expression || "0") {
  display.value = value;
}

function updateExpressionPreview(text = "") {
  expressionView.textContent = text;
}

function getLastNumberToken(exp) {
  const match = exp.match(/(?:^|[+\-*/])(\d*\.?\d*)$/);
  return match?.[1] ?? "";
}

function appendValue(value) {
  if (shouldResetOnInput) {
    expression = "";
    shouldResetOnInput = false;
  }

  if (value === ".") {
    const lastToken = getLastNumberToken(expression);
    if (lastToken.includes(".")) return;
    if (lastToken === "") expression += "0";
  }

  if (OPERATORS.has(value)) {
    if (!expression && value !== "-") return;
    if (OPERATORS.has(expression.slice(-1))) {
      expression = expression.slice(0, -1);
    }
  }

  expression += value;
  updateDisplay();
}

function clearAll() {
  expression = "";
  shouldResetOnInput = false;
  updateDisplay();
  updateExpressionPreview();
}

function deleteOne() {
  if (shouldResetOnInput) {
    clearAll();
    return;
  }

  expression = expression.slice(0, -1);
  updateDisplay();
}

function normalizeForDisplay(exp) {
  return exp.replace(/\*/g, "×").replace(/\//g, "÷");
}

function calculate() {
  if (!expression) return;
  if (OPERATORS.has(expression.slice(-1))) {
    expression = expression.slice(0, -1);
  }

  if (!expression) return;

  try {
    if (!/^[\d+\-*/.\s]+$/.test(expression)) {
      throw new Error("Invalid expression");
    }

    const result = new Function(`return (${expression})`)();
    if (!Number.isFinite(result)) {
      throw new Error("Not finite");
    }

    updateExpressionPreview(`${normalizeForDisplay(expression)} =`);
    expression = Number(result.toFixed(10)).toString();
    updateDisplay();
    shouldResetOnInput = true;
  } catch {
    updateDisplay("Error");
    updateExpressionPreview("Invalid expression");
    expression = "";
    shouldResetOnInput = true;
  }
}

function convertToPercent() {
  if (!expression) return;

  if (OPERATORS.has(expression.slice(-1))) {
    expression = expression.slice(0, -1);
  }

  if (!expression) return;

  try {
    const currentValue = new Function(`return (${expression})`)();
    if (!Number.isFinite(currentValue)) throw new Error("Not finite");
    expression = (currentValue / 100).toString();
    updateDisplay();
  } catch {
    updateDisplay("Error");
    expression = "";
    shouldResetOnInput = true;
  }
}

keyboard.addEventListener("click", (event) => {
  const key = event.target.closest("button");
  if (!key) return;

  const { value, action } = key.dataset;

  if (value) {
    appendValue(value);
    return;
  }

  if (action === "clear") clearAll();
  if (action === "delete") deleteOne();
  if (action === "equals") calculate();
  if (action === "percent") convertToPercent();
});

window.addEventListener("keydown", (event) => {
  const { key } = event;

  if (/^[0-9]$/.test(key) || OPERATORS.has(key) || key === ".") {
    event.preventDefault();
    appendValue(key);
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
    return;
  }

  if (key === "Backspace") {
    event.preventDefault();
    deleteOne();
    return;
  }

  if (key === "Escape") {
    event.preventDefault();
    clearAll();
    return;
  }

  if (key === "%") {
    event.preventDefault();
    convertToPercent();
  }
});

updateDisplay();
